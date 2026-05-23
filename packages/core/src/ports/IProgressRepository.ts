import { StudentProgress } from '@projeto/types';

export interface IProgressRepository {
  getProgress(userId: string, lessonId: string): Promise<StudentProgress | null>;
  upsert(userId: string, lessonId: string, data: {
    last_played_seconds?: number;
    percentage_watched?: number;
    completed?: boolean;
    completed_at?: string | null;
    tests_completed?: Record<string, number>;
    updated_at: string;
  }): Promise<StudentProgress>;
  getTestCompleted(userId: string, lessonId: string): Promise<Record<string, number>>;
  getLessonBlocks(lessonId: string): Promise<any[] | null>;
  markCompleted(userId: string, lessonId: string, completedAt: string): Promise<StudentProgress>;
}
