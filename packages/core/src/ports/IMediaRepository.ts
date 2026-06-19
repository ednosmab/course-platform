import { MediaFile } from '@projeto/types';

/**
 * @description Repository interface for Media library operations.
 * Defines the contract for persisting and retrieving uploaded media files.
 * Business rule: Media files are stored in Supabase Storage with metadata in media_files table.
 */
export interface IMediaRepository {
  /**
   * @description Lists all media files with optional filters.
   * @param filters - Optional: type (image/video/document), courseId, search (name).
   * @returns Promise resolving to an array of MediaFile objects.
   */
  listMedia(filters?: {
    type?: string;
    courseId?: string;
    search?: string;
  }): Promise<MediaFile[]>;

  /**
   * @description Retrieves a single media file by ID.
   * @param mediaId - The UUID of the media file.
   * @returns Promise resolving to the MediaFile object.
   */
  getMediaById(mediaId: string): Promise<MediaFile>;

  /**
   * @description Saves media file metadata after upload.
   * @param data - Media file metadata (name, type, mime_type, size_bytes, url, path, uploader_id, course_id).
   * @returns Promise resolving to the created MediaFile.
   */
  createMedia(data: {
    name: string;
    type: string;
    mime_type: string;
    size_bytes: number;
    url: string;
    path: string;
    uploader_id: string;
    course_id?: string;
  }): Promise<MediaFile>;

  /**
   * @description Permanently removes a media file record and its storage entry.
   * @param mediaId - The UUID of the media file to delete.
   * @returns Promise resolving when deletion completes.
   */
  deleteMedia(mediaId: string): Promise<void>;

  /**
   * @description Retrieves all media files associated with a specific course.
   * @param courseId - The UUID of the course.
   * @returns Promise resolving to an array of MediaFile objects.
   */
  getMediaByCourse(courseId: string): Promise<MediaFile[]>;

  /**
   * @description Checks if a media file is in use by any lesson blocks.
   * @param mediaId - The UUID of the media file.
   * @returns Promise resolving to true if in use, false otherwise.
   */
  isMediaInUse(mediaId: string): Promise<boolean>;
}
