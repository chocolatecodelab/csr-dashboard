/**
 * Report Service - Data Aggregation & Calculations Engine
 * Handles all report generation, metrics calculation, and data processing
 */

import { prisma } from '@/lib/prisma';

export interface ReportMetrics {
  // Financial
  totalBudget: number;
  budgetUsed: number;
  budgetRemaining: number;
  budgetPercentage: number;
  
  // Programs
  totalPrograms: number;
  activePrograms: number;
  completedPrograms: number;
  programCompletionRate: number;
  
  // Activities
  totalActivities: number;
  completedActivities: number;
  ongoingActivities: number;
  activityCompletionRate: number;
  
  // Stakeholders
  totalStakeholders: number;
  totalBeneficiaries: number;
  averageSatisfaction: number;
  
  // Impact
  socialImpact: number;
  environmentalImpact: number;
  economicImpact: number;
  overallImpact: number;
}

export interface PeriodData {
  startDate: Date;
  endDate: Date;
  label: string;
}

/**
 * Parse period string to date range
 */
export function parsePeriod(period: string): PeriodData {
  // Q1-2024, Q2-2024, etc
  if (period.match(/Q[1-4]-\d{4}/)) {
    const [quarter, year] = period.split('-');
    const q = parseInt(quarter.replace('Q', ''));
    const startMonth = (q - 1) * 3;
    const startDate = new Date(parseInt(year), startMonth, 1);
    const endDate = new Date(parseInt(year), startMonth + 3, 0);
    return { startDate, endDate, label: period };
  }
  
  // 2024 (full year)
  if (period.match(/^\d{4}$/)) {
    const year = parseInt(period);
    return {
      startDate: new Date(year, 0, 1),
      endDate: new Date(year, 11, 31),
      label: `Tahun ${year}`
    };
  }
  
  // Jan-2024, Feb-2024, etc
  if (period.match(/[A-Za-z]{3}-\d{4}/)) {
    const [monthStr, yearStr] = period.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months.indexOf(monthStr);
    const year = parseInt(yearStr);
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    return { startDate, endDate, label: period };
  }
  
  // Default: current month
  const now = new Date();
  return {
    startDate: new Date(now.getFullYear(), now.getMonth(), 1),
    endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    label: 'Current Period'
  };
}

/**
 * Calculate comprehensive metrics for a report
 */
export async function calculateReportMetrics(
  programId?: string,
  departmentId?: string,
  startDate?: Date,
  endDate?: Date
): Promise<ReportMetrics> {
  const whereClause: any = {};
  
  if (programId) whereClause.programId = programId;
  if (departmentId) whereClause.program = { departmentId };
  if (startDate || endDate) {
    whereClause.createdAt = {};
    if (startDate) whereClause.createdAt.gte = startDate;
    if (endDate) whereClause.createdAt.lte = endDate;
  }

  // Fetch all related data
  const [programs, activities, budgets, stakeholders] = await Promise.all([
    prisma.program.findMany({
      where: programId ? { id: programId } : (departmentId ? { departmentId } : {}),
      include: { stakeholders: true }
    }),
    prisma.activity.findMany({
      where: whereClause,
      include: { project: true }
    }),
    prisma.budget.findMany({
      where: whereClause,
    }),
    prisma.stakeholder.findMany({
      where: {},
      include: { programs: true }
    })
  ]);

  // Calculate financial metrics
  const totalBudget = budgets.reduce((sum, b) => sum + (b.amount || 0), 0);
  const budgetUsed = budgets.reduce((sum, b) => sum + (b.spentAmount || 0), 0);
  const budgetRemaining = totalBudget - budgetUsed;
  const budgetPercentage = totalBudget > 0 ? (budgetUsed / totalBudget) * 100 : 0;

  // Calculate program metrics
  const totalPrograms = programs.length;
  const activePrograms = programs.filter(p => p.status === 'active').length;
  const completedPrograms = programs.filter(p => p.status === 'completed').length;
  const programCompletionRate = totalPrograms > 0 ? (completedPrograms / totalPrograms) * 100 : 0;

  // Calculate activity metrics
  const totalActivities = activities.length;
  const completedActivities = activities.filter(a => a.status === 'completed').length;
  const ongoingActivities = activities.filter(a => a.status === 'ongoing').length;
  const activityCompletionRate = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;

  // Calculate stakeholder metrics
  const totalStakeholders = stakeholders.length;
  const totalBeneficiaries = activities.reduce((sum, a) => sum + (a.participants || 0), 0);
  const averageSatisfaction = 85; // Mock - could be calculated from feedback

  // Calculate impact metrics (weighted scoring)
  const socialImpact = totalBeneficiaries > 0 ? Math.min((totalBeneficiaries / 100) * 20, 100) : 0;
  const environmentalImpact = activePrograms > 0 ? Math.min((activePrograms / 5) * 20, 100) : 0;
  const economicImpact = budgetPercentage > 0 ? Math.min(budgetPercentage, 100) : 0;
  const overallImpact = (socialImpact + environmentalImpact + economicImpact) / 3;

  return {
    totalBudget,
    budgetUsed,
    budgetRemaining,
    budgetPercentage,
    totalPrograms,
    activePrograms,
    completedPrograms,
    programCompletionRate,
    totalActivities,
    completedActivities,
    ongoingActivities,
    activityCompletionRate,
    totalStakeholders,
    totalBeneficiaries,
    averageSatisfaction,
    socialImpact,
    environmentalImpact,
    economicImpact,
    overallImpact
  };
}

