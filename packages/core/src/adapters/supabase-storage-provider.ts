import { supabase } from '../supabase';
import type { IStorageProvider } from '../ports/IStorageProvider';

const THUMB_BUCKET = 'course-thumbnails';
const CERT_BUCKET = 'certificate-images';

async function ensureBucket(bucket: string): Promise<void> {
  const { error } = await supabase.storage.createBucket(bucket, { public: true, fileSizeLimit: 5 * 1024 * 1024 });
  if (error && !error.message.includes('already exists')) throw error;
}

async function uploadToBucket(
  bucket: string,
  path: string,
  file: File,
): Promise<string | null> {
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) {
    if (error.message.includes('bucket') || error.message.includes('Bucket')) {
      await ensureBucket(bucket);
      const { error: retryErr } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
      if (retryErr) { console.error(retryErr); return null; }
    } else { console.error(error); return null; }
  }
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
  return publicUrl;
}

/**
 * @description Supabase-backed implementation of the StorageProvider port.
 * Handles file uploads to Supabase Storage for course thumbnails and certificate images.
 * Business rule: Files are stored in public buckets with size limits.
 * Buckets are auto-created lazily on first upload if they don't exist.
 * @implements {IStorageProvider}
 */
export const supabaseStorageProvider: IStorageProvider = {
  async uploadThumbnail(file: File, courseId: string): Promise<string | null> {
    const ext = file.name.split('.').pop();
    const path = `${courseId}/thumbnail.${ext}`;
    return uploadToBucket(THUMB_BUCKET, path, file);
  },

  async uploadCertificateImage(file: File, courseId: string, blockId: string): Promise<string | null> {
    const ext = file.name.split('.').pop();
    const path = `${courseId}/certificates/${blockId}.${ext}`;
    return uploadToBucket(CERT_BUCKET, path, file);
  },

  async uploadCertificatePreview(blob: Blob, courseId: string): Promise<string | null> {
    const file = new File([blob], 'preview.png', { type: 'image/png' });
    const path = `${courseId}/certificate-preview.png`;
    return uploadToBucket(CERT_BUCKET, path, file);
  },
};
