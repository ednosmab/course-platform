import { supabase } from '../supabase';
import type {
  Profile,
  Enrollment} from '@projeto/types';
import {
  ProfileSchema,
  EnrollmentSchema,
  StudentProgress,
  StudentProgressSchema,
} from '@projeto/types';
import { z } from 'zod';
import type { IStudentRepository } from '../ports/IStudentRepository';

/**
 * @description Supabase adapter implementing IStudentRepository.
 * Provides student management operations including CRUD, enrollment, and progress tracking.
 * Business rule: All queries respect RLS policies (admin full access).
 */
export const supabaseStudentRepository: IStudentRepository = {
  async listStudents(query?) {
    let queryBuilder = supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .order('created_at', { ascending: false });

    if (query?.search) {
      const searchTerm = `%${query.search}%`;
      queryBuilder = queryBuilder.or(`full_name.ilike.${searchTerm},email.ilike.${searchTerm}`);
    }

    const { data: profiles, error } = await queryBuilder;
    if (error) throw error;

    const students = z.array(ProfileSchema).parse(profiles ?? []);

    // Get enrollment counts for each student
    const studentsWithCounts = await Promise.all(
      students.map(async (student) => {
        let enrollmentQuery = supabase
          .from('enrollments')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', student.id);

        if (query?.status) {
          enrollmentQuery = enrollmentQuery.eq('status', query.status);
        }

        if (query?.courseId) {
          enrollmentQuery = enrollmentQuery.eq('course_id', query.courseId);
        }

        if (query?.planId) {
          enrollmentQuery = enrollmentQuery.eq('path_id', query.planId);
        }

        const { count } = await enrollmentQuery;
        return { ...student, enrollment_count: count ?? 0 };
      }),
    );

    return studentsWithCounts;
  },

  async getStudentById(studentId: string): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', studentId)
      .single();
    if (error) throw error;
    return ProfileSchema.parse(data);
  },

  async createStudent(data) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({
        email: data.email,
        full_name: data.full_name,
        role: data.role ?? 'student',
      })
      .select()
      .single();
    if (error) throw error;
    return ProfileSchema.parse(profile);
  },

  async updateStudent(studentId: string, data) {
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', studentId);
    if (error) throw error;
  },

  async deleteStudent(studentId: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', studentId);
    if (error) throw error;
  },

  async getEnrollmentsByStudent(studentId: string): Promise<Enrollment[]> {
    const { data, error } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', studentId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return z.array(EnrollmentSchema).parse(data ?? []);
  },

  async assignToPlan(studentId: string, planId: string): Promise<void> {
    const { error } = await supabase
      .from('enrollments')
      .insert({
        user_id: studentId,
        path_id: planId,
        status: 'active',
      });
    if (error) throw error;
  },

  async assignToCourse(studentId: string, courseId: string, expiresAt?: string): Promise<void> {
    const { error } = await supabase
      .from('enrollments')
      .insert({
        user_id: studentId,
        course_id: courseId,
        status: 'active',
        expires_at: expiresAt ?? null,
      });
    if (error) throw error;
  },

  async removeEnrollment(enrollmentId: string): Promise<void> {
    const { error } = await supabase
      .from('enrollments')
      .delete()
      .eq('id', enrollmentId);
    if (error) throw error;
  },

  async updateEnrollmentStatus(enrollmentId: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('enrollments')
      .update({ status })
      .eq('id', enrollmentId);
    if (error) throw error;
  },

  async getStudentProgress(studentId: string) {
    const { data, error } = await supabase
      .from('student_progress')
      .select(`
        *,
        lessons!inner (
          title,
          modules!inner (
            title,
            courses!inner (
              title
            )
          )
        )
      `)
      .eq('user_id', studentId)
      .order('updated_at', { ascending: false });
    if (error) throw error;

    return (data ?? []).map((item: any) => ({
      ...StudentProgressSchema.parse(item),
      course_title: item.lessons.modules.courses.title,
      lesson_title: item.lessons.title,
    }));
  },
};
