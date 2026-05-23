import type { IStorageProvider } from '../ports/IStorageProvider';

/**
 * @description Creates a storage service that handles file upload operations
 * for the CMS platform. Currently provides thumbnail upload functionality
 * delegated to an IStorageProvider implementation.
 * Business rule: File uploads are delegated to the provider adapter to
 * abstract the underlying storage backend (e.g., Supabase Storage).
 * @param provider - An implementation of IStorageProvider
 * @returns An object with file upload methods
 */
export function createStorageService(provider: IStorageProvider) {
  return {
    /**
     * @description Uploads a thumbnail image file for a course and returns its public URL.
     * @param file - The File object to upload (image)
     * @param courseId - The UUID of the course to associate the thumbnail with
     * @returns The public URL string of the uploaded thumbnail, or null on failure
     */
    async uploadThumbnail(file: File, courseId: string): Promise<string | null> {
      return provider.uploadThumbnail(file, courseId);
    },
  };
}
