import { describe, it, expect, vi } from 'vitest';
import { createCourseService } from './course';

function makeRepo() {
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
    reorderLessons: vi.fn(),
    getModuleTitle: vi.fn(),
    getCourseTitle: vi.fn(),
    getCourseCertificateEnabled: vi.fn(),
    seedDemoData: vi.fn(),
  };
}

describe('CourseService', () => {
  describe('getAllCourses', () => {
    it('should return all courses from repo', async () => {
      const repo = makeRepo();
      const expected = [
        { id: '1', title: 'Curso A', description: 'Desc', is_published: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ];
      repo.getAllCourses.mockResolvedValue(expected);
      const service = createCourseService(repo);
      const result = await service.getAllCourses();
      expect(result).toEqual(expected);
      expect(repo.getAllCourses).toHaveBeenCalledOnce();
    });
  });

  describe('createCourse', () => {
    it('should delegate to repo and return created course', async () => {
      const repo = makeRepo();
      const created = {
        id: 'new-1', title: 'Novo Curso', description: 'Desc', is_published: false,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      };
      repo.createCourse.mockResolvedValue(created);
      const service = createCourseService(repo);
      const result = await service.createCourse('Novo Curso', 'Desc');
      expect(result).toEqual(created);
      expect(repo.createCourse).toHaveBeenCalledWith('Novo Curso', 'Desc');
    });
  });

  describe('deleteCourse', () => {
    it('should delegate to repo', async () => {
      const repo = makeRepo();
      repo.deleteCourse.mockResolvedValue(undefined);
      const service = createCourseService(repo);
      await service.deleteCourse('course-1');
      expect(repo.deleteCourse).toHaveBeenCalledWith('course-1');
    });
  });

  describe('togglePublish', () => {
    it('should call repo toggle with correct values', async () => {
      const repo = makeRepo();
      const service = createCourseService(repo);
      await service.togglePublish('c1', true);
      expect(repo.togglePublish).toHaveBeenCalledWith('c1', true);
    });
  });

  describe('getStudentPublishedCourses', () => {
    it('should filter only published courses', async () => {
      const repo = makeRepo();
      repo.getAllCourses.mockResolvedValue([
        { id: '1', is_published: true } as any,
        { id: '2', is_published: false } as any,
      ]);
      const service = createCourseService(repo);
      const result = await service.getStudentPublishedCourses();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
  });
});
