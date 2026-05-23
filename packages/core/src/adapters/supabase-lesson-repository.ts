import { supabase } from '../supabase';
import { Lesson, LessonSchema, AnyBlock } from '@projeto/types';
import type { ILessonRepository } from '../ports/ILessonRepository';

export const supabaseLessonRepository: ILessonRepository = {
  async getLesson(lessonId: string): Promise<Lesson | null> {
    const { data, error } = await supabase.from('lessons').select('*').eq('id', lessonId).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const parsed = LessonSchema.safeParse(data);
    if (!parsed.success) { console.error(`Erro de contrato na aula ${lessonId}:`, parsed.error); return data as unknown as Lesson; }
    return parsed.data;
  },

  async upsertDraft(lessonId: string, data: { module_id: string; title: string; order_index: number; blocks: AnyBlock[] }): Promise<void> {
    const draftId = lessonId.substring(0, 24) + 'dddddddddddd';
    const { error } = await supabase.from('lessons').upsert({
      id: draftId,
      module_id: data.module_id,
      title: data.title,
      order_index: data.order_index,
      is_published: false,
      blocks: data.blocks,
    });
    if (error) throw error;
  },

  async upsertPublished(lessonId: string, data: { module_id: string; title: string; order_index: number; blocks: AnyBlock[]; version: number }): Promise<void> {
    const { error } = await supabase.from('lessons').upsert({
      id: lessonId,
      module_id: data.module_id,
      title: data.title,
      order_index: data.order_index,
      is_published: true,
      blocks: data.blocks,
      version: data.version,
    });
    if (error) throw error;
  },

  async getLessonVersion(lessonId: string): Promise<number | null> {
    const { data, error } = await supabase.from('lessons').select('version').eq('id', lessonId).single();
    if (error || !data) return null;
    return data.version;
  },

  async getModuleCourseId(moduleId: string): Promise<string | null> {
    const { data, error } = await supabase.from('modules').select('course_id').eq('id', moduleId).single();
    if (error || !data) return null;
    return data.course_id;
  },

  async isCoursePublished(courseId: string): Promise<boolean> {
    const { data, error } = await supabase.from('courses').select('is_published').eq('id', courseId).single();
    if (error || !data) return false;
    return data.is_published;
  },
};
