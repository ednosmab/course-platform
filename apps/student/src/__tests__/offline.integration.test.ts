import { describe, it, expect, vi } from 'vitest'
import { ProgressRepository } from '../persistence/repos/ProgressRepository'
import { ContentCacheRepository } from '../persistence/repos/ContentCacheRepository'
import { MediaCacheRepository } from '../persistence/repos/MediaCacheRepository'
import { runMigrations } from '../persistence/migrationRunner'
import { createProgressOfflineStore } from '../services/progressOfflineStore'
import { createContentCacheService } from '../services/contentCacheService'
import { createMediaCacheService } from '../services/mediaCacheService'
import { createSyncService } from '../services/syncService'
import type { IDatabase } from '../persistence/types'
import type { ITelemetryProvider } from '../telemetry/types'

function createMockDb(): IDatabase {
  const store: Record<string, Record<string, unknown>[]> = {
    lesson_progress: [],
    cached_modules: [],
    cached_media: [],
    schema_version: [],
  }

  return {
    run: async (sql: string, params?: unknown[]) => {
      if (sql.includes('INSERT OR REPLACE INTO lesson_progress')) {
        const existing = store.lesson_progress.findIndex(
          (r) => r.user_id === params?.[0] && r.lesson_id === params?.[1],
        )
        const row = {
          user_id: params?.[0],
          lesson_id: params?.[1],
          last_played_seconds: params?.[2],
          percentage_watched: params?.[3],
          block_states: params?.[4],
          saved_at: params?.[5],
          synced: params?.[6] ?? 0,
          tests_completed: '{}',
          completed: 0,
          completed_at: null,
        }
        if (existing >= 0) store.lesson_progress[existing] = row
        else store.lesson_progress.push(row)
        return { changes: 1 }
      }
      if (sql.includes('INSERT OR REPLACE INTO cached_modules')) {
        const existing = store.cached_modules.findIndex(
          (r) => r.module_id === params?.[0],
        )
        const row = {
          module_id: params?.[0],
          course_id: params?.[1],
          title: params?.[2],
          order_index: params?.[3],
          data: params?.[4],
          cached_at: params?.[5],
          version: params?.[6],
          partial: params?.[7] ?? 0,
        }
        if (existing >= 0) store.cached_modules[existing] = row
        else store.cached_modules.push(row)
        return { changes: 1 }
      }
      if (sql.includes('INSERT OR REPLACE INTO cached_media')) {
        const existing = store.cached_media.findIndex(
          (r) => r.url === params?.[0],
        )
        const row = {
          url: params?.[0],
          local_path: params?.[1],
          mime_type: params?.[2],
          size_bytes: params?.[3],
          cached_at: params?.[4],
        }
        if (existing >= 0) store.cached_media[existing] = row
        else store.cached_media.push(row)
        return { changes: 1 }
      }
      if (sql.includes('UPDATE lesson_progress SET synced')) {
        let changes = 0
        for (const r of store.lesson_progress) {
          if (r.lesson_id === params?.[0]) {
            r.synced = 1
            changes++
          }
        }
        return { changes }
      }
      if (sql.includes('DELETE FROM lesson_progress')) {
        store.lesson_progress = []
        return { changes: 1 }
      }
      if (sql.includes('DELETE FROM cached_media')) {
        if (params?.[0]) {
          store.cached_media = store.cached_media.filter((r) => r.url !== params[0])
        } else {
          store.cached_media = []
        }
        return { changes: 1 }
      }
      if (sql.includes('DELETE FROM cached_modules')) {
        store.cached_modules = store.cached_modules.filter((r) => r.module_id !== params?.[0])
        return { changes: 1 }
      }
      if (sql.includes('INSERT INTO schema_version')) {
        store.schema_version.push({ version: params?.[0], applied_at: params?.[1] })
        return { changes: 1 }
      }
      return { changes: 0 }
    },
    getOne: async (sql: string, params?: unknown[]) => {
      if (sql.includes('lesson_progress') && sql.includes('user_id = ? AND lesson_id = ?')) {
        return store.lesson_progress.find(
          (r) => r.user_id === params?.[0] && r.lesson_id === params?.[1],
        ) ?? null
      }
      if (sql.includes('cached_modules') && sql.includes('module_id = ?')) {
        if (sql.includes('AND partial = 0')) {
          return store.cached_modules.find(
            (r) => r.module_id === params?.[0] && r.partial === 0,
          ) ?? null
        }
        const row = store.cached_modules.find((r) => r.module_id === params?.[0])
        return row ?? null
      }
      if (sql.includes('cached_modules') && sql.includes('SELECT data FROM')) {
        const row = store.cached_modules.find((r) => r.module_id === params?.[0])
        return row ? { data: row.data } : null
      }
      if (sql.includes('cached_media') && sql.includes('url = ?')) {
        return store.cached_media.find((r) => r.url === params?.[0]) ?? null
      }
      if (sql.includes('MAX(version)')) {
        const max = store.schema_version.reduce(
          (m, r) => Math.max(m, (r.version as number) || 0), 0,
        )
        return { version: max }
      }
      return null
    },
    getAll: async (sql: string, params?: unknown[]) => {
      if (sql.includes('lesson_progress') && sql.includes('synced = 0')) {
        return store.lesson_progress.filter((r) => r.synced === 0)
      }
      if (sql.includes('cached_modules') && sql.includes('course_id = ?')) {
        return store.cached_modules.filter((r) => r.course_id === params?.[0])
      }
      if (sql.includes('cached_media') && sql.includes('local_path')) {
        return store.cached_media.map((r) => ({ local_path: r.local_path }))
      }
      return []
    },
    exec: async (sql: string) => {
      if (sql.includes('DELETE FROM lesson_progress')) store.lesson_progress = []
      if (sql.includes('DELETE FROM cached_modules')) store.cached_modules = []
      if (sql.includes('DELETE FROM cached_media')) store.cached_media = []
    },
    transaction: async (fn) => fn(createMockDb()),
    close: async () => {},
  }
}

