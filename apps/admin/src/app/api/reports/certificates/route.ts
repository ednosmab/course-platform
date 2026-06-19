import { NextRequest } from 'next/server';
import { ReportService } from '@projeto/core';

/**
 * @description GET /api/reports/certificates - Gets certificate issuance statistics.
 * @returns JSON with total, by_course, timeline.
 */
export async function GET() {
  try {
    const report = await ReportService.getCertificateReports();
    return Response.json(report);
  } catch (error) {
    console.error('Error getting certificate report:', error);
    return Response.json(
      { error: 'Failed to get certificate report' },
      { status: 500 }
    );
  }
}
