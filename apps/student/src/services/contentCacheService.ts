import { Platform } from 'react-native';
import { getDatabase } from './offlineDb';
import { CourseService } from '@projeto/core';
import { mediaCacheService } from './mediaCacheService';

const MAX_RETRIES = 3;
const TIMEOUT_MS = 30000;

interface CachedModuleRow {
  module_id: string;
  course_id: string;
  title: string;
  order_index: number;
  data: string;
  cached_at: string;
  version: number;
  partial: number;
}

/**
 * Service de cache de conteúdo de módulos usando expo-sqlite.
 * Permite baixar e armazenar módulos completos para acesso offline.
 * No web, todas as funções são no-op.
 */
export const contentCacheService = {
  /**
   * Baixa a estrutura de um módulo e salva no cache local.
   * Também baixa as imagens dos blocos via mediaCacheService.
   */
  async downloadModule(courseId: string, moduleId: string): Promise<boolean> {
    if (Platform.OS === 'web') return false;

    const db = await getDatabase();
    if (!db) return false;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const structure = await CourseService.getCourseStructure(courseId);
        const module = structure.modules.find((m) => m.id === moduleId);
        if (!module) return false;

        await db.runAsync(
          `INSERT OR REPLACE INTO cached_modules
           (module_id, course_id, title, order_index, data, cached_at, version, partial)
           VALUES (?, ?, ?, ?, ?, ?, 1, 0)`,
          [
            moduleId,
            courseId,
            module.title,
            module.order_index,
            JSON.stringify({ lessons: module.lessons }),
            new Date().toISOString(),
          ]
        );

        for (const lesson of module.lessons) {
          if (lesson.blocks) {
            await mediaCacheService.preloadModuleMedia(lesson.blocks);
          }
        }

        return true;
      } catch (err) {
        if (attempt === MAX_RETRIES) {
          console.error(`Failed to download module after ${MAX_RETRIES} attempts:`, moduleId, err);
          const db = await getDatabase();
          if (db) {
            await db.runAsync(
              `INSERT OR REPLACE INTO cached_modules
               (module_id, course_id, title, order_index, data, cached_at, version, partial)
               VALUES (?, ?, ?, ?, ?, ?, 1, 1)`,
              [moduleId, courseId, '', 0, '{}', new Date().toISOString()]
            );
          }
          return false;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
    return false;
  },

  /**
   * Retorna um módulo cacheado do SQLite.
   */
  async getCachedModule(moduleId: string): Promise<{ title: string; lessons: any[] } | null> {
    if (Platform.OS === 'web') return null;

    const db = await getDatabase();
    if (!db) return null;

    const row = await db.getFirstAsync<CachedModuleRow>(
      'SELECT * FROM cached_modules WHERE module_id = ?',
      [moduleId]
    );
    if (!row) return null;

    const data = JSON.parse(row.data);
    return { title: row.title, lessons: data.lessons || [] };
  },

  /**
   * Retorna as aulas de um módulo cacheado.
   */
  async getCachedLessons(moduleId: string): Promise<any[]> {
    if (Platform.OS === 'web') return [];

    const db = await getDatabase();
    if (!db) return [];

    const row = await db.getFirstAsync<CachedModuleRow>(
      'SELECT data FROM cached_modules WHERE module_id = ?',
      [moduleId]
    );
    if (!row) return [];

    const data = JSON.parse(row.data);
    return data.lessons || [];
  },

  /**
   * Verifica se um módulo está no cache.
   */
  async isModuleCached(moduleId: string): Promise<boolean> {
    if (Platform.OS === 'web') return false;

    const db = await getDatabase();
    if (!db) return false;

    const row = await db.getFirstAsync<{ module_id: string }>(
      'SELECT module_id FROM cached_modules WHERE module_id = ? AND partial = 0',
      [moduleId]
    );
    return row !== null;
  },

  /**
   * Remove um módulo do cache.
   */
  async clearModuleCache(moduleId: string): Promise<void> {
    if (Platform.OS === 'web') return;

    const db = await getDatabase();
    if (!db) return;

    await db.runAsync('DELETE FROM cached_modules WHERE module_id = ?', [moduleId]);
  },

  /**
   * Lista módulos baixados para um curso.
   */
  async listCachedModules(courseId: string): Promise<{ moduleId: string; title: string; cachedAt: string; partial: boolean }[]> {
    if (Platform.OS === 'web') return [];

    const db = await getDatabase();
    if (!db) return [];

    const rows = await db.getAllAsync<CachedModuleRow>(
      'SELECT * FROM cached_modules WHERE course_id = ? ORDER BY order_index',
      [courseId]
    );

    return rows.map((row) => ({
      moduleId: row.module_id,
      title: row.title,
      cachedAt: row.cached_at,
      partial: row.partial === 1,
    }));
  },
};
