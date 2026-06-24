import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createLessonService } from './lesson';

function makeLessonRepo() {
  return {
    getLesson: vi.fn(),
    upsertDraft: vi.fn(),
    getModuleCourseId: vi.fn(),
    getLessonVersion: vi.fn(),
    isCoursePublished: vi.fn(),
    upsertPublished: vi.fn(),
    getCourseIdFromLesson: vi.fn(),
    getLessonTestBlocks: vi.fn(),
    getLessonsByCourse: vi.fn(),
  };
}

function makeCourseRepo() {
  return {
    getPublishedPaths: vi.fn(),
    getAllCourses: vi.fn(),
    getPublishedCourses: vi.fn(),
    getCourse: vi.fn(),
    createCourse: vi.fn(),
    updateCourse: vi.fn(),
    deleteCourse: vi.fn(),
    togglePublish: vi.fn(),
    updateCourseSettings: vi.fn(),
    getStructure: vi.fn(),
    getWithModulesAndLessons: vi.fn(),
    createModule: vi.fn(),
    updateModule: vi.fn(),
    deleteModule: vi.fn(),
    reorderModules: vi.fn(),
    createLesson: vi.fn(),
    updateLesson: vi.fn(),
    deleteLesson: vi.fn(),
    duplicateLesson: vi.fn(),
    reorderLessons: vi.fn(),
    getModuleTitle: vi.fn(),
    getCourseTitle: vi.fn(),
    getCourseCertificateEnabled: vi.fn(),
    seedDemoData: vi.fn(),
  };
}

describe('LessonService', () => {
  let lessonRepo: ReturnType<typeof makeLessonRepo>;
  let courseRepo: ReturnType<typeof makeCourseRepo>;
  let service: ReturnType<typeof createLessonService>;

  beforeEach(() => {
    lessonRepo = makeLessonRepo();
    courseRepo = makeCourseRepo();
    service = createLessonService(lessonRepo, courseRepo);
  });

  describe('getLesson', () => {
    it('should return lesson from repo', async () => {
      const expected = { id: 'l1', title: 'Lesson 1', blocks: [], module_id: 'm1', order_index: 1, is_published: false };
      lessonRepo.getLesson.mockResolvedValue(expected);
      const result = await service.getLesson('l1');
      expect(result).toEqual(expected);
    });
  });

  describe('getDraftLesson', () => {
    it('should derive draft ID and fetch from repo', async () => {
      const lessonId = 'abc12345678901234567890';
      const draftId = lessonId.substring(0, 24) + 'dddddddddddd';
      const expected = { id: draftId, title: 'Draft', blocks: [], module_id: 'm1', order_index: 1, is_published: false };
      lessonRepo.getLesson.mockResolvedValue(expected);
      const result = await service.getDraftLesson(lessonId);
      expect(lessonRepo.getLesson).toHaveBeenCalledWith(draftId);
      expect(result).toEqual(expected);
    });
  });

  describe('createDraftFromPublished', () => {
    it('should create a draft copy from published lesson', async () => {
      const published = { id: 'l1', title: 'Published', blocks: [], module_id: 'm1', order_index: 1, is_published: true };
      const draft = { id: 'l1dddddddddddd', title: 'Published', blocks: [], module_id: 'm1', order_index: 1, is_published: false };
      lessonRepo.getLesson.mockResolvedValueOnce(published);
      lessonRepo.upsertDraft.mockResolvedValue(undefined);
      lessonRepo.getLesson.mockResolvedValueOnce(draft);
      const result = await service.createDraftFromPublished('l1');
      expect(lessonRepo.upsertDraft).toHaveBeenCalledWith('l1', expect.objectContaining({ title: 'Published' }));
      expect(result).toEqual(draft);
    });

    it('should return null when published lesson not found', async () => {
      lessonRepo.getLesson.mockResolvedValue(null);
      const result = await service.createDraftFromPublished('unknown');
      expect(result).toBeNull();
    });
  });

  describe('saveDraft', () => {
    it('should delegate to repo upsertDraft', async () => {
      const data = { module_id: 'm1', title: 'Draft', order_index: 1, blocks: [] };
      await service.saveDraft('l1', data);
      expect(lessonRepo.upsertDraft).toHaveBeenCalledWith('l1', data);
    });
  });

  describe('publishLesson', () => {
    it('should publish incrementing version', async () => {
      lessonRepo.getModuleCourseId.mockResolvedValue('c1');
      lessonRepo.isCoursePublished.mockResolvedValue(true);
      lessonRepo.getLessonVersion.mockResolvedValue(2);
      const data = { module_id: 'm1', title: 'Lesson', order_index: 1, blocks: [] };
      await service.publishLesson('l1', data);
      expect(lessonRepo.upsertPublished).toHaveBeenCalledWith('l1', { ...data, version: 3 });
    });

    it('should start at version 1 when no prior version', async () => {
      lessonRepo.getModuleCourseId.mockResolvedValue('c1');
      lessonRepo.isCoursePublished.mockResolvedValue(true);
      lessonRepo.getLessonVersion.mockResolvedValue(null);
      const data = { module_id: 'm1', title: 'Lesson', order_index: 1, blocks: [] };
      await service.publishLesson('l1', data);
      expect(lessonRepo.upsertPublished).toHaveBeenCalledWith('l1', { ...data, version: 1 });
    });

    it('should throw when course not found', async () => {
      lessonRepo.getModuleCourseId.mockResolvedValue(null);
      await expect(service.publishLesson('l1', { module_id: 'm1', title: 'T', order_index: 1, blocks: [] })).rejects.toThrow('Module not found');
    });

    it('should throw when course not published', async () => {
      lessonRepo.getModuleCourseId.mockResolvedValue('c1');
      lessonRepo.isCoursePublished.mockResolvedValue(false);
      await expect(service.publishLesson('l1', { module_id: 'm1', title: 'T', order_index: 1, blocks: [] })).rejects.toThrow('Course must be published before publishing lessons');
    });
  });

  describe('getBreadcrumbMeta', () => {
    it('should return module and course titles', async () => {
      courseRepo.getModuleTitle.mockResolvedValue({ title: 'Module 1', course_id: 'c1' });
      courseRepo.getCourseTitle.mockResolvedValue('Course 1');
      const result = await service.getBreadcrumbMeta('m1');
      expect(result).toEqual({ moduleTitle: 'Module 1', courseId: 'c1', courseTitle: 'Course 1' });
    });

    it('should return null when module not found', async () => {
      courseRepo.getModuleTitle.mockResolvedValue(null);
      const result = await service.getBreadcrumbMeta('unknown');
      expect(result).toBeNull();
    });
  });

  describe('getLessonBlocks', () => {
    it('should return blocks from lesson', async () => {
      lessonRepo.getLesson.mockResolvedValue({ blocks: [{ id: 'b1', type: 'text' }] });
      const result = await service.getLessonBlocks('l1');
      expect(result).toEqual([{ id: 'b1', type: 'text' }]);
    });

    it('should return empty array when lesson not found', async () => {
      lessonRepo.getLesson.mockResolvedValue(null);
      const result = await service.getLessonBlocks('l1');
      expect(result).toEqual([]);
    });
  });

  describe('getLessonVersion', () => {
    it('should return version from repo', async () => {
      lessonRepo.getLessonVersion.mockResolvedValue(5);
      const result = await service.getLessonVersion('l1');
      expect(result).toBe(5);
    });
  });
});
