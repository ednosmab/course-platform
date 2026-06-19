import { CourseReport, EnrollmentReport, CertificateReport, ProgressReport, LessonRevisitReport } from '@projeto/types';

/**
 * @description Repository interface for reporting and analytics operations.
 * Defines the contract for retrieving aggregated metrics and statistics.
 * Business rule: All report queries are admin-only and use aggregate functions.
 */
export interface IReportRepository {
  /**
   * @description Retrieves course performance reports.
   * Business rule: Returns courses sorted by enrollment count descending.
   * @returns Promise resolving to array of CourseReport objects.
   */
  getCourseReports(): Promise<CourseReport[]>;

  /**
   * @description Retrieves enrollment statistics for a given period.
   * @param period - Time period filter: '7d', '30d', '90d', or 'all'.
   * @returns Promise resolving to EnrollmentReport with aggregates.
   */
  getEnrollmentReports(period: string): Promise<EnrollmentReport>;

  /**
   * @description Retrieves certificate issuance statistics.
   * @returns Promise resolving to CertificateReport with timeline data.
   */
  getCertificateReports(): Promise<CertificateReport>;

  /**
   * @description Retrieves progress metrics for reporting.
   * @returns Promise resolving to ProgressReport with top lessons and aggregates.
   */
  getProgressReport(): Promise<ProgressReport>;

  /**
   * @description Retrieves top courses by enrollment and completion.
   * @param limit - Maximum number of courses to return (default 10).
   * @returns Promise resolving to array of CourseReport objects sorted by enrollment.
   */
  getTopCourses(limit?: number): Promise<CourseReport[]>;

  /**
   * @description Retrieves lesson revisit analytics.
   * Shows which lessons are re-watched, by whom, and revisit patterns.
   * @param period - Time period filter: '7d', '30d', '90d', or 'all'.
   * @returns Promise resolving to LessonRevisitReport with aggregates.
   */
  getLessonRevisitReport(period?: string): Promise<LessonRevisitReport>;
}
