import { AnyBlock } from '@projeto/types';
import type { ILessonRepository } from '../ports/ILessonRepository';
import type { ICourseRepository } from '../ports/ICourseRepository';

export function createLessonService(
  lessonRepo: ILessonRepository,
  courseRepo: ICourseRepository,
) {
  return {
    async getLesson(lessonId: string) {
      return lessonRepo.getLesson(lessonId);
    },

    async getDraftLesson(lessonId: string) {
      const draftId = lessonId.substring(0, 24) + 'dddddddddddd';
      return lessonRepo.getLesson(draftId);
    },

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

    async saveDraft(
      lessonId: string,
      data: { module_id: string; title: string; order_index: number; blocks: AnyBlock[] },
    ) {
      return lessonRepo.upsertDraft(lessonId, data);
    },

    async publishLesson(
      lessonId: string,
      data: { module_id: string; title: string; order_index: number; blocks: AnyBlock[] },
    ) {
      const courseId = await lessonRepo.getModuleCourseId(data.module_id);
      if (!courseId) throw new Error('Módulo não encontrado.');

      const isPublished = await lessonRepo.isCoursePublished(courseId);
      if (!isPublished) {
        throw new Error('O curso precisa estar publicado antes de publicar aulas.');
      }

      const currentVersion = await lessonRepo.getLessonVersion(lessonId);
      const nextVersion = (currentVersion ?? 0) + 1;

      await lessonRepo.upsertPublished(lessonId, {
        ...data,
        version: nextVersion,
      });
    },

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

    async getLessonBlocks(lessonId: string): Promise<AnyBlock[]> {
      const lesson = await lessonRepo.getLesson(lessonId);
      return lesson?.blocks ?? [];
    },

    async getLessonVersion(lessonId: string) {
      return lessonRepo.getLessonVersion(lessonId);
    },
  };
}
