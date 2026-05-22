import { supabase } from '../supabase';
import { Certificate, CertificateSchema } from '@projeto/types';
import { z } from 'zod';

function generateBsgiCode(): string {
  const uuid = crypto.randomUUID();
  return `BSGI-${uuid}`;
}

export const CertificateService = {
  async getCourseIdFromLesson(lessonId: string): Promise<string | null> {
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('module_id')
      .eq('id', lessonId)
      .single();

    if (lessonError || !lesson) return null;

    const { data: module, error: moduleError } = await supabase
      .from('modules')
      .select('course_id')
      .eq('id', lesson.module_id)
      .single();

    if (moduleError || !module) return null;

    return module.course_id;
  },

  async getCompletedLessonCount(
    userId: string,
    courseId: string,
  ): Promise<{ completed: number; total: number }> {
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('id')
      .eq('course_id', courseId);

    if (modulesError || !modules || modules.length === 0) {
      return { completed: 0, total: 0 };
    }

    const moduleIds = modules.map((m) => m.id);

    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id')
      .in('module_id', moduleIds);

    if (lessonsError || !lessons) return { completed: 0, total: 0 };

    const total = lessons.length;
    if (total === 0) return { completed: 0, total: 0 };

    const lessonIds = lessons.map((l) => l.id);

    const { data: progress, error: progressError } = await supabase
      .from('student_progress')
      .select('lesson_id')
      .eq('user_id', userId)
      .eq('completed', true)
      .in('lesson_id', lessonIds);

    if (progressError) return { completed: 0, total };

    return { completed: progress?.length ?? 0, total };
  },

  async getLessonScore(userId: string, lessonId: string): Promise<number> {
    const { data: lessonData, error: lessonError } = await supabase
      .from('lessons')
      .select('blocks')
      .eq('id', lessonId)
      .single();

    if (lessonError || !lessonData?.blocks) return 0;

    const blocks = lessonData.blocks as Array<Record<string, any>>;
    const testBlocks = blocks.filter((b) => b.layouts?.isTest === true);

    if (testBlocks.length === 0) return 100;

    const { data: progress } = await supabase
      .from('student_progress')
      .select('tests_completed')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .maybeSingle();

    if (!progress?.tests_completed) return 0;

    const testsCompleted = progress.tests_completed as Record<string, number>;
    const scores = testBlocks.map((b) => testsCompleted[b.id] ?? 0);

    const total = scores.reduce((sum, s) => sum + s, 0);
    return Math.round(total / scores.length);
  },

  async getCourseAverage(userId: string, courseId: string): Promise<number> {
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('id')
      .eq('course_id', courseId);

    if (modulesError || !modules || modules.length === 0) return 0;

    const moduleIds = modules.map((m) => m.id);

    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id')
      .in('module_id', moduleIds);

    if (lessonsError || !lessons || lessons.length === 0) return 0;

    const lessonIds = lessons.map((l) => l.id);

    const { data: progress } = await supabase
      .from('student_progress')
      .select('lesson_id, completed, tests_completed')
      .eq('user_id', userId)
      .in('lesson_id', lessonIds);

    if (!progress) return 0;

    const totalLessons = progress.length;

    const lessonScores = await Promise.all(
      lessonIds.map((id) => this.getLessonScore(userId, id)),
    );

    const sumScores = lessonScores.reduce((a, b) => a + b, 0);
    return totalLessons > 0 ? Math.round(sumScores / totalLessons) : 0;
  },

  async isCourseCompleted(userId: string, courseId: string): Promise<boolean> {
    const { completed, total } = await this.getCompletedLessonCount(userId, courseId);
    return total > 0 && completed >= total;
  },

  async issueCertificate(userId: string, courseId: string): Promise<Certificate | null> {
    const { data: existing } = await supabase
      .from('certificates')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();

    if (existing) return null;

    const uuidBsgi = generateBsgiCode();

    const { data, error } = await supabase
      .from('certificates')
      .insert({
        user_id: userId,
        course_id: courseId,
        uuid_bsgi: uuidBsgi,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error issuing certificate:', error);
      return null;
    }

    return CertificateSchema.parse(data);
  },

  async checkAndIssue(userId: string, lessonId: string): Promise<Certificate | null> {
    const courseId = await this.getCourseIdFromLesson(lessonId);
    if (!courseId) return null;

    const { data: course } = await supabase
      .from('courses')
      .select('certificate_enabled')
      .eq('id', courseId)
      .single();

    if (!course?.certificate_enabled) return null;

    const completed = await this.isCourseCompleted(userId, courseId);
    if (!completed) return null;

    const average = await this.getCourseAverage(userId, courseId);
    if (average < 70) return null;

    return this.issueCertificate(userId, courseId);
  },

  async getUserCertificates(userId: string): Promise<Certificate[]> {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    const parsed = z.array(CertificateSchema).safeParse(data);
    if (!parsed.success) {
      console.error('Error parsing certificates:', parsed.error);
      return data as Certificate[];
    }

    return parsed.data;
  },

  async getCertificate(id: string): Promise<Certificate | null> {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return CertificateSchema.parse(data);
  },
};
