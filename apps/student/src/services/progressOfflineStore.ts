import { Platform } from 'react-native';
import { getDatabase } from './offlineDb';

export interface LocalProgressData {
  videoPosition: number;
  percentageWatched: number;
  blockStates: Record<string, any>;
  savedAt: string;
}

interface ProgressRow {
  user_id: string;
  lesson_id: string;
  last_played_seconds: number;
  percentage_watched: number;
  block_states: string;
  tests_completed: string;
  completed: number;
  completed_at: string | null;
  saved_at: string;
  synced: number;
}

/**
 * Cache de progresso do aluno usando expo-sqlite.
 * No web, usa fallback para null (consumers devem verificar).
 * Mantém a mesma interface de progressLocalStore para compatibilidade.
 */
export const progressOfflineStore = {
  /**
   * Salva progresso localmente (INSERT OR REPLACE).
   */
  async saveProgressLocal(userId: string, lessonId: string, data: LocalProgressData): Promise<void> {
    if (Platform.OS === 'web') return;
    const db = await getDatabase();
    if (!db) return;

    await db.runAsync(
      `INSERT OR REPLACE INTO lesson_progress
       (user_id, lesson_id, last_played_seconds, percentage_watched, block_states, saved_at, synced)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [userId, lessonId, data.videoPosition, data.percentageWatched, JSON.stringify(data.blockStates), data.savedAt]
    );
  },

  /**
   * Busca progresso local.
   */
  async getProgressLocal(userId: string, lessonId: string): Promise<LocalProgressData | null> {
    if (Platform.OS === 'web') return null;
    const db = await getDatabase();
    if (!db) return null;

    const row = await db.getFirstAsync<ProgressRow>(
      'SELECT * FROM lesson_progress WHERE user_id = ? AND lesson_id = ?',
      [userId, lessonId]
    );
    if (!row) return null;

    return {
      videoPosition: row.last_played_seconds,
      percentageWatched: row.percentage_watched,
      blockStates: JSON.parse(row.block_states || '{}'),
      savedAt: row.saved_at,
    };
  },

  /**
   * Marca uma aula como pendente de sync (synced=0).
   */
  async queuePendingSave(userId: string, lessonId: string, data: LocalProgressData): Promise<void> {
    if (Platform.OS === 'web') return;
    const db = await getDatabase();
    if (!db) return;

    await db.runAsync(
      `INSERT OR REPLACE INTO lesson_progress
       (user_id, lesson_id, last_played_seconds, percentage_watched, block_states, saved_at, synced)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [userId, lessonId, data.videoPosition, data.percentageWatched, JSON.stringify(data.blockStates), data.savedAt]
    );
  },

  /**
   * Retorna todas as aulas pendentes de sync.
   */
  async getPendingSaves(): Promise<{ userId: string; lessonId: string; data: LocalProgressData; savedAt: string }[]> {
    if (Platform.OS === 'web') return [];
    const db = await getDatabase();
    if (!db) return [];

    const rows = await db.getAllAsync<ProgressRow>(
      'SELECT * FROM lesson_progress WHERE synced = 0'
    );

    return rows.map((row) => ({
      userId: row.user_id,
      lessonId: row.lesson_id,
      data: {
        videoPosition: row.last_played_seconds,
        percentageWatched: row.percentage_watched,
        blockStates: JSON.parse(row.block_states || '{}'),
        savedAt: row.saved_at,
      },
      savedAt: row.saved_at,
    }));
  },

  /**
   * Marca uma aula como sincronizada (synced=1).
   */
  async clearPendingSave(lessonId: string): Promise<void> {
    if (Platform.OS === 'web') return;
    const db = await getDatabase();
    if (!db) return;

    await db.runAsync('UPDATE lesson_progress SET synced = 1 WHERE lesson_id = ?', [lessonId]);
  },

  /**
   * Marca uma aula como sincronizada (alias para clearPendingSave).
   */
  async markSynced(lessonId: string): Promise<void> {
    return progressOfflineStore.clearPendingSave(lessonId);
  },

  /**
   * Remove todos os dados de progresso local.
   */
  async clearAll(): Promise<void> {
    if (Platform.OS === 'web') return;
    const db = await getDatabase();
    if (!db) return;

    await db.execAsync('DELETE FROM lesson_progress');
  },
};
