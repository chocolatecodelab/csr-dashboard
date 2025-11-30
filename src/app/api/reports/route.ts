export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  calculateReportMetrics, 
  generateReportContent, 
  parsePeriod 
} from '@/services/report.service';
import { ApiResponse } from '@/lib/api-response';

// GET /api/reports - List reports with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';
    const period = searchParams.get('period') || '';
    const programId = searchParams.get('programId') || '';
    const departmentId = searchParams.get('departmentId') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) where.type = type;
    if (status) where.status = status;
    if (period) where.period = period;
    if (programId) where.programId = programId;
    if (departmentId) where.departmentId = departmentId;

    // Sort mapping
    const SORT_MAPPING: Record<string, any> = {
      title: 'title',
      type: 'type',
      status: 'status',
      period: 'period',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      publishedAt: 'publishedAt',
      version: 'version',
      viewCount: 'viewCount',
      downloadCount: 'downloadCount',
    };

    const orderBy = SORT_MAPPING[sortBy]
      ? { [SORT_MAPPING[sortBy]]: sortOrder as 'asc' | 'desc' }
      : { createdAt: 'desc' as 'asc' | 'desc' };

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          program: { select: { name: true } },
          department: { select: { name: true } },
          metrics_records: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.report.count({ where }),
    ]);

    return ApiResponse.success({
      data: reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('GET /api/reports error:', error);
    return ApiResponse.error(error.message, 500);
  }
}

// POST /api/reports - Create new report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      type,
      status = 'draft',
      period,
      startDate,
      endDate,
      programId,
      departmentId,
      template,
      tags,
    } = body;

    // Validation
    if (!title || !type || !period) {
      return ApiResponse.error('Title, type, and period are required', 400);
    }

    // Parse period to dates
    const { startDate: periodStart, endDate: periodEnd } = parsePeriod(period);

    // Auto-generate report content
    const content = await generateReportContent(
      type,
      programId,
      departmentId,
      period
    );

    // Calculate metrics
    const metrics = await calculateReportMetrics(
      programId,
      departmentId,
      startDate ? new Date(startDate) : periodStart,
      endDate ? new Date(endDate) : periodEnd
    );

    // Create report
    const report = await prisma.report.create({
      data: {
        title,
        description,
        type,
        status,
        period,
        startDate: startDate ? new Date(startDate) : periodStart,
        endDate: endDate ? new Date(endDate) : periodEnd,
        programId,
        departmentId,
        template,
        tags: tags ? JSON.stringify(tags) : null,
        content: JSON.stringify(content),
        metrics: JSON.stringify(metrics),
        version: 1,
      },
      include: {
        program: true,
        department: true,
      },
    });

    // Create metrics record
    await prisma.reportMetrics.create({
      data: {
        reportId: report.id,
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

    return ApiResponse.success({ data: report }, 'Report created successfully', 201);
  } catch (error: any) {
    console.error('POST /api/reports error:', error);
    return ApiResponse.error(error.message, 500);
  }
}

