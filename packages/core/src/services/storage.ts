import type { IStorageProvider } from '../ports/IStorageProvider';

export function createStorageService(provider: IStorageProvider) {
  return {
    async uploadThumbnail(file: File, courseId: string): Promise<string | null> {
      return provider.uploadThumbnail(file, courseId);
    },
  };
}
