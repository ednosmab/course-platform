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
    getCourseAccess: vi.fn(),
    updateCourseAccess: vi.fn(),
    getStudentCourseAccess: vi.fn(),
    getPublishedCoursesForStudent: vi.fn(),
    detectPrerequisiteCycle: vi.fn(),
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

  describe('getCourseAccess', () => {
    it('should return null when not configured', async () => {
      const repo = makeRepo();
      repo.getCourseAccess.mockResolvedValue(null);
      const service = createCourseService(repo);
      const result = await service.getCourseAccess('course-1');
      expect(result).toBeNull();
      expect(repo.getCourseAccess).toHaveBeenCalledWith('course-1');
    });

    it('should return access mode when configured', async () => {
      const repo = makeRepo();
      const accessData = {
        course_id: 'course-1',
        access_mode: 'progressive',
        prerequisite_course_id: 'course-0',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      repo.getCourseAccess.mockResolvedValue(accessData);
      const service = createCourseService(repo);
      const result = await service.getCourseAccess('course-1');
      expect(result).toEqual(accessData);
    });
  });

  describe('updateCourseAccess', () => {
    it('should save access configuration correctly', async () => {
      const repo = makeRepo();
      repo.updateCourseAccess.mockResolvedValue(undefined);
      const service = createCourseService(repo);
      await service.updateCourseAccess('course-1', {
        access_mode: 'progressive',
        prerequisite_course_id: 'course-0',
      });
      expect(repo.updateCourseAccess).toHaveBeenCalledWith('course-1', {
        access_mode: 'progressive',
        prerequisite_course_id: 'course-0',
      });
    });
  });

  describe('detectPrerequisiteCycle', () => {
    it('should detect cycle A→B→A', async () => {
      const repo = makeRepo();
      repo.detectPrerequisiteCycle.mockResolvedValue(true);
      const service = createCourseService(repo);
      const result = await service.detectPrerequisiteCycle('course-a', 'course-b');
      expect(result).toBe(true);
      expect(repo.detectPrerequisiteCycle).toHaveBeenCalledWith('course-a', 'course-b');
    });

    it('should allow A→B (no cycle)', async () => {
      const repo = makeRepo();
      repo.detectPrerequisiteCycle.mockResolvedValue(false);
      const service = createCourseService(repo);
      const result = await service.detectPrerequisiteCycle('course-a', 'course-b');
      expect(result).toBe(false);
    });
  });
});
