import { supabase } from '../supabase';
import type { StudentProgress} from '@projeto/types';
import { StudentProgressSchema } from '@projeto/types';
import type { IProgressRepository } from '../ports/IProgressRepository';

/**
 * @description Supabase-backed implementation of the ProgressRepository port.
 * Manages student lesson progress — watch time, completion status, and quiz/test scores.
 * Each progress record is keyed by (user_id, lesson_id) composite key.
 * @implements {IProgressRepository}
 */
export const supabaseProgressRepository: IProgressRepository = {
  /**
   * @description Retrieves a student's progress for a specific lesson.
   * Business rule: Every student-lesson pair has at most one progress record.
   * Returns null if no progress exists (lesson not yet started).
   * @param {string} userId - The UUID of the student.
   * @param {string} lessonId - The UUID of the lesson.
   * @returns {Promise<StudentProgress | null>} The progress record validated against StudentProgressSchema, or null.
   */
  async getProgress(userId: string, lessonId: string): Promise<StudentProgress | null> {
    const { data, error } = await supabase.from('student_progress').select('*').eq('user_id', userId).eq('lesson_id', lessonId).maybeSingle();
    if (error || !data) return null;
    const parsed = StudentProgressSchema.safeParse(data);
    if (!parsed.success) { console.error('Progress data validation error:', parsed.error); return data as StudentProgress; }
    return parsed.data;
  },

  /**
   * @description Creates or updates a student's progress for a lesson (upsert by user_id,lesson_id composite key).
   * Accepts partial progress data: last played seconds, percentage watched, completion flag,
   * completion timestamp, and test scores. The `updated_at` field is always required.
   * Business rule: Upsert uses `onConflict: 'user_id,lesson_id'` to ensure a single record per student-lesson pair.
   * @param {string} userId - The UUID of the student.
   * @param {string} lessonId - The UUID of the lesson.
   * @param {{ last_played_seconds?: number; percentage_watched?: number; completed?: boolean; completed_at?: string | null; tests_completed?: Record<string, number>; updated_at: string }} data - The progress fields to upsert.
   * @returns {Promise<StudentProgress>} The updated progress record validated against StudentProgressSchema.
   * @throws {PostgrestError} If the upsert operation fails.
   */
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

  /**
   * @description Retrieves the test completion scores for a specific student-lesson pair.
   * Business rule: Tests are identified by block ID; each value indicates the score achieved.
   * Returns an empty object if no test data exists yet.
   * @param {string} userId - The UUID of the student.
   * @param {string} lessonId - The UUID of the lesson.
   * @returns {Promise<Record<string, number>>} A record mapping block IDs to their scores.
   */
  async getTestCompleted(userId: string, lessonId: string): Promise<Record<string, number>> {
    const { data: current } = await supabase.from('student_progress').select('tests_completed').eq('user_id', userId).eq('lesson_id', lessonId).maybeSingle();
    return (current?.tests_completed as Record<string, number>) ?? {};
  },

  /**
   * @description Retrieves the content blocks of a lesson by its ID.
   * Used to determine which test/question blocks exist in a lesson for grading purposes.
   * @param {string} lessonId - The UUID of the lesson.
   * @returns {Promise<any[] | null>} The lesson blocks array, or null if the lesson doesn't exist or has no blocks.
   */
  async getLessonBlocks(lessonId: string): Promise<any[] | null> {
    const { data, error } = await supabase.from('lessons').select('blocks').eq('id', lessonId).single();
    if (error || !data?.blocks) return null;
    return data.blocks as any[];
  },

  /**
   * @description Marks a lesson as completed for a student at the given timestamp.
   * Business rule: Completion is a terminal state — setting `completed: true` and `completed_at`
   * records when the student finished the lesson. Used for certificate eligibility calculation.
   * @param {string} userId - The UUID of the student.
   * @param {string} lessonId - The UUID of the lesson.
   * @param {string} completedAt - ISO timestamp of when the lesson was completed.
   * @returns {Promise<StudentProgress>} The updated progress record validated against StudentProgressSchema.
   * @throws {PostgrestError} If the update operation fails.
   */
  async markCompleted(userId: string, lessonId: string, completedAt: string): Promise<StudentProgress> {
    const { data: updated, error: updateError } = await supabase.from('student_progress').update({ completed: true, completed_at: completedAt, updated_at: completedAt }).eq('user_id', userId).eq('lesson_id', lessonId).select('*').single();
    if (updateError) throw updateError;
    return StudentProgressSchema.parse(updated);
  },

  /**
   * @description Counts completed and total lessons for a user and course.
   * Business rule: Certificate eligibility requires completed === total.
   * @param {string} userId - The UUID of the student.
   * @param {string} courseId - The UUID of the course.
   * @returns {Promise<{ completed: number; total: number }>} Object with completed and total counts.
   */
  async getCompletedLessonCount(userId: string, courseId: string): Promise<{ completed: number; total: number }> {
    const { data: modules } = await supabase.from('modules').select('id').eq('course_id', courseId);
    if (!modules || modules.length === 0) return { completed: 0, total: 0 };
    const moduleIds = modules.map((m) => m.id);
    const { data: lessons } = await supabase.from('lessons').select('id').in('module_id', moduleIds).eq('is_published', true);
    if (!lessons) return { completed: 0, total: 0 };
    const total = lessons.length;
    if (total === 0) return { completed: 0, total: 0 };
    const lessonIds = lessons.map((l) => l.id);
    const { data: progress } = await supabase.from('student_progress').select('lesson_id').eq('user_id', userId).eq('completed', true).in('lesson_id', lessonIds);
    return { completed: progress?.length ?? 0, total };
  },

  /**
   * @description Retrieves test scores submitted by a student for a specific lesson.
   * Business rule: Scores are stored as a JSONB record mapping block IDs to numeric scores.
   * @param {string} userId - The UUID of the student.
   * @param {string} lessonId - The UUID of the lesson.
   * @returns {Promise<Record<string, number>>} Record of block ID to score, or empty object if none.
   */
  async getLessonTestScores(userId: string, lessonId: string): Promise<Record<string, number>> {
    const { data: progress } = await supabase.from('student_progress').select('tests_completed').eq('user_id', userId).eq('lesson_id', lessonId).maybeSingle();
    return (progress?.tests_completed as Record<string, number>) ?? {};
  },

  /**
   * @description Retrieves progress records for a student across a set of lessons.
   * Returns completion status and test scores for each lesson.
   * @param {string} userId - The UUID of the student.
   * @param {string[]} lessonIds - Array of lesson UUIDs to fetch progress for.
   * @returns {Promise<any[]>} Array of progress records (lesson_id, completed, tests_completed).
   */
  async getProgressByLessons(userId: string, lessonIds: string[]): Promise<any[]> {
    const { data: progress } = await supabase.from('student_progress').select('lesson_id, completed, tests_completed, percentage_watched, last_played_seconds').eq('user_id', userId).in('lesson_id', lessonIds);
    return progress ?? [];
  },

  /**
   * @description Full upsert of all progress fields including block_states, revisit_count, and last_revisited_at.
   * Business rule: Same composite key as regular upsert (user_id, lesson_id), but persists the complete lesson state
   * in a single atomic write — video position, block states, revisit metadata.
   * @param {string} userId - The UUID of the student.
   * @param {string} lessonId - The UUID of the lesson.
   * @param {object} data - All progress fields to persist.
   * @returns {Promise<StudentProgress>} The updated progress record validated against StudentProgressSchema.
   */
  async upsertFull(userId: string, lessonId: string, data: {
    last_played_seconds?: number;
    percentage_watched?: number;
    completed?: boolean;
    completed_at?: string | null;
    tests_completed?: Record<string, number>;
    block_states?: Record<string, any>;
    revisit_count?: number;
    last_revisited_at?: string | null;
    updated_at: string;
  }): Promise<StudentProgress> {
    const payload: any = { user_id: userId, lesson_id: lessonId, updated_at: data.updated_at };
    if (data.last_played_seconds !== undefined) payload.last_played_seconds = data.last_played_seconds;
    if (data.percentage_watched !== undefined) payload.percentage_watched = data.percentage_watched;
    if (data.completed !== undefined) payload.completed = data.completed;
    if (data.completed_at !== undefined) payload.completed_at = data.completed_at;
    if (data.tests_completed !== undefined) payload.tests_completed = data.tests_completed;
    if (data.block_states !== undefined) payload.block_states = data.block_states;
    if (data.revisit_count !== undefined) payload.revisit_count = data.revisit_count;
    if (data.last_revisited_at !== undefined) payload.last_revisited_at = data.last_revisited_at;

    const { data: result, error } = await supabase.from('student_progress').upsert(payload, { onConflict: 'user_id,lesson_id' }).select('*').single();
    if (error) throw error;
    return StudentProgressSchema.parse(result);
  },
};
