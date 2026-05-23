import { supabaseCourseRepository } from './adapters/supabase-course-repository';
import { supabaseProgressRepository } from './adapters/supabase-progress-repository';
import { supabaseCertificateRepository } from './adapters/supabase-certificate-repository';
import { supabaseLessonRepository } from './adapters/supabase-lesson-repository';
import { supabaseAuthGateway } from './adapters/supabase-auth-gateway';
import { supabaseStorageProvider } from './adapters/supabase-storage-provider';

import { createCourseService } from './services/course';
import { createLessonService } from './services/lesson';
import { createAuthService } from './services/auth';
import { createStorageService } from './services/storage';
import { createCertificateService } from './services/certificate';
import { createProgressService } from './services/progress';

/**
 * @description Singleton CourseService wired to the Supabase course repository. Provides methods for creating, reading, updating, deleting, and listing courses.
 */
export const courseService = createCourseService(supabaseCourseRepository);

/**
 * @description Singleton LessonService wired to the Supabase lesson and course repositories. Provides methods for managing lesson content, ordering, and retrieval within a course.
 */
export const lessonService = createLessonService(supabaseLessonRepository, supabaseCourseRepository);

/**
 * @description Singleton AuthService wired to the Supabase auth gateway. Provides methods for user registration, login, logout, session refresh, and password management.
 */
export const authService = createAuthService(supabaseAuthGateway);

/**
 * @description Singleton StorageService wired to the Supabase storage provider. Provides methods for uploading, downloading, and deleting media assets (images, videos, documents).
 */
export const storageService = createStorageService(supabaseStorageProvider);

/**
 * @description Singleton CertificateService wired to Supabase repositories. Provides methods for generating, validating, and listing student course certificates.
 */
export const certificateService = createCertificateService(
  supabaseCertificateRepository,
  supabaseCourseRepository,
  supabaseLessonRepository,
  supabaseProgressRepository,
);

/**
 * @description Singleton ProgressService wired to the Supabase progress and certificate repositories. Tracks lesson completion, calculates module and course progress percentages, and triggers certificate issuance on completion.
 */
export const progressService = createProgressService(supabaseProgressRepository, certificateService);