/**
 * Generate report content with aggregated data
 */
export async function generateReportContent(
  type: string,
  programId?: string,
  departmentId?: string,
  period?: string
): Promise<any> {
  const { startDate, endDate, label } = period ? parsePeriod(period) : { startDate: undefined, endDate: undefined, label: 'All Time' };
  
  const metrics = await calculateReportMetrics(programId, departmentId, startDate, endDate);
  
  const whereClause: any = {};
  if (programId) whereClause.programId = programId;
  if (departmentId) whereClause.program = { departmentId };
  if (startDate || endDate) {
    whereClause.createdAt = {};
    if (startDate) whereClause.createdAt.gte = startDate;
    if (endDate) whereClause.createdAt.lte = endDate;
  }

  // Fetch detailed data
  const [programs, activities, budgets, stakeholders] = await Promise.all([
    prisma.program.findMany({
      where: programId ? { id: programId } : (departmentId ? { departmentId } : {}),
      include: {
        department: true,
        category: true,
        type: true,
      }
    }),
    prisma.activity.findMany({
      where: whereClause,
      include: { project: { include: { program: true } } },
      orderBy: { startDate: 'desc' },
      take: 50
    }),
    prisma.budget.findMany({
      where: whereClause,
      include: { program: true, project: true },
      orderBy: { createdAt: 'desc' },
      take: 50
    }),
    prisma.stakeholder.findMany({
      where: {},
      include: { category: true, programs: true },
      take: 50
    })
  ]);

  // Build content based on report type
  const content = {
    type,
    period: label,
    generatedAt: new Date().toISOString(),
    
    // Executive Summary
    summary: {
      overview: `Laporan ${type} periode ${label} mencakup ${metrics.totalPrograms} program dengan total ${metrics.totalActivities} kegiatan.`,
      highlights: [
        `Total Anggaran: Rp ${metrics.totalBudget.toLocaleString('id-ID')}`,
        `Realisasi: ${metrics.budgetPercentage.toFixed(1)}%`,
        `Tingkat Penyelesaian Program: ${metrics.programCompletionRate.toFixed(1)}%`,
        `Total Penerima Manfaat: ${metrics.totalBeneficiaries.toLocaleString('id-ID')} orang`
      ],
      keyMetrics: metrics
    },
    
    // Programs Section
    programs: {
      total: programs.length,
      list: programs.map(p => ({
        id: p.id,
        name: p.name,
        department: p.department?.name,
        category: p.category?.name,
        status: p.status,
        startDate: p.startDate,
        endDate: p.endDate
      }))
    },
    
    // Activities Section
    activities: {
      total: activities.length,
      completed: activities.filter(a => a.status === 'completed').length,
      ongoing: activities.filter(a => a.status === 'ongoing').length,
      list: activities.map(a => ({
        id: a.id,
        name: a.name,
        program: a.project?.program?.name,
        type: a.type,
        status: a.status,
        participants: a.participants,
        startDate: a.startDate,
        endDate: a.endDate
      }))
    },
    
    // Budget Section
    budgets: {
      total: metrics.totalBudget,
      used: metrics.budgetUsed,
      remaining: metrics.budgetRemaining,
      percentage: metrics.budgetPercentage,
      list: budgets.map(b => ({
        id: b.id,
        description: b.name,
        planned: b.amount,
        realized: b.spentAmount,
        percentage: b.amount > 0 ? (b.spentAmount / b.amount * 100) : 0,
        category: b.category
      }))
    },
    
    // Stakeholders Section
    stakeholders: {
      total: stakeholders.length,
      byCategory: stakeholders.reduce((acc: any, s) => {
        const cat = s.category?.name || 'Lainnya';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {}),
      list: stakeholders.map(s => ({
        id: s.id,
        name: s.name,
        category: s.category?.name,
        type: s.type,
        importance: s.importance,
        influence: s.influence
      }))
    },
    
    // Impact Analysis
    impact: {
      social: metrics.socialImpact,
      environmental: metrics.environmentalImpact,
      economic: metrics.economicImpact,
      overall: metrics.overallImpact,
      beneficiaries: metrics.totalBeneficiaries,
      satisfaction: metrics.averageSatisfaction
    }
  };

  return content;
}

/**
 * Get comparison data between two periods
 */
export async function comparePeriodsMetrics(
  period1: string,
  period2: string,
  programId?: string,
  departmentId?: string
): Promise<any> {
  const p1 = parsePeriod(period1);
  const p2 = parsePeriod(period2);
  
  const [metrics1, metrics2] = await Promise.all([
    calculateReportMetrics(programId, departmentId, p1.startDate, p1.endDate),
    calculateReportMetrics(programId, departmentId, p2.startDate, p2.endDate)
  ]);
  
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };
  
  return {
    period1: { ...p1, metrics: metrics1 },
    period2: { ...p2, metrics: metrics2 },
    comparison: {
      budgetChange: calculateChange(metrics2.budgetUsed, metrics1.budgetUsed),
      programGrowth: calculateChange(metrics2.totalPrograms, metrics1.totalPrograms),
      activityGrowth: calculateChange(metrics2.totalActivities, metrics1.totalActivities),
      beneficiaryGrowth: calculateChange(metrics2.totalBeneficiaries, metrics1.totalBeneficiaries),
      impactChange: calculateChange(metrics2.overallImpact, metrics1.overallImpact)
    }
  };
}

