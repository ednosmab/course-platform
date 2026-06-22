import type { AnyBlock } from '@projeto/types';
import type { ILessonRepository } from '../ports/ILessonRepository';
import type { ICourseRepository } from '../ports/ICourseRepository';

/**
 * @description Creates a lesson service that manages the lesson lifecycle including
 * draft/published separation, lesson versioning, breadcrumb metadata, and block retrieval.
 * Business rule: Lessons follow a draft-published workflow — draft versions are stored
 * with a modified ID (12 'd' suffix) while published versions use the original ID.
 * Publishing requires the parent course to be published first.
 * @param lessonRepo - An implementation of ILessonRepository for lesson persistence
 * @param courseRepo - An implementation of ICourseRepository for course-level lookups
 * @returns An object with lesson query, draft, publish, and metadata methods
 */
export function createLessonService(
  lessonRepo: ILessonRepository,
  courseRepo: ICourseRepository,
) {
  return {
    /**
     * @description Retrieves a lesson by its ID. Used for both published and draft lookups.
     * @param lessonId - The UUID of the lesson
     * @returns The lesson object, or null if not found
     */
    async getLesson(lessonId: string) {
      return lessonRepo.getLesson(lessonId);
    },

    /**
     * @description Retrieves the draft version of a lesson. The draft ID is derived from the
     * published lesson ID by replacing the last 12 characters with 'd'.
     * @param lessonId - The UUID of the published lesson
     * @returns The draft lesson object, or null if no draft exists
     */
    async getDraftLesson(lessonId: string) {
      const draftId = lessonId.substring(0, 24) + 'dddddddddddd';
      return lessonRepo.getLesson(draftId);
    },

    /**
     * @description Creates a draft copy from the currently published lesson.
     * Business rule: The draft inherits all fields (module_id, title, order_index, blocks)
     * from the published version and is upserted into the draft ID slot.
     * @param lessonId - The UUID of the published lesson to copy from
     * @returns The newly created draft lesson object, or null if the published lesson is not found
     */
    async createDraftFromPublished(lessonId: string) {
      const draftId = lessonId.substring(0, 24) + 'dddddddddddd';
      const published = await lessonRepo.getLesson(lessonId);
      if (!published) return null;

      await lessonRepo.upsertDraft(lessonId, {
        module_id: published.module_id,
        title: published.title,
        order_index: published.order_index,
        blocks: published.blocks || [],
      });

      return lessonRepo.getLesson(draftId);
    },

    /**
     * @description Saves or updates the draft version of a lesson with the provided data.
     * @param lessonId - The UUID of the published lesson associated with this draft
     * @param data - Object containing module_id, title, order_index, and blocks for the draft
     */
    async saveDraft(
      lessonId: string,
      data: { module_id: string; title: string; order_index: number; blocks: AnyBlock[] },
    ) {
      return lessonRepo.upsertDraft(lessonId, data);
    },

    /**
     * @description Publishes a lesson by saving it to the published slot with an incremented version.
     * Business rule: The parent course must be published before any lesson can be published.
     * Each publish operation increments the lesson version number.
     * @param lessonId - The UUID of the lesson to publish
     * @param data - Object containing module_id, title, order_index, and blocks for the published version
     * @throws Error if the parent module's course is not published
     */
    async publishLesson(
      lessonId: string,
      data: { module_id: string; title: string; order_index: number; blocks: AnyBlock[] },
    ) {
      const courseId = await lessonRepo.getModuleCourseId(data.module_id);
      if (!courseId) throw new Error('Module not found.');

      const isPublished = await lessonRepo.isCoursePublished(courseId);
      if (!isPublished) {
        throw new Error('Course must be published before publishing lessons.');
      }

      const currentVersion = await lessonRepo.getLessonVersion(lessonId);
      const nextVersion = (currentVersion ?? 0) + 1;

      await lessonRepo.upsertPublished(lessonId, {
        ...data,
        version: nextVersion,
      });
    },

    /**
     * @description Retrieves breadcrumb navigation metadata for a given module.
     * Returns the module title, course ID, and course title for building UI breadcrumbs.
     * @param moduleId - The UUID of the module
     * @returns An object with moduleTitle, courseId, and courseTitle, or null if the module is not found
     */
    async getBreadcrumbMeta(moduleId: string) {
      const titleInfo = await courseRepo.getModuleTitle(moduleId);
      if (!titleInfo) return null;

      const courseTitle = await courseRepo.getCourseTitle(titleInfo.course_id);

      return {
        moduleTitle: titleInfo.title,
        courseId: titleInfo.course_id,
        courseTitle: courseTitle ?? '',
      };
    },

    /**
     * @description Retrieves the content blocks of a lesson.
     * @param lessonId - The UUID of the lesson
     * @returns An array of AnyBlock objects, or an empty array if the lesson or blocks are not found
     */
    async getLessonBlocks(lessonId: string): Promise<AnyBlock[]> {
      const lesson = await lessonRepo.getLesson(lessonId);
      return lesson?.blocks ?? [];
    },

    /**
     * @description Retrieves the current version number of a published lesson.
     * @param lessonId - The UUID of the lesson
     * @returns The version number, or null if the lesson has never been published
     */
    async getLessonVersion(lessonId: string) {
      return lessonRepo.getLessonVersion(lessonId);
    },
  };
}
