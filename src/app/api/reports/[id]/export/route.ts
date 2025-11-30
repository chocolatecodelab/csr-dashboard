import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/lib/api-response';

// GET /api/reports/[id]/export - Export report data
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json'; // json, csv, excel

    const report = await prisma.report.findUnique({
      where: { id: params.id },
      include: {
        program: { include: { department: true } },
        department: true,
        metrics_records: { orderBy: { createdAt: 'desc' }, take: 1 },
        activityReports: {
          include: {
            activity: {
              include: {
                project: { include: { program: true } },
              },
            },
          },
        },
      },
    });

    if (!report) {
      return ApiResponse.error('Report not found', 404);
    }

    // Increment download count
    await prisma.report.update({
      where: { id: params.id },
      data: { downloadCount: { increment: 1 } },
    });

    const content = JSON.parse(report.content);
    const metrics = report.metrics_records[0];

    // Prepare export data based on format
    if (format === 'csv') {
      // Flatten data for CSV
      const csvData = {
        reportInfo: {
          title: report.title,
          type: report.type,
          period: report.period,
          status: report.status,
          program: report.program?.name || '-',
          department: report.department?.name || '-',
          generatedAt: new Date().toISOString(),
        },
        metrics: metrics ? {
          totalBudget: metrics.totalBudget,
          budgetUsed: metrics.budgetUsed,
          budgetPercentage: metrics.budgetPercentage,
          totalPrograms: metrics.totalPrograms,
          activePrograms: metrics.activePrograms,
          totalActivities: metrics.totalActivities,
          completedActivities: metrics.completedActivities,
          totalBeneficiaries: metrics.totalBeneficiaries,
          socialImpact: metrics.socialImpact,
          economicImpact: metrics.economicImpact,
          environmentalImpact: metrics.environmentalImpact,
        } : {},
        programs: content.programs?.list || [],
        activities: content.activities?.list || [],
        budgets: content.budgets?.list || [],
        stakeholders: content.stakeholders?.list || [],
      };

      return ApiResponse.success({ data: csvData, format: 'csv' });
    }

    if (format === 'excel') {
      // Multi-sheet data for Excel
      const excelData = {
        sheets: [
          {
            name: 'Summary',
            data: [
              {
                'Report Title': report.title,
                'Type': report.type,
                'Period': report.period,
                'Status': report.status,
                'Program': report.program?.name || '-',
                'Department': report.department?.name || '-',
              },
            ],
          },
          {
            name: 'Metrics',
            data: metrics ? [{
              'Total Budget': metrics.totalBudget,
              'Budget Used': metrics.budgetUsed,
              'Budget %': metrics.budgetPercentage?.toFixed(2),
              'Total Programs': metrics.totalPrograms,
              'Active Programs': metrics.activePrograms,
              'Total Activities': metrics.totalActivities,
              'Completed Activities': metrics.completedActivities,
              'Total Beneficiaries': metrics.totalBeneficiaries,
              'Social Impact': metrics.socialImpact?.toFixed(2),
              'Economic Impact': metrics.economicImpact?.toFixed(2),
              'Environmental Impact': metrics.environmentalImpact?.toFixed(2),
            }] : [],
          },
          {
            name: 'Programs',
            data: (content.programs?.list || []).map((p: any) => ({
              'Program Name': p.name,
              'Department': p.department,
              'Category': p.category,
              'Status': p.status,
              'Budget': p.budget,
              'Progress': p.progress,
            })),
          },
          {
            name: 'Activities',
            data: (content.activities?.list || []).map((a: any) => ({
              'Activity Name': a.name,
              'Program': a.program,
              'Type': a.type,
              'Status': a.status,
              'Participants': a.participants,
              'Start Date': a.startDate,
              'End Date': a.endDate,
            })),
          },
          {
            name: 'Budgets',
            data: (content.budgets?.list || []).map((b: any) => ({
              'Description': b.description,
              'Planned Amount': b.planned,
              'Realized Amount': b.realized,
              'Percentage': b.percentage,
              'Category': b.category,
            })),
          },
        ],
      };

      return ApiResponse.success({ data: excelData, format: 'excel' });
    }

    // Default: return full JSON
    return ApiResponse.success({
      data: {
        report: {
          id: report.id,
          title: report.title,
          description: report.description,
          type: report.type,
          status: report.status,
          period: report.period,
          program: report.program,
          department: report.department,
          createdAt: report.createdAt,
          publishedAt: report.publishedAt,
        },
        metrics,
        content,
        activityReports: report.activityReports,
      },
      format: 'json',
    });
  } catch (error: any) {
    console.error('GET /api/reports/[id]/export error:', error);
    return ApiResponse.error(error.message, 500);
  }
}
