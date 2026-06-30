import type { IDatabase } from './types'
import type { ITelemetryProvider } from '../telemetry/types'
import { migrations } from './migrations'

/**
 * @description Runs pending migrations inside atomic transactions.
 * Each migration is executed within a transaction. If any migration
 * fails, the transaction is rolled back and the version is NOT recorded.
 * A version is only recorded after the full transaction commits.
 */
export async function runMigrations(
  db: IDatabase,
  telemetry: ITelemetryProvider,
): Promise<number> {
  const currentVersion = await getCurrentVersion(db)

  const pending = migrations.filter((m) => m.version > currentVersion)

  if (pending.length === 0) {
    return currentVersion
  }

  let appliedVersion = currentVersion

  for (const migration of pending) {
    telemetry.event('migration.started', {
      from: currentVersion,
      to: migration.version,
      name: migration.name,
    })

    try {
      await db.transaction(async (tx) => {
        await migration.up(tx)

        await tx.run(
          'INSERT INTO schema_version (version, applied_at) VALUES (?, ?)',
          [migration.version, new Date().toISOString()],
        )
      })

      appliedVersion = migration.version

      telemetry.event('migration.completed', {
        version: migration.version,
        name: migration.name,
      })
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))

      telemetry.error(error, {
        migration: migration.name,
        version: migration.version,
      })

      throw error
    }
  }

  return appliedVersion
}

/**
 * Reads the current schema version from the schema_version table.
 * Returns 0 if the table is empty (first run).
 */
async function getCurrentVersion(db: IDatabase): Promise<number> {
  try {
    const row = await db.getOne<{ version: number }>(
      'SELECT MAX(version) as version FROM schema_version',
    )
    return row?.version ?? 0
  } catch {
    return 0
  }
}
