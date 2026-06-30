import { describe, it, expect, beforeEach } from 'vitest'
import { MediaCacheRepository } from '../../../persistence/repos/MediaCacheRepository'
import type { IDatabase } from '../../../persistence/types'

function createMockDb(): IDatabase {
  const rows: Record<string, unknown>[] = []

  return {
    run: async (sql: string, params?: unknown[]) => {
      if (sql.includes('INSERT OR REPLACE')) {
        const existing = rows.findIndex(
          (r) => r['url'] === params?.[0],
        )
        const newRow = {
          url: params?.[0],
          local_path: params?.[1],
          mime_type: params?.[2],
          size_bytes: params?.[3],
          cached_at: params?.[4],
        }
        if (existing >= 0) {
          rows[existing] = newRow
        } else {
          rows.push(newRow)
        }
        return { changes: 1 }
      }
      if (sql.includes('DELETE')) {
        const idx = rows.findIndex((r) => r['url'] === params?.[0])
        if (idx >= 0) rows.splice(idx, 1)
        return { changes: 1 }
      }
      return { changes: 0 }
    },
    getOne: async (sql: string, params?: unknown[]) => {
      if (sql.includes('WHERE url = ?')) {
        return rows.find((r) => r['url'] === params?.[0]) ?? null
      }
      return null
    },
    getAll: async (sql: string) => {
      if (sql.includes('SELECT local_path FROM cached_media')) {
        return rows.map((r) => ({ local_path: r['local_path'] }))
      }
      return rows
    },
    exec: async (sql: string) => {
      if (sql.includes('DELETE FROM cached_media')) {
        rows.length = 0
      }
    },
    transaction: async (fn) => fn(createMockDb()),
    close: async () => {},
  }
}

describe('MediaCacheRepository', () => {
  let db: IDatabase
  let repo: MediaCacheRepository

  beforeEach(() => {
    db = createMockDb()
    repo = new MediaCacheRepository(db)
  })

  it('should upsert a media entry', async () => {
    await repo.upsert({
      url: 'https://example.com/image.png',
      localPath: '/cache/image.png',
      mimeType: 'image/png',
      sizeBytes: 1024,
      cachedAt: '2026-01-01T00:00:00Z',
    })

    const result = await repo.getByUrl('https://example.com/image.png')
    expect(result).not.toBeNull()
    expect(result?.localPath).toBe('/cache/image.png')
  })

  it('should return null for non-existent url', async () => {
    const result = await repo.getByUrl('https://example.com/missing.png')
    expect(result).toBeNull()
  })

  it('should delete by url', async () => {
    await repo.upsert({
      url: 'https://example.com/image.png',
      localPath: '/cache/image.png',
      mimeType: 'image/png',
      sizeBytes: 1024,
      cachedAt: '2026-01-01T00:00:00Z',
    })

    await repo.deleteByUrl('https://example.com/image.png')

    const result = await repo.getByUrl('https://example.com/image.png')
    expect(result).toBeNull()
  })

  it('should get all paths', async () => {
    await repo.upsert({
      url: 'https://example.com/img1.png',
      localPath: '/cache/img1.png',
      mimeType: 'image/png',
      sizeBytes: 512,
      cachedAt: '2026-01-01T00:00:00Z',
    })

    await repo.upsert({
      url: 'https://example.com/img2.png',
      localPath: '/cache/img2.png',
      mimeType: 'image/png',
      sizeBytes: 1024,
      cachedAt: '2026-01-01T00:00:00Z',
    })

    const paths = await repo.getAllPaths()
    expect(paths).toHaveLength(2)
    expect(paths).toContain('/cache/img1.png')
    expect(paths).toContain('/cache/img2.png')
  })

  it('should clear all entries', async () => {
    await repo.upsert({
      url: 'https://example.com/img1.png',
      localPath: '/cache/img1.png',
      mimeType: 'image/png',
      sizeBytes: 512,
      cachedAt: '2026-01-01T00:00:00Z',
    })

    await repo.clearAll()

    const paths = await repo.getAllPaths()
    expect(paths).toHaveLength(0)
  })
})
