import { NextRequest } from 'next/server';
import { ReportService } from '@projeto/core';

/**
 * @description GET /api/reports/progress - Gets progress metrics.
 * @returns JSON with total students, avg progress, completion rate, top lessons.
 */
export async function GET() {
  try {
    const report = await ReportService.getProgressReport();
    return Response.json(report);
  } catch (error) {
    console.error('Error getting progress report:', error);
    return Response.json(
      { error: 'Failed to get progress report' },
      { status: 500 }
    );
  }
}
