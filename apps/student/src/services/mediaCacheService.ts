import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { getDatabase } from './offlineDb';

const MAX_RETRIES = 3;
const TIMEOUT_MS = 30000;
const MAX_CONCURRENT = 5;

/**
 * Service de cache de mídia (imagens) usando expo-file-system + SQLite.
 * No web, todas as funções são no-op (imagens vêm directamente da URL).
 */
export const mediaCacheService = {
  /**
   * Baixa uma imagem e salva no cache local.
   * Retorna o path local ou null em caso de falha.
   */
  async downloadImage(url: string): Promise<string | null> {
    if (Platform.OS === 'web' || !url) return null;

    const db = await getDatabase();
    if (!db) return null;

    const cached = await db.getFirstAsync<{ local_path: string }>(
      'SELECT local_path FROM cached_media WHERE url = ?',
      [url]
    );
    if (cached) {
      const fileInfo = await FileSystem.getInfoAsync(cached.local_path);
      if (fileInfo.exists) return cached.local_path;
    }

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const filename = `${Date.now()}_${url.split('/').pop()?.replace(/[^a-zA-Z0-9._-]/g, '_') || 'image'}`;
        const localPath = `${FileSystem.cacheDirectory}media/${filename}`;

        const dir = `${FileSystem.cacheDirectory}media`;
        const dirInfo = await FileSystem.getInfoAsync(dir);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
        }

        const downloadResult = await FileSystem.downloadAsync(url, localPath, {
          timeout: TIMEOUT_MS,
        });

        if (downloadResult.status === 200) {
          const fileInfo = await FileSystem.getInfoAsync(localPath);
          await db.runAsync(
            'INSERT OR REPLACE INTO cached_media (url, local_path, mime_type, size_bytes, cached_at) VALUES (?, ?, ?, ?, ?)',
            [url, localPath, downloadResult.headers['content-type'] || 'image/png', fileInfo.size || 0, new Date().toISOString()]
          );
          return localPath;
        }
      } catch (err) {
        if (attempt === MAX_RETRIES) {
          console.error(`Failed to download image after ${MAX_RETRIES} attempts:`, url, err);
          return null;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
    return null;
  },

  /**
   * Retorna o path local de uma imagem cacheada, ou null se não existir.
   */
  async getCachedImage(url: string): Promise<string | null> {
    if (Platform.OS === 'web' || !url) return null;

    const db = await getDatabase();
    if (!db) return null;

    const cached = await db.getFirstAsync<{ local_path: string }>(
      'SELECT local_path FROM cached_media WHERE url = ?',
      [url]
    );
    if (!cached) return null;

    const fileInfo = await FileSystem.getInfoAsync(cached.local_path);
    if (!fileInfo.exists) {
      await db.runAsync('DELETE FROM cached_media WHERE url = ?', [url]);
      return null;
    }

    return cached.local_path;
  },

  /**
   * Baixa todas as imagens de um array de blocos (max 5 concorrentes).
   * Retorna mapa de URL → path local.
   */
  async preloadModuleMedia(blocks: any[]): Promise<Map<string, string>> {
    const result = new Map<string, string>();
    if (Platform.OS === 'web') return result;

    const urls = new Set<string>();
    for (const block of blocks) {
      if (block.type === 'image' && block.url) urls.add(block.url);
      if (block.styles?.backgroundImage) urls.add(block.styles.backgroundImage);
    }

    const urlArray = Array.from(urls);
    for (let i = 0; i < urlArray.length; i += MAX_CONCURRENT) {
      const batch = urlArray.slice(i, i + MAX_CONCURRENT);
      const downloads = await Promise.allSettled(
        batch.map(async (url) => {
          const path = await mediaCacheService.downloadImage(url);
          if (path) result.set(url, path);
        })
      );
      downloads.forEach((d, idx) => {
        if (d.status === 'rejected') {
          console.warn(`Media preload failed for ${batch[idx]}:`, d.reason);
        }
      });
    }

    return result;
  },

  /**
   * Limpa todo o cache de mídia.
   */
  async clearMediaCache(): Promise<void> {
    if (Platform.OS === 'web') return;

    const db = await getDatabase();
    if (!db) return;

    const all = await db.getAllAsync<{ local_path: string }>('SELECT local_path FROM cached_media');
    for (const item of all) {
      try {
        await FileSystem.deleteAsync(item.localPath, { idempotent: true });
      } catch {}
    }
    await db.execAsync('DELETE FROM cached_media');
  },
};
