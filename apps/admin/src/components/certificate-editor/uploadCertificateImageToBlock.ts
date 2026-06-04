import { StorageService } from '@projeto/core';

/**
 * Outcome of a certificate image upload attempt.
 *
 * - `ok: true`        — file uploaded and block updated
 * - `ok: false`       — one of the failure reasons below
 *
 * Returned by `uploadCertificateImageToBlock` so that callers can decide
 * whether to show a user-facing message (via `alertForUploadResult`) or
 * stay silent (e.g. when the block is not yet ready).
 */
export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; reason: 'no-course' | 'too-large' | 'wrong-type' | 'upload-failed' };

/**
 * Centralised certificate image upload flow.
 *
 * Used by:
 * - `CertificateCanvas` drag-and-drop handler (`handleImageDrop`)
 * - `CertificateImageSettings` file picker handler (`handleFile`)
 *
 * Validates the file (size + MIME), uploads to Supabase Storage via
 * `StorageService.uploadCertificateImage`, and patches the block's `url`
 * through the provided `updateBlock` callback.
 *
 * The function is intentionally side-effect-light: the only mutation is
 * the explicit `updateBlock` call when the upload succeeds. It does not
 * touch React state, show alerts, or know about the editor context.
 *
 * @param file        Image file selected by the user (drag-drop or file picker).
 * @param courseId    Course identifier (required by the storage path).
 * @param blockId     Block identifier that will own the uploaded image.
 * @param updateBlock Reducer action to patch the block with the new URL.
 * @returns           Discriminated union describing the outcome.
 */
export async function uploadCertificateImageToBlock(
  file: File,
  courseId: string | null,
  blockId: string,
  updateBlock: (id: string, patch: { url: string }) => void,
): Promise<UploadResult> {
  if (!courseId) return { ok: false, reason: 'no-course' };
  if (file.size > 5 * 1024 * 1024) return { ok: false, reason: 'too-large' };
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return { ok: false, reason: 'wrong-type' };
  }
  try {
    const url = await StorageService.uploadCertificateImage(file, courseId, blockId);
    if (!url) return { ok: false, reason: 'upload-failed' };
    updateBlock(blockId, { url });
    return { ok: true, url };
  } catch {
    return { ok: false, reason: 'upload-failed' };
  }
}

/**
 * Portuguese user-facing messages for each `UploadResult` failure reason.
 *
 * Kept in a single place so future i18n only needs to translate this map.
 * `no-course` is intentionally silent (the block is not ready yet — no
 * point in showing an error to the user).
 */
const ALERT_MESSAGES: Record<Exclude<UploadResult, { ok: true }>['reason'], string> = {
  'no-course': '',
  'too-large': 'Arquivo muito grande. Máximo: 5MB.',
  'wrong-type': 'Formato não suportado. Use JPEG, PNG ou WebP.',
  'upload-failed': 'Erro ao enviar imagem.',
};

/**
 * Renders a Portuguese alert for failed upload results. No-op for
 * successful uploads (nothing to tell the user) and for `no-course`
 * (block not ready — caller should suppress the attempt upstream).
 */
export function alertForUploadResult(result: UploadResult): void {
  if (result.ok) return;
  const message = ALERT_MESSAGES[result.reason];
  if (message) alert(message);
}
