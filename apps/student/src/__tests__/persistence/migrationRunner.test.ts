import { describe, it, expect, vi, beforeEach } from 'vitest'
import { runMigrations } from '../../persistence/migrationRunner'
import type { IDatabase } from '../../persistence/types'
import type { ITelemetryProvider } from '../../telemetry/types'

function createMockDb(currentVersion = 0): IDatabase {
  let version = currentVersion
  const executedSql: string[] = []

  return {
    run: async (sql: string, params?: unknown[]) => {
      executedSql.push(sql)
      if (sql.includes('INSERT INTO schema_version')) {
        version = params?.[0] as number
      }
      return { changes: 1 }
    },
    getOne: async (sql: string) => {
      if (sql.includes('MAX(version)')) {
        return { version }
      }
      return null
    },
    getAll: async () => [],
    exec: async (sql: string) => {
      executedSql.push(sql)
    },
    transaction: async (fn) => fn(createMockDb(version)),
    close: async () => {},
  }
}

function createMockTelemetry(): ITelemetryProvider {
  return {
    event: vi.fn(),
    error: vi.fn(),
    metric: vi.fn(),
  }
}

describe('runMigrations', () => {
  let telemetry: ITelemetryProvider

  beforeEach(() => {
    telemetry = createMockTelemetry()
  })

  it('should run migrations on fresh database', async () => {
    const db = createMockDb(0)
    const version = await runMigrations(db, telemetry)

    expect(version).toBe(1)
    expect(telemetry.event).toHaveBeenCalledWith(
      'migration.started',
      expect.objectContaining({ to: 1 }),
    )
    expect(telemetry.event).toHaveBeenCalledWith(
      'migration.completed',
      expect.objectContaining({ version: 1 }),
    )
  })

  it('should skip already applied migrations', async () => {
    const db = createMockDb(1)
    const version = await runMigrations(db, telemetry)

    expect(version).toBe(1)
    expect(telemetry.event).not.toHaveBeenCalledWith(
      'migration.started',
      expect.anything(),
    )
  })

  it('should handle migration failure', async () => {
    const failingDb: IDatabase = {
      run: async () => ({ changes: 0 }),
      getOne: async () => ({ version: 0 }),
      getAll: async () => [],
      exec: async () => {
        throw new Error('Migration failed')
      },
      transaction: async () => {
        throw new Error('Migration failed')
      },
      close: async () => {},
    }

    await expect(runMigrations(failingDb, telemetry)).rejects.toThrow(
      'Migration failed',
    )

    expect(telemetry.error).toHaveBeenCalled()
  })

  it('should record telemetry events for each migration', async () => {
    const db = createMockDb(0)
    await runMigrations(db, telemetry)

    expect(telemetry.event).toHaveBeenCalledWith(
      'migration.started',
      expect.objectContaining({ name: '001_initial' }),
    )
    expect(telemetry.event).toHaveBeenCalledWith(
      'migration.completed',
      expect.objectContaining({ name: '001_initial' }),
    )
  })
})
