import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProgressService } from './progress';

function makeProgressRepo() {
  return {
    getProgress: vi.fn(),
    upsert: vi.fn(),
    getTestCompleted: vi.fn(),
    markCompleted: vi.fn(),
    getLessonBlocks: vi.fn(),
    getCompletedLessonCount: vi.fn(),
    getLessonTestScores: vi.fn(),
    getProgressByLessons: vi.fn(),
  };
}

function makeCertService() {
  return {
    checkAndIssue: vi.fn().mockResolvedValue({ id: 'cert-1' }),
  };
}

describe('ProgressService', () => {
  let progressRepo: ReturnType<typeof makeProgressRepo>;
  let certService: ReturnType<typeof makeCertService>;
  let service: ReturnType<typeof createProgressService>;

  beforeEach(() => {
    progressRepo = makeProgressRepo();
    certService = makeCertService();
    service = createProgressService(progressRepo, certService);
  });

  describe('saveProgressImmediate', () => {
    it('should upsert progress with correct data', async () => {
      progressRepo.upsert.mockResolvedValue({
        user_id: 'user-1',
        lesson_id: 'lesson-1',
        last_played_seconds: 120,
        percentage_watched: 50,
        completed: false,
        tests_completed: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      progressRepo.getLessonBlocks.mockResolvedValue([]);
      progressRepo.getProgress.mockResolvedValue({
        user_id: 'user-1',
        lesson_id: 'lesson-1',
        last_played_seconds: 120,
        percentage_watched: 50,
        completed: false,
        tests_completed: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const result = await service.saveProgressImmediate('user-1', 'lesson-1', 120, 50);
      expect(progressRepo.upsert).toHaveBeenCalledWith('user-1', 'lesson-1', expect.objectContaining({
        last_played_seconds: 120,
        percentage_watched: 50,
      }));
      expect(result.percentage_watched).toBe(50);
    });

    it('should mark completed when video >= 85% and no tests', async () => {
      progressRepo.getLessonBlocks.mockResolvedValue([]);
      progressRepo.getProgress.mockResolvedValue({
        user_id: 'u1', lesson_id: 'l1', completed: false,
        percentage_watched: 90, last_played_seconds: 100,
        tests_completed: {},
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      });
      progressRepo.upsert.mockResolvedValue({
        user_id: 'u1', lesson_id: 'l1', completed: false,
        percentage_watched: 90, last_played_seconds: 100,
        tests_completed: {},
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      });
      progressRepo.markCompleted.mockResolvedValue({
        user_id: 'u1', lesson_id: 'l1', completed: true,
        percentage_watched: 90, last_played_seconds: 100,
        tests_completed: {},
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      });

      await service.saveProgressImmediate('u1', 'l1', 100, 90);

      expect(progressRepo.markCompleted).toHaveBeenCalledWith('u1', 'l1', expect.any(String));
    });

    it('should not mark completed when video < 85%', async () => {
      progressRepo.getLessonBlocks.mockResolvedValue([]);
      progressRepo.getProgress.mockResolvedValue({
        user_id: 'u1', lesson_id: 'l1', completed: false,
        percentage_watched: 50, last_played_seconds: 50,
        tests_completed: {},
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      });
      progressRepo.upsert.mockResolvedValue({
        user_id: 'u1', lesson_id: 'l1', completed: false,
        percentage_watched: 50, last_played_seconds: 50,
        tests_completed: {},
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      });

      await service.saveProgressImmediate('u1', 'l1', 50, 50);

      expect(progressRepo.markCompleted).not.toHaveBeenCalled();
    });
  });

  describe('submitTestScore', () => {
    it('should save score and evaluate completion', async () => {
      progressRepo.getTestCompleted.mockResolvedValue({});
      progressRepo.upsert.mockResolvedValue({
        user_id: 'u1', lesson_id: 'l1', completed: false,
        percentage_watched: 0, last_played_seconds: 0,
        tests_completed: { b1: 80 },
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      });
      progressRepo.getLessonBlocks.mockResolvedValue([]);
      progressRepo.getProgress.mockResolvedValue({
        user_id: 'u1', lesson_id: 'l1', completed: true,
        percentage_watched: 0, last_played_seconds: 0,
        tests_completed: { b1: 80 },
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      });
      progressRepo.markCompleted.mockResolvedValue({
        user_id: 'u1', lesson_id: 'l1', completed: true,
        percentage_watched: 0, last_played_seconds: 0,
        tests_completed: { b1: 80 },
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      });

      const result = await service.submitTestScore('u1', 'l1', 'b1', 80);
      expect(result.tests_completed?.b1).toBe(80);
    });

    it('should clamp score to 0-100 range', async () => {
      progressRepo.getTestCompleted.mockResolvedValue({});
      progressRepo.upsert.mockResolvedValue({
        user_id: 'u1', lesson_id: 'l1', completed: false,
        percentage_watched: 0, last_played_seconds: 0,
        tests_completed: { b1: 100 },
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      });
      progressRepo.getLessonBlocks.mockResolvedValue([]);
      progressRepo.getProgress.mockResolvedValue({
        user_id: 'u1', lesson_id: 'l1', completed: false,
        percentage_watched: 0, last_played_seconds: 0,
        tests_completed: { b1: 100 },
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      });

      const result = await service.submitTestScore('u1', 'l1', 'b1', 150);
      expect(result.tests_completed?.b1).toBe(100);
    });
  });

  describe('getLessonProgress', () => {
    it('should return progress from repo', async () => {
      const expected = {
        user_id: 'u1', lesson_id: 'l1', completed: false,
        percentage_watched: 50, last_played_seconds: 100,
        tests_completed: {},
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      };
      progressRepo.getProgress.mockResolvedValue(expected);
      const result = await service.getLessonProgress('u1', 'l1');
      expect(result).toEqual(expected);
    });
  });
});
