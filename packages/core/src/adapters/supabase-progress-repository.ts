import { supabase } from '../supabase';
import { StudentProgress, StudentProgressSchema } from '@projeto/types';
import type { IProgressRepository } from '../ports/IProgressRepository';

export const supabaseProgressRepository: IProgressRepository = {
  async getProgress(userId: string, lessonId: string): Promise<StudentProgress | null> {
    const { data, error } = await supabase.from('student_progress').select('*').eq('user_id', userId).eq('lesson_id', lessonId).maybeSingle();
    if (error || !data) return null;
    const parsed = StudentProgressSchema.safeParse(data);
    if (!parsed.success) { console.error('Erro de validação no progresso do aluno:', parsed.error); return data as StudentProgress; }
    return parsed.data;
  },

  async upsert(userId: string, lessonId: string, data: { last_played_seconds?: number; percentage_watched?: number; completed?: boolean; completed_at?: string | null; tests_completed?: Record<string, number>; updated_at: string }): Promise<StudentProgress> {
    const payload: any = { user_id: userId, lesson_id: lessonId, updated_at: data.updated_at };
    if (data.last_played_seconds !== undefined) payload.last_played_seconds = data.last_played_seconds;
    if (data.percentage_watched !== undefined) payload.percentage_watched = data.percentage_watched;
    if (data.completed !== undefined) payload.completed = data.completed;
    if (data.completed_at !== undefined) payload.completed_at = data.completed_at;
    if (data.tests_completed !== undefined) payload.tests_completed = data.tests_completed;

    const { data: result, error } = await supabase.from('student_progress').upsert(payload, { onConflict: 'user_id,lesson_id' }).select('*').single();
    if (error) throw error;
    return StudentProgressSchema.parse(result);
  },

  async getTestCompleted(userId: string, lessonId: string): Promise<Record<string, number>> {
    const { data: current } = await supabase.from('student_progress').select('tests_completed').eq('user_id', userId).eq('lesson_id', lessonId).maybeSingle();
    return (current?.tests_completed as Record<string, number>) ?? {};
  },

  async getLessonBlocks(lessonId: string): Promise<any[] | null> {
    const { data, error } = await supabase.from('lessons').select('blocks').eq('id', lessonId).single();
    if (error || !data?.blocks) return null;
    return data.blocks as any[];
  },

  async markCompleted(userId: string, lessonId: string, completedAt: string): Promise<StudentProgress> {
    const { data: updated, error: updateError } = await supabase.from('student_progress').update({ completed: true, completed_at: completedAt, updated_at: completedAt }).eq('user_id', userId).eq('lesson_id', lessonId).select('*').single();
    if (updateError) throw updateError;
    return StudentProgressSchema.parse(updated);
  },
};
