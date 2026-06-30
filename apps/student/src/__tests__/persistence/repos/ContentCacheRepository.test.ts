import { describe, it, expect, beforeEach } from 'vitest'
import { ContentCacheRepository } from '../../../persistence/repos/ContentCacheRepository'
import type { IDatabase } from '../../../persistence/types'

function createMockDb(): IDatabase {
  const rows: Record<string, unknown>[] = []

  return {
    run: async (sql: string, params?: unknown[]) => {
      if (sql.includes('INSERT OR REPLACE')) {
        const existing = rows.findIndex(
          (r) => r['module_id'] === params?.[0],
        )
        // upsertPartial uses hardcoded values in SQL: VALUES (?, ?, '', 0, '{}', ?, 1, 1)
        // upsert uses 8 params: VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        const isPartial = sql.includes("''") && sql.includes('partial')
        const newRow = isPartial
          ? {
              module_id: params?.[0],
              course_id: params?.[1],
              title: '',
              order_index: 0,
              data: '{}',
              cached_at: params?.[2],
              version: 1,
              partial: 1,
            }
          : {
              module_id: params?.[0],
              course_id: params?.[1],
              title: params?.[2],
              order_index: params?.[3],
              data: params?.[4],
              cached_at: params?.[5],
              version: params?.[6],
              partial: params?.[7] ?? 0,
            }
        if (existing >= 0) {
          rows[existing] = newRow
        } else {
          rows.push(newRow)
        }
        return { changes: 1 }
      }
      if (sql.includes('DELETE')) {
        const idx = rows.findIndex((r) => r['module_id'] === params?.[0])
        if (idx >= 0) rows.splice(idx, 1)
        return { changes: 1 }
      }
      return { changes: 0 }
    },
    getOne: async (sql: string, params?: unknown[]) => {
      if (sql.includes('WHERE module_id = ?')) {
        if (sql.includes('AND partial = 0')) {
          const row = rows.find(
            (r) => r['module_id'] === params?.[0] && (r['partial'] === 0 || r['partial'] === false),
          )
          return row ? { module_id: row['module_id'] } : null
        }
        const row = rows.find((r) => r['module_id'] === params?.[0])
        if (!row) return null
        return {
          module_id: row['module_id'],
          course_id: row['course_id'],
          title: row['title'],
          order_index: row['order_index'],
          data: row['data'],
          cached_at: row['cached_at'],
          version: row['version'],
          partial: row['partial'],
        }
      }
      if (sql.includes('SELECT data FROM')) {
        const row = rows.find((r) => r['module_id'] === params?.[0])
        return row ? { data: row['data'] } : null
      }
      return null
    },
    getAll: async (sql: string, params?: unknown[]) => {
      if (sql.includes('WHERE course_id = ?')) {
        return rows.filter((r) => r['course_id'] === params?.[0])
      }
      return rows
    },
    exec: async () => {},
    transaction: async (fn) => fn(createMockDb()),
    close: async () => {},
  }
}

describe('ContentCacheRepository', () => {
  let db: IDatabase
  let repo: ContentCacheRepository

  beforeEach(() => {
    db = createMockDb()
    repo = new ContentCacheRepository(db)
  })

  it('should upsert a module', async () => {
    await repo.upsert({
      moduleId: 'mod1',
      courseId: 'course1',
      title: 'Module 1',
      orderIndex: 1,
      data: JSON.stringify({ lessons: [] }),
      cachedAt: '2026-01-01T00:00:00Z',
      version: 1,
      partial: false,
    })

    const result = await repo.getById('mod1')
    expect(result).not.toBeNull()
    expect(result?.title).toBe('Module 1')
  })

  it('should upsert partial module', async () => {
    await repo.upsertPartial('mod1', 'course1')

    const result = await repo.getById('mod1')
    expect(result).not.toBeNull()
    expect(result?.partial).toBe(true)
  })

  it('should return null for non-existent module', async () => {
    const result = await repo.getById('nonexistent')
    expect(result).toBeNull()
  })

  it('should get lessons data', async () => {
    await repo.upsert({
      moduleId: 'mod1',
      courseId: 'course1',
      title: 'Module 1',
      orderIndex: 1,
      data: JSON.stringify({ lessons: [{ id: 'l1' }] }),
      cachedAt: '2026-01-01T00:00:00Z',
      version: 1,
      partial: false,
    })

    const data = await repo.getLessons('mod1')
    expect(data).not.toBeNull()
    const parsed = JSON.parse(data!)
    expect(parsed.lessons).toHaveLength(1)
  })

  it('should check if module exists (non-partial)', async () => {
    await repo.upsert({
      moduleId: 'mod1',
      courseId: 'course1',
      title: 'Module 1',
      orderIndex: 1,
      data: '{}',
      cachedAt: '2026-01-01T00:00:00Z',
      version: 1,
      partial: false,
    })

    expect(await repo.exists('mod1')).toBe(true)
    expect(await repo.exists('nonexistent')).toBe(false)
  })

  it('should delete module by id', async () => {
    await repo.upsert({
      moduleId: 'mod1',
      courseId: 'course1',
      title: 'Module 1',
      orderIndex: 1,
      data: '{}',
      cachedAt: '2026-01-01T00:00:00Z',
      version: 1,
      partial: false,
    })

    await repo.deleteById('mod1')

    const result = await repo.getById('mod1')
    expect(result).toBeNull()
  })

  it('should list modules by course', async () => {
    await repo.upsert({
      moduleId: 'mod1',
      courseId: 'course1',
      title: 'Module 1',
      orderIndex: 1,
      data: '{}',
      cachedAt: '2026-01-01T00:00:00Z',
      version: 1,
      partial: false,
    })

    await repo.upsert({
      moduleId: 'mod2',
      courseId: 'course1',
      title: 'Module 2',
      orderIndex: 2,
      data: '{}',
      cachedAt: '2026-01-01T00:00:00Z',
      version: 1,
      partial: false,
    })

    const modules = await repo.listByCourse('course1')
    expect(modules).toHaveLength(2)
  })
})
