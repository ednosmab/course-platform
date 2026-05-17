import { supabase } from '../supabase.js';
import { Course, CourseSchema, Module, ModuleSchema, Lesson, LessonSchema, Path, PathSchema } from '@projeto/types';
import { z } from 'zod';

export const CourseService = {
  /**
   * Lista todas as trilhas publicadas do sistema.
   */
  async getPublishedPaths(): Promise<Path[]> {
    const { data, error } = await supabase
      .from('paths')
      .select('*')
      .eq('is_published', true);

    if (error) throw error;
    if (!data) return [];

    return z.array(PathSchema).parse(data);
  },

  /**
   * Lista todos os cursos publicados.
   */
  async getPublishedCourses(): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_published', true);

    if (error) throw error;
    if (!data) return [];

    return z.array(CourseSchema).parse(data);
  },

  /**
   * Obtém a árvore de módulos e aulas estruturadas de um curso específico.
   */
  async getCourseStructure(courseId: string): Promise<{
    course: Course;
    modules: (Module & { lessons: Lesson[] })[];
  }> {
    // 1. Buscar dados primários do curso
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseError) throw courseError;
    const course = CourseSchema.parse(courseData);

    // 2. Buscar módulos ordenados
    const { data: modulesData, error: modulesError } = await supabase
      .from('modules')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    if (modulesError) throw modulesError;
    const modulesParsed = z.array(ModuleSchema).parse(modulesData);

    // 3. Buscar aulas ordenadas de cada módulo e injetar recursivamente
    const modulesWithLessons = await Promise.all(
      modulesParsed.map(async (mod) => {
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .eq('module_id', mod.id)
          .eq('is_published', true)
          .order('order_index', { ascending: true });

        if (lessonsError) throw lessonsError;

        // Parse individual de cada aula com safeParse para resiliência de CMS blocks
        const lessons = (lessonsData || []).map((les: any) => {
          const parsed = LessonSchema.safeParse(les);
          if (!parsed.success) {
            console.error(`Erro de contrato na aula ${les.id}:`, parsed.error);
            return les as unknown as Lesson;
          }
          return parsed.data;
        });

        return {
          ...mod,
          lessons,
        };
      })
    );

    return {
      course,
      modules: modulesWithLessons,
    };
  }
};
