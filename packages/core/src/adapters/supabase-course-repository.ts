import { supabase } from '../supabase';
import {
  Course,
  CourseSchema,
  Module,
  ModuleSchema,
  Lesson,
  LessonSchema,
  Path,
  PathSchema,
} from '@projeto/types';
import { z } from 'zod';
import type { ICourseRepository } from '../ports/ICourseRepository';

export const supabaseCourseRepository: ICourseRepository = {
  async getPublishedPaths(): Promise<Path[]> {
    const { data, error } = await supabase.from('paths').select('*').eq('is_published', true);
    if (error) throw error;
    return z.array(PathSchema).parse(data ?? []);
  },

  async getAllCourses(): Promise<Course[]> {
    const { data, error } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return z.array(CourseSchema).parse(data ?? []);
  },

  async getPublishedCourses(): Promise<Course[]> {
    const { data, error } = await supabase.from('courses').select('*').eq('is_published', true);
    if (error) throw error;
    return z.array(CourseSchema).parse(data ?? []);
  },

  async getCourse(courseId: string): Promise<Course> {
    const { data, error } = await supabase.from('courses').select('*').eq('id', courseId).single();
    if (error) throw error;
    return CourseSchema.parse(data);
  },

  async createCourse(title: string, description: string): Promise<Course> {
    const { data, error } = await supabase.from('courses').insert({ title: title.trim(), description: description.trim(), is_published: false }).select().single();
    if (error) throw error;
    return CourseSchema.parse(data);
  },

  async updateCourse(courseId: string, updates: Partial<Pick<Course, 'title' | 'description' | 'thumbnail_url' | 'is_published'>>): Promise<void> {
    const { error } = await supabase.from('courses').update(updates).eq('id', courseId);
    if (error) throw error;
  },

  async deleteCourse(courseId: string): Promise<void> {
    const { error } = await supabase.from('courses').delete().eq('id', courseId);
    if (error) throw error;
  },

  async togglePublish(courseId: string, isPublished: boolean): Promise<void> {
    const { error } = await supabase.from('courses').update({ is_published: isPublished }).eq('id', courseId);
    if (error) throw error;
  },

  async updateCourseSettings(courseId: string, data: { title: string; description: string; certificate_enabled: boolean; thumbnail_url: string | null }): Promise<void> {
    const { error } = await supabase.from('courses').update({ title: data.title.trim(), description: data.description.trim(), certificate_enabled: data.certificate_enabled, thumbnail_url: data.thumbnail_url }).eq('id', courseId);
    if (error) throw error;
  },

  async getStructure(courseId: string): Promise<{ course: Course; modules: (Module & { lessons: Lesson[] })[] }> {
    const course = await this.getCourse(courseId);
    const { data: modulesData, error: modulesError } = await supabase.from('modules').select('*').eq('course_id', courseId).order('order_index', { ascending: true });
    if (modulesError) throw modulesError;
    const modulesParsed = z.array(ModuleSchema).parse(modulesData);

    const modulesWithLessons = await Promise.all(
      modulesParsed.map(async (mod) => {
        const { data: lessonsData, error: lessonsError } = await supabase.from('lessons').select('*').eq('module_id', mod.id).eq('is_published', true).order('order_index', { ascending: true });
        if (lessonsError) throw lessonsError;
        const filtered = (lessonsData || []).filter((l: any) => !l.id.endsWith('dddddddddddd'));
        const lessons = filtered.map((les: any) => {
          const parsed = LessonSchema.safeParse(les);
          if (!parsed.success) { console.error(`Erro de contrato na aula ${les.id}:`, parsed.error); return les as unknown as Lesson; }
          return parsed.data;
        });
        return { ...mod, lessons };
      }),
    );
    return { course, modules: modulesWithLessons };
  },

  async getWithModulesAndLessons(courseId: string): Promise<{ course: Course; modules: (Module & { lessons: Lesson[] })[] }> {
    const course = await this.getCourse(courseId);
    const { data: mods } = await supabase.from('modules').select('*').eq('course_id', courseId).order('order_index');
    const modsWithLessons = await Promise.all(
      (mods || []).map(async (m) => {
        const { data: less } = await supabase.from('lessons').select('*').eq('module_id', m.id).order('order_index');
        return { ...m, lessons: (less || []).filter((l: any) => !l.id.endsWith('dddddddddddd')) };
      }),
    );
    return { course, modules: modsWithLessons };
  },

  async createModule(courseId: string, title: string, orderIndex: number): Promise<Module> {
    const { data, error } = await supabase.from('modules').insert({ course_id: courseId, title: title.trim(), order_index: orderIndex }).select().single();
    if (error) throw error;
    return ModuleSchema.parse(data);
  },

  async updateModule(moduleId: string, updates: Partial<Pick<Module, 'title' | 'order_index'>>): Promise<void> {
    const { error } = await supabase.from('modules').update(updates).eq('id', moduleId);
    if (error) throw error;
  },

  async deleteModule(moduleId: string): Promise<void> {
    const { error } = await supabase.from('modules').delete().eq('id', moduleId);
    if (error) throw error;
  },

  async reorderModules(items: { id: string; order_index: number }[]): Promise<void> {
    for (const item of items) {
      const { error } = await supabase.from('modules').update({ order_index: item.order_index }).eq('id', item.id);
      if (error) throw error;
    }
  },

  async createLesson(moduleId: string, title: string, orderIndex: number): Promise<Lesson> {
    const { data, error } = await supabase.from('lessons').insert({ module_id: moduleId, title: title.trim(), order_index: orderIndex, is_published: false, blocks: [] }).select().single();
    if (error) throw error;
    return LessonSchema.parse(data);
  },

  async updateLesson(lessonId: string, updates: Partial<Pick<Lesson, 'title' | 'order_index' | 'is_published' | 'blocks'>>): Promise<void> {
    const { error } = await supabase.from('lessons').update(updates).eq('id', lessonId);
    if (error) throw error;
  },

  async deleteLesson(lessonId: string): Promise<void> {
    const { error } = await supabase.from('lessons').delete().eq('id', lessonId);
    if (error) throw error;
  },

  async reorderLessons(items: { id: string; order_index: number }[]): Promise<void> {
    for (const item of items) {
      const { error } = await supabase.from('lessons').update({ order_index: item.order_index }).eq('id', item.id);
      if (error) throw error;
    }
  },

  async getModuleTitle(moduleId: string): Promise<{ title: string; course_id: string } | null> {
    const { data } = await supabase.from('modules').select('title, course_id').eq('id', moduleId).single();
    return data;
  },

  async getCourseTitle(courseId: string): Promise<string | null> {
    const { data } = await supabase.from('courses').select('title').eq('id', courseId).single();
    return data?.title ?? null;
  },

  async seedDemoData(params: { pathId: string; courseId: string; moduleId: string; activeLessonId: string; blocks: any[] }): Promise<void> {
    const { pathId, courseId, moduleId, activeLessonId, blocks } = params;
    await supabase.from('paths').upsert({ id: pathId, title: 'Trilha Full Stack Developer', description: 'Aprenda do zero ao deploy com arquiteturas resilientes e modernas.', is_published: true });
    await supabase.from('courses').upsert({ id: courseId, title: 'Desenvolvimento Web Full Stack', description: 'Torne-se um desenvolvedor completo, do frontend ao backend e DevOps.', is_published: true });
    await supabase.from('path_courses').upsert({ path_id: pathId, course_id: courseId, order_index: 1 });
    await supabase.from('modules').upsert({ id: moduleId, course_id: courseId, title: 'Módulo 1: Introdução Básica', order_index: 1 });
    await supabase.from('lessons').upsert({ id: activeLessonId, module_id: moduleId, title: '1. Introdução à Plataforma Híbrida', order_index: 1, is_published: true, blocks });
    const draftId = activeLessonId.substring(0, 24) + 'dddddddddddd';
    await supabase.from('lessons').upsert({ id: draftId, module_id: moduleId, title: '1. Introdução à Plataforma Híbrida', order_index: 1, is_published: false, blocks });
  },
};
