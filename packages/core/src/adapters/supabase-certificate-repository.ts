import { supabase } from '../supabase';
import { Certificate, CertificateSchema } from '@projeto/types';
import { z } from 'zod';
import type { ICertificateRepository } from '../ports/ICertificateRepository';

export const supabaseCertificateRepository: ICertificateRepository = {
  async getCourseIdFromLesson(lessonId: string): Promise<string | null> {
    const { data: lesson, error: lessonError } = await supabase.from('lessons').select('module_id').eq('id', lessonId).single();
    if (lessonError || !lesson) return null;
    const { data: module, error: moduleError } = await supabase.from('modules').select('course_id').eq('id', lesson.module_id).single();
    if (moduleError || !module) return null;
    return module.course_id;
  },

  async getCompletedLessonCount(userId: string, courseId: string): Promise<{ completed: number; total: number }> {
    const { data: modules, error: modulesError } = await supabase.from('modules').select('id').eq('course_id', courseId);
    if (modulesError || !modules || modules.length === 0) return { completed: 0, total: 0 };
    const moduleIds = modules.map((m) => m.id);
    const { data: lessons, error: lessonsError } = await supabase.from('lessons').select('id').in('module_id', moduleIds);
    if (lessonsError || !lessons) return { completed: 0, total: 0 };
    const total = lessons.length;
    if (total === 0) return { completed: 0, total: 0 };
    const lessonIds = lessons.map((l) => l.id);
    const { data: progress, error: progressError } = await supabase.from('student_progress').select('lesson_id').eq('user_id', userId).eq('completed', true).in('lesson_id', lessonIds);
    if (progressError) return { completed: 0, total };
    return { completed: progress?.length ?? 0, total };
  },

  async getLessonTestBlocks(lessonId: string): Promise<any[]> {
    const { data, error } = await supabase.from('lessons').select('blocks').eq('id', lessonId).single();
    if (error || !data?.blocks) return [];
    const blocks = data.blocks as Array<Record<string, any>>;
    return blocks.filter((b) => (b as any).layouts?.isTest === true);
  },

  async getLessonTestScores(userId: string, lessonId: string): Promise<Record<string, number>> {
    const { data: progress } = await supabase.from('student_progress').select('tests_completed').eq('user_id', userId).eq('lesson_id', lessonId).maybeSingle();
    return (progress?.tests_completed as Record<string, number>) ?? {};
  },

  async getLessonsByCourse(courseId: string): Promise<string[]> {
    const { data: modules } = await supabase.from('modules').select('id').eq('course_id', courseId);
    if (!modules || modules.length === 0) return [];
    const moduleIds = modules.map((m) => m.id);
    const { data: lessons } = await supabase.from('lessons').select('id').in('module_id', moduleIds);
    if (!lessons) return [];
    return lessons.map((l) => l.id);
  },

  async getProgressByLessons(userId: string, lessonIds: string[]): Promise<any[]> {
    const { data: progress } = await supabase.from('student_progress').select('lesson_id, completed, tests_completed').eq('user_id', userId).in('lesson_id', lessonIds);
    return progress ?? [];
  },

  async getCourseCertificateEnabled(courseId: string): Promise<boolean> {
    const { data: course } = await supabase.from('courses').select('certificate_enabled').eq('id', courseId).single();
    return course?.certificate_enabled ?? false;
  },

  async findExistingCertificate(userId: string, courseId: string): Promise<Certificate | null> {
    const { data: existing } = await supabase.from('certificates').select('id').eq('user_id', userId).eq('course_id', courseId).maybeSingle();
    return existing as Certificate | null;
  },

  async insertCertificate(userId: string, courseId: string, uuidBsgi: string): Promise<Certificate> {
    const { data, error } = await supabase.from('certificates').insert({ user_id: userId, course_id: courseId, uuid_bsgi: uuidBsgi }).select('*').single();
    if (error) { console.error('Error issuing certificate:', error); throw error; }
    return CertificateSchema.parse(data);
  },

  async getUserCertificates(userId: string): Promise<Certificate[]> {
    const { data, error } = await supabase.from('certificates').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error || !data) return [];
    const parsed = z.array(CertificateSchema).safeParse(data);
    if (!parsed.success) { console.error('Error parsing certificates:', parsed.error); return data as Certificate[]; }
    return parsed.data;
  },

  async getCertificate(id: string): Promise<Certificate | null> {
    const { data, error } = await supabase.from('certificates').select('*').eq('id', id).single();
    if (error || !data) return null;
    return CertificateSchema.parse(data);
  },
};
