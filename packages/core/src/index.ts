/**
 * @description Provides the lazily-initialised Supabase client singleton used across all core services.
 * Shared between login, storage, and data services so they use the same auth session.
 */
export { getSupabaseClient, setSupabaseClient, getSupabaseAdmin } from './supabase';

/**
 * @description In-memory rate limiter using sliding window algorithm.
 * Use checkRateLimit() to verify request limits,
 * withRateLimit() to create rate-limited middleware,
 * and RATE_LIMIT_CONFIGS for pre-defined configurations.
 */
export {
  checkRateLimit,
  withRateLimit,
  cleanupRateLimitStore,
  RATE_LIMIT_CONFIGS,
} from './infrastructure/rate-limiter';

/**
 * @description Provides the singleton CourseService instance bound to the Supabase course repository — manages course CRUD, listing, and retrieval.
 */
export { courseService as CourseService } from './service-factory';

/**
 * @description Provides the singleton AuthService instance bound to the Supabase auth gateway — handles sign-up, sign-in, session management, and password recovery.
 */
export { authService as AuthService } from './service-factory';

/**
 * @description Provides the singleton ProgressService instance bound to the Supabase progress & certificate repositories — tracks lesson completion, module progress, and student advancement.
 */
export { progressService as ProgressService } from './service-factory';

/**
 * @description Provides the singleton CertificateService instance bound to the Supabase certificate repository — issues, validates, and retrieves course completion certificates.
 */
export { certificateService as CertificateService } from './service-factory';

/**
 * @description Provides the singleton LessonService instance bound to the Supabase lesson and course repositories — manages lesson content, ordering, and retrieval within courses.
 */
export { lessonService as LessonService } from './service-factory';

/**
 * @description Provides the singleton StorageService instance bound to the Supabase storage provider — handles file uploads, downloads, and media asset management.
 */
export { storageService as StorageService } from './service-factory';

/**
 * @description Re-exports all i18n symbols — internationalisation utilities, translation keys, and locale helpers used across the platform.
 */
export * from './i18n';

/**
 * @description Re-exports all renderer symbols — block-to-HTML conversion, layout calculation utilities, and responsive breakpoint constants for the visual canvas.
 */
export * from './renderer';
