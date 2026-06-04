import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockUploadCertificateImage } = vi.hoisted(() => ({
  mockUploadCertificateImage: vi.fn(),
}));

vi.mock('@projeto/core', () => ({
  StorageService: {
    uploadCertificateImage: mockUploadCertificateImage,
  },
}));

import { uploadCertificateImageToBlock, alertForUploadResult } from './uploadCertificateImageToBlock';

describe('uploadCertificateImageToBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('happy path: calls StorageService and updateBlock with the returned URL', async () => {
    mockUploadCertificateImage.mockResolvedValueOnce('https://supabase.example/cert-images/uploaded.png');
    const updateBlock = vi.fn();

    const file = new File(['x'], 'logo.png', { type: 'image/png' });
    const result = await uploadCertificateImageToBlock(file, 'course-1', 'block-1', updateBlock);

    expect(mockUploadCertificateImage).toHaveBeenCalledWith(file, 'course-1', 'block-1');
    expect(updateBlock).toHaveBeenCalledWith('block-1', { url: 'https://supabase.example/cert-images/uploaded.png' });
    expect(result).toEqual({ ok: true, url: 'https://supabase.example/cert-images/uploaded.png' });
  });

  it('rejects files larger than 5MB before calling StorageService', async () => {
    const updateBlock = vi.fn();

    const big = new File([new Uint8Array(6 * 1024 * 1024)], 'big.png', { type: 'image/png' });
    const result = await uploadCertificateImageToBlock(big, 'course-1', 'block-1', updateBlock);

    expect(mockUploadCertificateImage).not.toHaveBeenCalled();
    expect(updateBlock).not.toHaveBeenCalled();
    expect(result).toEqual({ ok: false, reason: 'too-large' });
  });

  it('rejects unsupported MIME types before calling StorageService', async () => {
    const updateBlock = vi.fn();

    const pdf = new File(['%PDF-1.4'], 'doc.pdf', { type: 'application/pdf' });
    const result = await uploadCertificateImageToBlock(pdf, 'course-1', 'block-1', updateBlock);

    expect(mockUploadCertificateImage).not.toHaveBeenCalled();
    expect(updateBlock).not.toHaveBeenCalled();
    expect(result).toEqual({ ok: false, reason: 'wrong-type' });
  });

  it('returns no-course when courseId is null (block not ready)', async () => {
    const updateBlock = vi.fn();

    const file = new File(['x'], 'logo.png', { type: 'image/png' });
    const result = await uploadCertificateImageToBlock(file, null, 'block-1', updateBlock);

    expect(mockUploadCertificateImage).not.toHaveBeenCalled();
    expect(updateBlock).not.toHaveBeenCalled();
    expect(result).toEqual({ ok: false, reason: 'no-course' });
  });

  it('returns upload-failed when StorageService resolves with null (no URL)', async () => {
    mockUploadCertificateImage.mockResolvedValueOnce(null);
    const updateBlock = vi.fn();

    const file = new File(['x'], 'logo.png', { type: 'image/png' });
    const result = await uploadCertificateImageToBlock(file, 'course-1', 'block-1', updateBlock);

    expect(updateBlock).not.toHaveBeenCalled();
    expect(result).toEqual({ ok: false, reason: 'upload-failed' });
  });

  it('returns upload-failed when StorageService throws (no crash)', async () => {
    mockUploadCertificateImage.mockRejectedValueOnce(new Error('network down'));
    const updateBlock = vi.fn();

    const file = new File(['x'], 'logo.png', { type: 'image/png' });
    const result = await uploadCertificateImageToBlock(file, 'course-1', 'block-1', updateBlock);

    expect(updateBlock).not.toHaveBeenCalled();
    expect(result).toEqual({ ok: false, reason: 'upload-failed' });
  });
});

describe('alertForUploadResult', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a Portuguese message for too-large', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    alertForUploadResult({ ok: false, reason: 'too-large' });
    expect(alertSpy).toHaveBeenCalledWith('Arquivo muito grande. Máximo: 5MB.');
    alertSpy.mockRestore();
  });

  it('shows a Portuguese message for wrong-type', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    alertForUploadResult({ ok: false, reason: 'wrong-type' });
    expect(alertSpy).toHaveBeenCalledWith('Formato não suportado. Use JPEG, PNG ou WebP.');
    alertSpy.mockRestore();
  });

  it('shows a Portuguese message for upload-failed', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    alertForUploadResult({ ok: false, reason: 'upload-failed' });
    expect(alertSpy).toHaveBeenCalledWith('Erro ao enviar imagem.');
    alertSpy.mockRestore();
  });

  it('is silent for no-course (block not ready — no user-facing error)', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    alertForUploadResult({ ok: false, reason: 'no-course' });
    expect(alertSpy).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('is silent when upload succeeded (no alert needed)', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    alertForUploadResult({ ok: true, url: 'https://x' });
    expect(alertSpy).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});
