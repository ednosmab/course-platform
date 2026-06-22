import { supabase } from '../supabase';
import type {
  CourseReport,
  EnrollmentReport,
  CertificateReport,
  ProgressReport,
  LessonRevisitReport} from '@projeto/types';
import {
  CourseReportSchema,
  EnrollmentReportSchema,
  CertificateReportSchema,
  ProgressReportSchema,
  LessonRevisitReportSchema,
} from '@projeto/types';
import { z } from 'zod';
import type { IReportRepository } from '../ports/IReportRepository';

/**
 * @description Supabase adapter implementing IReportRepository.
 * Provides reporting and analytics operations using aggregate queries.
 * Business rule: All queries are admin-only and use SQL aggregates for performance.
 */
export const supabaseReportRepository: IReportRepository = {
  async getCourseReports(): Promise<CourseReport[]> {
    // 1. Fetch published courses
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title')
      .eq('is_published', true)
      .order('title');
    if (coursesError) throw coursesError;

    if (!courses || courses.length === 0) return [];

    // 2. Fetch all modules with their course_id
    const { data: modules } = await supabase
      .from('modules')
      .select('id, course_id');

    // 3. Fetch all lessons with their module_id
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id, module_id');

    // Build lookup: courseId -> lessonIds
    const moduleMap = new Map<string, string>();
    (modules ?? []).forEach((m: any) => moduleMap.set(m.id, m.course_id));

    const courseLessonsMap = new Map<string, string[]>();
    (lessons ?? []).forEach((l: any) => {
      const courseId = moduleMap.get(l.module_id);
      if (courseId) {
        const arr = courseLessonsMap.get(courseId) ?? [];
        arr.push(l.id);
        courseLessonsMap.set(courseId, arr);
      }
    });

    // 3. For each course, fetch enrollment count and progress
    const reports = await Promise.all(
      courses.map(async (course) => {
        const { count: enrollmentCount } = await supabase
          .from('enrollments')
          .select('id', { count: 'exact', head: true })
          .eq('course_id', course.id);

        const lessonIds = courseLessonsMap.get(course.id) ?? [];

        let entries: any[] = [];
        if (lessonIds.length > 0) {
          const { data: progressData } = await supabase
            .from('student_progress')
            .select('percentage_watched, completed')
            .in('lesson_id', lessonIds);
          entries = progressData ?? [];
        }

        const completionCount = entries.filter((p: any) => p.completed).length;
        const avgProgress = entries.length > 0
          ? Math.round(entries.reduce((sum: number, p: any) => sum + (p.percentage_watched ?? 0), 0) / entries.length)
          : 0;

        return CourseReportSchema.parse({
          course_id: course.id,
          course_title: course.title,
          enrollment_count: enrollmentCount ?? 0,
          completion_count: completionCount,
          completion_rate: (enrollmentCount ?? 0) > 0 ? Math.round((completionCount / (enrollmentCount ?? 1)) * 100) : 0,
          avg_progress: avgProgress,
        });
      }),
    );

    return reports;
  },

  async getEnrollmentReports(period: string): Promise<EnrollmentReport> {
    const now = new Date();
    const daysMap: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 };
    const days = period !== 'all' ? (daysMap[period] ?? 30) : 0;
    const startDate = days > 0 ? new Date(now.getTime() - days * 24 * 60 * 60 * 1000) : null;

    // Query 1: total, active, expired, canceled (period-filtered)
    let queryBuilder = supabase.from('enrollments').select('*');
    if (startDate) {
      queryBuilder = queryBuilder.gte('created_at', startDate.toISOString());
    }
    const { data: enrollments, error } = await queryBuilder;
    if (error) throw error;

    const allEnrollments = enrollments ?? [];
    const active = allEnrollments.filter((e: any) => e.status === 'active').length;
    const expired = allEnrollments.filter((e: any) => e.status === 'expired').length;
    const canceled = allEnrollments.filter((e: any) => e.status === 'canceled').length;

    // Query 2: new_in_period (same period filter)
    let newQuery = supabase.from('enrollments').select('id', { count: 'exact', head: true });
    if (startDate) {
      newQuery = newQuery.gte('created_at', startDate.toISOString());
    }
    const { count: newInPeriod } = await newQuery;

    // Query 3: by_course (same period filter)
    let courseQuery = supabase
      .from('enrollments')
      .select(`
        course_id,
        courses (title)
      `)
      .not('course_id', 'is', null);
    if (startDate) {
      courseQuery = courseQuery.gte('created_at', startDate.toISOString());
    }
    const { data: courseEnrollments } = await courseQuery;

    const byCourseMap = new Map<string, { course_id: string; course_title: string; count: number }>();
    (courseEnrollments ?? []).forEach((e: any) => {
      const key = e.course_id;
      const existing = byCourseMap.get(key);
      if (existing) {
        existing.count++;
      } else {
        byCourseMap.set(key, {
          course_id: e.course_id,
          course_title: e.courses?.title ?? 'Unknown',
          count: 1,
        });
      }
    });

    // Query 4: total students (profiles with role='student')
    const { count: totalStudents } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'student');

    return EnrollmentReportSchema.parse({
      total: allEnrollments.length,
      total_students: totalStudents ?? 0,
      active,
      expired,
      canceled,
      new_in_period: newInPeriod ?? 0,
      by_course: Array.from(byCourseMap.values()),
    });
  },

  async getCertificateReports(): Promise<CertificateReport> {
    const { data: certificates, error } = await supabase
      .from('certificates')
      .select(`
        id,
        created_at,
        course_id,
        courses (title)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;

    const certs = certificates ?? [];

    // Group by course (skip certs with no course_id)
    const byCourseMap = new Map<string, { course_id: string; course_title: string; count: number }>();
    certs.forEach((c: any) => {
      if (!c.course_id) return;
      const key = c.course_id;
      const existing = byCourseMap.get(key);
      if (existing) {
        existing.count++;
      } else {
        byCourseMap.set(key, {
          course_id: c.course_id,
          course_title: c.courses?.title ?? 'Unknown',
          count: 1,
        });
      }
    });

    // Build timeline (last 30 days)
    const timelineMap = new Map<string, number>();
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      timelineMap.set(dateStr, 0);
    }

    certs.forEach((c: any) => {
      const dateStr = c.created_at?.split('T')[0];
      if (dateStr && timelineMap.has(dateStr)) {
        timelineMap.set(dateStr, (timelineMap.get(dateStr) ?? 0) + 1);
      }
    });

    return CertificateReportSchema.parse({
      total: certs.length,
      by_course: Array.from(byCourseMap.values()),
      timeline: Array.from(timelineMap.entries()).map(([date, count]) => ({ date, count })),
    });
  },

  async getProgressReport(): Promise<ProgressReport> {
    // Total students
    const { count: totalStudents } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'student');

    // Average progress
    const { data: progressData } = await supabase
      .from('student_progress')
      .select('percentage_watched, completed');

    const progressEntries = progressData ?? [];
    const avgProgress = progressEntries.length > 0
      ? Math.round(progressEntries.reduce((sum: number, p: any) => sum + (p.percentage_watched ?? 0), 0) / progressEntries.length)
      : 0;
    const completionRate = progressEntries.length > 0
      ? Math.round((progressEntries.filter((p: any) => p.completed).length / progressEntries.length) * 100)
      : 0;

    // Top lessons by view count
    const { data: lessonViews } = await supabase
      .from('student_progress')
      .select(`
        lesson_id,
        lessons (title)
      `);

    const lessonViewMap = new Map<string, { lesson_id: string; lesson_title: string; view_count: number }>();
    (lessonViews ?? []).forEach((v: any) => {
      const key = v.lesson_id;
      const existing = lessonViewMap.get(key);
      if (existing) {
        existing.view_count++;
      } else {
        lessonViewMap.set(key, {
          lesson_id: v.lesson_id,
          lesson_title: v.lessons?.title ?? 'Unknown',
          view_count: 1,
        });
      }
    });

    const topLessons = Array.from(lessonViewMap.values())
      .sort((a, b) => b.view_count - a.view_count)
      .slice(0, 10);

    return ProgressReportSchema.parse({
      total_students: totalStudents ?? 0,
      avg_progress: avgProgress,
      completion_rate: completionRate,
      top_lessons: topLessons,
    });
  },

  async getTopCourses(limit = 10): Promise<CourseReport[]> {
    const reports = await this.getCourseReports();
    return reports
      .sort((a, b) => b.enrollment_count - a.enrollment_count)
      .slice(0, limit);
  },

  async getLessonRevisitReport(period?: string): Promise<LessonRevisitReport> {
    const now = new Date();
    const daysMap: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 };
    const days = period && period !== 'all' ? (daysMap[period] ?? 30) : 0;
    const startDate = days > 0 ? new Date(now.getTime() - days * 24 * 60 * 60 * 1000) : null;

    // Query 1: Fetch all revisit events with joins
    let eventsQuery = supabase
      .from('lesson_revisit_events')
      .select(`
        id,
        user_id,
        lesson_id,
        course_id,
        student_level,
        completed_before,
        revisit_number,
        created_at,
        lessons (title),
        courses (title),
        profiles (full_name)
      `);

    if (startDate) {
      eventsQuery = eventsQuery.gte('created_at', startDate.toISOString());
    }

    const { data: events, error } = await eventsQuery;
    if (error) throw error;

    const allEvents = events ?? [];

    // Aggregate: top revisited lessons
    const lessonMap = new Map<string, { lesson_id: string; lesson_title: string; course_title: string; revisit_count: number }>();
    allEvents.forEach((e: any) => {
      const key = e.lesson_id;
      const existing = lessonMap.get(key);
      if (existing) {
        existing.revisit_count++;
      } else {
        lessonMap.set(key, {
          lesson_id: e.lesson_id,
          lesson_title: e.lessons?.title ?? 'Unknown',
          course_title: e.courses?.title ?? 'Unknown',
          revisit_count: 1,
        });
      }
    });
    const topRevisitedLessons = Array.from(lessonMap.values())
      .sort((a, b) => b.revisit_count - a.revisit_count)
      .slice(0, 10);

    // Aggregate: top revisiting students
    const studentMap = new Map<string, { user_id: string; student_name: string; total_revisits: number; lessons_revisited: Set<string> }>();
    allEvents.forEach((e: any) => {
      const key = e.user_id;
      const existing = studentMap.get(key);
      if (existing) {
        existing.total_revisits++;
        existing.lessons_revisited.add(e.lesson_id);
      } else {
        studentMap.set(key, {
          user_id: e.user_id,
          student_name: e.profiles?.full_name ?? 'Unknown',
          total_revisits: 1,
          lessons_revisited: new Set([e.lesson_id]),
        });
      }
    });
    const topRevisitingStudents = Array.from(studentMap.values())
      .map(s => ({
        user_id: s.user_id,
        student_name: s.student_name,
        total_revisits: s.total_revisits,
        lessons_revisited: s.lessons_revisited.size,
      }))
      .sort((a, b) => b.total_revisits - a.total_revisits)
      .slice(0, 10);

    // Aggregate: timeline (last 30 days)
    const timelineMap = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split('T')[0];
      timelineMap.set(key, 0);
    }
    allEvents.forEach((e: any) => {
      const dateKey = e.created_at.split('T')[0];
      if (timelineMap.has(dateKey)) {
        timelineMap.set(dateKey, (timelineMap.get(dateKey) ?? 0) + 1);
      }
    });
    const timeline = Array.from(timelineMap.entries()).map(([date, count]) => ({ date, count }));

    // Aggregate: by course
    const courseMap = new Map<string, { course_id: string; course_title: string; revisit_count: number }>();
    allEvents.forEach((e: any) => {
      const key = e.course_id;
      const existing = courseMap.get(key);
      if (existing) {
        existing.revisit_count++;
      } else {
        courseMap.set(key, {
          course_id: e.course_id,
          course_title: e.courses?.title ?? 'Unknown',
          revisit_count: 1,
        });
      }
    });
    const byCourse = Array.from(courseMap.values())
      .sort((a, b) => b.revisit_count - a.revisit_count);

    return LessonRevisitReportSchema.parse({
      top_revisited_lessons: topRevisitedLessons,
      top_revisiting_students: topRevisitingStudents,
      timeline,
      by_course: byCourse,
      total_revisits: allEvents.length,
      unique_students_revisiting: studentMap.size,
    });
  },
};
