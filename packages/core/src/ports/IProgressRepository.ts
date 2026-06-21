import { StudentProgress } from '@projeto/types';

/**
 * @description Repository interface for student lesson progress operations.
 * Defines the contract for persisting and tracking user progress through lessons,
 * including watch time, completion status, and test scores.
 * Business rule: Progress data drives student dashboards, certificate eligibility,
 * and resumability across sessions.
 */
export interface IProgressRepository {
  /**
   * @description Retrieves the current progress record for a specific user and lesson.
   * @param userId - The UUID of the student.
   * @param lessonId - The UUID of the lesson.
   * @returns Promise resolving to the StudentProgress object or null if no progress exists.
   */
  getProgress(userId: string, lessonId: string): Promise<StudentProgress | null>;

  /**
   * @description Creates or updates a progress record for a user on a given lesson.
   * Business rule: Uses upsert semantics so a single record exists per user-lesson pair.
   * @param userId - The UUID of the student.
   * @param lessonId - The UUID of the lesson.
   * @param data - Partial progress data including last_played_seconds,
   *               percentage_watched, completed, completed_at, tests_completed,
   *               and updated_at timestamp.
   * @returns Promise resolving to the updated StudentProgress object.
   */
  upsert(userId: string, lessonId: string, data: {
    last_played_seconds?: number;
    percentage_watched?: number;
    completed?: boolean;
    completed_at?: string | null;
    tests_completed?: Record<string, number>;
    updated_at: string;
  }): Promise<StudentProgress>;

  /**
   * @description Retrieves the test completion scores for a user on a specific lesson.
   * Business rule: Used to determine if a student passed all required assessments
   * for lesson and certificate eligibility.
   * @param userId - The UUID of the student.
   * @param lessonId - The UUID of the lesson.
   * @returns Promise resolving to a record mapping test identifiers to scores.
   */
  getTestCompleted(userId: string, lessonId: string): Promise<Record<string, number>>;

  /**
   * @description Retrieves the blocks (content structure) for a given lesson.
   * Business rule: Used to calculate the total number of tests in a lesson
   * for completion verification.
   * @param lessonId - The UUID of the lesson.
   * @returns Promise resolving to the array of lesson blocks, or null if not found.
   */
  getLessonBlocks(lessonId: string): Promise<any[] | null>;

  /**
   * @description Marks a lesson as fully completed for a user with a timestamp.
   * Business rule: Triggers downstream certificate eligibility checks.
   * @param userId - The UUID of the student.
   * @param lessonId - The UUID of the lesson.
   * @param completedAt - ISO 8601 timestamp of completion.
   * @returns Promise resolving to the updated StudentProgress object.
   */
  markCompleted(userId: string, lessonId: string, completedAt: string): Promise<StudentProgress>;

  /**
   * @description Counts the number of lessons completed by a student within a course and the total
   * number of lessons in that course.
   * Business rule: Certificate eligibility requires completed === total and all test scores above threshold.
   * @param userId - The UUID of the student.
   * @param courseId - The UUID of the course.
   * @returns Object with completed and total lesson counts.
   */
  getCompletedLessonCount(userId: string, courseId: string): Promise<{ completed: number; total: number }>;

  /**
   * @description Retrieves the test scores submitted by a student for a specific lesson.
   * Business rule: Scores are stored as a JSONB record mapping block IDs to numeric scores.
   * @param userId - The UUID of the student.
   * @param lessonId - The UUID of the lesson.
   * @returns Record of block ID to score, or empty object if none.
   */
  getLessonTestScores(userId: string, lessonId: string): Promise<Record<string, number>>;

  /**
   * @description Retrieves progress records for a student across a set of lessons.
   * Returns completion status, test scores, watch percentage, and last played position.
   * @param userId - The UUID of the student.
   * @param lessonIds - Array of lesson UUIDs to fetch progress for.
   * @returns Array of progress records (lesson_id, completed, tests_completed, percentage_watched, last_played_seconds).
   */
  getProgressByLessons(userId: string, lessonIds: string[]): Promise<any[]>;

  /**
   * @description Full upsert of all progress fields including block_states, revisit_count, and last_revisited_at.
   * Used by the save-progress flow to persist the complete lesson state in a single write.
   * @param userId - The UUID of the student.
   * @param lessonId - The UUID of the lesson.
   * @param data - All progress fields to persist.
   * @returns The updated StudentProgress object.
   */
  upsertFull(userId: string, lessonId: string, data: {
    last_played_seconds?: number;
    percentage_watched?: number;
    completed?: boolean;
    completed_at?: string | null;
    tests_completed?: Record<string, number>;
    block_states?: Record<string, any>;
    revisit_count?: number;
    last_revisited_at?: string | null;
    updated_at: string;
  }): Promise<StudentProgress>;
}
