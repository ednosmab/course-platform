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

/**
 * @description Creates a progress service that tracks student lesson progress including
 * video watch percentage, test scores, lesson completion evaluation, and debounced saving.
 * Business rule: A lesson is considered completed when the student has watched >= 85% of the
 * video AND passed all test blocks with a score >= 70%. Upon completion, the service
 * automatically triggers certificate check-and-issuance.
 * @param progressRepo - An implementation of IProgressRepository for progress persistence
 * @param certificateService - An object with a checkAndIssue method for certificate auto-issuance
 * @returns An object with progress query, save, and test-submission methods
 */
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
    const hasVideoBlocks = blocks.some((b: any) => b.type === 'video');
    const videoPassed = hasVideoBlocks ? progress.percentage_watched >= 85 : true;
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
    /**
     * @description Retrieves the current progress record for a specific user and lesson.
     * @param userId - The UUID of the student
     * @param lessonId - The UUID of the lesson
     * @returns The StudentProgress object, or null if no progress record exists
     */
    async getLessonProgress(userId: string, lessonId: string): Promise<StudentProgress | null> {
      return progressRepo.getProgress(userId, lessonId);
    },

    /**
     * @description Retrieves progress records for a student across multiple lessons at once.
     * Used by the CourseLessons screen to display completion status for all lessons in a course.
     * @param userId - The UUID of the student
     * @param lessonIds - Array of lesson UUIDs to fetch progress for
     * @returns Array of progress records with lesson_id, completed, tests_completed, percentage_watched, and last_played_seconds
     */
    async getProgressByLessons(userId: string, lessonIds: string[]): Promise<any[]> {
      return progressRepo.getProgressByLessons(userId, lessonIds);
    },

    /**
     * @description Calculates completion percentage for a set of lessons belonging to a module.
     * Business rule: Module progress = (completed lessons / total lessons) * 100.
     * Used by CourseLessons to display per-module progress bars.
     * @param userId - The UUID of the student
     * @param lessonIds - Array of lesson UUIDs in the module
     * @returns Object with completed count, total count, and percentage (0-100)
     */
    async getModuleProgress(userId: string, lessonIds: string[]): Promise<{ completed: number; total: number; percentage: number }> {
      const progressData = await progressRepo.getProgressByLessons(userId, lessonIds);
      const completed = progressData.filter((p: any) => p.completed).length;
      const total = lessonIds.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { completed, total, percentage };
    },

    /**
     * @description Counts completed and total lessons for a user within a course.
     * Used by StudentCourses to compute per-course completion status.
     * @param userId - The UUID of the student
     * @param courseId - The UUID of the course
     * @returns Object with completed and total lesson counts
     */
    async getCompletedLessonCount(userId: string, courseId: string): Promise<{ completed: number; total: number }> {
      return progressRepo.getCompletedLessonCount(userId, courseId);
    },

    /**
     * @description Immediately saves the current video progress (position and watch percentage)
     * and evaluates lesson completion. Used for critical progress checkpoints.
     * Business rule: Save is performed immediately without debouncing. Completion evaluation
     * runs after the save — errors in completion evaluation are logged but do not block the save.
     * @param userId - The UUID of the student
     * @param lessonId - The UUID of the lesson
     * @param lastPlayedSeconds - The last playback position in seconds
     * @param percentageWatched - The percentage of the video watched (0–100)
     * @returns The updated StudentProgress object
     */
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

    /**
     * @description Submits a score for a specific test block within a lesson.
     * Business rule: The score is clamped to the 0–100 range. After updating the test score,
     * the service re-evaluates lesson completion — if all conditions are now met,
     * the lesson is marked complete and certificate issuance is triggered.
     * @param userId - The UUID of the student
     * @param lessonId - The UUID of the lesson
     * @param blockId - The UUID of the test block
     * @param score - The test score (will be clamped to 0–100)
     * @returns The updated StudentProgress object
     */
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

    /**
     * @description Marks a lesson as complete for a user, regardless of video progress.
     * Business rule: Used for lessons without video content (images, text, HTML) where
     * the 85% video rule does not apply. Triggers certificate eligibility checks.
     * @param userId - The UUID of the student
     * @param lessonId - The UUID of the lesson
     * @returns The updated StudentProgress object
     */
    async markLessonComplete(userId: string, lessonId: string): Promise<StudentProgress> {
      const now = new Date().toISOString();
      const progress = await progressRepo.upsert(userId, lessonId, {
        percentage_watched: 100,
        completed: true,
        completed_at: now,
        updated_at: now,
      });

      certificateService.checkAndIssue(userId, lessonId).catch((err) => {
        console.error('Error issuing certificate after manual completion:', err);
      });

      return progress;
    },

    /**
     * @description Saves video progress with a 5-second debounce to reduce write frequency
     * during continuous playback. Tracks the highest percentage watched per user-lesson pair.
     * Business rule: Only the maximum watched percentage is persisted — if a later call reports
     * a lower percentage than a previous one, the higher value is retained.
     * @param userId - The UUID of the student
     * @param lessonId - The UUID of the lesson
     * @param lastPlayedSeconds - The current playback position in seconds
     * @param percentageWatched - The current watch percentage (0–100)
     * @param onSuccess - Optional callback invoked with the saved StudentProgress on success
     */
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
          console.error('Debounced progress processing failed:', err);
        }
      }, 5000);
    },
  };
}
