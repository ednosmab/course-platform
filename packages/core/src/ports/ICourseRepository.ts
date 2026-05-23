import {
  Course,
  Module,
  Lesson,
  Path,
} from '@projeto/types';

/**
 * @description Repository interface for Course aggregate operations.
 * Defines the contract for persisting and retrieving courses, modules, lessons,
 * and learning paths from the data layer.
 * Business rule: All course data access must go through this port to decouple
 * storage from domain logic (Ports & Adapters).
 */
export interface ICourseRepository {
  /**
   * @description Retrieves all published learning paths available to students.
   * Business rule: Only published paths are visible to end-users.
   * @returns Promise resolving to an array of published Path objects.
   */
  getPublishedPaths(): Promise<Path[]>;

  /**
   * @description Retrieves every course in the system regardless of publish status.
   * Business rule: Admin-only operation for CMS management.
   * @returns Promise resolving to an array of all Course objects.
   */
  getAllCourses(): Promise<Course[]>;

  /**
   * @description Retrieves only the courses that are currently published.
   * Business rule: Students must only see published courses.
   * @returns Promise resolving to an array of published Course objects.
   */
  getPublishedCourses(): Promise<Course[]>;

  /**
   * @description Fetches a single course by its unique identifier.
   * @param courseId - The UUID of the course to retrieve.
   * @returns Promise resolving to the Course object.
   */
  getCourse(courseId: string): Promise<Course>;

  /**
   * @description Creates a new course with the given title and description.
   * Business rule: New courses start as unpublished drafts by default.
   * @param title - The display title of the course.
   * @param description - A textual summary of the course content.
   * @returns Promise resolving to the newly created Course object.
   */
  createCourse(title: string, description: string): Promise<Course>;

  /**
   * @description Partially updates an existing course's metadata fields.
   * @param courseId - The UUID of the course to update.
   * @param updates - Partial object containing any subset of title, description,
   *                  thumbnail_url, or is_published.
   * @returns Promise resolving when the update completes.
   */
  updateCourse(courseId: string, updates: Partial<Pick<Course, 'title' | 'description' | 'thumbnail_url' | 'is_published' | 'certificate_blocks'>>): Promise<void>;

  /**
   * @description Permanently removes a course and its associated data.
   * Business rule: Cascade deletion of modules and lessons is expected.
   * @param courseId - The UUID of the course to delete.
   * @returns Promise resolving when deletion completes.
   */
  deleteCourse(courseId: string): Promise<void>;

  /**
   * @description Toggles the published state of a course.
   * Business rule: Unpublishing hides the course from student-facing queries.
   * @param courseId - The UUID of the course to toggle.
   * @param isPublished - The new published state to set.
   * @returns Promise resolving when the toggle completes.
   */
  togglePublish(courseId: string, isPublished: boolean): Promise<void>;

  /**
   * @description Updates the core settings of a course including certificate flag.
   * Business rule: Certificate availability is configured at course level.
   * @param courseId - The UUID of the course.
   * @param data - Object containing title, description, certificate_enabled flag,
   *               and optional thumbnail_url.
   * @returns Promise resolving when settings are saved.
   */
  updateCourseSettings(courseId: string, data: { title: string; description: string; certificate_enabled: boolean; thumbnail_url: string | null }): Promise<void>;

  /**
   * @description Retrieves the full course structure including nested modules and lessons.
   * Business rule: Used by the CMS admin canvas to render the course tree.
   * @param courseId - The UUID of the course.
   * @returns Promise resolving to an object containing the course and an array of
   *          modules, each with their nested lessons.
   */
  getStructure(courseId: string): Promise<{ course: Course; modules: (Module & { lessons: Lesson[] })[] }>;

  /**
   * @description Alias for getStructure; retrieves course with all modules and lessons.
   * @param courseId - The UUID of the course.
   * @returns Promise resolving to course with nested modules and lessons.
   */
  getWithModulesAndLessons(courseId: string): Promise<{ course: Course; modules: (Module & { lessons: Lesson[] })[] }>;

