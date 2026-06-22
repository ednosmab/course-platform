import type {
  CourseReport,
  EnrollmentReport,
  CertificateReport,
  ProgressReport,
} from '@projeto/types';
import type { IReportRepository } from '../ports/IReportRepository';

/**
 * @description Creates a report service that provides analytics and metrics for the admin dashboard.
 * All operations are read-only and return aggregated data.
 * Business rule: Reports are admin-only and use pre-computed aggregates.
 * @param repo - An implementation of IReportRepository
 * @returns An object with report methods
 */
export function createReportService(repo: IReportRepository) {
  return {
    /**
     * @description Retrieves course performance reports.
     * @returns Array of course reports with enrollment and completion metrics
     */
    async getCourseReports(): Promise<CourseReport[]> {
      return repo.getCourseReports();
    },

    /**
     * @description Retrieves enrollment statistics for a given period.
     * @param period - Time period: '7d', '30d', '90d', or 'all'.
     * @returns Enrollment report with aggregates
     */
    async getEnrollmentReports(period: string): Promise<EnrollmentReport> {
      return repo.getEnrollmentReports(period);
    },

    /**
     * @description Retrieves certificate issuance statistics.
     * @returns Certificate report with timeline
     */
    async getCertificateReports(): Promise<CertificateReport> {
      return repo.getCertificateReports();
    },

    /**
     * @description Retrieves progress metrics.
     * @returns Progress report with top lessons
     */
    async getProgressReport(): Promise<ProgressReport> {
      return repo.getProgressReport();
    },

    /**
     * @description Retrieves top courses by enrollment.
     * @param limit - Maximum courses to return (default 10).
     * @returns Array of top course reports
     */
    async getTopCourses(limit?: number): Promise<CourseReport[]> {
      return repo.getTopCourses(limit);
    },
  };
}
