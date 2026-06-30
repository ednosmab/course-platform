import type { IDatabase } from '../types'
import type { IMediaCacheRepository, CachedMedia } from './types'

interface MediaRow {
  url: string
  local_path: string
  mime_type: string | null
  size_bytes: number | null
  cached_at: string
}

function rowToMedia(row: MediaRow): CachedMedia {
  return {
    url: row.url,
    localPath: row.local_path,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    cachedAt: row.cached_at,
  }
}

/**
 * @description SQLite implementation of IMediaCacheRepository.
 * All SQL queries for cached_media live here.
 */
export class MediaCacheRepository implements IMediaCacheRepository {
  constructor(private readonly db: IDatabase) {}

  async getByUrl(url: string): Promise<CachedMedia | null> {
    const row = await this.db.getOne<MediaRow>(
      'SELECT * FROM cached_media WHERE url = ?',
      [url],
    )
    return row ? rowToMedia(row) : null
  }

  async upsert(entry: CachedMedia): Promise<void> {
    await this.db.run(
      `INSERT OR REPLACE INTO cached_media
       (url, local_path, mime_type, size_bytes, cached_at)
       VALUES (?, ?, ?, ?, ?)`,
      [entry.url, entry.localPath, entry.mimeType, entry.sizeBytes, entry.cachedAt],
    )
  }

  async deleteByUrl(url: string): Promise<void> {
    await this.db.run(
      'DELETE FROM cached_media WHERE url = ?',
      [url],
    )
  }

  async getAllPaths(): Promise<string[]> {
    const rows = await this.db.getAll<{ local_path: string }>(
      'SELECT local_path FROM cached_media',
    )
    return rows.map((r) => r.local_path)
  }

  async clearAll(): Promise<void> {
    await this.db.exec('DELETE FROM cached_media')
  }
}
