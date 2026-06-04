import { supabase } from '../supabase';
import { Certificate, CertificateSchema } from '@projeto/types';
import { z } from 'zod';
import type { ICertificateRepository } from '../ports/ICertificateRepository';

/**
 * @description Supabase-backed implementation of the CertificateRepository port.
 * Handles certificate persistence, retrieval, and duplicate prevention.
 * Operates exclusively on the `certificates` table.
 * @implements {ICertificateRepository}
 */
export const supabaseCertificateRepository: ICertificateRepository = {
  /**
   * @description Checks if a certificate already exists for a given student and course pair.
   * Business rule: Prevents duplicate certificate issuance for the same course.
   * @param {string} userId - The UUID of the student.
   * @param {string} courseId - The UUID of the course.
   * @returns {Promise<Certificate | null>} The existing certificate ID record, or null if none.
   */
  async findExistingCertificate(userId: string, courseId: string): Promise<Certificate | null> {
    const { data: existing } = await supabase.from('certificates').select('id').eq('user_id', userId).eq('course_id', courseId).maybeSingle();
    return existing as Certificate | null;
  },

  /**
   * @description Issues a new certificate for a student by inserting a record with the BSGI UUID.
   * Business rule: The BSGI UUID is provided by the external certification authority (BSGI).
   * Each certificate must have a unique BSGI identifier for verification.
   * @param {string} userId - The UUID of the student.
   * @param {string} courseId - The UUID of the course.
   * @param {string} uuidBsgi - The BSGI unique identifier for the certificate.
   * @returns {Promise<Certificate>} The newly created certificate validated against CertificateSchema.
   * @throws {Error} If the database insert fails; error is logged before re-throw.
   */
  async insertCertificate(userId: string, courseId: string, uuidBsgi: string): Promise<Certificate> {
    const { data, error } = await (supabase.from('certificates') as any).insert({ user_id: userId, course_id: courseId, uuid_bsgi: uuidBsgi }).select('*').single();
    if (error) { console.error('Error issuing certificate:', error); throw error; }
    return CertificateSchema.parse(data);
  },

  /**
   * @description Retrieves all certificates issued to a student, ordered by creation date descending.
   * Business rule: Certificates are immutable records; this provides the student's certificate history.
   * @param {string} userId - The UUID of the student.
   * @returns {Promise<Certificate[]>} Array of certificates (validated via safeParse), or empty array on error.
   */
  async getUserCertificates(userId: string): Promise<Certificate[]> {
    const { data, error } = await supabase.from('certificates').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error || !data) return [];
    const parsed = z.array(CertificateSchema).safeParse(data);
    if (!parsed.success) { console.error('Error parsing certificates:', parsed.error); return data as Certificate[]; }
    return parsed.data;
  },

  /**
   * @description Retrieves a single certificate by its database ID.
   * Used for certificate verification and display.
   * @param {string} id - The UUID of the certificate record.
   * @returns {Promise<Certificate | null>} The certificate validated against CertificateSchema, or null if not found.
   */
  async getCertificate(id: string): Promise<Certificate | null> {
    const { data, error } = await supabase.from('certificates').select('*').eq('id', id).single();
    if (error || !data) return null;
    return CertificateSchema.parse(data);
  },
};
