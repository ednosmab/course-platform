import { Lesson, AnyBlock } from '@projeto/types';

/**
 * @description Repository interface for lesson content operations.
 * Defines the contract for reading and writing individual lessons, including
 * draft/published versioning, block-level content, and module/course resolution.
 * Business rule: Supports the CMS content editor with draft and published states
 * for safe content authoring workflows.
 */
export interface ILessonRepository {
  /**
   * @description Retrieves a lesson by its unique identifier, including all content blocks.
   * @param lessonId - The UUID of the lesson to retrieve.
   * @returns Promise resolving to the Lesson object, or null if not found.
   */
  getLesson(lessonId: string): Promise<Lesson | null>;

  /**
   * @description Saves or overwrites the draft version of a lesson.
   * Business rule: Draft changes do not affect the published lesson visible to students
   * until explicitly published via upsertPublished.
   * @param lessonId - The UUID of the lesson.
   * @param data - Object containing module_id, title, order_index, and blocks
   *               representing the draft content state.
   * @returns Promise resolving when the draft is persisted.
   */
  upsertDraft(lessonId: string, data: {
    module_id: string;
    title: string;
    order_index: number;
    blocks: AnyBlock[];
  }): Promise<void>;

  /**
   * @description Publishes a lesson version, making it visible to students.
   * Business rule: The published version is versioned so previous versions can
   * be tracked. Increments the version counter on each publish.
   * @param lessonId - The UUID of the lesson.
   * @param data - Object containing module_id, title, order_index, blocks, and
   *               the new version number.
   * @returns Promise resolving when the published version is saved.
   */
  upsertPublished(lessonId: string, data: {
    module_id: string;
    title: string;
    order_index: number;
    blocks: AnyBlock[];
    version: number;
  }): Promise<void>;

  /**
   * @description Retrieves the current version number of a published lesson.
   * Business rule: Used to track publish iterations and detect stale caches.
   * @param lessonId - The UUID of the lesson.
   * @returns Promise resolving to the version number, or null if never published.
   */
  getLessonVersion(lessonId: string): Promise<number | null>;

  /**
   * @description Resolves the parent course ID from a given module ID.
   * Business rule: Used for navigation, breadcrumbs, and permission checks.
   * @param moduleId - The UUID of the module.
   * @returns Promise resolving to the course UUID string, or null if not found.
   */
  getModuleCourseId(moduleId: string): Promise<string | null>;

  /**
   * @description Checks whether a course is in published state.
   * Business rule: Unpublished courses should not serve lessons to students.
   * @param courseId - The UUID of the course.
   * @returns Promise resolving to true if the course is published, false otherwise.
   */
  isCoursePublished(courseId: string): Promise<boolean>;

  /**
   * @description Resolves the parent course ID for a given lesson by traversing
   * lesson → module → course.
   * @param lessonId - The UUID of the lesson.
   * @returns The parent course UUID, or null if the lesson/module chain is broken.
   */
  getCourseIdFromLesson(lessonId: string): Promise<string | null>;

  /**
   * @description Retrieves all test/question blocks from a lesson's block array.
   * Business rule: A block is considered a test if its `layouts.isTest` property is true.
   * @param lessonId - The UUID of the lesson.
   * @returns Array of test blocks (empty array if none or lesson not found).
   */
  getLessonTestBlocks(lessonId: string): Promise<any[]>;

  /**
   * @description Retrieves all lesson IDs belonging to a given course by traversing
   * the course → modules → lessons hierarchy.
   * @param courseId - The UUID of the course.
   * @returns Array of lesson UUIDs for the course.
   */
  getLessonsByCourse(courseId: string): Promise<string[]>;
}
