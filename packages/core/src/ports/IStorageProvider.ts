/**
 * @description Provider interface for external file storage operations.
 * Defines the contract for uploading media assets such as course thumbnails,
 * video files, and supplementary resources.
 * Business rule: All media uploads must go through this provider to decouple
 * the application from the underlying storage backend (Supabase Storage).
 */
export interface IStorageProvider {
  /**
   * @description Uploads a thumbnail image file for a course.
   * Business rule: The file is validated, processed, and stored externally.
   * The returned URL is persisted on the course record.
   * @param file - The File object to upload (image file).
   * @param courseId - The UUID of the course the thumbnail belongs to.
   * @returns Promise resolving to the public URL of the uploaded thumbnail,
   *          or null if the upload failed.
   */
  uploadThumbnail(file: File, courseId: string): Promise<string | null>;
}
