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

  /**
   * @description Uploads an image for the certificate designer (Studio).
   * Files are stored in the 'certificate-images' bucket under {courseId}/{blockId}.{ext}.
   * Business rule: Supports JPEG, PNG, WebP formats. Returns the public URL
   * to be stored in the certificate block's `url` field instead of inline base64.
   * @param file - The image File to upload.
   * @param courseId - The UUID of the course (used as folder path).
   * @param blockId - The UUID of the certificate block (used as filename).
   * @returns Promise resolving to the public URL of the uploaded image,
   *          or null if the upload failed.
   */
  uploadCertificateImage(file: File, courseId: string, blockId: string): Promise<string | null>;

  /**
   * @description Uploads a rendered certificate preview image (PNG) generated from the Studio.
   * The image is stored in the 'certificate-images' bucket under {courseId}/preview.png.
   * Business rule: Called on auto-save in certificate mode so the settings page can show
   * a static image preview instead of re-rendering the blocks live.
   * @param blob - The PNG Blob from html-to-image capture.
   * @param courseId - The UUID of the course (used as folder path).
   * @returns Promise resolving to the public URL of the preview image.
   */
  uploadCertificatePreview(blob: Blob, courseId: string): Promise<string | null>;
}
