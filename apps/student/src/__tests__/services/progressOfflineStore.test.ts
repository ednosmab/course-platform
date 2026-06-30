import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createProgressOfflineStore } from '../../services/progressOfflineStore'
import type { ILessonProgressRepository } from '../../persistence/repos/types'

function createMockRepo(): ILessonProgressRepository {
  const store = new Map<string, { userId: string; lessonId: string; data: any; synced: boolean }>()

  return {
    upsert: vi.fn(async (userId, lessonId, data) => {
      store.set(`${userId}:${lessonId}`, { userId, lessonId, data, synced: false })
    }),
    getByUserAndLesson: vi.fn(async (userId, lessonId) => {
      const item = store.get(`${userId}:${lessonId}`)
      return item?.data ?? null
    }),
    getUnsynced: vi.fn(async () => {
      return Array.from(store.values())
        .filter((item) => !item.synced)
        .map((item) => ({ ...item.data, userId: item.userId, lessonId: item.lessonId }))
    }),
    markSynced: vi.fn(async (lessonId) => {
      for (const [key, value] of store.entries()) {
        if (key.endsWith(`:${lessonId}`)) {
          value.synced = true
        }
      }
    }),
    clearAll: vi.fn(async () => {
      store.clear()
    }),
  }
}

describe('progressOfflineStore', () => {
  let repo: ILessonProgressRepository
  let store: ReturnType<typeof createProgressOfflineStore>

  beforeEach(() => {
    repo = createMockRepo()
    store = createProgressOfflineStore(repo)
  })

  it('should save progress locally', async () => {
    await store.saveProgressLocal('user1', 'lesson1', {
      videoPosition: 120,
      percentageWatched: 50,
      blockStates: {},
      savedAt: '2026-01-01T00:00:00Z',
    })

    expect(repo.upsert).toHaveBeenCalledWith('user1', 'lesson1', {
      videoPosition: 120,
      percentageWatched: 50,
      blockStates: {},
      savedAt: '2026-01-01T00:00:00Z',
    })
  })

  it('should get progress locally', async () => {
    await store.saveProgressLocal('user1', 'lesson1', {
      videoPosition: 120,
      percentageWatched: 50,
      blockStates: {},
      savedAt: '2026-01-01T00:00:00Z',
    })

    const result = await store.getProgressLocal('user1', 'lesson1')
    expect(result).not.toBeNull()
    expect(result?.videoPosition).toBe(120)
  })

  it('should queue pending save', async () => {
    await store.queuePendingSave('user1', 'lesson1', {
      videoPosition: 120,
      percentageWatched: 50,
      blockStates: {},
      savedAt: '2026-01-01T00:00:00Z',
    })

    expect(repo.upsert).toHaveBeenCalled()
  })

  it('should get pending saves', async () => {
    await store.queuePendingSave('user1', 'lesson1', {
      videoPosition: 120,
      percentageWatched: 50,
      blockStates: {},
      savedAt: '2026-01-01T00:00:00Z',
    })

    const pending = await store.getPendingSaves()
    expect(pending).toHaveLength(1)
    expect(pending[0].userId).toBe('user1')
  })

  it('should mark as synced', async () => {
    await store.markSynced('lesson1')
    expect(repo.markSynced).toHaveBeenCalledWith('lesson1')
  })

  it('should clear all', async () => {
    await store.clearAll()
    expect(repo.clearAll).toHaveBeenCalled()
  })
})
