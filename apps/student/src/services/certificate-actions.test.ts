import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockOpenURL = vi.fn();
const mockShare = vi.fn();

vi.mock('expo-linking', () => ({
  openURL: (...args: unknown[]) => mockOpenURL(...args),
}));

vi.mock('react-native', () => ({
  Share: {
    share: (...args: unknown[]) => mockShare(...args),
  },
}));

import { downloadCertificatePdf, openCertificateValidation, shareCertificate } from './certificate-actions';

describe('certificate-actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    mockOpenURL.mockResolvedValue(true);
    mockShare.mockResolvedValue({ action: 'sharedAction' });
  });

  describe('downloadCertificatePdf', () => {
    it('should open the PDF URL constructed from EXPO_PUBLIC_PDF_BASE_URL and cert id', async () => {
      vi.stubEnv('EXPO_PUBLIC_PDF_BASE_URL', 'https://api.example.com');
      await downloadCertificatePdf('cert-123');
      expect(mockOpenURL).toHaveBeenCalledWith('https://api.example.com/certificates/cert-123.pdf');
    });

    it('should silently no-op when EXPO_PUBLIC_PDF_BASE_URL is missing', async () => {
      await downloadCertificatePdf('cert-123');
      expect(mockOpenURL).not.toHaveBeenCalled();
    });
  });

  describe('openCertificateValidation', () => {
    it('should open the validation URL with cert.uuid_extranet appended', async () => {
      vi.stubEnv('EXPO_PUBLIC_EXTRANET_VALIDATION_URL', 'https://validacao.example.com');
      await openCertificateValidation('EXTR-abc-123');
      expect(mockOpenURL).toHaveBeenCalledWith('https://validacao.example.com/EXTR-abc-123');
    });

    it('should silently no-op when EXPO_PUBLIC_EXTRANET_VALIDATION_URL is missing', async () => {
      await openCertificateValidation('EXTR-abc-123');
      expect(mockOpenURL).not.toHaveBeenCalled();
    });
  });

  describe('shareCertificate', () => {
    it('should share a message that includes the certificate uuid_extranet', async () => {
      await shareCertificate('EXTR-abc-123', 'Fundamentos UX');
      expect(mockShare).toHaveBeenCalledWith({
        message: expect.stringContaining('EXTR-abc-123') as unknown as string,
        title: 'Meu certificado',
      });
    });
  });
});
