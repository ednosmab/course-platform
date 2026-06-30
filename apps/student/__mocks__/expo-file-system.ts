/**
 * @description Mock for expo-file-system used in unit tests.
 * Simulates file system operations with an in-memory store.
 */

const files = new Map<string, string>()

export const cacheDirectory = '/mock/cache/'

export async function getInfoAsync(
  path: string,
): Promise<{ exists: boolean; size?: number }> {
  if (files.has(path)) {
    return { exists: true, size: files.get(path)!.length }
  }
  if (path.endsWith('/')) {
    // Directory check — always exists in mock
    return { exists: true }
  }
  return { exists: false }
}

export async function makeDirectoryAsync(
  _path: string,
  _options?: { intermediates?: boolean },
): Promise<void> {
  // No-op in mock
}

export async function downloadAsync(
  url: string,
  path: string,
  _options?: { timeout?: number },
): Promise<{ status: number; headers: Record<string, string> }> {
  files.set(path, `content-from-${url}`)
  return {
    status: 200,
    headers: { 'content-type': 'image/png' },
  }
}

export async function deleteAsync(
  path: string,
  _options?: { idempotent?: boolean },
): Promise<void> {
  files.delete(path)
}

export async function readAsStringAsync(path: string): Promise<string> {
  return files.get(path) ?? ''
}

export async function writeAsStringAsync(
  path: string,
  content: string,
): Promise<void> {
  files.set(path, content)
}
