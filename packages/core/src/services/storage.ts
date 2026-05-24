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

    /**
     * @description Uploads an image for the certificate designer.
     * Stores the file in the certificate-images bucket and returns the public URL.
     * The URL is then set as the block's `url` so it renders from Storage instead of
     * inline base64, keeping the JSONB column lean.
     * @param file - The image File to upload
     * @param courseId - The UUID of the course
     * @param blockId - The UUID of the certificate block (used as filename)
     * @returns The public URL string, or null on failure
     */
    async uploadCertificateImage(file: File, courseId: string, blockId: string): Promise<string | null> {
      return provider.uploadCertificateImage(file, courseId, blockId);
    },

    /**
     * @description Uploads a rendered certificate preview image (PNG) to storage.
     * Used by the Studio to capture and persist a static preview of the certificate design.
     * @param blob - The PNG Blob captured via html-to-image.
     * @param courseId - The UUID of the course.
     * @returns The public URL of the preview image, or null on failure.
     */
    async uploadCertificatePreview(blob: Blob, courseId: string): Promise<string | null> {
      return provider.uploadCertificatePreview(blob, courseId);
    },
  };
}
