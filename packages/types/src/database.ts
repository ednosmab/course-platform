import { z } from 'zod';
import { TextBlockSchema } from './text';
import { VideoBlockSchema } from './video';
import { QuizBlockSchema } from './quiz';
import { ImageBlockSchema } from './image';
import { HtmlBlockSchema } from './html';
import { QuoteBlockSchema } from './quote';
import { HeadingBlockSchema } from './heading';
import { DividerBlockSchema } from './divider';
import { CertificateBlockSchema } from './certificate-block';

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
  order_index: z.number().int().nonnegative().default(0),
  student_order_index: z.number().int().nonnegative().default(0),
  certificate_blocks: z.array(CertificateBlockSchema).catch([]).nullable().optional(),
  certificate_enabled: z.boolean().optional().default(false),
  created_at: z.string().or(z.date()),
  updated_at: z.string().or(z.date()),
}).passthrough();

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
    HeadingBlockSchema,
    DividerBlockSchema,
  ])),
  version: z.number().int().positive().default(1),
  schema_version: z.number().int().positive().optional(),
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
  tests_completed: z.record(z.string(), z.number()).optional().default({}),
}).strict();

export type StudentProgress = z.infer<typeof StudentProgressSchema>;

// 9. Certificate Schema & Type
export const CertificateSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  course_id: z.string().uuid().nullable().optional(),
  path_id: z.string().uuid().nullable().optional(),
  uuid_extranet: z.string().min(1),
  created_at: z.string().or(z.date()),
}).strict();

export type Certificate = z.infer<typeof CertificateSchema>;

// 10. CourseAccess Schema & Type
export const CourseAccessSchema = z.object({
  course_id: z.string().uuid(),
  access_mode: z.enum(['free', 'progressive', 'restricted']),
  prerequisite_course_id: z.string().uuid().nullable().optional(),
  created_at: z.string().or(z.date()),
  updated_at: z.string().or(z.date()),
}).strict();

export type CourseAccess = z.infer<typeof CourseAccessSchema>;

// 11. Plan Schema & Type
export const PlanSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  is_active: z.boolean(),
  created_at: z.string().or(z.date()),
  updated_at: z.string().or(z.date()),
}).strict();

export type Plan = z.infer<typeof PlanSchema>;

// 12. PlanCourse Schema & Type
export const PlanCourseSchema = z.object({
  plan_id: z.string().uuid(),
  course_id: z.string().uuid(),
  order_index: z.number().int().nonnegative(),
}).strict();

export type PlanCourse = z.infer<typeof PlanCourseSchema>;

// 13. StudentPlan Schema & Type
export const StudentPlanSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  plan_id: z.string().uuid(),
  assigned_at: z.string().or(z.date()),
}).strict();

export type StudentPlan = z.infer<typeof StudentPlanSchema>;

// 14. MediaFile Schema & Type
export const MediaFileSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  type: z.enum(['image', 'video', 'document']),
  mime_type: z.string().min(1),
  size_bytes: z.number().int().positive(),
  url: z.string().url(),
  bucket: z.string().default('media'),
  path: z.string().min(1),
  uploader_id: z.string().uuid().nullable().optional(),
  course_id: z.string().uuid().nullable().optional(),
  created_at: z.string().or(z.date()),
}).strict();

export type MediaFile = z.infer<typeof MediaFileSchema>;

// 15. Report Schemas & Types
export const CourseReportSchema = z.object({
  course_id: z.string().uuid(),
  course_title: z.string(),
  enrollment_count: z.number().int().nonnegative(),
  completion_count: z.number().int().nonnegative(),
  completion_rate: z.number().min(0).max(100),
  avg_progress: z.number().min(0).max(100),
}).strict();

export type CourseReport = z.infer<typeof CourseReportSchema>;

export const EnrollmentReportSchema = z.object({
  total: z.number().int().nonnegative(),
  total_students: z.number().int().nonnegative(),
  active: z.number().int().nonnegative(),
  expired: z.number().int().nonnegative(),
  canceled: z.number().int().nonnegative(),
  new_in_period: z.number().int().nonnegative(),
  by_course: z.array(z.object({
    course_id: z.string().uuid(),
    course_title: z.string(),
    count: z.number().int().nonnegative(),
  })),
}).strict();

export type EnrollmentReport = z.infer<typeof EnrollmentReportSchema>;

export const CertificateReportSchema = z.object({
  total: z.number().int().nonnegative(),
  by_course: z.array(z.object({
    course_id: z.string().uuid(),
    course_title: z.string(),
    count: z.number().int().nonnegative(),
  })),
  timeline: z.array(z.object({
    date: z.string(),
    count: z.number().int().nonnegative(),
  })),
}).strict();

export type CertificateReport = z.infer<typeof CertificateReportSchema>;

export const ProgressReportSchema = z.object({
  total_students: z.number().int().nonnegative(),
  avg_progress: z.number().min(0).max(100),
  completion_rate: z.number().min(0).max(100),
  top_lessons: z.array(z.object({
    lesson_id: z.string().uuid(),
    lesson_title: z.string(),
    view_count: z.number().int().nonnegative(),
  })),
}).strict();

export type ProgressReport = z.infer<typeof ProgressReportSchema>;
