/**
 * @description Mock for expo-sqlite used in unit tests.
 * Provides an in-memory SQLite implementation via simple maps.
 */

interface MockRow {
  [key: string]: unknown
}

const databases = new Map<string, MockRow[]>()

function getRows(dbName: string): MockRow[] {
  if (!databases.has(dbName)) databases.set(dbName, [])
  return databases.get(dbName)!
}

class MockDatabase {
  constructor(private readonly name: string) {}

  async runAsync(sql: string, params: unknown[] = []): Promise<{ changes: number }> {
    const rows = getRows(this.name)

    if (sql.includes('INSERT OR REPLACE')) {
      const existing = rows.findIndex(
        (r) => r['user_id'] === params[0] && r['lesson_id'] === params[1],
      )
      const newRow: MockRow = {
        user_id: params[0],
        lesson_id: params[1],
        last_played_seconds: params[2],
        percentage_watched: params[3],
        block_states: params[4],
        saved_at: params[5],
        synced: params[6] ?? 0,
        tests_completed: '{}',
        completed: 0,
        completed_at: null,
      }
      if (existing >= 0) {
        rows[existing] = newRow
      } else {
        rows.push(newRow)
      }
      return { changes: 1 }
    }

    if (sql.includes('UPDATE')) {
      let changes = 0
      for (const row of rows) {
        if (sql.includes('synced = 1') && row['lesson_id'] === params[0]) {
          row['synced'] = 1
          changes++
        }
      }
      return { changes }
    }

    if (sql.includes('DELETE')) {
      const before = rows.length
      if (sql.includes('DELETE FROM lesson_progress')) {
        databases.set(this.name, [])
      }
      return { changes: before }
    }

    return { changes: 0 }
  }

  async getFirstAsync<T = MockRow>(sql: string, params: unknown[] = []): Promise<T | null> {
    const rows = getRows(this.name)

    if (sql.includes('WHERE user_id = ? AND lesson_id = ?')) {
      const found = rows.find(
        (r) => r['user_id'] === params[0] && r['lesson_id'] === params[1],
      )
      return (found as T) ?? null
    }

    if (sql.includes('WHERE module_id = ?')) {
      const found = rows.find((r) => r['module_id'] === params[0])
      return (found as T) ?? null
    }

    if (sql.includes('WHERE url = ?')) {
      const found = rows.find((r) => r['url'] === params[0])
      return (found as T) ?? null
    }

    if (sql.includes('MAX(version)')) {
      const maxVersion = rows.reduce(
        (max, r) => Math.max(max, (r['version'] as number) || 0),
        0,
      )
      return { version: maxVersion } as T
    }

    return null
  }

  async getAllAsync<T = MockRow>(sql: string, params: unknown[] = []): Promise<T[]> {
    const rows = getRows(this.name)

    if (sql.includes('WHERE synced = 0')) {
      return rows.filter((r) => r['synced'] === 0) as T[]
    }

    if (sql.includes('WHERE course_id = ?')) {
      return rows.filter((r) => r['course_id'] === params[0]) as T[]
    }

    if (sql.includes('SELECT local_path FROM cached_media')) {
      return rows.map((r) => ({ local_path: r['local_path'] })) as T[]
    }

    return rows as T[]
  }

  async execAsync(sql: string): Promise<void> {
    // DDL is a no-op in mock
  }

  async closeAsync(): Promise<void> {
    // No-op in mock
  }
}

export async function openDatabaseAsync(name: string): Promise<MockDatabase> {
  return new MockDatabase(name)
}
