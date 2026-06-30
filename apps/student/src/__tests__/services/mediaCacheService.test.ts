import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMediaCacheService } from '../../services/mediaCacheService'
import type { IMediaCacheRepository } from '../../persistence/repos/types'
import type { ITelemetryProvider } from '../../telemetry/types'

vi.mock('expo-file-system', () => ({
  cacheDirectory: '/mock/cache/',
  getInfoAsync: vi.fn(async (path: string) => {
    if (path.endsWith('/')) return { exists: true }
    return { exists: path.includes('existing') }
  }),
  makeDirectoryAsync: vi.fn(async () => {}),
  downloadAsync: vi.fn(async (url: string) => ({
    status: 200,
    headers: { 'content-type': 'image/png' },
  })),
  deleteAsync: vi.fn(async () => {}),
}))

function createMockMediaRepo(): IMediaCacheRepository {
  const store = new Map<string, any>()

  return {
    getByUrl: vi.fn(async (url) => store.get(url) ?? null),
    upsert: vi.fn(async (entry) => {
      store.set(entry.url, entry)
    }),
    deleteByUrl: vi.fn(async (url) => {
      store.delete(url)
    }),
    getAllPaths: vi.fn(async () => {
      return Array.from(store.values()).map((e) => e.localPath)
    }),
    clearAll: vi.fn(async () => {
      store.clear()
    }),
  }
}

function createMockTelemetry(): ITelemetryProvider {
  return {
    event: vi.fn(),
    error: vi.fn(),
    metric: vi.fn(),
  }
}

describe('mediaCacheService', () => {
  let mediaRepo: IMediaCacheRepository
  let telemetry: ITelemetryProvider
  let service: ReturnType<typeof createMediaCacheService>

  beforeEach(() => {
    mediaRepo = createMockMediaRepo()
    telemetry = createMockTelemetry()
    service = createMediaCacheService(mediaRepo, telemetry)
    vi.clearAllMocks()
  })

  it('should download an image', async () => {
    const path = await service.downloadImage('https://example.com/image.png')

    expect(path).not.toBeNull()
    expect(mediaRepo.upsert).toHaveBeenCalled()
    expect(telemetry.event).toHaveBeenCalledWith(
      'image.cached',
      expect.objectContaining({ url: 'https://example.com/image.png' }),
    )
  })

  it('should return null for empty url', async () => {
    const path = await service.downloadImage('')
    expect(path).toBeNull()
  })

  it('should get cached image', async () => {
    await mediaRepo.upsert({
      url: 'https://example.com/existing.png',
      localPath: '/mock/cache/existing.png',
      mimeType: 'image/png',
      sizeBytes: 1024,
      cachedAt: '2026-01-01T00:00:00Z',
    })

    const path = await service.getCachedImage('https://example.com/existing.png')
    expect(path).toBe('/mock/cache/existing.png')
  })

  it('should return null for non-cached image', async () => {
    const path = await service.getCachedImage('https://example.com/missing.png')
    expect(path).toBeNull()
  })

  it('should return null for empty url in getCachedImage', async () => {
    const path = await service.getCachedImage('')
    expect(path).toBeNull()
  })

  it('should clear media cache', async () => {
    await mediaRepo.upsert({
      url: 'https://example.com/img.png',
      localPath: '/mock/cache/img.png',
      mimeType: 'image/png',
      sizeBytes: 512,
      cachedAt: '2026-01-01T00:00:00Z',
    })

    await service.clearMediaCache()
    expect(mediaRepo.clearAll).toHaveBeenCalled()
  })

  it('should preload module media', async () => {
    const blocks = [
      { type: 'image', url: 'https://example.com/img1.png' },
      { type: 'text', content: 'Hello' },
      { type: 'image', url: 'https://example.com/img2.png' },
    ]

    const result = await service.preloadModuleMedia(blocks)

    expect(result.size).toBe(2)
    expect(result.has('https://example.com/img1.png')).toBe(true)
    expect(result.has('https://example.com/img2.png')).toBe(true)
  })
})
