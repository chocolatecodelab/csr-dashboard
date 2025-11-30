export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateReportMetrics, parsePeriod, comparePeriodsMetrics } from '@/services/report.service';
import { ApiResponse } from '@/lib/api-response';

// Helper function to get previous period
function getPreviousPeriod(period: string): string {
  // Q1-2024 -> Q4-2023
  if (period.match(/Q[1-4]-\d{4}/)) {
    const [quarter, year] = period.split('-');
    const q = parseInt(quarter.replace('Q', ''));
    if (q === 1) {
      return `Q4-${parseInt(year) - 1}`;
    }
    return `Q${q - 1}-${year}`;
  }
  
  // 2024 -> 2023
  if (period.match(/^\d{4}$/)) {
    return `${parseInt(period) - 1}`;
  }
  
  // Jan-2024 -> Dec-2023
  if (period.match(/[A-Za-z]{3}-\d{4}/)) {
    const [monthStr, yearStr] = period.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIndex = months.indexOf(monthStr);
    if (monthIndex === 0) {
      return `Dec-${parseInt(yearStr) - 1}`;
    }
    return `${months[monthIndex - 1]}-${yearStr}`;
  }
  
  return period;
}

// GET /api/analytics - Get comprehensive analytics data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '2024';
    const programId = searchParams.get('programId') || undefined;
    const departmentId = searchParams.get('departmentId') || undefined;
    const compare = searchParams.get('compare') || '';

    const { startDate, endDate, label } = parsePeriod(period);

    // Calculate main metrics
    const metrics = await calculateReportMetrics(
      programId,
      departmentId,
      startDate,
      endDate
    );

    // Get comparison data if requested
    let comparison = null;
    if (compare) {
      comparison = await comparePeriodsMetrics(period, compare, programId, departmentId);
    }

    // Calculate growth by comparing with previous period
    const previousPeriod = parsePeriod(getPreviousPeriod(period));
    const previousMetrics = await calculateReportMetrics(
      programId,
      departmentId,
      previousPeriod.startDate,
      previousPeriod.endDate
    );

    const budgetGrowth = previousMetrics.totalBudget > 0
      ? ((metrics.totalBudget - previousMetrics.totalBudget) / previousMetrics.totalBudget) * 100
      : 0;
    const programGrowth = previousMetrics.totalPrograms > 0
      ? ((metrics.totalPrograms - previousMetrics.totalPrograms) / previousMetrics.totalPrograms) * 100
      : 0;
    const activityGrowth = previousMetrics.totalActivities > 0
      ? ((metrics.totalActivities - previousMetrics.totalActivities) / previousMetrics.totalActivities) * 100
      : 0;
    const beneficiaryGrowth = previousMetrics.totalBeneficiaries > 0
      ? ((metrics.totalBeneficiaries - previousMetrics.totalBeneficiaries) / previousMetrics.totalBeneficiaries) * 100
      : 0;

    // Fetch budget trend data
    const budgets = await prisma.budget.findMany({
      where: {
        ...(programId && { programId }),
        ...(departmentId && { program: { departmentId } }),
        createdAt: { gte: startDate, lte: endDate },
      },
      include: { program: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by month
    const budgetTrend = budgets.reduce((acc: any[], budget) => {
      const month = new Date(budget.createdAt).toLocaleString('id-ID', { month: 'short' });
      const existing = acc.find(item => item.period === month);
      
      if (existing) {
        existing.planned += budget.amount || 0;
        existing.realized += budget.spentAmount || 0;
      } else {
        acc.push({
          period: month,
          planned: budget.amount || 0,
          realized: budget.spentAmount || 0,
        });
      }
      
      return acc;
    }, []);

    // Get program distribution by category
    const programs = await prisma.program.findMany({
      where: departmentId ? { departmentId } : {},
      include: {
        category: true,
        budgets: true,
      },
    });

    const programDistribution = programs.reduce((acc: any[], program) => {
      const categoryName = program.category?.name || 'Lainnya';
      const existing = acc.find(item => item.name === categoryName);
      const programBudget = program.budgets.reduce((sum, b) => sum + b.amount, 0);
      
      if (existing) {
        existing.count += 1;
        existing.budget += programBudget;
      } else {
        acc.push({
          name: categoryName,
          count: 1,
          budget: programBudget,
        });
      }
      
      return acc;
    }, []);

    // Get activity status distribution
    const activities = await prisma.activity.findMany({
      where: {
        ...(programId && { project: { programId } }),
        ...(departmentId && { departmentId }),
        createdAt: { gte: startDate, lte: endDate },
      },
    });

    const activityStatus = activities.reduce((acc: any[], activity) => {
      const status = activity.status || 'planned';
      const statusLabel = status === 'completed' ? 'Completed' :
                         status === 'ongoing' ? 'Ongoing' : 'Planned';
      const existing = acc.find(item => item.status === statusLabel);
      
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ status: statusLabel, count: 1 });
      }
      
      return acc;
    }, []);

    // Get department performance
    const departments = await prisma.department.findMany({
      include: {
        programs: {
          include: {
            projects: {
              include: {
                activities: true
              }
            },
            budgets: true,
          },
        },
      },
    });

    const departmentPerformance = departments.map(dept => {
      const deptActivities = dept.programs.flatMap((p: any) => p.projects.flatMap((proj: any) => proj.activities));
      const completedActivities = deptActivities.filter((a: any) => a.status === 'completed').length;
      const totalActivities = deptActivities.length;
      const completion = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;
      const budget = dept.programs.reduce((sum: number, p: any) => 
        sum + p.budgets.reduce((s: number, b: any) => s + b.amount, 0), 0);
      
      return {
        name: dept.name,
        completion: Math.round(completion),
        budget,
      };
    }).filter(d => d.completion > 0).slice(0, 5);

    // Calculate monthly impact based on activities
    const monthlyImpactMap = new Map<string, { social: number; economic: number; environmental: number; count: number }>();
    
    // Group activities by month and calculate impact scores
    activities.forEach(activity => {
      const month = new Date(activity.createdAt).toLocaleString('id-ID', { month: 'short' });
      const existing = monthlyImpactMap.get(month) || { social: 0, economic: 0, environmental: 0, count: 0 };
      
      // Calculate impact based on activity completion and participants
      const impactScore = activity.status === 'completed' ? 100 : (activity.progress || 0);
      const participantFactor = Math.min((activity.participants || 0) / 100, 1); // Normalize to 0-1
      
      existing.social += impactScore * (0.5 + participantFactor * 0.5);
      existing.economic += impactScore * 0.7;
      existing.environmental += impactScore * 0.6;
      existing.count += 1;
      
      monthlyImpactMap.set(month, existing);
    });

    const monthlyImpact = Array.from(monthlyImpactMap.entries()).map(([month, data]) => ({
      month,
      social: Math.round(data.count > 0 ? data.social / data.count : 0),
      economic: Math.round(data.count > 0 ? data.economic / data.count : 0),
      environmental: Math.round(data.count > 0 ? data.environmental / data.count : 0),
    }));

    // Get top programs with real completion data
    const programsWithProjects = await prisma.program.findMany({
      where: departmentId ? { departmentId } : {},
      include: {
        category: true,
        budgets: true,
        projects: {
          include: {
            activities: true,
          },
        },
      },
    });

    const topPrograms = programsWithProjects
      .map(program => {
        const budget = program.budgets.reduce((sum, b) => sum + b.amount, 0);
        
        // Calculate completion based on projects and activities
        const allActivities = program.projects.flatMap(p => p.activities);
        const completedActivities = allActivities.filter(a => a.status === 'completed').length;
        const completion = allActivities.length > 0 
          ? Math.round((completedActivities / allActivities.length) * 100) 
          : 0;
        
        // Calculate impact based on multiple factors
        const beneficiaryCount = allActivities.reduce((sum, a) => sum + (a.participants || 0), 0);
        const budgetUtilization = program.budgets.reduce((sum, b) => sum + b.spentAmount, 0);
        const budgetEfficiency = budget > 0 ? (budgetUtilization / budget) * 100 : 0;
        
        // Calculate base impact even if some factors are 0
        // If program has budget or activities, it should have some impact
        const hasActivity = allActivities.length > 0;
        const hasBudget = budget > 0;
        
        let impact = 0;
        if (hasActivity || hasBudget) {
          impact = Math.min(
            Math.round((completion * 0.4) + (budgetEfficiency * 0.3) + (Math.min(beneficiaryCount / 100, 100) * 0.3)),
            100
          );
          // Ensure minimum impact of 10 for active programs
          impact = Math.max(impact, hasActivity ? 10 : 5);
        }
        
        return {
          name: program.name,
          completion,
          budget,
          impact,
        };
      })
      .filter(p => p.budget > 0 || p.completion > 0) // Show programs with budget or activities
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 5);

    const analyticsData = {
      overview: {
        totalBudget: metrics.totalBudget,
        budgetUsed: metrics.budgetUsed,
        budgetGrowth,
        totalPrograms: metrics.totalPrograms,
        programGrowth,
        totalActivities: metrics.totalActivities,
        activityGrowth,
        totalBeneficiaries: metrics.totalBeneficiaries,
        beneficiaryGrowth,
      },
      budgetTrend: budgetTrend.length > 0 ? budgetTrend : [
        { period: 'Jan', planned: 0, realized: 0 },
      ],
      programDistribution: programDistribution.length > 0 ? programDistribution : [
        { name: 'No Data', count: 0, budget: 0 },
      ],
      activityStatus: activityStatus.length > 0 ? activityStatus : [
        { status: 'No Data', count: 0 },
      ],
      departmentPerformance: departmentPerformance.length > 0 ? departmentPerformance : [
        { name: 'No Data', completion: 0, budget: 0 },
      ],
      monthlyImpact,
      topPrograms: topPrograms.length > 0 ? topPrograms : [
        { name: 'No Data', completion: 0, budget: 0, impact: 0 },
      ],
      comparison,
    };

    return ApiResponse.success({ data: analyticsData });
  } catch (error: any) {
    console.error('GET /api/analytics error:', error);
    return ApiResponse.error(error.message, 500);
  }
}

