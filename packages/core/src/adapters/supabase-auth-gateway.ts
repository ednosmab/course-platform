import { supabase } from '../supabase';
import { Profile, ProfileSchema } from '@projeto/types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { IAuthGateway } from '../ports/IAuthGateway';

/**
 * @description Supabase-backed implementation of the AuthGateway port.
 * Provides authentication operations — session management, user/profile retrieval,
 * role-based access control, sign-in, and sign-out.
 * Business rule: All auth operations delegate to Supabase Auth; role information
 * is stored in the profiles table linked to the auth user.
 * @implements {IAuthGateway}
 */
export const supabaseAuthGateway: IAuthGateway = {
  /**
   * @description Retrieves the current Supabase Auth session from the client.
   * Used to determine if a user is authenticated and to access session tokens.
   * @returns {Promise<any>} The session object or null if no active session.
   * @throws {AuthError} If the Supabase Auth getSession call fails.
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  /**
   * @description Retrieves the authenticated user's ID from the Supabase Auth client.
   * Accepts an optional custom Supabase client (for server-side or service-role contexts).
   * Falls back to the default `supabase` client if none is provided.
   * @param {SupabaseClient} [client] - Optional custom Supabase client for context-specific auth.
   * @returns {Promise<{ id: string } | null>} The user object with ID, or null if not authenticated.
   */
  async getUser(client?: SupabaseClient) {
    const c = client || supabase;
    const { data: { user }, error: userError } = await c.auth.getUser();
    if (userError || !user) return null;
    return { id: user.id };
  },

  /**
   * @description Fetches a user's profile from the profiles table by user ID.
   * Business rule: Profiles extend auth users with additional CMS-specific data
   * (name, role, avatar, etc.). Falls back to raw data if Zod validation fails.
   * @param {string} userId - The UUID of the user.
   * @returns {Promise<Profile | null>} The profile validated against ProfileSchema, or null if not found.
   */
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error || !data) return null;
    const parsed = ProfileSchema.safeParse(data);
    if (!parsed.success) { console.error('Profile data contract validation failed:', parsed.error); return null; }
    return parsed.data;
  },

  /**
   * @description Retrieves the role of the currently authenticated user.
   * Accepts an optional custom Supabase client. The role is read from the profiles table.
   * Business rule: Role determines access permissions (admin vs student).
   * Used by the admin panel to gate features and by the student app to restrict access.
   * @param {SupabaseClient} [client] - Optional custom Supabase client.
   * @returns {Promise<string | null>} The user's role string (e.g. 'admin', 'student'), or null.
   */
  async getUserRole(client?: SupabaseClient): Promise<string | null> {
    const c = client || supabase;
    const { data: { user }, error: userError } = await c.auth.getUser();
    if (userError || !user) return null;
    const { data: profile } = await c.from('profiles').select('role').eq('id', user.id).single();
    return profile?.role ?? null;
  },

  /**
   * @description Authenticates a user with email and password using Supabase Auth.
   * Business rule: Used in the login form for both admin and student portals.
   * Throws on invalid credentials or network errors.
   * @param {string} email - The user's email address.
   * @param {string} password - The user's password.
   * @param {SupabaseClient} [client] - Optional custom Supabase client.
   * @returns {Promise<void>}
   * @throws {AuthError} If sign-in fails (invalid credentials, network error, etc.).
   */
  async signIn(email: string, password: string, client?: SupabaseClient): Promise<void> {
    const c = client || supabase;
    const { error } = await c.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  /**
   * @description Signs out the current user by invalidating the Supabase Auth session.
   * Business rule: Clears the local session and invalidates the refresh token.
   * @returns {Promise<void>}
   * @throws {AuthError} If the sign-out operation fails.
   */
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
};
