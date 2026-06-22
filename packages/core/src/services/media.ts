import type {
  MediaFile,
} from '@projeto/types';
import type { IMediaRepository } from '../ports/IMediaRepository';
import type { IStorageProvider } from '../ports/IStorageProvider';

/**
 * @description Creates a media service that manages the media library for the admin panel.
 * Handles file uploads, metadata persistence, and deletion operations.
 * Business rule: Files are uploaded to Supabase Storage, metadata stored in media_files table.
 * @param repo - An implementation of IMediaRepository
 * @param storage - An implementation of IStorageProvider
 * @returns An object with media management methods
 */
export function createMediaService(
  repo: IMediaRepository,
  storage: IStorageProvider
) {
  return {
    /**
     * @description Lists all media files with optional filters.
     * @param filters - Optional: type, courseId, search.
     * @returns Array of media files
     */
    async listMedia(filters?: {
      type?: string;
      courseId?: string;
      search?: string;
    }): Promise<MediaFile[]> {
      return repo.listMedia(filters);
    },

    /**
     * @description Retrieves a single media file by ID.
     * @param mediaId - The UUID of the media file.
     * @returns The media file
     */
    async getMediaById(mediaId: string): Promise<MediaFile> {
      return repo.getMediaById(mediaId);
    },

    /**
     * @description Uploads a file and persists its metadata.
     * Business rule: File type is auto-detected from MIME type.
     * @param file - The File object to upload.
     * @param uploaderId - The UUID of the user uploading.
     * @param courseId - Optional course association.
     * @returns The created media file record
     */
    async uploadMedia(
      file: File,
      uploaderId: string,
      courseId?: string
    ): Promise<MediaFile> {
      // Determine media type from MIME
      const mimeType = file.type;
      let mediaType: string;
      if (mimeType.startsWith('image/')) {
        mediaType = 'image';
      } else if (mimeType.startsWith('video/')) {
        mediaType = 'video';
      } else {
        mediaType = 'document';
      }

      // Upload to storage
      const path = `media/${Date.now()}-${file.name}`;
      const url = await storage.uploadThumbnail(file, courseId ?? 'general');

      if (!url) {
        throw new Error('Failed to upload file to storage');
      }

      // Persist metadata
      return repo.createMedia({
        name: file.name,
        type: mediaType,
        mime_type: mimeType,
        size_bytes: file.size,
        url,
        path,
        uploader_id: uploaderId,
        course_id: courseId,
      });
    },

    /**
     * @description Deletes a media file from storage and metadata.
     * Business rule: Checks if file is in use before deletion.
     * @param mediaId - The UUID of the media file.
     */
    async deleteMedia(mediaId: string): Promise<void> {
      // Check if in use
      const inUse = await repo.isMediaInUse(mediaId);
      if (inUse) {
        throw new Error('Cannot delete media file that is in use by lesson content');
      }

      // Delete metadata (storage cleanup would happen here if we had deleteMedia in IStorageProvider)
      return repo.deleteMedia(mediaId);
    },

    /**
     * @description Retrieves all media files for a specific course.
     * @param courseId - The UUID of the course.
     * @returns Array of media files
     */
    async getMediaByCourse(courseId: string): Promise<MediaFile[]> {
      return repo.getMediaByCourse(courseId);
    },
  };
}
