import { Lesson, AnyBlock } from '@projeto/types';

export interface ILessonRepository {
  getLesson(lessonId: string): Promise<Lesson | null>;
  upsertDraft(lessonId: string, data: {
    module_id: string;
    title: string;
    order_index: number;
    blocks: AnyBlock[];
  }): Promise<void>;
  upsertPublished(lessonId: string, data: {
    module_id: string;
    title: string;
    order_index: number;
    blocks: AnyBlock[];
    version: number;
  }): Promise<void>;
  getLessonVersion(lessonId: string): Promise<number | null>;
  getModuleCourseId(moduleId: string): Promise<string | null>;
  isCoursePublished(courseId: string): Promise<boolean>;
}
