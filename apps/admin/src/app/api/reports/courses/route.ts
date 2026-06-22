import type { NextRequest } from 'next/server';
import { ReportService } from '@projeto/core';

/**
 * @description GET /api/reports/courses - Gets course performance reports.
 * Query params: limit (default 10).
 * @returns JSON array of course reports sorted by enrollment.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') ?? '10', 10);

    const report = await ReportService.getTopCourses(limit);
    return Response.json(report);
  } catch (error) {
    console.error('Error getting course report:', error);
    return Response.json(
      { error: 'Failed to get course report' },
      { status: 500 }
    );
  }
}
