import type { IDatabase } from '../types'
import type { IModuleCacheRepository, CachedModule } from './types'

interface ModuleRow {
  module_id: string
  course_id: string
  title: string
  order_index: number
  data: string
  cached_at: string
  version: number
  partial: number
}

function rowToModule(row: ModuleRow): CachedModule {
  return {
    moduleId: row.module_id,
    courseId: row.course_id,
    title: row.title,
    orderIndex: row.order_index,
    data: row.data,
    cachedAt: row.cached_at,
    version: row.version,
    partial: row.partial === 1,
  }
}

/**
 * @description SQLite implementation of IModuleCacheRepository.
 * All SQL queries for cached_modules live here.
 */
export class ContentCacheRepository implements IModuleCacheRepository {
  constructor(private readonly db: IDatabase) {}

  async upsert(module: CachedModule): Promise<void> {
    await this.db.run(
      `INSERT OR REPLACE INTO cached_modules
       (module_id, course_id, title, order_index, data, cached_at, version, partial)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        module.moduleId,
        module.courseId,
        module.title,
        module.orderIndex,
        module.data,
        module.cachedAt,
        module.version,
        module.partial ? 1 : 0,
      ],
    )
  }

  async upsertPartial(moduleId: string, courseId: string): Promise<void> {
    await this.db.run(
      `INSERT OR REPLACE INTO cached_modules
       (module_id, course_id, title, order_index, data, cached_at, version, partial)
       VALUES (?, ?, '', 0, '{}', ?, 1, 1)`,
      [moduleId, courseId, new Date().toISOString()],
    )
  }

  async getById(moduleId: string): Promise<CachedModule | null> {
    const row = await this.db.getOne<ModuleRow>(
      'SELECT * FROM cached_modules WHERE module_id = ?',
      [moduleId],
    )
    return row ? rowToModule(row) : null
  }

  async getLessons(moduleId: string): Promise<string | null> {
    const row = await this.db.getOne<{ data: string }>(
      'SELECT data FROM cached_modules WHERE module_id = ?',
      [moduleId],
    )
    return row?.data ?? null
  }

  async exists(moduleId: string): Promise<boolean> {
    const row = await this.db.getOne<{ module_id: string }>(
      'SELECT module_id FROM cached_modules WHERE module_id = ? AND partial = 0',
      [moduleId],
    )
    return row !== null
  }

  async deleteById(moduleId: string): Promise<void> {
    await this.db.run(
      'DELETE FROM cached_modules WHERE module_id = ?',
      [moduleId],
    )
  }

  async listByCourse(courseId: string): Promise<CachedModule[]> {
    const rows = await this.db.getAll<ModuleRow>(
      'SELECT * FROM cached_modules WHERE course_id = ? ORDER BY order_index',
      [courseId],
    )
    return rows.map(rowToModule)
  }
}
