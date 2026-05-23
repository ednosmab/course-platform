import { Certificate, CertificateSchema } from '@projeto/types';
import type { ICertificateRepository } from '../ports/ICertificateRepository';

function generateBsgiCode(): string {
  const uuid = crypto.randomUUID();
  return `BSGI-${uuid}`;
}

export function createCertificateService(repo: ICertificateRepository) {
  return {
    async getCourseIdFromLesson(lessonId: string): Promise<string | null> {
      return repo.getCourseIdFromLesson(lessonId);
    },

    async getCompletedLessonCount(
      userId: string,
      courseId: string,
    ): Promise<{ completed: number; total: number }> {
      return repo.getCompletedLessonCount(userId, courseId);
    },

    async getLessonScore(userId: string, lessonId: string): Promise<number> {
      const testBlocks = await repo.getLessonTestBlocks(lessonId);
      if (testBlocks.length === 0) return 100;

      const testsCompleted = await repo.getLessonTestScores(userId, lessonId);
      const scores = testBlocks.map((b: any) => testsCompleted[b.id] ?? 0);
      const total = scores.reduce((sum: number, s: number) => sum + s, 0);
      return Math.round(total / scores.length);
    },

    async getCourseAverage(userId: string, courseId: string): Promise<number> {
      const lessonIds = await repo.getLessonsByCourse(courseId);
      if (lessonIds.length === 0) return 0;

      const lessonScores = await Promise.all(
        lessonIds.map((id) => this.getLessonScore(userId, id)),
      );

      const sumScores = lessonScores.reduce((a: number, b: number) => a + b, 0);
      return lessonIds.length > 0 ? Math.round(sumScores / lessonIds.length) : 0;
    },

    async isCourseCompleted(userId: string, courseId: string): Promise<boolean> {
      const { completed, total } = await this.getCompletedLessonCount(userId, courseId);
      return total > 0 && completed >= total;
    },

    async issueCertificate(userId: string, courseId: string): Promise<Certificate | null> {
      const existing = await repo.findExistingCertificate(userId, courseId);
      if (existing) return null;

      const uuidBsgi = generateBsgiCode();
      return repo.insertCertificate(userId, courseId, uuidBsgi);
    },

    async checkAndIssue(userId: string, lessonId: string): Promise<Certificate | null> {
      const courseId = await repo.getCourseIdFromLesson(lessonId);
      if (!courseId) return null;

      const enabled = await repo.getCourseCertificateEnabled(courseId);
      if (!enabled) return null;

      const completed = await this.isCourseCompleted(userId, courseId);
      if (!completed) return null;

      const average = await this.getCourseAverage(userId, courseId);
      if (average < 70) return null;

      return this.issueCertificate(userId, courseId);
    },

    async getUserCertificates(userId: string): Promise<Certificate[]> {
      return repo.getUserCertificates(userId);
    },

    async getCertificate(id: string): Promise<Certificate | null> {
      return repo.getCertificate(id);
    },
  };
}
