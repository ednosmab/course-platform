import { supabase } from '../supabase';
import { Lesson, LessonSchema, AnyBlock } from '@projeto/types';
import type { ILessonRepository } from '../ports/ILessonRepository';

/**
 * @description Supabase-backed implementation of the LessonRepository port.
 * Manages individual lesson CRUD, draft/published versioning, and publish-state checks
 * across the lesson → module → course hierarchy.
 * Business rule: Every lesson has a paired draft lesson (ID suffix 'dddddddddddd') that
 * holds unpublished changes while the published version remains live.
 * @implements {ILessonRepository}
 */
export const supabaseLessonRepository: ILessonRepository = {
  /**
   * @description Retrieves a single lesson by its ID using maybeSingle (no error if not found).
   * Falls back to returning the raw data as Lesson if Zod validation fails (with console error).
   * Business rule: Lessons that fail contract validation are still returned to avoid breaking
   * the frontend; the validation error is logged for monitoring.
   * @param {string} lessonId - The UUID of the lesson to fetch.
   * @returns {Promise<Lesson | null>} The lesson validated against LessonSchema, or null if not found.
   * @throws {PostgrestError} If the Supabase query fails unexpectedly.
   */
  async getLesson(lessonId: string): Promise<Lesson | null> {
    const { data, error } = await supabase.from('lessons').select('*').eq('id', lessonId).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const parsed = LessonSchema.safeParse(data);
    if (!parsed.success) { console.error(`Contract validation error in lesson ${lessonId}:`, parsed.error); return data as unknown as Lesson; }
    return parsed.data;
  },

  /**
   * @description Creates or updates the draft version of a lesson.
   * Business rule: The draft ID is derived from the published lesson ID by keeping the first
   * 24 characters and appending 'dddddddddddd'. Drafts are always unpublished (is_published: false).
   * This preserves the published version while edits are in progress.
   * @param {string} lessonId - The UUID of the published lesson (used to derive the draft ID).
   * @param {{ module_id: string; title: string; order_index: number; blocks: AnyBlock[] }} data - The draft content.
   * @returns {Promise<void>}
   * @throws {PostgrestError} If the upsert operation fails.
   */
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
    if (error) {
      const reason = `upsertDraft error [lessonId=${lessonId}, draftId=${draftId}]: ${error.message || JSON.stringify(error)}`;
      console.error(reason);
      throw new Error(reason);
    }
  },

  /**
   * @description Creates or updates the published version of a lesson.
   * Business rule: Publishing a lesson sets is_published to true and increments the version.
   * The published lesson uses the canonical lesson ID (not the draft suffix).
   * @param {string} lessonId - The UUID of the lesson to publish.
   * @param {{ module_id: string; title: string; order_index: number; blocks: AnyBlock[]; version: number }} data - The published content and version number.
   * @returns {Promise<void>}
   * @throws {PostgrestError} If the upsert operation fails.
   */
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

  /**
   * @description Retrieves the current version number of a published lesson.
   * Business rule: Version tracking enables change history and cache invalidation.
   * Each publish operation increments the version.
   * @param {string} lessonId - The UUID of the lesson.
   * @returns {Promise<number | null>} The current version number, or null if the lesson doesn't exist.
   */
  async getLessonVersion(lessonId: string): Promise<number | null> {
    const { data, error } = await supabase.from('lessons').select('version').eq('id', lessonId).single();
    if (error || !data) return null;
    return data.version;
  },

  /**
   * @description Resolves the parent course ID for a given module.
   * Used to verify publish-state permissions when publishing a lesson.
   * @param {string} moduleId - The UUID of the module.
   * @returns {Promise<string | null>} The parent course UUID, or null if not found.
   */
  async getModuleCourseId(moduleId: string): Promise<string | null> {
    const { data, error } = await supabase.from('modules').select('course_id').eq('id', moduleId).single();
    if (error || !data) return null;
    return data.course_id;
  },

  /**
   * @description Checks whether a course is published.
   * Business rule: Content from unpublished courses must not be visible to students.
   * This check is performed before displaying any lesson content from a course.
   * @param {string} courseId - The UUID of the course.
   * @returns {Promise<boolean>} True if the course is published, false otherwise (also false on error/not found).
   */
  async isCoursePublished(courseId: string): Promise<boolean> {
    const { data, error } = await supabase.from('courses').select('is_published').eq('id', courseId).single();
    if (error || !data) return false;
    return data.is_published;
  },

  /**
   * @description Resolves the parent course ID for a given lesson by traversing
   * lesson → module → course.
   * @param {string} lessonId - The UUID of the lesson.
   * @returns {Promise<string | null>} The parent course UUID, or null if the lesson/module chain is broken.
   */
  async getCourseIdFromLesson(lessonId: string): Promise<string | null> {
    const { data: lesson } = await supabase.from('lessons').select('module_id').eq('id', lessonId).single();
    if (!lesson) return null;
    const { data: module } = await supabase.from('modules').select('course_id').eq('id', lesson.module_id).single();
    if (!module) return null;
    return module.course_id;
  },

  /**
   * @description Retrieves all test/question blocks from a lesson's block array.
   * Business rule: A block is considered a test if its `layouts.isTest` property is true.
   * @param {string} lessonId - The UUID of the lesson.
   * @returns {Promise<any[]>} Array of test blocks (empty array if none or lesson not found).
   */
  async getLessonTestBlocks(lessonId: string): Promise<any[]> {
    const { data, error } = await supabase.from('lessons').select('blocks').eq('id', lessonId).single();
    if (error || !data?.blocks) return [];
    const blocks = data.blocks as Array<Record<string, any>>;
    return blocks.filter((b) => (b as any).layouts?.isTest === true);
  },

  /**
   * @description Retrieves all lesson IDs belonging to a given course by traversing
   * course → modules → lessons.
   * @param {string} courseId - The UUID of the course.
   * @returns {Promise<string[]>} Array of lesson UUIDs for the course.
   */
  async getLessonsByCourse(courseId: string): Promise<string[]> {
    const { data: modules } = await supabase.from('modules').select('id').eq('course_id', courseId);
    if (!modules || modules.length === 0) return [];
    const moduleIds = modules.map((m) => m.id);
    const { data: lessons } = await supabase.from('lessons').select('id').in('module_id', moduleIds);
    if (!lessons) return [];
    return lessons.map((l) => l.id);
  },
};
