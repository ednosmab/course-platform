import { Profile } from '@projeto/types';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface IAuthGateway {
  getSession(): Promise<any>;
  getUser(client?: SupabaseClient): Promise<{ id: string } | null>;
  getProfile(userId: string): Promise<Profile | null>;
  getUserRole(client?: SupabaseClient): Promise<string | null>;
  signIn(email: string, password: string, client?: SupabaseClient): Promise<void>;
  signOut(): Promise<void>;
}
