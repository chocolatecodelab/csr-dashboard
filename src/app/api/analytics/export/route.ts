export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { ApiResponse } from '@/lib/api-response';

// GET /api/analytics/export - Export analytics data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '2024';
    const format = searchParams.get('format') || 'json';

    // Get analytics data from main analytics endpoint
    const analyticsUrl = new URL('/api/analytics', request.url);
    analyticsUrl.searchParams.set('period', period);
    
    const analyticsResponse = await fetch(analyticsUrl.toString());
    const analyticsResult = await analyticsResponse.json();
    
    if (!analyticsResult.success) {
      return ApiResponse.error('Failed to fetch analytics data', 500);
    }

    const data = analyticsResult.data;

    if (format === 'csv') {
      const csvData = {
        overview: [data.overview],
        budgetTrend: data.budgetTrend,
        programDistribution: data.programDistribution,
        activityStatus: data.activityStatus,
        departmentPerformance: data.departmentPerformance,
        topPrograms: data.topPrograms,
      };

      return ApiResponse.success({ data: csvData, format: 'csv' });
    }

    if (format === 'excel') {
      const excelData = {
        sheets: [
          {
            name: 'Overview',
            data: [{
              'Period': period,
              'Total Budget': data.overview.totalBudget,
              'Budget Used': data.overview.budgetUsed,
              'Budget Growth': `${data.overview.budgetGrowth}%`,
              'Total Programs': data.overview.totalPrograms,
              'Program Growth': `${data.overview.programGrowth}%`,
              'Total Activities': data.overview.totalActivities,
              'Activity Growth': `${data.overview.activityGrowth}%`,
              'Total Beneficiaries': data.overview.totalBeneficiaries,
              'Beneficiary Growth': `${data.overview.beneficiaryGrowth}%`,
            }],
          },
          {
            name: 'Budget Trend',
            data: data.budgetTrend.map((item: any) => ({
              'Period': item.period,
              'Planned': item.planned,
              'Realized': item.realized,
              'Difference': item.planned - item.realized,
            })),
          },
          {
            name: 'Program Distribution',
            data: data.programDistribution.map((item: any) => ({
              'Category': item.name,
              'Count': item.count,
              'Budget': item.budget,
            })),
          },
          {
            name: 'Activity Status',
            data: data.activityStatus.map((item: any) => ({
              'Status': item.status,
              'Count': item.count,
            })),
          },
          {
            name: 'Department Performance',
            data: data.departmentPerformance.map((item: any) => ({
              'Department': item.name,
              'Completion Rate': `${item.completion}%`,
              'Budget': item.budget,
            })),
          },
          {
            name: 'Top Programs',
            data: data.topPrograms.map((item: any) => ({
              'Program': item.name,
              'Completion': `${item.completion}%`,
              'Budget': item.budget,
              'Impact Score': item.impact,
            })),
          },
        ],
      };

      return ApiResponse.success({ data: excelData, format: 'excel' });
    }

    // Default: JSON
    return ApiResponse.success({ data, format: 'json', period });
  } catch (error: any) {
    console.error('GET /api/analytics/export error:', error);
    return ApiResponse.error(error.message, 500);
  }
}

