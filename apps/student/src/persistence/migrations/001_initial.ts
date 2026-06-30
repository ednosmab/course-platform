import type { IDatabase } from '../types'

/**
 * @description Initial schema migration.
 * Creates all tables required for offline-first persistence.
 */
export const migration001 = {
  version: 1,
  name: '001_initial',

  async up(db: IDatabase): Promise<void> {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS lesson_progress (
        user_id TEXT NOT NULL,
        lesson_id TEXT NOT NULL,
        last_played_seconds INTEGER DEFAULT 0,
        percentage_watched INTEGER DEFAULT 0,
        block_states TEXT DEFAULT '{}',
        tests_completed TEXT DEFAULT '{}',
        completed INTEGER DEFAULT 0,
        completed_at TEXT,
        saved_at TEXT NOT NULL,
        synced INTEGER DEFAULT 0,
        PRIMARY KEY (user_id, lesson_id)
      );

      CREATE TABLE IF NOT EXISTS cached_modules (
        module_id TEXT PRIMARY KEY,
        course_id TEXT NOT NULL,
        title TEXT NOT NULL,
        order_index INTEGER NOT NULL,
        data TEXT NOT NULL,
        cached_at TEXT NOT NULL,
        version INTEGER DEFAULT 1,
        partial INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS cached_media (
        url TEXT PRIMARY KEY,
        local_path TEXT NOT NULL,
        mime_type TEXT,
        size_bytes INTEGER,
        cached_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS schema_version (
        version INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL
      );
    `)
  },
}
