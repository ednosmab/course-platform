import { supabase } from '../supabase';
import {
  MediaFile,
  MediaFileSchema,
} from '@projeto/types';
import { z } from 'zod';
import type { IMediaRepository } from '../ports/IMediaRepository';

/**
 * @description Supabase adapter implementing IMediaRepository.
 * Provides media library operations including listing, uploading, and deleting files.
 * Business rule: Media files are stored in Supabase Storage with metadata in media_files table.
 */
export const supabaseMediaRepository: IMediaRepository = {
  async listMedia(filters?) {
    let queryBuilder = supabase
      .from('media_files')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.type) {
      queryBuilder = queryBuilder.eq('type', filters.type);
    }

    if (filters?.courseId) {
      queryBuilder = queryBuilder.eq('course_id', filters.courseId);
    }

    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      queryBuilder = queryBuilder.ilike('name', searchTerm);
    }

    const { data, error } = await queryBuilder;
    if (error) throw error;
    return z.array(MediaFileSchema).parse(data ?? []);
  },

  async getMediaById(mediaId: string): Promise<MediaFile> {
    const { data, error } = await supabase
      .from('media_files')
      .select('*')
      .eq('id', mediaId)
      .single();
    if (error) throw error;
    return MediaFileSchema.parse(data);
  },

  async createMedia(data) {
    const { data: media, error } = await supabase
      .from('media_files')
      .insert({
        name: data.name,
        type: data.type,
        mime_type: data.mime_type,
        size_bytes: data.size_bytes,
        url: data.url,
        path: data.path,
        uploader_id: data.uploader_id,
        course_id: data.course_id ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return MediaFileSchema.parse(media);
  },

  async deleteMedia(mediaId: string): Promise<void> {
    const { error } = await supabase
      .from('media_files')
      .delete()
      .eq('id', mediaId);
    if (error) throw error;
  },

  async getMediaByCourse(courseId: string): Promise<MediaFile[]> {
    const { data, error } = await supabase
      .from('media_files')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return z.array(MediaFileSchema).parse(data ?? []);
  },

  async isMediaInUse(mediaId: string): Promise<boolean> {
    // Check if media URL is referenced in any lesson blocks
    const { data: media } = await supabase
      .from('media_files')
      .select('url')
      .eq('id', mediaId)
      .single();

    if (!media) return false;

    const { data: lessons, error } = await supabase
      .from('lessons')
      .select('id')
      .contains('blocks', [{ url: media.url }])
      .limit(1);

    if (error) throw error;
    return (lessons ?? []).length > 0;
  },
};
