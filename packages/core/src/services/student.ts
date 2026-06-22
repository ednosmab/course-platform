import type {
  Profile,
  Enrollment,
  StudentProgress,
} from '@projeto/types';
import type { IStudentRepository } from '../ports/IStudentRepository';

/**
 * @description Creates a student service that manages student profiles, enrollments,
 * and progress tracking for the admin panel. All data operations are delegated
 * to an IStudentRepository implementation.
 * Business rule: Admin-only operations for student management.
 * @param repo - An implementation of IStudentRepository
 * @returns An object with student management methods
 */
export function createStudentService(repo: IStudentRepository) {
  return {
    /**
     * @description Lists all students with optional filters and search.
     * @param query - Optional filters: search, status, courseId, planId.
     * @returns Array of students with enrollment counts
     */
    async listStudents(query?: {
      search?: string;
      status?: string;
      courseId?: string;
      planId?: string;
    }): Promise<(Profile & { enrollment_count: number })[]> {
      return repo.listStudents(query);
    },

    /**
     * @description Retrieves a single student by ID.
     * @param studentId - The UUID of the student.
     * @returns The student profile
     */
    async getStudentById(studentId: string): Promise<Profile> {
      return repo.getStudentById(studentId);
    },

    /**
     * @description Creates a new student profile.
     * @param data - Student data (email, full_name, role).
     * @returns The newly created student profile
     */
    async createStudent(data: {
      email: string;
      full_name: string;
      role?: string;
    }): Promise<Profile> {
      return repo.createStudent(data);
    },

    /**
     * @description Updates an existing student profile.
     * @param studentId - The UUID of the student.
     * @param data - Fields to update.
     */
    async updateStudent(
      studentId: string,
      data: Partial<Pick<Profile, 'email' | 'full_name' | 'role'>>
    ): Promise<void> {
      return repo.updateStudent(studentId, data);
    },

    /**
     * @description Permanently removes a student.
     * @param studentId - The UUID of the student.
     */
    async deleteStudent(studentId: string): Promise<void> {
      return repo.deleteStudent(studentId);
    },

    /**
     * @description Retrieves all enrollments for a student.
     * @param studentId - The UUID of the student.
     * @returns Array of enrollments
     */
    async getEnrollmentsByStudent(studentId: string): Promise<Enrollment[]> {
      return repo.getEnrollmentsByStudent(studentId);
    },

    /**
     * @description Assigns a student to a plan.
     * @param studentId - The UUID of the student.
     * @param planId - The UUID of the plan.
     */
    async assignToPlan(studentId: string, planId: string): Promise<void> {
      return repo.assignToPlan(studentId, planId);
    },

    /**
     * @description Enrolls a student in a course.
     * @param studentId - The UUID of the student.
     * @param courseId - The UUID of the course.
     * @param expiresAt - Optional expiration date.
     */
    async assignToCourse(
      studentId: string,
      courseId: string,
      expiresAt?: string
    ): Promise<void> {
      return repo.assignToCourse(studentId, courseId, expiresAt);
    },

    /**
     * @description Removes an enrollment.
     * @param enrollmentId - The UUID of the enrollment.
     */
    async removeEnrollment(enrollmentId: string): Promise<void> {
      return repo.removeEnrollment(enrollmentId);
    },

    /**
     * @description Updates enrollment status.
     * @param enrollmentId - The UUID of the enrollment.
     * @param status - New status.
     */
    async updateEnrollmentStatus(
      enrollmentId: string,
      status: string
    ): Promise<void> {
      return repo.updateEnrollmentStatus(enrollmentId, status);
    },

    /**
     * @description Gets progress summary for a student.
     * @param studentId - The UUID of the student.
     * @returns Array of progress records with course/lesson info
     */
    async getStudentProgress(
      studentId: string
    ): Promise<(StudentProgress & { course_title: string; lesson_title: string })[]> {
      return repo.getStudentProgress(studentId);
    },
  };
}
