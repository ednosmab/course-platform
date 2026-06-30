import type { IModuleCacheRepository } from '../persistence/repos/types'
import type { IMediaCacheRepository } from '../persistence/repos/types'
import type { ITelemetryProvider } from '../telemetry/types'
import { CourseService } from '@projeto/core'

const MAX_RETRIES = 3

/**
 * @description Service for module content caching.
 * Delegates all persistence to IModuleCacheRepository and IMediaCacheRepository.
 * No Platform.OS checks — platform decisions live in the repository layer.
 */
export function createContentCacheService(
  moduleRepo: IModuleCacheRepository,
  mediaRepo: IMediaCacheRepository,
  telemetry: ITelemetryProvider,
) {
  async function downloadModule(
    courseId: string,
    moduleId: string,
  ): Promise<boolean> {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const structure = await CourseService.getCourseStructure(courseId)
        const module = structure.modules.find((m) => m.id === moduleId)
        if (!module) return false

        await moduleRepo.upsert({
          moduleId,
          courseId,
          title: module.title,
          orderIndex: module.order_index,
          data: JSON.stringify({ lessons: module.lessons }),
          cachedAt: new Date().toISOString(),
          version: 1,
          partial: false,
        })

        telemetry.event('module.downloaded', {
          moduleId,
          courseId,
          lessonCount: module.lessons.length,
        })

        return true
      } catch (err) {
        if (attempt === MAX_RETRIES) {
          telemetry.error(err instanceof Error ? err : new Error(String(err)), {
            moduleId,
            courseId,
            attempts: MAX_RETRIES,
          })
          await moduleRepo.upsertPartial(moduleId, courseId)
          return false
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
      }
    }
    return false
  }

  async function getCachedModule(
    moduleId: string,
  ): Promise<{ title: string; lessons: unknown[] } | null> {
    const cached = await moduleRepo.getById(moduleId)
    if (!cached) {
      telemetry.event('cache.miss', { moduleId })
      return null
    }

    telemetry.event('cache.hit', { moduleId })
    const data = JSON.parse(cached.data)
    return { title: cached.title, lessons: data.lessons || [] }
  }

  async function getCachedLessons(moduleId: string): Promise<unknown[]> {
    const data = await moduleRepo.getLessons(moduleId)
    if (!data) return []
    const parsed = JSON.parse(data)
    return parsed.lessons || []
  }

  async function isModuleCached(moduleId: string): Promise<boolean> {
    return moduleRepo.exists(moduleId)
  }

  async function clearModuleCache(moduleId: string): Promise<void> {
    await moduleRepo.deleteById(moduleId)
  }

  async function listCachedModules(
    courseId: string,
  ): Promise<{ moduleId: string; title: string; cachedAt: string; partial: boolean }[]> {
    const modules = await moduleRepo.listByCourse(courseId)
    return modules.map((m) => ({
      moduleId: m.moduleId,
      title: m.title,
      cachedAt: m.cachedAt,
      partial: m.partial,
    }))
  }

  return {
    downloadModule,
    getCachedModule,
    getCachedLessons,
    isModuleCached,
    clearModuleCache,
    listCachedModules,
  }
}
