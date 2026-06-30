import type { IDatabase } from '../types'
import type {
  ILessonProgressRepository,
  LocalProgressData,
} from './types'

interface ProgressRow {
  user_id: string
  lesson_id: string
  last_played_seconds: number
  percentage_watched: number
  block_states: string
  tests_completed: string
  completed: number
  completed_at: string | null
  saved_at: string
  synced: number
}

function rowToData(row: ProgressRow): LocalProgressData {
  return {
    videoPosition: row.last_played_seconds,
    percentageWatched: row.percentage_watched,
    blockStates: JSON.parse(row.block_states || '{}'),
    savedAt: row.saved_at,
  }
}

/**
 * @description SQLite implementation of ILessonProgressRepository.
 * All SQL queries for lesson_progress live here.
 */
export class ProgressRepository implements ILessonProgressRepository {
  constructor(private readonly db: IDatabase) {}

  async upsert(
    userId: string,
    lessonId: string,
    data: LocalProgressData,
  ): Promise<void> {
    await this.db.run(
      `INSERT OR REPLACE INTO lesson_progress
       (user_id, lesson_id, last_played_seconds, percentage_watched, block_states, saved_at, synced)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [
        userId,
        lessonId,
        data.videoPosition,
        data.percentageWatched,
        JSON.stringify(data.blockStates),
        data.savedAt,
      ],
    )
  }

  async getByUserAndLesson(
    userId: string,
    lessonId: string,
  ): Promise<LocalProgressData | null> {
    const row = await this.db.getOne<ProgressRow>(
      'SELECT * FROM lesson_progress WHERE user_id = ? AND lesson_id = ?',
      [userId, lessonId],
    )
    return row ? rowToData(row) : null
  }

  async getUnsynced(): Promise<
    (LocalProgressData & { userId: string; lessonId: string })[]
  > {
    const rows = await this.db.getAll<ProgressRow>(
      'SELECT * FROM lesson_progress WHERE synced = 0',
    )
    return rows.map((row) => ({
      userId: row.user_id,
      lessonId: row.lesson_id,
      ...rowToData(row),
    }))
  }

  async markSynced(lessonId: string): Promise<void> {
    await this.db.run(
      'UPDATE lesson_progress SET synced = 1 WHERE lesson_id = ?',
      [lessonId],
    )
  }

  async clearAll(): Promise<void> {
    await this.db.exec('DELETE FROM lesson_progress')
  }
}
