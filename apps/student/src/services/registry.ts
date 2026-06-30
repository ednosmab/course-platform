import { Platform } from 'react-native'
import { getDatabase } from '../persistence'
import { createTelemetry } from '../telemetry'
import { ProgressRepository } from '../persistence/repos/ProgressRepository'
import { ContentCacheRepository } from '../persistence/repos/ContentCacheRepository'
import { MediaCacheRepository } from '../persistence/repos/MediaCacheRepository'
import { createProgressOfflineStore } from './progressOfflineStore'
import { createSyncService } from './syncService'
import { createContentCacheService } from './contentCacheService'

import type { ITelemetryProvider } from '../telemetry/types'
import type { IDatabase } from '../persistence/types'

let initialized = false
let _telemetry: ITelemetryProvider | null = null

export let offlineStore: ReturnType<typeof createProgressOfflineStore>
export let syncService: ReturnType<typeof createSyncService>
export let contentCache: ReturnType<typeof createContentCacheService>

/**
 * @description Composition root for offline-first services.
 * Initialises DB, telemetry, repositories and services as singletons.
 * Must be called once at app startup before any screen uses offline services.
 *
 * On web, this is a no-op — offline-first is native-only (expo-sqlite).
 */
export async function initOfflineServices(): Promise<void> {
  if (initialized) return

  if (Platform.OS === 'web') {
    initialized = true
    return
  }

  _telemetry = createTelemetry('console')
  const db: IDatabase = await getDatabase(_telemetry)

  const progressRepo = new ProgressRepository(db)
  const moduleRepo = new ContentCacheRepository(db)
  const mediaRepo = new MediaCacheRepository(db)

  offlineStore = createProgressOfflineStore(progressRepo)
  syncService = createSyncService(progressRepo, _telemetry)
  contentCache = createContentCacheService(moduleRepo, mediaRepo, _telemetry)

  initialized = true
}

/**
 * @description Returns true if offline services have been initialised.
 */
export function isOfflineReady(): boolean {
  return initialized
}
