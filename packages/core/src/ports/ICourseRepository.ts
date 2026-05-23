import {
  Course,
  Module,
  Lesson,
  Path,
} from '@projeto/types';

export interface ICourseRepository {
  getPublishedPaths(): Promise<Path[]>;
  getAllCourses(): Promise<Course[]>;
  getPublishedCourses(): Promise<Course[]>;
  getCourse(courseId: string): Promise<Course>;
  createCourse(title: string, description: string): Promise<Course>;
  updateCourse(courseId: string, updates: Partial<Pick<Course, 'title' | 'description' | 'thumbnail_url' | 'is_published'>>): Promise<void>;
  deleteCourse(courseId: string): Promise<void>;
  togglePublish(courseId: string, isPublished: boolean): Promise<void>;
  updateCourseSettings(courseId: string, data: { title: string; description: string; certificate_enabled: boolean; thumbnail_url: string | null }): Promise<void>;
  getStructure(courseId: string): Promise<{ course: Course; modules: (Module & { lessons: Lesson[] })[] }>;
  getWithModulesAndLessons(courseId: string): Promise<{ course: Course; modules: (Module & { lessons: Lesson[] })[] }>;
  createModule(courseId: string, title: string, orderIndex: number): Promise<Module>;
  updateModule(moduleId: string, updates: Partial<Pick<Module, 'title' | 'order_index'>>): Promise<void>;
  deleteModule(moduleId: string): Promise<void>;
  reorderModules(items: { id: string; order_index: number }[]): Promise<void>;
  createLesson(moduleId: string, title: string, orderIndex: number): Promise<Lesson>;
  updateLesson(lessonId: string, updates: Partial<Pick<Lesson, 'title' | 'order_index' | 'is_published' | 'blocks'>>): Promise<void>;
  deleteLesson(lessonId: string): Promise<void>;
  reorderLessons(items: { id: string; order_index: number }[]): Promise<void>;
  getModuleTitle(moduleId: string): Promise<{ title: string; course_id: string } | null>;
  getCourseTitle(courseId: string): Promise<string | null>;
  seedDemoData(params: { pathId: string; courseId: string; moduleId: string; activeLessonId: string; blocks: any[] }): Promise<void>;
}
