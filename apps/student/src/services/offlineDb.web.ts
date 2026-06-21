// Web stub - expo-sqlite is not available on web
// Platform.OS === 'web' checks in offlineDb.ts handle this at runtime

export async function getDatabase(): Promise<null> {
  return null;
}

export async function initDatabase(): Promise<null> {
  return null;
}

export async function closeDatabase(): Promise<void> {
  // No-op on web
}

export async function isDatabaseAvailable(): Promise<boolean> {
  return false;
}
