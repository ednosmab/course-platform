import type { ILessonProgressRepository } from '../persistence/repos/types'
import type { LocalProgressData } from '../persistence/repos/types'

export type { LocalProgressData }

/**
 * @description Service for local lesson progress operations.
 * Delegates all persistence to ILessonProgressRepository.
 * No Platform.OS checks — platform decisions live in the repository layer.
 */
export function createProgressOfflineStore(
  repo: ILessonProgressRepository,
) {
  return {
    async saveProgressLocal(
      userId: string,
      lessonId: string,
      data: LocalProgressData,
    ): Promise<void> {
      await repo.upsert(userId, lessonId, data)
    },

    async getProgressLocal(
      userId: string,
      lessonId: string,
    ): Promise<LocalProgressData | null> {
      return repo.getByUserAndLesson(userId, lessonId)
    },

    async queuePendingSave(
      userId: string,
      lessonId: string,
      data: LocalProgressData,
    ): Promise<void> {
      await repo.upsert(userId, lessonId, data)
    },

    async getPendingSaves(): Promise<
      { userId: string; lessonId: string; data: LocalProgressData; savedAt: string }[]
    > {
      return repo.getUnsynced()
    },

    async clearPendingSave(lessonId: string): Promise<void> {
      await repo.markSynced(lessonId)
    },

    async markSynced(lessonId: string): Promise<void> {
      await repo.markSynced(lessonId)
    },

    async clearAll(): Promise<void> {
      await repo.clearAll()
    },
  }
}
