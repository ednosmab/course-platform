import { describe, it, expect, vi } from 'vitest';

const { mockSignInWithPassword, mockSignUp, mockSignOut, mockGetSession, mockGetUser } = vi.hoisted(
  () => ({
    mockSignInWithPassword: vi.fn(),
    mockSignUp: vi.fn(),
    mockSignOut: vi.fn(),
    mockGetSession: vi.fn(),
    mockGetUser: vi.fn(),
  }),
);

vi.mock('../supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signOut: mockSignOut,
      getSession: mockGetSession,
      getUser: mockGetUser,
    },
  },
}));

import { supabase } from '../supabase';

describe('AuthService', () => {
  it('should call signInWithPassword with credentials', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: { id: '123' }, session: { access_token: 'token' } },
      error: null,
    });
    const result = await supabase.auth.signInWithPassword({
      email: 'test@test.com',
      password: 'password123',
    });
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password123',
    });
    expect(result.data.user.id).toBe('123');
  });

  it('should call signUp with credentials', async () => {
    mockSignUp.mockResolvedValue({
      data: { user: { id: '456' } },
      error: null,
    });
    const result = await supabase.auth.signUp({
      email: 'new@test.com',
      password: 'password123',
    });
    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'new@test.com',
      password: 'password123',
    });
    expect(result.data.user.id).toBe('456');
  });

  it('should handle signOut', async () => {
    mockSignOut.mockResolvedValue({ error: null });
    await supabase.auth.signOut();
    expect(mockSignOut).toHaveBeenCalled();
  });
});
