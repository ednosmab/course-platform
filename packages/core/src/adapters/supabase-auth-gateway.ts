import { supabase } from '../supabase';
import { Profile, ProfileSchema } from '@projeto/types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { IAuthGateway } from '../ports/IAuthGateway';

export const supabaseAuthGateway: IAuthGateway = {
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getUser(client?: SupabaseClient) {
    const c = client || supabase;
    const { data: { user }, error: userError } = await c.auth.getUser();
    if (userError || !user) return null;
    return { id: user.id };
  },

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error || !data) return null;
    const parsed = ProfileSchema.safeParse(data);
    if (!parsed.success) { console.error('Falha ao validar contrato de dados do perfil:', parsed.error); return data as Profile; }
    return parsed.data;
  },

  async getUserRole(client?: SupabaseClient): Promise<string | null> {
    const c = client || supabase;
    const { data: { user }, error: userError } = await c.auth.getUser();
    if (userError || !user) return null;
    const { data: profile } = await c.from('profiles').select('role').eq('id', user.id).single();
    return profile?.role ?? null;
  },

  async signIn(email: string, password: string, client?: SupabaseClient): Promise<void> {
    const c = client || supabase;
    const { error } = await c.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
};
