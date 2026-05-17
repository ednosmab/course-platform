import { z } from 'zod';
import { TextBlockSchema } from './text';
import { VideoBlockSchema } from './video';
import { QuizBlockSchema } from './quiz';
import { ImageBlockSchema } from './image';
import { HtmlBlockSchema } from './html';
import { QuoteBlockSchema } from './quote';

// 1. Profile Schema & Type
export const ProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string().nullable().optional(),
  role: z.enum(['student', 'teacher', 'admin']),
  created_at: z.string().or(z.date()),
}).strict();

export type Profile = z.infer<typeof ProfileSchema>;

// 2. Path (Trilha) Schema & Type
export const PathSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  is_published: z.boolean(),
  created_at: z.string().or(z.date()),
}).strict();

export type Path = z.infer<typeof PathSchema>;

// 3. Course Schema & Type
export const CourseSchema = z.object({
  id: z.string().uuid(),
  author_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  thumbnail_url: z.string().nullable().optional(),
  is_published: z.boolean(),
  created_at: z.string().or(z.date()),
  updated_at: z.string().or(z.date()),
}).strict();

export type Course = z.infer<typeof CourseSchema>;

// 4. PathCourse Schema & Type
export const PathCourseSchema = z.object({
  path_id: z.string().uuid(),
  course_id: z.string().uuid(),
  order_index: z.number().int().nonnegative(),
}).strict();

export type PathCourse = z.infer<typeof PathCourseSchema>;

// 5. Enrollment Schema & Type
export const EnrollmentSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  course_id: z.string().uuid().nullable().optional(),
  path_id: z.string().uuid().nullable().optional(),
  status: z.enum(['active', 'expired', 'canceled']),
  expires_at: z.string().or(z.date()).nullable().optional(),
  created_at: z.string().or(z.date()),
}).strict();

export type Enrollment = z.infer<typeof EnrollmentSchema>;

// 6. Module Schema & Type
export const ModuleSchema = z.object({
  id: z.string().uuid(),
  course_id: z.string().uuid(),
  title: z.string().min(1),
  order_index: z.number().int().nonnegative(),
  created_at: z.string().or(z.date()),
}).strict();

export type Module = z.infer<typeof ModuleSchema>;

// 7. Lesson Schema & Type
export const LessonSchema = z.object({
  id: z.string().uuid(),
  module_id: z.string().uuid(),
  title: z.string().min(1),
  order_index: z.number().int().nonnegative(),
  blocks: z.array(z.discriminatedUnion('type', [
    TextBlockSchema,
    VideoBlockSchema,
    QuizBlockSchema,
    ImageBlockSchema,
    HtmlBlockSchema,
    QuoteBlockSchema,
  ])),
  schema_version: z.number().int().positive().default(1),
  is_published: z.boolean(),
  created_at: z.string().or(z.date()),
  updated_at: z.string().or(z.date()),
}).strict();

export type Lesson = z.infer<typeof LessonSchema>;

// 8. Student Progress Schema & Type
export const StudentProgressSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  lesson_id: z.string().uuid(),
  last_played_seconds: z.number().int().nonnegative().default(0),
  percentage_watched: z.number().int().min(0).max(100).default(0),
  completed: z.boolean().default(false),
  completed_at: z.string().or(z.date()).nullable().optional(),
  updated_at: z.string().or(z.date()),
}).strict();

export type StudentProgress = z.infer<typeof StudentProgressSchema>;

// 9. Certificate Schema & Type
export const CertificateSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  course_id: z.string().uuid().nullable().optional(),
  path_id: z.string().uuid().nullable().optional(),
  uuid_bsgi: z.string().min(1),
  created_at: z.string().or(z.date()),
}).strict();

export type Certificate = z.infer<typeof CertificateSchema>;
