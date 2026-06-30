import type { IDatabase } from '../types'
import { migration001 } from './001_initial'

export interface Migration {
  version: number
  name: string
  up(db: IDatabase): Promise<void>
}

/**
 * Ordered list of all migrations.
 * New migrations must be appended at the end.
 */
export const migrations: Migration[] = [migration001]
