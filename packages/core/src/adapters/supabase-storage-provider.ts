import { supabase } from '../supabase';
import type { IStorageProvider } from '../ports/IStorageProvider';

const BUCKET = 'course-thumbnails';

async function ensureBucket(): Promise<void> {
  const { error } = await supabase.storage.createBucket(BUCKET, { public: true, fileSizeLimit: 2 * 1024 * 1024 });
  if (error && !error.message.includes('already exists')) throw error;
}

/**
 * @description Supabase-backed implementation of the StorageProvider port.
 * Handles file uploads to Supabase Storage, specifically course thumbnail images.
 * Business rule: Thumbnails are stored in the 'course-thumbnails' public bucket
 * with a 2MB size limit. The bucket is auto-created on first upload if it doesn't exist.
 * @implements {IStorageProvider}
 */
export const supabaseStorageProvider: IStorageProvider = {
  /**
   * @description Uploads a course thumbnail image to Supabase Storage.
   * Tries the upload first; if the bucket doesn't exist, creates it with public access
   * and a 2MB file limit, then retries the upload. Returns the public URL on success.
   * Business rule: The file is stored at `{courseId}/thumbnail.{ext}` with upsert enabled
   * so re-uploading replaces the previous thumbnail. The bucket is auto-provisioned lazily.
   * @param {File} file - The image file to upload (must be under 2MB).
   * @param {string} courseId - The UUID of the course (used as folder path).
   * @returns {Promise<string | null>} The public URL of the uploaded thumbnail, or null on failure.
   */
  async uploadThumbnail(file: File, courseId: string): Promise<string | null> {
    const ext = file.name.split('.').pop();
    const path = `${courseId}/thumbnail.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true });
    if (error) {
      if (error.message.includes('bucket') || error.message.includes('Bucket')) {
        await ensureBucket();
        const { error: retryErr } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true });
        if (retryErr) { console.error(retryErr); return null; }
      } else { console.error(error); return null; }
    }
    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return publicUrl;
  },
};
