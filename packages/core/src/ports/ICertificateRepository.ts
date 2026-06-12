import { Certificate } from '@projeto/types';

/**
 * @description Repository interface for certificate persistence operations.
 * Defines the contract for storing, retrieving, and verifying certificate records.
 * Business rule: Certificates are immutable records tied to a student and course.
 */
export interface ICertificateRepository {
  /**
   * @description Checks if a certificate already exists for a given student and course pair.
   * Business rule: Prevents duplicate certificate issuance for the same course.
   * @param userId - The UUID of the student.
   * @param courseId - The UUID of the course.
   * @returns Promise resolving to the existing Certificate or null if none exists.
   */
  findExistingCertificate(userId: string, courseId: string): Promise<Certificate | null>;

  /**
   * @description Creates and persists a new certificate record.
   * Business rule: Each certificate includes a unique external validation UUID for
   * verification and auditability.
   * @param userId - The UUID of the student receiving the certificate.
   * @param courseId - The UUID of the completed course.
   * @param uuidExtranet - The external unique identifier for the certificate.
   * @returns Promise resolving to the newly created Certificate object.
   */
  insertCertificate(userId: string, courseId: string, uuidExtranet: string): Promise<Certificate>;

  /**
   * @description Retrieves all certificates issued to a specific user.
   * Business rule: Used on the student profile / achievements page.
   * @param userId - The UUID of the student.
   * @returns Promise resolving to an array of the user's Certificate objects.
   */
  getUserCertificates(userId: string): Promise<Certificate[]>;

  /**
   * @description Retrieves a single certificate by its unique identifier.
   * Business rule: Used for public verification and display.
   * @param id - The UUID of the certificate.
   * @returns Promise resolving to the Certificate object, or null if not found.
   */
  getCertificate(id: string): Promise<Certificate | null>;
}
