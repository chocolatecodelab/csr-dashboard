import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateReportMetrics, parsePeriod } from '@/services/report.service';
import { ApiResponse } from '@/lib/api-response';

// GET /api/reports/[id] - Get single report
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const report = await prisma.report.findUnique({
      where: { id: params.id },
      include: {
        program: true,
        department: true,
        metrics_records: { orderBy: { createdAt: 'desc' } },
        activityReports: {
          include: {
            activity: { include: { project: true } },
          },
        },
      },
    });

    if (!report) {
      return ApiResponse.error('Report not found', 404);
    }

    // Increment view count
    await prisma.report.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } },
    });

    return ApiResponse.success({ data: report });
  } catch (error: any) {
    console.error('GET /api/reports/[id] error:', error);
    return ApiResponse.error(error.message, 500);
  }
}

// PATCH /api/reports/[id] - Update report
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      type,
      status,
      period,
      startDate,
      endDate,
      programId,
      departmentId,
      template,
      tags,
      regenerateContent,
    } = body;

    // Check if report exists
    const existingReport = await prisma.report.findUnique({
      where: { id: params.id },
    });

    if (!existingReport) {
      return ApiResponse.error('Report not found', 404);
    }

    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (status !== undefined) {
      updateData.status = status;
      
      // Update workflow timestamps
      if (status === 'review' && !existingReport.submittedAt) {
        updateData.submittedAt = new Date();
      }
      if (status === 'approved' && !existingReport.approvedAt) {
        updateData.approvedAt = new Date();
        updateData.reviewedAt = new Date();
      }
      if (status === 'published' && !existingReport.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }
    if (period !== undefined) updateData.period = period;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (programId !== undefined) updateData.programId = programId;
    if (departmentId !== undefined) updateData.departmentId = departmentId;
    if (template !== undefined) updateData.template = template;
    if (tags !== undefined) updateData.tags = JSON.stringify(tags);

    // Regenerate content if requested
    if (regenerateContent) {
      const { generateReportContent } = await import('@/services/report.service');
      const content = await generateReportContent(
        type || existingReport.type,
        programId || existingReport.programId || undefined,
        departmentId || existingReport.departmentId || undefined,
        period || existingReport.period
      );
      updateData.content = JSON.stringify(content);
      updateData.version = existingReport.version + 1;

      // Recalculate metrics
      const periodData = parsePeriod(period || existingReport.period);
      const metrics = await calculateReportMetrics(
        programId || existingReport.programId || undefined,
        departmentId || existingReport.departmentId || undefined,
        startDate ? new Date(startDate) : periodData.startDate,
        endDate ? new Date(endDate) : periodData.endDate
      );
      updateData.metrics = JSON.stringify(metrics);

      // Create new metrics record
      await prisma.reportMetrics.create({
        data: {
          reportId: params.id,
          totalBudget: metrics.totalBudget,
          budgetUsed: metrics.budgetUsed,
          budgetRemaining: metrics.budgetRemaining,
          budgetPercentage: metrics.budgetPercentage,
          totalPrograms: metrics.totalPrograms,
          activePrograms: metrics.activePrograms,
          completedPrograms: metrics.completedPrograms,
          totalActivities: metrics.totalActivities,
          completedActivities: metrics.completedActivities,
          ongoingActivities: metrics.ongoingActivities,
          totalStakeholders: metrics.totalStakeholders,
          totalBeneficiaries: metrics.totalBeneficiaries,
          satisfactionScore: metrics.averageSatisfaction,
          socialImpact: metrics.socialImpact,
          environmentalImpact: metrics.environmentalImpact,
          economicImpact: metrics.economicImpact,
        },
      });
    }

    const report = await prisma.report.update({
      where: { id: params.id },
      data: updateData,
      include: {
        program: true,
        department: true,
        metrics_records: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    return ApiResponse.success({ data: report });
  } catch (error: any) {
    console.error('PATCH /api/reports/[id] error:', error);
    return ApiResponse.error(error.message, 500);
  }
}

// DELETE /api/reports/[id] - Delete report
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if report exists
    const report = await prisma.report.findUnique({
      where: { id: params.id },
    });

    if (!report) {
      return ApiResponse.error('Report not found', 404);
    }

    // Delete report (cascade will delete metrics_records)
    await prisma.report.delete({
      where: { id: params.id },
    });

    return ApiResponse.success({ message: 'Report deleted successfully' });
  } catch (error: any) {
    console.error('DELETE /api/reports/[id] error:', error);
    return ApiResponse.error(error.message, 500);
  }
}
