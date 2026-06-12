import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createStorageService } from './storage';

function makeProvider() {
  return {
    uploadThumbnail: vi.fn(),
  };
}

describe('StorageService', () => {
  let provider: ReturnType<typeof makeProvider>;
  let service: ReturnType<typeof createStorageService>;

  beforeEach(() => {
    provider = makeProvider();
    service = createStorageService(provider);
  });

  describe('uploadThumbnail', () => {
    it('should delegate to provider', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      provider.uploadThumbnail.mockResolvedValue('https://example.com/thumb.jpg');
      const result = await service.uploadThumbnail(file, 'course-1');
      expect(provider.uploadThumbnail).toHaveBeenCalledWith(file, 'course-1');
      expect(result).toBe('https://example.com/thumb.jpg');
    });

    it('should return null when upload fails', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      provider.uploadThumbnail.mockResolvedValue(null);
      const result = await service.uploadThumbnail(file, 'course-1');
      expect(result).toBeNull();
    });
  });
});
