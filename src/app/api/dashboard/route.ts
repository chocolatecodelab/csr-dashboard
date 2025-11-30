import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET /api/dashboard - Get dashboard overview data
export async function GET(request: NextRequest) {
  try {
    // Get current date for filtering
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // 1. Total Programs (active)
    const totalPrograms = await prisma.program.count({
      where: {
        status: "active",
      },
    });

    const totalProgramsLastMonth = await prisma.program.count({
      where: {
        status: "active",
        createdAt: {
          gte: lastMonth,
          lte: lastMonthEnd,
        },
      },
    });

    // 2. Total Beneficiaries (sum of targetBeneficiary from active programs)
    const beneficiariesData = await prisma.program.aggregate({
      where: {
        status: "active",
        targetBeneficiary: { not: null },
      },
      _sum: {
        targetBeneficiary: true,
      },
    });

    const beneficiariesLastMonth = await prisma.program.aggregate({
      where: {
        status: "active",
        targetBeneficiary: { not: null },
        createdAt: {
          gte: lastMonth,
          lte: lastMonthEnd,
        },
      },
      _sum: {
        targetBeneficiary: true,
      },
    });

    const totalBeneficiaries = beneficiariesData._sum.targetBeneficiary || 0;
    const beneficiariesChange = beneficiariesLastMonth._sum.targetBeneficiary || 0;

    // 3. Budget Allocated (sum of all budgets with status approved/disbursed)
    const budgetData = await prisma.budget.aggregate({
      where: {
        status: {
          in: ["approved", "disbursed"],
        },
      },
      _sum: {
        amount: true,
      },
    });

    const budgetLastMonth = await prisma.budget.aggregate({
      where: {
        status: {
          in: ["approved", "disbursed"],
        },
        createdAt: {
          gte: lastMonth,
          lte: lastMonthEnd,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const totalBudget = budgetData._sum.amount || 0;
    const budgetChange = budgetLastMonth._sum.amount || 0;

    // 4. Program Distribution by Category
    const programsByCategory = await prisma.program.groupBy({
      by: ["categoryId"],
      where: {
        status: "active",
        categoryId: { not: "" },
      },
      _count: {
        _all: true,
      },
    });

    // Get category details
    const categories = await prisma.categoryProgram.findMany({
      where: {
        id: {
          in: programsByCategory.map((p) => p.categoryId!).filter((id): id is string => !!id),
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const distribution = programsByCategory.map((item) => {
      const category = categories.find((c: any) => c.id === item.categoryId);
      return {
        categoryId: item.categoryId,
        categoryName: category?.name || "Lainnya",
        count: item._count._all,
        percentage: ((item._count._all / totalPrograms) * 100).toFixed(1),
      };
    });

    // 5. Programs by Status
    const programsByStatus = await prisma.program.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    });

    const statusDistribution = programsByStatus.map((item) => ({
      status: item.status,
      count: item._count.id,
    }));

    // 6. Recent Activities (last 10)
    const recentActivities = await prisma.activity.findMany({
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        status: true,
        startDate: true,
        endDate: true,
        location: true,
        project: {
          select: {
            id: true,
            program: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        createdAt: true,
      },
    });

    // 7. Regional Distribution (programs by area)
    const programsByArea = await prisma.program.groupBy({
      by: ["targetArea"],
      where: {
        status: "active",
        targetArea: { not: "" },
      },
      _count: {
        _all: true,
      },
      _sum: {
        targetBeneficiary: true,
      },
    });

    const regionalDistribution = programsByArea.map((item) => ({
      area: item.targetArea,
      programCount: item._count._all,
      beneficiaries: item._sum.targetBeneficiary || 0,
    }));

    // 8. Impact Metrics (calculate based on completed programs and activities)
    const completedPrograms = await prisma.program.count({
      where: {
        status: "completed",
      },
    });

    const completedActivities = await prisma.activity.count({
      where: {
        status: "completed",
      },
    });

    const totalActivities = await prisma.activity.count();

    // Calculate impact score (0-10 scale)
    const completionRate = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;
    const impactScore = Number(Math.min((completionRate / 10), 10).toFixed(1));

    // Calculate changes (percentage)
    const programChange = totalProgramsLastMonth > 0 
      ? ((totalPrograms - totalProgramsLastMonth) / totalProgramsLastMonth * 100).toFixed(1)
      : 0;

    const beneficiaryChangePercent = beneficiariesChange > 0
      ? ((totalBeneficiaries - beneficiariesChange) / beneficiariesChange * 100).toFixed(1)
      : 0;

    const budgetChangePercent = budgetChange > 0
      ? ((totalBudget - budgetChange) / budgetChange * 100).toFixed(1)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalPrograms: {
            count: totalPrograms,
            change: Number(programChange),
            isPositive: Number(programChange) >= 0,
          },
          activeBeneficiaries: {
            count: totalBeneficiaries,
            change: Number(beneficiaryChangePercent),
            isPositive: Number(beneficiaryChangePercent) >= 0,
          },
          budgetAllocated: {
            amount: totalBudget,
            change: Number(budgetChangePercent),
            isPositive: Number(budgetChangePercent) >= 0,
          },
          impactScore: {
            score: Number(impactScore),
            change: 0.3, // Mock for now, calculate from previous period
            isPositive: true,
          },
        },
        distribution,
        statusDistribution,
        recentActivities,
        regionalDistribution,
        metrics: {
          completedPrograms,
          completedActivities,
          totalActivities,
          completionRate: completionRate.toFixed(1),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
