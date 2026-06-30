import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createSyncService } from '../../services/syncService'
import type { ILessonProgressRepository } from '../../persistence/repos/types'
import type { ITelemetryProvider } from '../../telemetry/types'

vi.mock('@projeto/core', () => ({
  ProgressService: {
    saveLessonState: vi.fn(),
    getProgressByLessons: vi.fn(),
  },
}))

import { ProgressService } from '@projeto/core'

function createMockRepo(): ILessonProgressRepository {
  const store = new Map<string, any>()

  return {
    upsert: vi.fn(async (userId, lessonId, data) => {
      store.set(lessonId, { userId, lessonId, data, synced: false })
    }),
    getByUserAndLesson: vi.fn(async (userId, lessonId) => {
      return store.get(lessonId)?.data ?? null
    }),
    getUnsynced: vi.fn(async () => {
      return Array.from(store.values())
        .filter((item) => !item.synced)
        .map((item) => ({
          ...item.data,
          userId: item.userId,
          lessonId: item.lessonId,
        }))
    }),
    markSynced: vi.fn(async (lessonId) => {
      const item = store.get(lessonId)
      if (item) item.synced = true
    }),
    clearAll: vi.fn(async () => {
      store.clear()
    }),
  }
}

function createMockTelemetry(): ITelemetryProvider {
  return {
    event: vi.fn(),
    error: vi.fn(),
    metric: vi.fn(),
  }
}

describe('syncService', () => {
  let repo: ILessonProgressRepository
  let telemetry: ITelemetryProvider
  let service: ReturnType<typeof createSyncService>

  beforeEach(() => {
    repo = createMockRepo()
    telemetry = createMockTelemetry()
    service = createSyncService(repo, telemetry)
    vi.clearAllMocks()
  })

  it('should push pending progress', async () => {
    await repo.upsert('user1', 'lesson1', {
      videoPosition: 120,
      percentageWatched: 50,
      blockStates: {},
      savedAt: '2026-01-01T00:00:00Z',
    })

    vi.mocked(ProgressService.saveLessonState).mockResolvedValue(undefined)

    const pushed = await service.pushPendingProgress()

    expect(pushed).toBe(1)
    expect(ProgressService.saveLessonState).toHaveBeenCalledWith(
      'user1',
      'lesson1',
      expect.objectContaining({ lastPlayedSeconds: 120 }),
    )
    expect(repo.markSynced).toHaveBeenCalledWith('lesson1')
  })

  it('should pull server progress', async () => {
    vi.mocked(ProgressService.getProgressByLessons).mockResolvedValue([
      {
        lastPlayedSeconds: 200,
        percentageWatched: 75,
        blockStates: { q1: 'answered' },
        updatedAt: '2026-01-02T00:00:00Z',
      },
    ])

    const pulled = await service.pullServerProgress('user1', ['lesson1'])

    expect(pulled).toBe(1)
    expect(repo.upsert).toHaveBeenCalledWith(
      'user1',
      'lesson1',
      expect.objectContaining({ videoPosition: 200 }),
    )
    expect(repo.markSynced).toHaveBeenCalledWith('lesson1')
  })

  it('should perform full sync', async () => {
    vi.mocked(ProgressService.saveLessonState).mockResolvedValue(undefined)
    vi.mocked(ProgressService.getProgressByLessons).mockResolvedValue([])

    const result = await service.syncAll('user1', ['lesson1'])

    expect(result).toHaveProperty('pushed')
    expect(result).toHaveProperty('pulled')
  })

  it('should start and stop auto sync', () => {
    vi.useFakeTimers()

    service.startAutoSync(() => 'user1', () => ['lesson1'])

    vi.advanceTimersByTime(30000)

    service.stopAutoSync()

    vi.useRealTimers()
  })

  it('should not push when no pending items', async () => {
    const pushed = await service.pushPendingProgress()
    expect(pushed).toBe(0)
  })
})