  /**
   * @description Creates a new module inside a course at a specified position.
   * @param courseId - The UUID of the parent course.
   * @param title - The display title of the module.
   * @param orderIndex - The sort order position for the module.
   * @returns Promise resolving to the newly created Module object.
   */
  createModule(courseId: string, title: string, orderIndex: number): Promise<Module>;

  /**
   * @description Partially updates an existing module's title or order_index.
   * @param moduleId - The UUID of the module to update.
   * @param updates - Partial object with title and/or order_index.
   * @returns Promise resolving when the update completes.
   */
  updateModule(moduleId: string, updates: Partial<Pick<Module, 'title' | 'order_index'>>): Promise<void>;

  /**
   * @description Removes a module and its lessons from the course.
   * Business rule: Cascade deletion of child lessons is expected.
   * @param moduleId - The UUID of the module to delete.
   * @returns Promise resolving when deletion completes.
   */
  deleteModule(moduleId: string): Promise<void>;

  /**
   * @description Reorders modules within a course by updating their sort indices.
   * @param items - Array of objects mapping module IDs to their new order_index values.
   * @returns Promise resolving when the reorder completes.
   */
  reorderModules(items: { id: string; order_index: number }[]): Promise<void>;

  /**
   * @description Creates a new lesson inside a module at a specified position.
   * @param moduleId - The UUID of the parent module.
   * @param title - The display title of the lesson.
   * @param orderIndex - The sort order position for the lesson.
   * @returns Promise resolving to the newly created Lesson object.
   */
  createLesson(moduleId: string, title: string, orderIndex: number): Promise<Lesson>;

  /**
   * @description Partially updates an existing lesson's metadata or content blocks.
   * @param lessonId - The UUID of the lesson to update.
   * @param updates - Partial object with title, order_index, is_published, and/or blocks.
   * @returns Promise resolving when the update completes.
   */
  updateLesson(lessonId: string, updates: Partial<Pick<Lesson, 'title' | 'order_index' | 'is_published' | 'blocks'>>): Promise<void>;

  /**
   * @description Permanently removes a lesson from its parent module.
   * @param lessonId - The UUID of the lesson to delete.
   * @returns Promise resolving when deletion completes.
   */
  deleteLesson(lessonId: string): Promise<void>;

  /**
   * @description Reorders lessons within a module by updating their sort indices.
   * @param items - Array of objects mapping lesson IDs to their new order_index values.
   * @returns Promise resolving when the reorder completes.
   */
  reorderLessons(items: { id: string; order_index: number }[]): Promise<void>;

  /**
   * @description Retrieves the title and parent course ID for a given module.
   * Business rule: Used internally for navigation breadcrumbs.
   * @param moduleId - The UUID of the module.
   * @returns Promise resolving to an object with title and course_id, or null if not found.
   */
  getModuleTitle(moduleId: string): Promise<{ title: string; course_id: string } | null>;

  /**
   * @description Retrieves the display title of a course.
   * @param courseId - The UUID of the course.
   * @returns Promise resolving to the course title string, or null if not found.
   */
  getCourseTitle(courseId: string): Promise<string | null>;

  /**
   * @description Checks whether certificate issuance is enabled for a given course.
   * Business rule: Course-level setting must be true for certificates to be generated.
   * @param courseId - The UUID of the course.
   * @returns Promise resolving to true if certificates are enabled, false otherwise.
   */
  getCourseCertificateEnabled(courseId: string): Promise<boolean>;

  /**
   * @description Seeds demo / placeholder data for development and testing purposes.
   * Business rule: Creates a minimal viable structure of path, course, module,
   * lesson, and initial blocks in a single operation.
   * @param params - Object containing pathId, courseId, moduleId, activeLessonId,
   *                 and blocks for the demo lesson content.
   * @returns Promise resolving when seeding completes.
   */
  seedDemoData(params: { pathId: string; courseId: string; moduleId: string; activeLessonId: string; blocks: any[] }): Promise<void>;
}
