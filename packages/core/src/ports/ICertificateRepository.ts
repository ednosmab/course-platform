import { Certificate } from '@projeto/types';

export interface ICertificateRepository {
  getCourseIdFromLesson(lessonId: string): Promise<string | null>;
  getCompletedLessonCount(userId: string, courseId: string): Promise<{ completed: number; total: number }>;
  getLessonTestBlocks(lessonId: string): Promise<any[]>;
  getLessonTestScores(userId: string, lessonId: string): Promise<Record<string, number>>;
  getLessonsByCourse(courseId: string): Promise<string[]>;
  getProgressByLessons(userId: string, lessonIds: string[]): Promise<any[]>;
  getCourseCertificateEnabled(courseId: string): Promise<boolean>;
  findExistingCertificate(userId: string, courseId: string): Promise<Certificate | null>;
  insertCertificate(userId: string, courseId: string, uuidBsgi: string): Promise<Certificate>;
  getUserCertificates(userId: string): Promise<Certificate[]>;
  getCertificate(id: string): Promise<Certificate | null>;
}
