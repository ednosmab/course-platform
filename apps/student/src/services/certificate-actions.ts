import { openURL } from 'expo-linking';
import { Share } from 'react-native';

/**
 * @description Opens the certificate PDF in the device's default handler.
 *
 * Business rule: the PDF endpoint location is configured via `EXPO_PUBLIC_PDF_BASE_URL`
 * (see `.env.example`). When unset, the function no-ops silently — the user can still
 * see the `uuid_extranet` on the certificate card for manual retrieval.
 *
 * **Open question (BACKLOG `needs-spec`):** the exact PDF endpoint is not yet decided
 * (could be Next.js API route, Supabase Edge Function, or pre-rendered Storage URL).
 * The current URL pattern is a placeholder until that decision lands.
 *
 * @param {string} certificateId - The internal certificate row id.
 * @returns {Promise<void>} Resolves when the URL is handed off to the OS.
 */
export async function downloadCertificatePdf(certificateId: string): Promise<void> {
  const baseUrl = process.env.EXPO_PUBLIC_PDF_BASE_URL;
  if (!baseUrl) {
    return;
  }
  await openURL(`${baseUrl}/certificates/${certificateId}.pdf`);
}

/**
 * @description Opens the official extranet validation page for a certificate.
 *
 * Business rule: external systems (per Requisitos §1) verify certificates via a
 * dedicated URL keyed by the certificate's public `uuid_extranet`. The host is
 * configured via `EXPO_PUBLIC_EXTRANET_VALIDATION_URL` (no real partner name in code
 * — see `FORBIDDEN_OPERATIONS.md` secção 9 CONFID-01).
 *
 * @param {string} uuidExtranet - The certificate's public validation code (e.g. `EXTR-…`).
 * @returns {Promise<void>} Resolves when the URL is handed off to the OS.
 */
export async function openCertificateValidation(uuidExtranet: string): Promise<void> {
  const baseUrl = process.env.EXPO_PUBLIC_EXTRANET_VALIDATION_URL;
  if (!baseUrl) {
    return;
  }
  await openURL(`${baseUrl}/${uuidExtranet}`);
}

/**
 * @description Shares the certificate via the OS-native share sheet.
 *
 * Business rule: the share message must include the public `uuid_extranet` so the
 * recipient can independently verify the certificate via the validation endpoint.
 *
 * @param {string} uuidExtranet - The certificate's public validation code.
 * @param {string} [courseTitle] - Optional human-readable course title for the message.
 * @returns {Promise<void>} Resolves when the share sheet closes.
 */
export async function shareCertificate(uuidExtranet: string, courseTitle?: string): Promise<void> {
  const prefix = courseTitle ? `Concluí o curso "${courseTitle}"` : 'Concluí um curso';
  await Share.share({
    message: `${prefix}! Código de validação: ${uuidExtranet}`,
    title: 'Meu certificado',
  });
}
