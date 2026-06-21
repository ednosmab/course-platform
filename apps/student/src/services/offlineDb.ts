import { Platform } from 'react-native';

const DB_NAME = 'student_offline.db';

let dbInstance: any = null;

const SCHEMA_SQL = `
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
`;

/**
 * Retorna a instância do banco de dados SQLite.
 * No web, retorna null (fallback para Supabase direto).
 */
export async function getDatabase(): Promise<any | null> {
  if (Platform.OS === 'web') return null;
  if (dbInstance) return dbInstance;

  const SQLite = await import('expo-sqlite');
  dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
  return dbInstance;
}

/**
 * Inicializa o banco de dados criando as tabelas necessárias.
 * No web, é um no-op (retorna null).
 */
export async function initDatabase(): Promise<any | null> {
  if (Platform.OS === 'web') return null;
  const db = await getDatabase();
  if (!db) return null;
  await db.execAsync(SCHEMA_SQL);
  return db;
}

/**
 * Fecha a conexão com o banco de dados.
 * No web, é um no-op.
 */
export async function closeDatabase(): Promise<void> {
  if (Platform.OS === 'web') return;
  if (dbInstance) {
    await dbInstance.closeAsync();
    dbInstance = null;
  }
}

/**
 * Verifica se o banco de dados está disponível.
 * Retorna false no web ou se o DB não pôde ser aberto.
 */
export async function isDatabaseAvailable(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const db = await getDatabase();
    return db !== null;
  } catch {
    return false;
  }
}
