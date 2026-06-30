import type { IMediaCacheRepository } from '../persistence/repos/types'
import type { ITelemetryProvider } from '../telemetry/types'
import * as FileSystem from 'expo-file-system'

const MAX_RETRIES = 3
const TIMEOUT_MS = 30000
const MAX_CONCURRENT = 5

/**
 * @description Service for media (image) caching.
 * Delegates all persistence to IMediaCacheRepository.
 * No Platform.OS checks — platform decisions live in the repository layer.
 */
export function createMediaCacheService(
  mediaRepo: IMediaCacheRepository,
  telemetry: ITelemetryProvider,
) {
  async function downloadImage(url: string): Promise<string | null> {
    if (!url) return null

    const cached = await mediaRepo.getByUrl(url)
    if (cached) {
      const fileInfo = await FileSystem.getInfoAsync(cached.localPath)
      if (fileInfo.exists) return cached.localPath
    }

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const filename = `${Date.now()}_${url.split('/').pop()?.replace(/[^a-zA-Z0-9._-]/g, '_') || 'image'}`
        const localPath = `${FileSystem.cacheDirectory}media/${filename}`

        const dir = `${FileSystem.cacheDirectory}media`
        const dirInfo = await FileSystem.getInfoAsync(dir)
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(dir, { intermediates: true })
        }

        const downloadResult = await FileSystem.downloadAsync(url, localPath, {
          timeout: TIMEOUT_MS,
        })

        if (downloadResult.status === 200) {
          const fileInfo = await FileSystem.getInfoAsync(localPath)
          await mediaRepo.upsert({
            url,
            localPath,
            mimeType: downloadResult.headers['content-type'] || 'image/png',
            sizeBytes: fileInfo.size || 0,
            cachedAt: new Date().toISOString(),
          })

          telemetry.event('image.cached', {
            url,
            sizeBytes: fileInfo.size || 0,
          })

          return localPath
        }
      } catch (err) {
        if (attempt === MAX_RETRIES) {
          telemetry.error(err instanceof Error ? err : new Error(String(err)), {
            url,
            attempts: MAX_RETRIES,
          })
          return null
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
      }
    }
    return null
  }

  async function getCachedImage(url: string): Promise<string | null> {
    if (!url) return null

    const cached = await mediaRepo.getByUrl(url)
    if (!cached) return null

    const fileInfo = await FileSystem.getInfoAsync(cached.localPath)
    if (!fileInfo.exists) {
      await mediaRepo.deleteByUrl(url)
      return null
    }

    return cached.localPath
  }

  async function preloadModuleMedia(
    blocks: { type?: string; url?: string; styles?: { backgroundImage?: string } }[],
  ): Promise<Map<string, string>> {
    const result = new Map<string, string>()

    const urls = new Set<string>()
    for (const block of blocks) {
      if (block.type === 'image' && block.url) urls.add(block.url)
      if (block.styles?.backgroundImage) urls.add(block.styles.backgroundImage)
    }

    const urlArray = Array.from(urls)
    for (let i = 0; i < urlArray.length; i += MAX_CONCURRENT) {
      const batch = urlArray.slice(i, i + MAX_CONCURRENT)
      const downloads = await Promise.allSettled(
        batch.map(async (url) => {
          const path = await downloadImage(url)
          if (path) result.set(url, path)
        }),
      )
      downloads.forEach((d, idx) => {
        if (d.status === 'rejected') {
          telemetry.error(d.reason instanceof Error ? d.reason : new Error(String(d.reason)), {
            url: batch[idx],
          })
        }
      })
    }

    return result
  }

  async function clearMediaCache(): Promise<void> {
    const paths = await mediaRepo.getAllPaths()
    for (const path of paths) {
      try {
        await FileSystem.deleteAsync(path, { idempotent: true })
      } catch {
        // File may not exist — continue cleanup
      }
    }
    await mediaRepo.clearAll()
  }

  return {
    downloadImage,
    getCachedImage,
    preloadModuleMedia,
    clearMediaCache,
  }
}
