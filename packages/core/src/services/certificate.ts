import type { Certificate, Course } from '@projeto/types';
import type { ICertificateRepository } from '../ports/ICertificateRepository';
import type { ICourseRepository } from '../ports/ICourseRepository';
import type { ILessonRepository } from '../ports/ILessonRepository';
import type { IProgressRepository } from '../ports/IProgressRepository';

function generateExtranetCode(): string {
  const uuid = crypto.randomUUID();
  return `EXTR-${uuid}`;
}

/**
 * @description Creates a certificate service that manages the full certificate lifecycle:
 * lesson-score computation, course-average calculation, completion verification,
 * external-validation-code generation, and certificate issuance for the CMS platform.
 * Business rule: Certificates are only issued when the course average is >= 70%
 * and all lessons are completed. Duplicate issuance is prevented.
 * @param certRepo - An implementation of ICertificateRepository for certificate persistence
 * @param courseRepo - An implementation of ICourseRepository for course-level checks
 * @param lessonRepo - An implementation of ILessonRepository for lesson queries
 * @param progressRepo - An implementation of IProgressRepository for progress queries
 * @returns An object with certificate query, scoring, and issuance methods
 */
export function createCertificateService(
  certRepo: ICertificateRepository,
  courseRepo: Pick<ICourseRepository, 'getCourse' | 'getCourseCertificateEnabled' | 'getAllCourses'>,
  lessonRepo: Pick<ILessonRepository, 'getCourseIdFromLesson' | 'getLessonTestBlocks' | 'getLessonsByCourse'>,
  progressRepo: Pick<IProgressRepository, 'getCompletedLessonCount' | 'getLessonTestScores' | 'getProgressByLessons'>,
) {
  return {
    /**
     * @description Resolves the course ID that contains a given lesson.
     * Used internally to determine which course context a lesson belongs to.
     * @param lessonId - The UUID of the lesson
     * @returns The course UUID as a string, or null if the lesson is not found
     */
    async getCourseIdFromLesson(lessonId: string): Promise<string | null> {
      return lessonRepo.getCourseIdFromLesson(lessonId);
    },

    /**
     * @description Counts completed and total lessons for a given user and course.
     * Business rule: A lesson is considered completed when its progress record
     * has the completed flag set to true.
     * @param userId - The UUID of the student
     * @param courseId - The UUID of the course
     * @returns An object with `completed` (number) and `total` (number) lesson counts
     */
    async getCompletedLessonCount(
      userId: string,
      courseId: string,
    ): Promise<{ completed: number; total: number }> {
      return progressRepo.getCompletedLessonCount(userId, courseId);
    },

    /**
     * @description Computes the average score for a single lesson by averaging all test-block scores.
     * Business rule: If the lesson has no test blocks, it is considered automatically passed (score 100).
     * Each test block is scored individually; missing scores default to 0.
     * @param userId - The UUID of the student
     * @param lessonId - The UUID of the lesson
     * @returns The average score as a rounded integer (0–100)
     */
    async getLessonScore(userId: string, lessonId: string): Promise<number> {
      const testBlocks = await lessonRepo.getLessonTestBlocks(lessonId);
      if (testBlocks.length === 0) return 100;

      const testsCompleted = await progressRepo.getLessonTestScores(userId, lessonId);
      const scores = testBlocks.map((b: any) => testsCompleted[b.id] ?? 0);
      const total = scores.reduce((sum: number, s: number) => sum + s, 0);
      return Math.round(total / scores.length);
    },

    /**
     * @description Computes the overall average score for a course by averaging all lesson scores.
     * Business rule: If the course has no lessons, the average is 0.
     * @param userId - The UUID of the student
     * @param courseId - The UUID of the course
     * @returns The course average as a rounded integer (0–100)
     */
    async getCourseAverage(userId: string, courseId: string): Promise<number> {
      const lessonIds = await lessonRepo.getLessonsByCourse(courseId);
      if (lessonIds.length === 0) return 0;

      const lessonScores = await Promise.all(
        lessonIds.map((id) => this.getLessonScore(userId, id)),
      );

      const sumScores = lessonScores.reduce((a: number, b: number) => a + b, 0);
      return lessonIds.length > 0 ? Math.round(sumScores / lessonIds.length) : 0;
    },

    /**
     * @description Checks whether a student has completed all lessons in a course.
     * Business rule: Completion requires that completed lessons equal or exceed total lessons,
     * and the total lesson count must be greater than zero.
     * @param userId - The UUID of the student
     * @param courseId - The UUID of the course
     * @returns True if all lessons are completed, false otherwise
     */
    async isCourseCompleted(userId: string, courseId: string): Promise<boolean> {
      const { completed, total } = await this.getCompletedLessonCount(userId, courseId);
      return total > 0 && completed >= total;
    },

    /**
     * @description Issues a new external-validation certificate for a user and course.
     * Business rule: A certificate can only be issued once per user-course pair.
     * If a certificate already exists, this method returns null.
     * Each certificate gets a unique EXTR-XXXXXXXX code.
     * @param userId - The UUID of the student
     * @param courseId - The UUID of the course
     * @returns The newly created Certificate object, or null if one already exists
     */
    async issueCertificate(userId: string, courseId: string): Promise<Certificate | null> {
      const existing = await certRepo.findExistingCertificate(userId, courseId);
      if (existing) return null;

      const uuidExtranet = generateExtranetCode();
      return certRepo.insertCertificate(userId, courseId, uuidExtranet);
    },

    /**
     * @description Full certificate check-and-issue pipeline triggered after a lesson is completed.
     * Business rule: All conditions must be met for issuance — the lesson must belong to a course,
     * the course must have certificates enabled, all lessons must be completed,
     * and the course average must be >= 70.
     * @param userId - The UUID of the student
     * @param lessonId - The UUID of the lesson that was just completed
     * @returns The newly issued Certificate object, or null if any condition fails
     */
    async checkAndIssue(userId: string, lessonId: string): Promise<Certificate | null> {
      const courseId = await lessonRepo.getCourseIdFromLesson(lessonId);
      if (!courseId) return null;

      const enabled = await courseRepo.getCourseCertificateEnabled(courseId);
      if (!enabled) return null;

      const completed = await this.isCourseCompleted(userId, courseId);
      if (!completed) return null;

      const average = await this.getCourseAverage(userId, courseId);
      if (average < 70) return null;

      return this.issueCertificate(userId, courseId);
    },

    /**
     * @description Retrieves course metadata for certificate display.
     * Returns only the fields needed for rendering the certificate template.
     * @param courseId - The UUID of the course
     * @returns The Course object containing title, description, thumbnail_url
     */
    async getCourseData(courseId: string): Promise<Course> {
      return courseRepo.getCourse(courseId);
    },

    /**
     * @description Retrieves all certificates issued to a given user.
     * @param userId - The UUID of the student
     * @returns An array of Certificate objects owned by the user
     */
    async getUserCertificates(userId: string): Promise<Certificate[]> {
      return certRepo.getUserCertificates(userId);
    },

    /**
     * @description Retrieves a single certificate by its unique ID.
     * @param id - The UUID of the certificate
     * @returns The Certificate object, or null if not found
     */
    async getCertificate(id: string): Promise<Certificate | null> {
      return certRepo.getCertificate(id);
    },

    /**
     * @description Re-checks certificate eligibility for all completed courses and issues
     * any missing certificates. Used as a recovery mechanism when previous issuance attempts
     * failed (e.g., due to RLS policy issues).
     * @param userId - The UUID of the student
     * @returns Array of newly issued certificates
     */
    async recheckAndIssueAll(userId: string): Promise<Certificate[]> {
      const issued: Certificate[] = [];
      const courses = await courseRepo.getAllCourses();

      for (const course of courses) {
        if (!course.certificate_enabled) continue;

        const existing = await certRepo.findExistingCertificate(userId, course.id);
        if (existing) continue;

        const completed = await this.isCourseCompleted(userId, course.id);
        if (!completed) continue;

        const average = await this.getCourseAverage(userId, course.id);
        if (average < 70) continue;

        const cert = await this.issueCertificate(userId, course.id);
        if (cert) issued.push(cert);
      }

      return issued;
    },
  };
}
