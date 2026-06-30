/**
 * @description Infrastructure contract for local persistence.
 * Repositories are the only consumers of this interface.
 * Services NEVER depend on it directly.
 *
 * The interface is intentionally minimal — just enough to execute
 * parameterized queries and transactions. No ORM concepts (ITable,
 * WhereClause, QueryBuilder) are exposed here. All query logic
 * lives in repositories.
 */
export interface IDatabase {
  /**
   * Executes an INSERT, UPDATE, or DELETE statement.
   * @returns The number of affected rows.
   */
  run(sql: string, params?: unknown[]): Promise<{ changes: number }>

  /**
   * Executes a SELECT statement and returns a single row, or null.
   */
  getOne<T = Record<string, unknown>>(
    sql: string,
    params?: unknown[],
  ): Promise<T | null>

  /**
   * Executes a SELECT statement and returns all matching rows.
   */
  getAll<T = Record<string, unknown>>(
    sql: string,
    params?: unknown[],
  ): Promise<T[]>

  /**
   * Executes a DDL statement (CREATE TABLE, CREATE INDEX, etc.).
   */
  exec(sql: string): Promise<void>

  /**
   * Executes the callback inside an atomic transaction.
   * If the callback throws, the transaction is rolled back.
   */
  transaction<T>(fn: (tx: IDatabase) => Promise<T>): Promise<T>

  /**
   * Closes the database connection.
   */
  close(): Promise<void>
}
