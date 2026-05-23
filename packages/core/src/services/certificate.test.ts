import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCertificateService } from './certificate';

function makeCertRepo() {
  return {
    getCourseIdFromLesson: vi.fn(),
    getCompletedLessonCount: vi.fn(),
    getLessonTestBlocks: vi.fn(),
    getLessonTestScores: vi.fn(),
    getLessonsByCourse: vi.fn(),
    getProgressByLessons: vi.fn(),
    getCourseCertificateEnabled: vi.fn(),
    findExistingCertificate: vi.fn(),
    insertCertificate: vi.fn(),
    getUserCertificates: vi.fn(),
    getCertificate: vi.fn(),
  };
}

describe('CertificateService', () => {
  let repo: ReturnType<typeof makeCertRepo>;
  let service: ReturnType<typeof createCertificateService>;

  beforeEach(() => {
    repo = makeCertRepo();
    service = createCertificateService(repo);
  });

  describe('getCourseIdFromLesson', () => {
    it('should return course id from lesson', async () => {
      repo.getCourseIdFromLesson.mockResolvedValue('course-1');
      const result = await service.getCourseIdFromLesson('lesson-1');
      expect(result).toBe('course-1');
    });

    it('should return null when lesson not found', async () => {
      repo.getCourseIdFromLesson.mockResolvedValue(null);
      const result = await service.getCourseIdFromLesson('unknown');
      expect(result).toBeNull();
    });
  });

  describe('getCompletedLessonCount', () => {
    it('should return completed/total from repo', async () => {
      repo.getCompletedLessonCount.mockResolvedValue({ completed: 3, total: 5 });
      const result = await service.getCompletedLessonCount('u1', 'c1');
      expect(result).toEqual({ completed: 3, total: 5 });
    });
  });

  describe('isCourseCompleted', () => {
    it('should return true when completed >= total', async () => {
      repo.getCompletedLessonCount.mockResolvedValue({ completed: 5, total: 5 });
      const result = await service.isCourseCompleted('user-1', 'course-1');
      expect(result).toBe(true);
    });

    it('should return false when not all lessons completed', async () => {
      repo.getCompletedLessonCount.mockResolvedValue({ completed: 3, total: 5 });
      const result = await service.isCourseCompleted('user-1', 'course-1');
      expect(result).toBe(false);
    });
  });

  describe('getLessonScore', () => {
    it('should return 100 when no test blocks', async () => {
      repo.getLessonTestBlocks.mockResolvedValue([]);
      const result = await service.getLessonScore('user-1', 'lesson-1');
      expect(result).toBe(100);
    });

    it('should return average of test scores', async () => {
      repo.getLessonTestBlocks.mockResolvedValue([
        { id: 'b1', layouts: { isTest: true } },
        { id: 'b2', layouts: { isTest: true } },
      ]);
      repo.getLessonTestScores.mockResolvedValue({ b1: 80, b2: 90 });
      const result = await service.getLessonScore('user-1', 'lesson-1');
      expect(result).toBe(85);
    });

    it('should handle missing test scores (count as 0)', async () => {
      repo.getLessonTestBlocks.mockResolvedValue([
        { id: 'b1', layouts: { isTest: true } },
      ]);
      repo.getLessonTestScores.mockResolvedValue({});
      const result = await service.getLessonScore('user-1', 'lesson-1');
      expect(result).toBe(0);
    });
  });

  describe('getCourseAverage', () => {
    it('should return average across all lessons', async () => {
      repo.getLessonsByCourse.mockResolvedValue(['l1', 'l2']);
      repo.getLessonTestBlocks.mockResolvedValueOnce([]);
      repo.getLessonTestBlocks.mockResolvedValueOnce([
        { id: 'tb', layouts: { isTest: true } },
      ]);
      repo.getLessonTestScores.mockResolvedValue({ tb: 80 });

      const result = await service.getCourseAverage('user-1', 'course-1');
      expect(result).toBe(90);
    });
  });

  describe('issueCertificate', () => {
    it('should insert certificate with BSGI code', async () => {
      repo.findExistingCertificate.mockResolvedValue(null);
      repo.insertCertificate.mockResolvedValue({
        id: 'cert-1',
        user_id: 'user-1',
        course_id: 'course-1',
        uuid_bsgi: 'BSGI-xxxx',
        issued_at: new Date().toISOString(),
      });

      const result = await service.issueCertificate('user-1', 'course-1');
      expect(result).not.toBeNull();
      expect(result!.uuid_bsgi).toContain('BSGI-');
    });

    it('should not issue duplicate certificate', async () => {
      repo.findExistingCertificate.mockResolvedValue({ id: 'existing' } as any);
      const result = await service.issueCertificate('user-1', 'course-1');
      expect(result).toBeNull();
    });
  });

  describe('getUserCertificates', () => {
    it('should return certificates from repo', async () => {
      const certs = [
        { id: 'c1', user_id: 'u1', course_id: 'course-1', uuid_bsgi: 'BSGI-abc', issued_at: new Date().toISOString() },
      ];
      repo.getUserCertificates.mockResolvedValue(certs);
      const result = await service.getUserCertificates('u1');
      expect(result).toEqual(certs);
    });
  });

  describe('checkAndIssue', () => {
    it('should issue certificate when all conditions met', async () => {
      repo.getCourseIdFromLesson.mockResolvedValue('course-1');
      repo.getCourseCertificateEnabled.mockResolvedValue(true);
      repo.getCompletedLessonCount.mockResolvedValue({ completed: 2, total: 2 });
      repo.getLessonsByCourse.mockResolvedValue(['l1', 'l2']);
      repo.getLessonTestBlocks.mockResolvedValueOnce([]);
      repo.getLessonTestBlocks.mockResolvedValueOnce([
        { id: 'tb', layouts: { isTest: true } },
      ]);
      repo.getLessonTestScores.mockResolvedValue({ tb: 80 });
      repo.findExistingCertificate.mockResolvedValue(null);
      repo.insertCertificate.mockResolvedValue({
        id: 'cert-1', user_id: 'u1', course_id: 'course-1',
        uuid_bsgi: 'BSGI-abc', issued_at: new Date().toISOString(),
      });

      const result = await service.checkAndIssue('u1', 'lesson-2');
      expect(result).not.toBeNull();
    });

    it('should return null when certificate not enabled', async () => {
      repo.getCourseIdFromLesson.mockResolvedValue('course-1');
      repo.getCourseCertificateEnabled.mockResolvedValue(false);
      const result = await service.checkAndIssue('u1', 'lesson-1');
      expect(result).toBeNull();
    });

    it('should return null when course incomplete', async () => {
      repo.getCourseIdFromLesson.mockResolvedValue('course-1');
      repo.getCourseCertificateEnabled.mockResolvedValue(true);
      repo.getCompletedLessonCount.mockResolvedValue({ completed: 1, total: 5 });
      const result = await service.checkAndIssue('u1', 'lesson-1');
      expect(result).toBeNull();
    });

    it('should return null when average < 70', async () => {
      repo.getCourseIdFromLesson.mockResolvedValue('course-1');
      repo.getCourseCertificateEnabled.mockResolvedValue(true);
      repo.getCompletedLessonCount.mockResolvedValue({ completed: 2, total: 2 });
      repo.getLessonsByCourse.mockResolvedValue(['l1', 'l2']);
      repo.getLessonTestBlocks.mockResolvedValue([
        { id: 'tb', layouts: { isTest: true } },
      ]);
      repo.getLessonTestScores.mockResolvedValue({ tb: 30 });
      const result = await service.checkAndIssue('u1', 'lesson-2');
      expect(result).toBeNull();
    });
  });
});
