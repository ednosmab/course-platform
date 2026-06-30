import { describe, it, expect, beforeEach } from 'vitest'
import { ProgressRepository } from '../../../persistence/repos/ProgressRepository'
import type { IDatabase } from '../../../persistence/types'

function createMockDb(): IDatabase {
  const rows: Record<string, unknown>[] = []

  return {
    run: async (sql: string, params?: unknown[]) => {
      if (sql.includes('INSERT OR REPLACE')) {
        const existing = rows.findIndex(
          (r) => r['user_id'] === params?.[0] && r['lesson_id'] === params?.[1],
        )
        const newRow = {
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
        if (existing >= 0) {
          rows[existing] = newRow
        } else {
          rows.push(newRow)
        }
        return { changes: 1 }
      }
      if (sql.includes('UPDATE')) {
        let changes = 0
        for (const row of rows) {
          if (sql.includes('synced = 1') && row['lesson_id'] === params?.[0]) {
            row['synced'] = 1
            changes++
          }
        }
        return { changes }
      }
      if (sql.includes('DELETE')) {
        rows.length = 0
        return { changes: 1 }
      }
      return { changes: 0 }
    },
    getOne: async (sql: string, params?: unknown[]) => {
      if (sql.includes('WHERE user_id = ? AND lesson_id = ?')) {
        return rows.find(
          (r) => r['user_id'] === params?.[0] && r['lesson_id'] === params?.[1],
        ) ?? null
      }
      return null
    },
    getAll: async (sql: string) => {
      if (sql.includes('WHERE synced = 0')) {
        return rows.filter((r) => r['synced'] === 0)
      }
      return rows
    },
    exec: async (sql: string) => {
      if (sql.includes('DELETE FROM lesson_progress')) {
        rows.length = 0
      }
    },
    transaction: async (fn) => fn(createMockDb()),
    close: async () => {},
  }
}

describe('ProgressRepository', () => {
  let db: IDatabase
  let repo: ProgressRepository

  beforeEach(() => {
    db = createMockDb()
    repo = new ProgressRepository(db)
  })

  it('should upsert progress data', async () => {
    await repo.upsert('user1', 'lesson1', {
      videoPosition: 120,
      percentageWatched: 50,
      blockStates: { q1: 'answered' },
      savedAt: '2026-01-01T00:00:00Z',
    })

    const result = await repo.getByUserAndLesson('user1', 'lesson1')
    expect(result).not.toBeNull()
    expect(result?.videoPosition).toBe(120)
    expect(result?.percentageWatched).toBe(50)
  })

  it('should return null for non-existent progress', async () => {
    const result = await repo.getByUserAndLesson('user1', 'nonexistent')
    expect(result).toBeNull()
  })

  it('should get unsynced items', async () => {
    await repo.upsert('user1', 'lesson1', {
      videoPosition: 100,
      percentageWatched: 25,
      blockStates: {},
      savedAt: '2026-01-01T00:00:00Z',
    })

    const unsynced = await repo.getUnsynced()
    expect(unsynced).toHaveLength(1)
    expect(unsynced[0].userId).toBe('user1')
    expect(unsynced[0].lessonId).toBe('lesson1')
  })

  it('should mark as synced', async () => {
    await repo.upsert('user1', 'lesson1', {
      videoPosition: 100,
      percentageWatched: 25,
      blockStates: {},
      savedAt: '2026-01-01T00:00:00Z',
    })

    await repo.markSynced('lesson1')

    const unsynced = await repo.getUnsynced()
    expect(unsynced).toHaveLength(0)
  })

  it('should clear all progress', async () => {
    await repo.upsert('user1', 'lesson1', {
      videoPosition: 100,
      percentageWatched: 25,
      blockStates: {},
      savedAt: '2026-01-01T00:00:00Z',
    })

    await repo.clearAll()

    const unsynced = await repo.getUnsynced()
    expect(unsynced).toHaveLength(0)
  })
})
