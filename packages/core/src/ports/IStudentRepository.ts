import type { Profile, Enrollment, StudentProgress } from '@projeto/types';

/**
 * @description Repository interface for Student management operations.
 * Defines the contract for persisting and retrieving student profiles,
 * enrollments, and progress from the data layer.
 * Business rule: Admin-only operations for student management.
 */
export interface IStudentRepository {
  /**
   * @description Lists all students with optional filters and search.
   * Business rule: Returns profiles with role='student' including enrollment count.
   * @param query - Optional filters: search (name/email), status, courseId, planId.
   * @returns Promise resolving to an array of Profile objects with enrollment metadata.
   */
  listStudents(query?: {
    search?: string;
    status?: string;
    courseId?: string;
    planId?: string;
  }): Promise<(Profile & { enrollment_count: number })[]>;

  /**
   * @description Retrieves a single student by ID with full details.
   * @param studentId - The UUID of the student.
   * @returns Promise resolving to the Profile object.
   */
  getStudentById(studentId: string): Promise<Profile>;

  /**
   * @description Creates a new student profile.
   * @param data - Object containing email, full_name, and optional role.
   * @returns Promise resolving to the newly created Profile.
   */
  createStudent(data: { email: string; full_name: string; role?: string }): Promise<Profile>;

  /**
   * @description Updates an existing student profile.
   * @param studentId - The UUID of the student to update.
   * @param data - Partial object with fields to update.
   * @returns Promise resolving when update completes.
   */
  updateStudent(studentId: string, data: Partial<Pick<Profile, 'email' | 'full_name' | 'role'>>): Promise<void>;

  /**
   * @description Permanently removes a student and associated data.
   * @param studentId - The UUID of the student to delete.
   * @returns Promise resolving when deletion completes.
   */
  deleteStudent(studentId: string): Promise<void>;

  /**
   * @description Retrieves all enrollments for a specific student.
   * @param studentId - The UUID of the student.
   * @returns Promise resolving to an array of Enrollment objects.
   */
  getEnrollmentsByStudent(studentId: string): Promise<Enrollment[]>;

  /**
   * @description Assigns a student to a plan.
   * @param studentId - The UUID of the student.
   * @param planId - The UUID of the plan.
   * @returns Promise resolving when assignment completes.
   */
  assignToPlan(studentId: string, planId: string): Promise<void>;

  /**
   * @description Enrolls a student in a course.
   * @param studentId - The UUID of the student.
   * @param courseId - The UUID of the course.
   * @param expiresAt - Optional expiration date.
   * @returns Promise resolving when enrollment completes.
   */
  assignToCourse(studentId: string, courseId: string, expiresAt?: string): Promise<void>;

  /**
   * @description Removes an enrollment record.
   * @param enrollmentId - The UUID of the enrollment to remove.
   * @returns Promise resolving when removal completes.
   */
  removeEnrollment(enrollmentId: string): Promise<void>;

  /**
   * @description Updates enrollment status.
   * @param enrollmentId - The UUID of the enrollment.
   * @param status - New status (active/expired/canceled).
   * @returns Promise resolving when update completes.
   */
  updateEnrollmentStatus(enrollmentId: string, status: string): Promise<void>;

  /**
   * @description Gets progress summary for a student across all courses.
   * @param studentId - The UUID of the student.
   * @returns Promise resolving to array of progress records with course info.
   */
  getStudentProgress(studentId: string): Promise<(StudentProgress & { course_title: string; lesson_title: string })[]>;
}