/**
 * Get trend data for analytics charts
 */
export async function getTrendData(
  metric: 'budget' | 'activities' | 'beneficiaries',
  groupBy: 'month' | 'quarter' | 'year',
  startDate: Date,
  endDate: Date,
  programId?: string
): Promise<any[]> {
  // This would require more complex date grouping queries
  // For now, returning mock structure
  const data: any[] = [];
  
  // Generate time periods
  const current = new Date(startDate);
  while (current <= endDate) {
    let label = '';
    let nextDate = new Date(current);
    
    if (groupBy === 'month') {
      label = current.toLocaleString('id-ID', { month: 'short', year: 'numeric' });
      nextDate.setMonth(nextDate.getMonth() + 1);
    } else if (groupBy === 'quarter') {
      const q = Math.floor(current.getMonth() / 3) + 1;
      label = `Q${q} ${current.getFullYear()}`;
      nextDate.setMonth(nextDate.getMonth() + 3);
    } else {
      label = current.getFullYear().toString();
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    }
    
    // Calculate metrics for this period
    const metrics = await calculateReportMetrics(
      programId,
      undefined,
      current,
      nextDate
    );
    
    data.push({
      period: label,
      value: metric === 'budget' ? metrics.budgetUsed :
             metric === 'activities' ? metrics.totalActivities :
             metrics.totalBeneficiaries,
      startDate: current.toISOString(),
      endDate: nextDate.toISOString()
    });
    
    current.setTime(nextDate.getTime());
    
    // Safety limit
    if (data.length > 50) break;
  }
  
  return data;
}
