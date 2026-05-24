import { useRef, useCallback } from 'react';
import { toBlob } from 'html-to-image';
import { CourseService, StorageService } from '@projeto/core';

/**
 * @description Hook that captures a hidden certificate blocks container as a PNG image
 * and uploads it to Supabase Storage. The URL is saved to the course's certificate_url
 * field so the settings page can show a static preview instead of re-rendering live blocks.
 * Business rule: Called after auto-save completes in certificate mode.
 */
export function useCertificateCapture(courseId: string) {
  const captureRef = useRef<HTMLDivElement>(null);

  const captureAndUpload = useCallback(async (): Promise<string | null> => {
    const el = captureRef.current;
    if (!el) {
      console.warn('[useCertificateCapture] captureRef.current is null');
      return null;
    }

    console.log('[useCertificateCapture] Starting capture for course:', courseId);

    try {
      const child = el.firstElementChild;
      if (!child) {
        console.warn('[useCertificateCapture] No child element found in capture container');
        return null;
      }

      console.log('[useCertificateCapture] Capture element child found, child size:', child.clientWidth, 'x', child.clientHeight);
      console.log('[useCertificateCapture] Capture element child innerHTML length:', child.innerHTML.length);

      const blob = await toBlob(child as HTMLElement, { quality: 0.92, pixelRatio: 2 });
      if (!blob) {
        console.warn('[useCertificateCapture] toBlob returned null - element may not be rendered');
        return null;
      }

      console.log('[useCertificateCapture] Blob captured, size:', blob.size, 'bytes');

      const url = await StorageService.uploadCertificatePreview(blob, courseId);
      if (!url) {
        console.warn('[useCertificateCapture] uploadCertificatePreview returned null - bucket may not exist');
        return null;
      }

      console.log('[useCertificateCapture] Upload succeeded, url:', url);

      await CourseService.updateCourse(courseId, { certificate_url: url } as any);
      console.log('[useCertificateCapture] certificate_url saved to course');
      return url;
    } catch (err) {
      console.error('[useCertificateCapture] Failed:', err);
      return null;
    }
  }, [courseId]);

  return { captureRef, captureAndUpload };
}
