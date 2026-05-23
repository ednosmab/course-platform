import { describe, it, expect, vi } from 'vitest';
import { createAuthService } from './auth';

function makeGateway() {
  return {
    getSession: vi.fn(),
    getUser: vi.fn(),
    getProfile: vi.fn(),
    getUserRole: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  };
}

describe('AuthService', () => {
  describe('getCurrentProfile', () => {
    it('should return null when no user is logged in', async () => {
      const gateway = makeGateway();
      gateway.getUser.mockResolvedValue(null);
      const service = createAuthService(gateway);
      const result = await service.getCurrentProfile();
      expect(result).toBeNull();
    });

    it('should return profile when user is logged in', async () => {
      const gateway = makeGateway();
      gateway.getUser.mockResolvedValue({ id: 'user-1' });
      gateway.getProfile.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        full_name: 'Test User',
        role: 'admin',
        created_at: new Date().toISOString(),
      });
      const service = createAuthService(gateway);
      const result = await service.getCurrentProfile();
      expect(result).not.toBeNull();
      expect(result!.email).toBe('test@test.com');
    });
  });

  describe('signIn', () => {
    it('should call gateway signIn with correct params', async () => {
      const gateway = makeGateway();
      const service = createAuthService(gateway);
      await service.signIn('a@b.com', 'pass');
      expect(gateway.signIn).toHaveBeenCalledWith('a@b.com', 'pass', undefined);
    });
  });
});
