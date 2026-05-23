import { supabase } from '../supabase';
import type { IStorageProvider } from '../ports/IStorageProvider';

const BUCKET = 'course-thumbnails';

async function ensureBucket(): Promise<void> {
  const { error } = await supabase.storage.createBucket(BUCKET, { public: true, fileSizeLimit: 2 * 1024 * 1024 });
  if (error && !error.message.includes('already exists')) throw error;
}

export const supabaseStorageProvider: IStorageProvider = {
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
