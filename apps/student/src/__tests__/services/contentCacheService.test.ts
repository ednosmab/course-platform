import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createContentCacheService } from '../../services/contentCacheService'
import type { IModuleCacheRepository, IMediaCacheRepository } from '../../persistence/repos/types'
import type { ITelemetryProvider } from '../../telemetry/types'

vi.mock('@projeto/core', () => ({
  CourseService: {
    getCourseStructure: vi.fn(),
  },
}))

import { CourseService } from '@projeto/core'

function createMockModuleRepo(): IModuleCacheRepository {
  const store = new Map<string, any>()

  return {
    upsert: vi.fn(async (module) => {
      store.set(module.moduleId, module)
    }),
    upsertPartial: vi.fn(async (moduleId, courseId) => {
      store.set(moduleId, { moduleId, courseId, partial: true })
    }),
    getById: vi.fn(async (moduleId) => store.get(moduleId) ?? null),
    getLessons: vi.fn(async (moduleId) => {
      const mod = store.get(moduleId)
      return mod?.data ?? null
    }),
    exists: vi.fn(async (moduleId) => {
      const mod = store.get(moduleId)
      return mod ? !mod.partial : false
    }),
    deleteById: vi.fn(async (moduleId) => {
      store.delete(moduleId)
    }),
    listByCourse: vi.fn(async (courseId) => {
      return Array.from(store.values()).filter((m) => m.courseId === courseId)
    }),
  }
}

function createMockMediaRepo(): IMediaCacheRepository {
  return {
    getByUrl: vi.fn(async () => null),
    upsert: vi.fn(async () => {}),
    deleteByUrl: vi.fn(async () => {}),
    getAllPaths: vi.fn(async () => []),
    clearAll: vi.fn(async () => {}),
  }
}

function createMockTelemetry(): ITelemetryProvider {
  return {
    event: vi.fn(),
    error: vi.fn(),
    metric: vi.fn(),
  }
}

describe('contentCacheService', () => {
  let moduleRepo: IModuleCacheRepository
  let mediaRepo: IMediaCacheRepository
  let telemetry: ITelemetryProvider
  let service: ReturnType<typeof createContentCacheService>

  beforeEach(() => {
    moduleRepo = createMockModuleRepo()
    mediaRepo = createMockMediaRepo()
    telemetry = createMockTelemetry()
    service = createContentCacheService(moduleRepo, mediaRepo, telemetry)
    vi.clearAllMocks()
  })

  it('should download a module', async () => {
    vi.mocked(CourseService.getCourseStructure).mockResolvedValue({
      modules: [
        {
          id: 'mod1',
          title: 'Module 1',
          order_index: 1,
          lessons: [{ id: 'l1', blocks: [] }],
        },
      ],
    } as any)

    const result = await service.downloadModule('course1', 'mod1')

    expect(result).toBe(true)
    expect(moduleRepo.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ moduleId: 'mod1', courseId: 'course1' }),
    )
    expect(telemetry.event).toHaveBeenCalledWith(
      'module.downloaded',
      expect.objectContaining({ moduleId: 'mod1' }),
    )
  })

  it('should return false for non-existent module', async () => {
    vi.mocked(CourseService.getCourseStructure).mockResolvedValue({
      modules: [],
    } as any)

    const result = await service.downloadModule('course1', 'nonexistent')
    expect(result).toBe(false)
  })

  it('should get cached module', async () => {
    await moduleRepo.upsert({
      moduleId: 'mod1',
      courseId: 'course1',
      title: 'Module 1',
      orderIndex: 1,
      data: JSON.stringify({ lessons: [{ id: 'l1' }] }),
      cachedAt: '2026-01-01T00:00:00Z',
      version: 1,
      partial: false,
    })

    const result = await service.getCachedModule('mod1')
    expect(result).not.toBeNull()
    expect(result?.title).toBe('Module 1')
  })

  it('should return null for non-cached module', async () => {
    const result = await service.getCachedModule('nonexistent')
    expect(result).toBeNull()
    expect(telemetry.event).toHaveBeenCalledWith('cache.miss', { moduleId: 'nonexistent' })
  })

  it('should check if module is cached', async () => {
    await moduleRepo.upsert({
      moduleId: 'mod1',
      courseId: 'course1',
      title: 'Module 1',
      orderIndex: 1,
      data: '{}',
      cachedAt: '2026-01-01T00:00:00Z',
      version: 1,
      partial: false,
    })

    expect(await service.isModuleCached('mod1')).toBe(true)
    expect(await service.isModuleCached('nonexistent')).toBe(false)
  })

  it('should clear module cache', async () => {
    await service.clearModuleCache('mod1')
    expect(moduleRepo.deleteById).toHaveBeenCalledWith('mod1')
  })

  it('should list cached modules', async () => {
    await moduleRepo.upsert({
      moduleId: 'mod1',
      courseId: 'course1',
      title: 'Module 1',
      orderIndex: 1,
      data: '{}',
      cachedAt: '2026-01-01T00:00:00Z',
      version: 1,
      partial: false,
    })

    const modules = await service.listCachedModules('course1')
    expect(modules).toHaveLength(1)
    expect(modules[0].moduleId).toBe('mod1')
  })
})
