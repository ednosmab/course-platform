import {
  Course,
  CourseAccess,
  CourseSchema,
  Module,
  ModuleSchema,
  Lesson,
  LessonSchema,
  Path,
} from '@projeto/types';
import { z } from 'zod';
import type { ICourseRepository } from '../ports/ICourseRepository';

/**
 * @description Creates a course service that manages courses, modules, lessons, paths,
 * and their CRUD operations for the CMS platform. All data operations are delegated
 * to an ICourseRepository implementation, ensuring persistence-layer independence.
 * Business rule: Published status is respected for student-facing queries; admin queries
 * return all content regardless of publication state.
 * @param repo - An implementation of ICourseRepository
 * @returns An object with course, module, lesson, and path management methods
 */
export function createCourseService(repo: ICourseRepository) {
  return {
    /**
     * @description Retrieves all published learning paths visible to students.
     * @returns An array of published Path objects
     */
    async getPublishedPaths(): Promise<Path[]> {
      return repo.getPublishedPaths();
    },

    /**
     * @description Retrieves all courses including unpublished ones. Intended for admin use.
     * @returns An array of all Course objects
     */
    async getAllCourses(): Promise<Course[]> {
      return repo.getAllCourses();
    },

    /**
     * @description Retrieves only published courses. Intended for student-facing views.
     * @returns An array of published Course objects
     */
    async getPublishedCourses(): Promise<Course[]> {
      return repo.getPublishedCourses();
    },

    /**
     * @description Retrieves a single course by its ID.
     * @param courseId - The UUID of the course
     * @returns The Course object
     */
    async getCourse(courseId: string): Promise<Course> {
      return repo.getCourse(courseId);
    },

    /**
     * @description Creates a new course with the given title and description.
     * @param title - The title of the new course
     * @param description - The description of the new course
     * @returns The newly created Course object
     */
    async createCourse(title: string, description: string): Promise<Course> {
      return repo.createCourse(title, description);
    },

    /**
     * @description Partially updates an existing course. Only the provided fields are updated.
     * @param courseId - The UUID of the course to update
     * @param updates - Partial object with title, description, thumbnail_url, and/or is_published
     */
    async updateCourse(
      courseId: string,
      updates: Partial<Pick<Course, 'title' | 'description' | 'thumbnail_url' | 'is_published' | 'certificate_blocks'>>,
    ): Promise<void> {
      return repo.updateCourse(courseId, updates);
    },

    /**
     * @description Deletes a course permanently.
     * @param courseId - The UUID of the course to delete
     */
    async deleteCourse(courseId: string): Promise<void> {
      return repo.deleteCourse(courseId);
    },

    /**
     * @description Toggles the published state of a course.
     * @param courseId - The UUID of the course
     * @param isPublished - The new published state
     */
    async togglePublish(courseId: string, isPublished: boolean): Promise<void> {
      return repo.togglePublish(courseId, isPublished);
    },

    /**
     * @description Updates all settings for a course in a single operation.
     * @param courseId - The UUID of the course
     * @param data - Object containing title, description, certificate_enabled, and thumbnail_url
     */
    async updateCourseSettings(
      courseId: string,
      data: { title: string; description: string; certificate_enabled: boolean; thumbnail_url: string | null },
    ): Promise<void> {
      return repo.updateCourseSettings(courseId, data);
    },

    /**
     * @description Retrieves the full course structure including modules and their lessons.
     * @param courseId - The UUID of the course
     * @returns An object with the course and a flat modules array, each module containing its lessons
     */
    async getCourseStructure(courseId: string): Promise<{
      course: Course;
      modules: (Module & { lessons: Lesson[] })[];
    }> {
      return repo.getStructure(courseId);
    },

    /**
     * @description Retrieves a course with its modules and lessons nested. Alias for getCourseStructure.
     * @param courseId - The UUID of the course
     * @returns An object with the course and modules containing nested lessons
     */
    async getCourseWithModulesAndLessons(courseId: string): Promise<{
      course: Course;
      modules: (Module & { lessons: Lesson[] })[];
    }> {
      return repo.getWithModulesAndLessons(courseId);
    },

    /**
     * @description Creates a new module within a course at the specified order index.
     * @param courseId - The UUID of the parent course
     * @param title - The title of the new module
     * @param orderIndex - The display order index for the module
     * @returns The newly created Module object
     */
    async createModule(courseId: string, title: string, orderIndex: number): Promise<Module> {
      return repo.createModule(courseId, title, orderIndex);
    },

    /**
     * @description Partially updates a module's title and/or order index.
     * @param moduleId - The UUID of the module to update
     * @param updates - Partial object with title and/or order_index
     */
    async updateModule(moduleId: string, updates: Partial<Pick<Module, 'title' | 'order_index'>>): Promise<void> {
      return repo.updateModule(moduleId, updates);
    },

    /**
     * @description Deletes a module permanently.
     * @param moduleId - The UUID of the module to delete
     */
    async deleteModule(moduleId: string): Promise<void> {
      return repo.deleteModule(moduleId);
    },

    /**
     * @description Reorders modules by updating their order_index values in bulk.
     * @param items - Array of objects each containing an id and the new order_index
     */
    async reorderModules(items: { id: string; order_index: number }[]): Promise<void> {
      return repo.reorderModules(items);
    },

    /**
     * @description Creates a new lesson within a module at the specified order index.
     * @param moduleId - The UUID of the parent module
     * @param title - The title of the new lesson
     * @param orderIndex - The display order index for the lesson
     * @returns The newly created Lesson object
     */
    async createLesson(moduleId: string, title: string, orderIndex: number): Promise<Lesson> {
      return repo.createLesson(moduleId, title, orderIndex);
    },

    /**
     * @description Partially updates a lesson's title, order_index, is_published, and/or blocks.
     * @param lessonId - The UUID of the lesson to update
     * @param updates - Partial object with title, order_index, is_published, and/or blocks
     */
    async updateLesson(lessonId: string, updates: Partial<Pick<Lesson, 'title' | 'order_index' | 'is_published' | 'blocks'>>): Promise<void> {
      return repo.updateLesson(lessonId, updates);
    },

    /**
     * @description Deletes a lesson permanently.
     * @param lessonId - The UUID of the lesson to delete
     */
    async deleteLesson(lessonId: string): Promise<void> {
      return repo.deleteLesson(lessonId);
    },

    /**
     * @description Reorders lessons within a module by updating their order_index values in bulk.
     * @param items - Array of objects each containing an id and the new order_index
     */
    async reorderLessons(items: { id: string; order_index: number }[]): Promise<void> {
      return repo.reorderLessons(items);
    },

    /**
     * @description Retrieves the title and course_id for a given module.
     * @param moduleId - The UUID of the module
     * @returns An object with title and course_id, or null if not found
     */
    async getModuleTitle(moduleId: string): Promise<{ title: string; course_id: string } | null> {
      return repo.getModuleTitle(moduleId);
    },

    /**
     * @description Retrieves the title of a course by its ID.
     * @param courseId - The UUID of the course
     * @returns The course title as a string, or null if not found
     */
    async getCourseTitle(courseId: string): Promise<string | null> {
      return repo.getCourseTitle(courseId);
    },

    /**
     * @description Retrieves all published courses intended for student consumption.
     * Filters the full course list to only include published items.
     * @returns An array of published Course objects
     */
    async getStudentPublishedCourses(): Promise<Course[]> {
      return repo.getAllCourses().then(courses => courses.filter(c => c.is_published));
    },

    /**
     * @description Seeds demo data for development and testing purposes.
     * @param params - Object containing pathId, courseId, moduleId, activeLessonId, and blocks
     */
    async seedDemoData(params: { pathId: string; courseId: string; moduleId: string; activeLessonId: string; blocks: any[] }): Promise<void> {
      return repo.seedDemoData(params);
    },

    /**
     * @description Retrieves the access configuration for a specific course.
     * @param courseId - The UUID of the course
     * @returns The CourseAccess object or null if not configured
     */
    async getCourseAccess(courseId: string): Promise<CourseAccess | null> {
      return repo.getCourseAccess(courseId);
    },

    /**
     * @description Updates or creates the access configuration for a course.
     * @param courseId - The UUID of the course
     * @param data - Object containing access_mode and optional prerequisite_course_id
     */
    async updateCourseAccess(courseId: string, data: { access_mode: string; prerequisite_course_id: string | null }): Promise<void> {
      return repo.updateCourseAccess(courseId, data);
    },

    /**
     * @description Checks if a student has access to a specific course.
     * @param studentId - The UUID of the student
     * @param courseId - The UUID of the course
     * @returns An object with hasAccess flag and reason string
     */
    async getStudentCourseAccess(studentId: string, courseId: string): Promise<{ hasAccess: boolean; reason: string }> {
      return repo.getStudentCourseAccess(studentId, courseId);
    },

    /**
     * @description Retrieves all published courses available to a specific student.
     * @param studentId - The UUID of the student
     * @returns An array of Course objects
     */
    async getPublishedCoursesForStudent(studentId: string): Promise<Course[]> {
      return repo.getPublishedCoursesForStudent(studentId);
    },

    /**
     * @description Detects if adding a prerequisite would create a circular dependency.
     * @param courseId - The UUID of the course
     * @param prerequisiteId - The UUID of the potential prerequisite course
     * @returns true if a cycle would be created, false otherwise
     */
    async detectPrerequisiteCycle(courseId: string, prerequisiteId: string): Promise<boolean> {
      return repo.detectPrerequisiteCycle(courseId, prerequisiteId);
    },
  };
}