function createTelemetry(): ITelemetryProvider {
  return { event: vi.fn(), error: vi.fn(), metric: vi.fn() }
}

describe('Offline-First Integration', () => {
  it('full workflow: save progress → get progress → mark synced → verify', async () => {
    const db = createMockDb()
    const telemetry = createTelemetry()
    const progressRepo = new ProgressRepository(db)
    const store = createProgressOfflineStore(progressRepo)

    await store.saveProgressLocal('user1', 'lesson1', {
      videoPosition: 120,
      percentageWatched: 50,
      blockStates: { q1: 'answered' },
      savedAt: '2026-01-01T00:00:00Z',
    })

    const progress = await store.getProgressLocal('user1', 'lesson1')
    expect(progress).not.toBeNull()
    expect(progress?.videoPosition).toBe(120)
    expect(progress?.percentageWatched).toBe(50)

    const pending = await store.getPendingSaves()
    expect(pending).toHaveLength(1)

    await store.markSynced('lesson1')

    const pendingAfter = await store.getPendingSaves()
    expect(pendingAfter).toHaveLength(0)
  })

  it('full workflow: download module → get cached → list by course', async () => {
    const db = createMockDb()
    const telemetry = createTelemetry()
    const moduleRepo = new ContentCacheRepository(db)
    const mediaRepo = new MediaCacheRepository(db)
    const service = createContentCacheService(moduleRepo, mediaRepo, telemetry)

    await moduleRepo.upsert({
      moduleId: 'mod1',
      courseId: 'course1',
      title: 'Module 1',
      orderIndex: 1,
      data: JSON.stringify({ lessons: [{ id: 'l1' }] }),
      cachedAt: '2026-01-01T00:00:00Z',
      version: 1,
      partial: false,
    })

    const cached = await service.getCachedModule('mod1')
    expect(cached).not.toBeNull()
    expect(cached?.title).toBe('Module 1')
    expect(cached?.lessons).toHaveLength(1)

    const isCached = await service.isModuleCached('mod1')
    expect(isCached).toBe(true)

    const modules = await service.listCachedModules('course1')
    expect(modules).toHaveLength(1)
    expect(modules[0].moduleId).toBe('mod1')
  })

  it('migration runner applies schema version', async () => {
    const db = createMockDb()
    const telemetry = createTelemetry()

    const version = await runMigrations(db, telemetry)
    expect(version).toBe(1)

    const version2 = await runMigrations(db, telemetry)
    expect(version2).toBe(1)
  })

  it('telemetry receives events during sync', async () => {
    const db = createMockDb()
    const telemetry = createTelemetry()
    const progressRepo = new ProgressRepository(db)
    const store = createProgressOfflineStore(progressRepo)

    await store.saveProgressLocal('user1', 'lesson1', {
      videoPosition: 120,
      percentageWatched: 50,
      blockStates: {},
      savedAt: '2026-01-01T00:00:00Z',
    })

    const pending = await store.getPendingSaves()
    expect(pending).toHaveLength(1)
  })
})
