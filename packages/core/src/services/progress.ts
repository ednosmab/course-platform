import { StudentProgress, StudentProgressSchema } from '@projeto/types';
import type { IProgressRepository } from '../ports/IProgressRepository';

interface DebounceCache {
  [key: string]: {
    timer: ReturnType<typeof setTimeout> | null;
    lastPlayedSeconds: number;
    percentageWatched: number;
  };
}

const progressCache: DebounceCache = {};

export function createProgressService(
  progressRepo: IProgressRepository,
  certificateService: {
    checkAndIssue: (userId: string, lessonId: string) => Promise<any>;
  },
) {
  const evaluateLessonCompletion = async (
    userId: string,
    lessonId: string,
  ): Promise<StudentProgress | null> => {
    const blocks = await progressRepo.getLessonBlocks(lessonId);
    if (!blocks) return null;

    const testBlocks = blocks.filter((b: any) => b.layouts?.isTest === true);
    const progress = await progressRepo.getProgress(userId, lessonId);
    if (!progress) return null;

    const testsCompleted = progress.tests_completed ?? {};
    const videoPassed = progress.percentage_watched >= 85;
    const allTestsPassed = testBlocks.every((block: any) => {
      const testScore = testsCompleted[block.id];
      return testScore !== undefined && testScore >= 70;
    });

    const isComplete = videoPassed && allTestsPassed;

    if (isComplete && !progress.completed) {
      const now = new Date().toISOString();
      const result = await progressRepo.markCompleted(userId, lessonId, now);

      certificateService.checkAndIssue(userId, lessonId).catch((err) => {
        console.error('Error issuing certificate:', err);
      });

      return result;
    }

    return null;
  };

  return {
    async getLessonProgress(userId: string, lessonId: string): Promise<StudentProgress | null> {
      return progressRepo.getProgress(userId, lessonId);
    },

    async saveProgressImmediate(
      userId: string,
      lessonId: string,
      lastPlayedSeconds: number,
      percentageWatched: number,
    ): Promise<StudentProgress> {
      const progress = await progressRepo.upsert(userId, lessonId, {
        last_played_seconds: lastPlayedSeconds,
        percentage_watched: percentageWatched,
        updated_at: new Date().toISOString(),
      });

      await evaluateLessonCompletion(userId, lessonId).catch((err) => {
        console.error('Error evaluating lesson completion:', err);
      });

      return progress;
    },

    async submitTestScore(
      userId: string,
      lessonId: string,
      blockId: string,
      score: number,
    ): Promise<StudentProgress> {
      const clampedScore = Math.max(0, Math.min(100, score));
      const existing = await progressRepo.getTestCompleted(userId, lessonId);
      existing[blockId] = clampedScore;

      await progressRepo.upsert(userId, lessonId, {
        tests_completed: existing,
        updated_at: new Date().toISOString(),
      });

      const result = await evaluateLessonCompletion(userId, lessonId);
      if (result) return result;

      const progress = await progressRepo.getProgress(userId, lessonId);
      return progress!;
    },

    saveProgressDebounced(
      userId: string,
      lessonId: string,
      lastPlayedSeconds: number,
      percentageWatched: number,
      onSuccess?: (progress: StudentProgress) => void,
    ) {
      const cacheKey = `${userId}:${lessonId}`;

      if (!progressCache[cacheKey]) {
        progressCache[cacheKey] = { timer: null, lastPlayedSeconds, percentageWatched };
      } else {
        progressCache[cacheKey].lastPlayedSeconds = lastPlayedSeconds;
        progressCache[cacheKey].percentageWatched = Math.max(
          progressCache[cacheKey].percentageWatched,
          percentageWatched,
        );
      }

      if (progressCache[cacheKey].timer) clearTimeout(progressCache[cacheKey].timer!);

      progressCache[cacheKey].timer = setTimeout(async () => {
        try {
          const cached = progressCache[cacheKey];
          delete progressCache[cacheKey];
          const progress = await this.saveProgressImmediate(
            userId,
            lessonId,
            cached.lastPlayedSeconds,
            cached.percentageWatched,
          );
          if (onSuccess) onSuccess(progress);
        } catch (err) {
          console.error('Erro ao processar progresso debounced:', err);
        }
      }, 5000);
    },
  };
}
