import type { ILessonProgressRepository } from '../persistence/repos/types'
import type { ITelemetryProvider } from '../telemetry/types'
import { ProgressService } from '@projeto/core'

const AUTO_SYNC_INTERVAL_MS = 30000
let syncTimer: ReturnType<typeof setInterval> | null = null

/**
 * @description Service for bidirectional sync between local SQLite and Supabase.
 * Delegates all persistence to ILessonProgressRepository.
 * No Platform.OS checks — platform decisions live in the repository layer.
 */
export function createSyncService(
  progressRepo: ILessonProgressRepository,
  telemetry: ITelemetryProvider,
) {
  async function pushPendingProgress(): Promise<number> {
    const pending = await progressRepo.getUnsynced()
    let synced = 0

    for (const item of pending) {
      try {
        await ProgressService.saveLessonState(item.userId, item.lessonId, {
          lastPlayedSeconds: item.videoPosition,
          percentageWatched: item.percentageWatched,
          blockStates: item.blockStates,
        })
        await progressRepo.markSynced(item.lessonId)
        synced++
      } catch {
        // Item remains queued for next attempt
      }
    }

    telemetry.event('sync.completed', { pushed: synced })
    return synced
  }

  async function pullServerProgress(
    userId: string,
    lessonIds: string[],
  ): Promise<number> {
    let updated = 0

    for (const lessonId of lessonIds) {
      try {
        const serverProgress = await ProgressService.getProgressByLessons(userId, [lessonId])
        if (serverProgress && serverProgress.length > 0) {
          const p = serverProgress[0]
          await progressRepo.upsert(userId, lessonId, {
            videoPosition: p.lastPlayedSeconds || 0,
            percentageWatched: p.percentageWatched || 0,
            blockStates: p.blockStates || {},
            savedAt: p.updatedAt || new Date().toISOString(),
          })
          await progressRepo.markSynced(lessonId)
          updated++
        }
      } catch {
        // Continue with next lesson
      }
    }

    telemetry.event('sync.completed', { pulled: updated })
    return updated
  }

  async function syncAll(
    userId: string,
    lessonIds: string[],
  ): Promise<{ pushed: number; pulled: number }> {
    const pushed = await pushPendingProgress()
    const pulled = await pullServerProgress(userId, lessonIds)
    return { pushed, pulled }
  }

  function startAutoSync(
    getUserId: () => string | null,
    getLessonIds: () => string[],
  ): void {
    stopAutoSync()

    syncTimer = setInterval(async () => {
      try {
        const userId = getUserId()
        if (!userId) return
        const lessonIds = getLessonIds()
        if (lessonIds.length === 0) return
        await syncAll(userId, lessonIds)
      } catch {
        // Silent fail for auto-sync
      }
    }, AUTO_SYNC_INTERVAL_MS)
  }

  function stopAutoSync(): void {
    if (syncTimer) {
      clearInterval(syncTimer)
      syncTimer = null
    }
  }

  return {
    pushPendingProgress,
    pullServerProgress,
    syncAll,
    startAutoSync,
    stopAutoSync,
  }
}
