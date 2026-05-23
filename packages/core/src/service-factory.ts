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

export const courseService = createCourseService(supabaseCourseRepository);
export const lessonService = createLessonService(supabaseLessonRepository, supabaseCourseRepository);
export const authService = createAuthService(supabaseAuthGateway);
export const storageService = createStorageService(supabaseStorageProvider);
export const certificateService = createCertificateService(supabaseCertificateRepository);
export const progressService = createProgressService(supabaseProgressRepository, certificateService);
