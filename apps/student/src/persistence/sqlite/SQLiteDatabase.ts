import type { IDatabase } from '../types'

/**
 * @description SQLite implementation of IDatabase using expo-sqlite.
 * Wraps the native SQLite database with the minimal IDatabase contract.
 * All query logic lives in repositories — this class only provides
 * the transport layer.
 */
export class SQLiteDatabase implements IDatabase {
  private constructor(private readonly db: any) {}

  /**
   * Opens a SQLite database and returns a SQLiteDatabase instance.
   * @param name - The database file name (e.g. 'student_offline.db').
   */
  static async open(name: string): Promise<SQLiteDatabase> {
    const SQLite = await import('expo-sqlite')
    const db = await SQLite.openDatabaseAsync(name)
    return new SQLiteDatabase(db)
  }

  async run(
    sql: string,
    params?: unknown[],
  ): Promise<{ changes: number }> {
    const result = await this.db.runAsync(sql, params ?? [])
    return { changes: result.changes }
  }

  async getOne<T = Record<string, unknown>>(
    sql: string,
    params?: unknown[],
  ): Promise<T | null> {
    const row = await this.db.getFirstAsync<T>(sql, params ?? [])
    return row ?? null
  }

  async getAll<T = Record<string, unknown>>(
    sql: string,
    params?: unknown[],
  ): Promise<T[]> {
    return this.db.getAllAsync<T>(sql, params ?? [])
  }

  async exec(sql: string): Promise<void> {
    await this.db.execAsync(sql)
  }

  async transaction<T>(fn: (tx: IDatabase) => Promise<T>): Promise<T> {
    return this.db.withExclusiveTransactionAsync(async (nativeTx: any) => {
      const wrapper: IDatabase = {
        run: (sql, params) =>
          nativeTx.runAsync(sql, params ?? []).then((r: any) => ({
            changes: r.changes,
          })),
        getOne: (sql, params) =>
          nativeTx.getFirstAsync(sql, params ?? []),
        getAll: (sql, params) =>
          nativeTx.getAllAsync(sql, params ?? []),
        exec: (sql) => nativeTx.execAsync(sql),
        transaction: () =>
          Promise.reject(new Error('Nested transactions not supported')),
        close: () => Promise.resolve(),
      }
      return fn(wrapper)
    })
  }

  async close(): Promise<void> {
    await this.db.closeAsync()
  }
}
