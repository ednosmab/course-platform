import { supabase } from '../supabase';
import { Profile, ProfileSchema } from '@projeto/types';
import type { SupabaseClient } from '@supabase/supabase-js';

export const AuthService = {
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getCurrentProfile(): Promise<Profile | null> {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !data) return null;

    const parsed = ProfileSchema.safeParse(data);
    if (!parsed.success) {
      console.error('Falha ao validar contrato de dados do perfil:', parsed.error);
      return data as Profile;
    }

    return parsed.data;
  },

  async getUserRole(
    client: SupabaseClient = supabase,
  ): Promise<string | null> {
    const {
      data: { user },
      error: userError,
    } = await client.auth.getUser();
    if (userError || !user) return null;

    const { data: profile } = await client
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return profile?.role ?? null;
  },

  async signIn(
    email: string,
    password: string,
    client: SupabaseClient = supabase,
  ): Promise<void> {
    const { error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  },

  async signInAndGetRole(
    email: string,
    password: string,
    client: SupabaseClient,
  ): Promise<string | null> {
    const { error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return this.getUserRole(client);
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
};
