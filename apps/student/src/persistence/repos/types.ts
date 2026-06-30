/**
 * @description Data shape for local lesson progress.
 */
export interface LocalProgressData {
  videoPosition: number
  percentageWatched: number
  blockStates: Record<string, unknown>
  savedAt: string
}

/**
 * @description A cached module record.
 */
export interface CachedModule {
  moduleId: string
  courseId: string
  title: string
  orderIndex: number
  data: string
  cachedAt: string
  version: number
  partial: boolean
}

/**
 * @description A cached media file record.
 */
export interface CachedMedia {
  url: string
  localPath: string
  mimeType: string | null
  sizeBytes: number | null
  cachedAt: string
}

/**
 * @description Repository for lesson_progress table operations.
 */
export interface ILessonProgressRepository {
  upsert(userId: string, lessonId: string, data: LocalProgressData): Promise<void>
  getByUserAndLesson(userId: string, lessonId: string): Promise<LocalProgressData | null>
  getUnsynced(): Promise<(LocalProgressData & { userId: string; lessonId: string })[]>
  markSynced(lessonId: string): Promise<void>
  clearAll(): Promise<void>
}

/**
 * @description Repository for cached_modules table operations.
 */
export interface IModuleCacheRepository {
  upsert(module: CachedModule): Promise<void>
  upsertPartial(moduleId: string, courseId: string): Promise<void>
  getById(moduleId: string): Promise<CachedModule | null>
  getLessons(moduleId: string): Promise<string | null>
  exists(moduleId: string): Promise<boolean>
  deleteById(moduleId: string): Promise<void>
  listByCourse(courseId: string): Promise<CachedModule[]>
}

/**
 * @description Repository for cached_media table operations.
 */
export interface IMediaCacheRepository {
  getByUrl(url: string): Promise<CachedMedia | null>
  upsert(entry: CachedMedia): Promise<void>
  deleteByUrl(url: string): Promise<void>
  getAllPaths(): Promise<string[]>
  clearAll(): Promise<void>
}
