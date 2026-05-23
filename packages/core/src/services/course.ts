import {
  Course,
  CourseSchema,
  Module,
  ModuleSchema,
  Lesson,
  LessonSchema,
  Path,
} from '@projeto/types';
import { z } from 'zod';
import type { ICourseRepository } from '../ports/ICourseRepository';

export function createCourseService(repo: ICourseRepository) {
  return {
    async getPublishedPaths(): Promise<Path[]> {
      return repo.getPublishedPaths();
    },

    async getAllCourses(): Promise<Course[]> {
      return repo.getAllCourses();
    },

    async getPublishedCourses(): Promise<Course[]> {
      return repo.getPublishedCourses();
    },

    async getCourse(courseId: string): Promise<Course> {
      return repo.getCourse(courseId);
    },

    async createCourse(title: string, description: string): Promise<Course> {
      return repo.createCourse(title, description);
    },

    async updateCourse(
      courseId: string,
      updates: Partial<Pick<Course, 'title' | 'description' | 'thumbnail_url' | 'is_published'>>,
    ): Promise<void> {
      return repo.updateCourse(courseId, updates);
    },

    async deleteCourse(courseId: string): Promise<void> {
      return repo.deleteCourse(courseId);
    },

    async togglePublish(courseId: string, isPublished: boolean): Promise<void> {
      return repo.togglePublish(courseId, isPublished);
    },

    async updateCourseSettings(
      courseId: string,
      data: { title: string; description: string; certificate_enabled: boolean; thumbnail_url: string | null },
    ): Promise<void> {
      return repo.updateCourseSettings(courseId, data);
    },

    async getCourseStructure(courseId: string): Promise<{
      course: Course;
      modules: (Module & { lessons: Lesson[] })[];
    }> {
      return repo.getStructure(courseId);
    },

    async getCourseWithModulesAndLessons(courseId: string): Promise<{
      course: Course;
      modules: (Module & { lessons: Lesson[] })[];
    }> {
      return repo.getWithModulesAndLessons(courseId);
    },

    async createModule(courseId: string, title: string, orderIndex: number): Promise<Module> {
      return repo.createModule(courseId, title, orderIndex);
    },

    async updateModule(moduleId: string, updates: Partial<Pick<Module, 'title' | 'order_index'>>): Promise<void> {
      return repo.updateModule(moduleId, updates);
    },

    async deleteModule(moduleId: string): Promise<void> {
      return repo.deleteModule(moduleId);
    },

    async reorderModules(items: { id: string; order_index: number }[]): Promise<void> {
      return repo.reorderModules(items);
    },

    async createLesson(moduleId: string, title: string, orderIndex: number): Promise<Lesson> {
      return repo.createLesson(moduleId, title, orderIndex);
    },

    async updateLesson(lessonId: string, updates: Partial<Pick<Lesson, 'title' | 'order_index' | 'is_published' | 'blocks'>>): Promise<void> {
      return repo.updateLesson(lessonId, updates);
    },

    async deleteLesson(lessonId: string): Promise<void> {
      return repo.deleteLesson(lessonId);
    },

    async reorderLessons(items: { id: string; order_index: number }[]): Promise<void> {
      return repo.reorderLessons(items);
    },

    async getModuleTitle(moduleId: string): Promise<{ title: string; course_id: string } | null> {
      return repo.getModuleTitle(moduleId);
    },

    async getCourseTitle(courseId: string): Promise<string | null> {
      return repo.getCourseTitle(courseId);
    },

    async getStudentPublishedCourses(): Promise<Course[]> {
      return repo.getAllCourses().then(courses => courses.filter(c => c.is_published));
    },

    async seedDemoData(params: { pathId: string; courseId: string; moduleId: string; activeLessonId: string; blocks: any[] }): Promise<void> {
      return repo.seedDemoData(params);
    },
  };
}
