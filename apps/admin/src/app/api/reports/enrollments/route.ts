import { NextRequest } from 'next/server';
import { ReportService } from '@projeto/core';

/**
 * @description GET /api/reports/enrollments - Gets enrollment statistics.
 * Query params: period (7d, 30d, 90d, all).
 * @returns JSON with total, active, expired, canceled, new_in_period, by_course.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') ?? '30d';

    const report = await ReportService.getEnrollmentReports(period);
    return Response.json(report);
  } catch (error) {
    console.error('Error getting enrollment report:', error);
    return Response.json(
      { error: 'Failed to get enrollment report' },
      { status: 500 }
    );
  }
}
