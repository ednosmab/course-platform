import { supabase } from '../supabase';
import { Lesson, LessonSchema, AnyBlock } from '@projeto/types';
import { CourseService } from './course';

function getDraftId(lessonId: string): string {
  return lessonId.substring(0, 24) + 'dddddddddddd';
}

export const LessonService = {
  async getLesson(lessonId: string): Promise<Lesson | null> {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const parsed = LessonSchema.safeParse(data);
    if (!parsed.success) {
      console.error(`Erro de contrato na aula ${lessonId}:`, parsed.error);
      return data as unknown as Lesson;
    }
    return parsed.data;
  },

  async getDraftLesson(lessonId: string): Promise<Lesson | null> {
    const draftId = getDraftId(lessonId);
    return this.getLesson(draftId);
  },

  async createDraftFromPublished(lessonId: string): Promise<Lesson | null> {
    const draftId = getDraftId(lessonId);
    const published = await this.getLesson(lessonId);
    if (!published) return null;

    const { data, error } = await supabase
      .from('lessons')
      .upsert({
        id: draftId,
        module_id: published.module_id,
        title: published.title,
        order_index: published.order_index,
        is_published: false,
        blocks: published.blocks || [],
      })
      .select()
      .single();

    if (error) throw error;
    return LessonSchema.parse(data);
  },

  async saveDraft(
    lessonId: string,
    data: {
      module_id: string;
      title: string;
      order_index: number;
      blocks: AnyBlock[];
    },
  ): Promise<void> {
    const draftId = getDraftId(lessonId);
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

  async publishLesson(
    lessonId: string,
    data: {
      module_id: string;
      title: string;
      order_index: number;
      blocks: AnyBlock[];
    },
  ): Promise<void> {
    const { data: mod, error: modErr } = await supabase
      .from('modules')
      .select('course_id')
      .eq('id', data.module_id)
      .single();

    if (modErr || !mod) {
      throw new Error('Módulo não encontrado.');
    }

    const { data: course, error: courseErr } = await supabase
      .from('courses')
      .select('is_published')
      .eq('id', mod.course_id)
      .single();

    if (courseErr || !course) {
      throw new Error('Curso não encontrado.');
    }

    if (!course.is_published) {
      throw new Error('O curso precisa estar publicado antes de publicar aulas.');
    }

    const { data: existingLesson } = await supabase
      .from('lessons')
      .select('version')
      .eq('id', lessonId)
      .single();

    const nextVersion = (existingLesson?.version ?? 0) + 1;

    const { error: pubErr } = await supabase.from('lessons').upsert({
      id: lessonId,
      module_id: data.module_id,
      title: data.title,
      order_index: data.order_index,
      is_published: true,
      blocks: data.blocks,
      version: nextVersion,
    });

    if (pubErr) {
      throw new Error('Erro ao publicar aula.');
    }
  },

  async getBreadcrumbMeta(moduleId: string): Promise<{
    moduleTitle: string;
    courseId: string;
    courseTitle: string;
  } | null> {
    const mod = await CourseService.getModuleTitle(moduleId);
    if (!mod) return null;

    const courseTitle = await CourseService.getCourseTitle(mod.course_id);

    return {
      moduleTitle: mod.title,
      courseId: mod.course_id,
      courseTitle: courseTitle ?? '',
    };
  },

  async getLessonBlocks(lessonId: string): Promise<AnyBlock[]> {
    const { data, error } = await supabase
      .from('lessons')
      .select('blocks, title')
      .eq('id', lessonId)
      .single();

    if (error || !data?.blocks) return [];
    return data.blocks as AnyBlock[];
  },

  async getLessonVersion(lessonId: string): Promise<number | null> {
    const { data, error } = await supabase
      .from('lessons')
      .select('version')
      .eq('id', lessonId)
      .single();

    if (error || !data) return null;
    return data.version;
  },

  subscribeToLesson(
    lessonId: string,
    onBlocksChanged: (blocks: AnyBlock[], title: string) => void,
  ) {
    const channel = supabase
      .channel(`lesson-realtime-${lessonId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lessons',
          filter: `id=eq.${lessonId}`,
        },
        (payload: any) => {
          if (payload.new && payload.new.blocks) {
            onBlocksChanged(
              payload.new.blocks as AnyBlock[],
              payload.new.title || '',
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
