/**
 * @description Re-exports all port interface types from the Ports & Adapters layer.
 * Business rule: Consumers import ports from this barrel file rather than
 * individual files to enforce the dependency inversion boundary.
 */
export type { ICourseRepository } from './ICourseRepository';
export type { IProgressRepository } from './IProgressRepository';
export type { ICertificateRepository } from './ICertificateRepository';
export type { ILessonRepository } from './ILessonRepository';
export type { IAuthGateway } from './IAuthGateway';
export type { IStorageProvider } from './IStorageProvider';
