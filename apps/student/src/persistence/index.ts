import type { IDatabase } from './types'
import type { ITelemetryProvider } from '../telemetry/types'
import { SQLiteDatabase } from './sqlite/SQLiteDatabase'
import { runMigrations } from './migrationRunner'

export type { IDatabase } from './types'
export { runMigrations } from './migrationRunner'

const DB_NAME = 'student_offline.db'

let dbInstance: IDatabase | null = null

/**
 * Returns the singleton database instance.
 * Opens the database and runs migrations on first call.
 */
export async function getDatabase(
  telemetry: ITelemetryProvider,
): Promise<IDatabase> {
  if (dbInstance) return dbInstance

  dbInstance = await SQLiteDatabase.open(DB_NAME)
  await runMigrations(dbInstance, telemetry)

  return dbInstance
}

/**
 * Closes the database connection and clears the singleton.
 */
export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.close()
    dbInstance = null
  }
}

/**
 * Checks if the database is available (opened and not closed).
 */
export async function isDatabaseAvailable(): Promise<boolean> {
  try {
    return dbInstance !== null
  } catch {
    return false
  }
}
