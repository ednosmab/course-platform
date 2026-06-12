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

import { printCertificate, openCertificateValidation, shareCertificate } from './certificate-actions';

describe('certificate-actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    mockOpenURL.mockResolvedValue(true);
    mockShare.mockResolvedValue({ action: 'sharedAction' });
  });

  describe('printCertificate', () => {
    it('should create an iframe and trigger print when document is available', () => {
      const mockAppendChild = vi.fn();
      const mockRemove = vi.fn();
      const mockPrint = vi.fn();
      const mockFocus = vi.fn();

      vi.stubGlobal('document', {
        createElement: vi.fn(() => ({
          style: {},
          srcdoc: '',
          setAttribute: vi.fn(),
          onload: null,
          contentWindow: { focus: mockFocus, print: mockPrint },
          remove: mockRemove,
        })),
        body: { appendChild: mockAppendChild },
      });

      printCertificate([
        { id: '1', type: 'text', content: 'Hello', layouts: { desktop: { x: 0, y: 0, w: 100, h: 50, zIndex: 0 } } },
      ]);

      expect(mockAppendChild).toHaveBeenCalled();
    });

    it('should be a no-op when document is undefined (SSR)', () => {
      vi.stubGlobal('document', undefined);
      expect(() => printCertificate([])).not.toThrow();
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
