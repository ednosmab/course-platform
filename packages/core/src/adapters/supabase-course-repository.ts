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

/**
 * @description Supabase-backed implementation of the CourseRepository port.
 * Handles all CRUD operations for courses, modules, lessons, and learning paths
 * in the CMS. Constains business rules for publishing, ordering, and structure retrieval.
 * @implements {ICourseRepository}
 */
export const supabaseCourseRepository: ICourseRepository = {
  /**
   * @description Retrieves all published learning paths. Filters the `paths` table
   * to return only records where `is_published` is true.
   * Business rule: Only published paths are visible to students on the frontend.
   * @returns {Promise<Path[]>} Array of published paths validated against PathSchema.
   * @throws {PostgrestError} If the Supabase query fails.
   */
  async getPublishedPaths(): Promise<Path[]> {
    const { data, error } = await supabase.from('paths').select('*').eq('is_published', true);
    if (error) throw error;
    return z.array(PathSchema).parse(data ?? []);
  },

  /**
   * @description Retrieves all courses ordered by creation date descending.
   * Used in the admin panel to list every course regardless of publish status.
   * @returns {Promise<Course[]>} Array of all courses validated against CourseSchema.
   * @throws {PostgrestError} If the Supabase query fails.
   */
  async getAllCourses(): Promise<Course[]> {
    const { data, error } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return z.array(CourseSchema).parse(data ?? []);
  },

  /**
   * @description Retrieves only published courses. Used by the student-facing
   * frontend to display available courses.
   * Business rule: Unpublished courses must never appear in student views.
   * @returns {Promise<Course[]>} Array of published courses validated against CourseSchema.
   * @throws {PostgrestError} If the Supabase query fails.
   */
  async getPublishedCourses(): Promise<Course[]> {
    const { data, error } = await supabase.from('courses').select('*').eq('is_published', true);
    if (error) throw error;
    return z.array(CourseSchema).parse(data ?? []);
  },

  /**
   * @description Retrieves a single course by its unique ID.
   * @param {string} courseId - The UUID of the course to fetch.
   * @returns {Promise<Course>} The course object validated against CourseSchema.
   * @throws {PostgrestError} If the query fails or no course is found (.single()).
   */
  async getCourse(courseId: string): Promise<Course> {
    const { data, error } = await supabase.from('courses').select('*').eq('id', courseId).single();
    if (error) throw error;
    return CourseSchema.parse(data);
  },

  /**
   * @description Creates a new course with the given title and description.
   * Trims whitespace from both inputs. New courses are created as unpublished by default.
   * @param {string} title - The course title (trimmed before insert).
   * @param {string} description - The course description (trimmed before insert).
   * @returns {Promise<Course>} The newly created course validated against CourseSchema.
   * @throws {PostgrestError} If the insert operation fails.
   */
  async createCourse(title: string, description: string): Promise<Course> {
    const { data, error } = await supabase.from('courses').insert({ title: title.trim(), description: description.trim(), is_published: false }).select().single();
    if (error) throw error;
    return CourseSchema.parse(data);
  },

  /**
   * @description Partially updates a course. Accepts a partial object with updatable fields:
   * title, description, thumbnail_url, and is_published.
   * Business rule: Ensures only owned fields can be mutated; no accidental overrides.
   * @param {string} courseId - The UUID of the course to update.
   * @param {Partial<Pick<Course, 'title' | 'description' | 'thumbnail_url' | 'is_published'>>} updates - The fields to update.
   * @returns {Promise<void>}
   * @throws {PostgrestError} If the update operation fails.
   */
  async updateCourse(courseId: string, updates: Partial<Pick<Course, 'title' | 'description' | 'thumbnail_url' | 'is_published'>>): Promise<void> {
    const { error } = await supabase.from('courses').update(updates).eq('id', courseId);
    if (error) throw error;
  },

  /**
   * @description Deletes a course and its associated data (modules/lessons cascade is DB-level).
   * Business rule: Course deletion is irreversible; used exclusively in the admin panel.
   * @param {string} courseId - The UUID of the course to delete.
   * @returns {Promise<void>}
   * @throws {PostgrestError} If the delete operation fails.
   */
  async deleteCourse(courseId: string): Promise<void> {
    const { error } = await supabase.from('courses').delete().eq('id', courseId);
    if (error) throw error;
  },

  /**
   * @description Toggles the published state of a course.
   * Business rule: Controls visibility on the student frontend. Only published courses
   * appear in student course lists.
   * @param {string} courseId - The UUID of the course to toggle.
   * @param {boolean} isPublished - The new published state.
   * @returns {Promise<void>}
   * @throws {PostgrestError} If the update operation fails.
   */
  async togglePublish(courseId: string, isPublished: boolean): Promise<void> {
    const { error } = await supabase.from('courses').update({ is_published: isPublished }).eq('id', courseId);
    if (error) throw error;
  },

  /**
   * @description Updates the full settings payload for a course including title, description,
   * certificate toggle, and thumbnail URL. Trims title and description before persisting.
   * Business rule: Used by the admin course settings page to persist all configuration fields at once.
   * @param {string} courseId - The UUID of the course.
   * @param {{ title: string; description: string; certificate_enabled: boolean; thumbnail_url: string | null }} data - The settings payload.
   * @returns {Promise<void>}
   * @throws {PostgrestError} If the update operation fails.
   */
  async updateCourseSettings(courseId: string, data: { title: string; description: string; certificate_enabled: boolean; thumbnail_url: string | null }): Promise<void> {
    const { error } = await supabase.from('courses').update({ title: data.title.trim(), description: data.description.trim(), certificate_enabled: data.certificate_enabled, thumbnail_url: data.thumbnail_url }).eq('id', courseId);
    if (error) throw error;
  },

  /**
   * @description Retrieves the full hierarchical structure of a course: the course itself,
   * its modules ordered by `order_index`, and each module's published lessons.
   * Applies a draft-filter heuristic — lessons whose ID ends with 'dddddddddddd' are excluded
   * from the response. Lessons that fail Zod validation are returned as-is with a console error.
   * Business rule: Only published lessons are included in the structure. Draft lessons (suffix pattern)
   * are filtered out to prevent incomplete content from being served.
   * @param {string} courseId - The UUID of the course.
   * @returns {Promise<{ course: Course; modules: (Module & { lessons: Lesson[] })[] }>} The course with nested modules and lessons.
   * @throws {PostgrestError} If any of the chained Supabase queries fail.
   */
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
          if (!parsed.success) { console.error(`Contract validation error in lesson ${les.id}:`, parsed.error); return les as unknown as Lesson; }
          return parsed.data;
        });
        return { ...mod, lessons };
      }),
    );
    return { course, modules: modulesWithLessons };
  },

  /**
   * @description Retrieves the full course structure including both published and unpublished lessons.
   * Unlike getStructure, this method does not filter by `is_published` and is intended for the admin
   * editor to see all content including drafts.
   * Business rule: Admin users need visibility into all lessons regardless of publish state.
   * Draft lessons (suffix pattern) are still filtered out.
   * @param {string} courseId - The UUID of the course.
   * @returns {Promise<{ course: Course; modules: (Module & { lessons: Lesson[] })[] }>} The course with all modules and all lessons.
   */
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

  /**
   * @description Creates a new module under a given course with the specified title and order index.
   * Trims the title before persisting.
   * @param {string} courseId - The UUID of the parent course.
   * @param {string} title - The module title (trimmed before insert).
   * @param {number} orderIndex - The display order index within the course.
   * @returns {Promise<Module>} The newly created module validated against ModuleSchema.
   * @throws {PostgrestError} If the insert operation fails.
   */
  async createModule(courseId: string, title: string, orderIndex: number): Promise<Module> {
    const { data, error } = await supabase.from('modules').insert({ course_id: courseId, title: title.trim(), order_index: orderIndex }).select().single();
    if (error) throw error;
    return ModuleSchema.parse(data);
  },

  /**
   * @description Partially updates a module's title and/or order index.
   * @param {string} moduleId - The UUID of the module to update.
   * @param {Partial<Pick<Module, 'title' | 'order_index'>>} updates - The fields to update.
   * @returns {Promise<void>}
   * @throws {PostgrestError} If the update operation fails.
   */
  async updateModule(moduleId: string, updates: Partial<Pick<Module, 'title' | 'order_index'>>): Promise<void> {
    const { error } = await supabase.from('modules').update(updates).eq('id', moduleId);
    if (error) throw error;
  },

  /**
   * @description Deletes a module and its cascade of lessons.
   * Business rule: Module deletion is irreversible; used exclusively in the admin panel.
   * @param {string} moduleId - The UUID of the module to delete.
   * @returns {Promise<void>}
   * @throws {PostgrestError} If the delete operation fails.
   */
  async deleteModule(moduleId: string): Promise<void> {
    const { error } = await supabase.from('modules').delete().eq('id', moduleId);
    if (error) throw error;
  },

  /**
   * @description Reorders a list of modules by updating their `order_index` values sequentially.
   * Business rule: Each module's order is updated individually in a loop to support partial reordering.
   * @param {{ id: string; order_index: number }[]} items - Array of module ID and new order index pairs.
   * @returns {Promise<void>}
   * @throws {PostgrestError} If any individual update fails.
   */
  async reorderModules(items: { id: string; order_index: number }[]): Promise<void> {
    const { error } = await supabase.from('modules').upsert(
      items.map(item => ({ id: item.id, order_index: item.order_index })),
      { onConflict: 'id' },
    );
    if (error) throw error;
  },

  /**
   * @description Creates a new lesson under a given module. New lessons are created as unpublished
   * with an empty blocks array.
   * @param {string} moduleId - The UUID of the parent module.
   * @param {string} title - The lesson title (trimmed before insert).
   * @param {number} orderIndex - The display order index within the module.
   * @returns {Promise<Lesson>} The newly created lesson validated against LessonSchema.
   * @throws {PostgrestError} If the insert operation fails.
   */
  async createLesson(moduleId: string, title: string, orderIndex: number): Promise<Lesson> {
    const { data, error } = await supabase.from('lessons').insert({ module_id: moduleId, title: title.trim(), order_index: orderIndex, is_published: false, blocks: [] }).select().single();
    if (error) throw error;
    return LessonSchema.parse(data);
  },

  /**
   * @description Partially updates a lesson's title, order_index, is_published, and/or blocks.
   * @param {string} lessonId - The UUID of the lesson to update.
   * @param {Partial<Pick<Lesson, 'title' | 'order_index' | 'is_published' | 'blocks'>>} updates - The fields to update.
   * @returns {Promise<void>}
   * @throws {PostgrestError} If the update operation fails.
   */
  async updateLesson(lessonId: string, updates: Partial<Pick<Lesson, 'title' | 'order_index' | 'is_published' | 'blocks'>>): Promise<void> {
    const { error } = await supabase.from('lessons').update(updates).eq('id', lessonId);
    if (error) throw error;
  },

  /**
   * @description Deletes a lesson by its ID.
   * Business rule: Lesson deletion is irreversible; used exclusively in the admin panel.
   * @param {string} lessonId - The UUID of the lesson to delete.
   * @returns {Promise<void>}
   * @throws {PostgrestError} If the delete operation fails.
   */
  async deleteLesson(lessonId: string): Promise<void> {
    const { error } = await supabase.from('lessons').delete().eq('id', lessonId);
    if (error) throw error;
  },

  /**
   * @description Reorders a list of lessons by updating their `order_index` values sequentially.
   * Business rule: Each lesson's order is updated individually to support granular drag-and-drop reordering.
   * @param {{ id: string; order_index: number }[]} items - Array of lesson ID and new order index pairs.
   * @returns {Promise<void>}
   * @throws {PostgrestError} If any individual update fails.
   */
  async reorderLessons(items: { id: string; order_index: number }[]): Promise<void> {
    const { error } = await supabase.from('lessons').upsert(
      items.map(item => ({ id: item.id, order_index: item.order_index })),
      { onConflict: 'id' },
    );
    if (error) throw error;
  },

  /**
   * @description Retrieves the title and parent course ID for a given module.
   * Used by navigation/breadcrumb components to resolve the module context.
   * @param {string} moduleId - The UUID of the module.
   * @returns {Promise<{ title: string; course_id: string } | null>} The module title and course ID, or null if not found.
   */
  async getModuleTitle(moduleId: string): Promise<{ title: string; course_id: string } | null> {
    const { data } = await supabase.from('modules').select('title, course_id').eq('id', moduleId).single();
    return data;
  },

  /**
   * @description Retrieves the title of a course by its ID.
   * Used for display purposes in breadcrumbs, navigation, and meta tags.
   * @param {string} courseId - The UUID of the course.
   * @returns {Promise<string | null>} The course title, or null if not found.
   */
  async getCourseTitle(courseId: string): Promise<string | null> {
    const { data } = await supabase.from('courses').select('title').eq('id', courseId).single();
    return data?.title ?? null;
  },

  /**
   * @description Checks whether certificate issuance is enabled for a course.
   * Business rule: Course-level flag — if false, students cannot receive certificates
   * for this course regardless of completion status.
   * @param {string} courseId - The UUID of the course.
   * @returns {Promise<boolean>} True if certificates are enabled for the course, false otherwise.
   */
  async getCourseCertificateEnabled(courseId: string): Promise<boolean> {
    const { data: course } = await supabase.from('courses').select('certificate_enabled').eq('id', courseId).single();
    return course?.certificate_enabled ?? false;
  },

  /**
   * @description Seeds demo data into the database for development/testing purposes.
   * Creates a full learning path with a course, module, published lesson, and a corresponding draft lesson.
   * Business rule: The draft lesson is derived from the active lesson ID by appending 'dddddddddddd'
   * to the first 24 characters. This convention is used system-wide to pair draft/published lessons.
   * @param {{ pathId: string; courseId: string; moduleId: string; activeLessonId: string; blocks: any[] }} params
   * @returns {Promise<void>}
   */
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
