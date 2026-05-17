
import { supabase } from '../supabase';
import { Profile, ProfileSchema } from '@projeto/types';

export const AuthService = {
  /**
   * Obtém a sessão ativa atual no Supabase Auth.
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  /**
   * Obtém o perfil de banco de dados do usuário autenticado atual.
   */
  async getCurrentProfile(): Promise<Profile | null> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !data) return null;

    // Validar os dados de acordo com o contrato Zod estrito de types
    const parsed = ProfileSchema.safeParse(data);
    if (!parsed.success) {
      console.error('Falha ao validar contrato de dados do perfil:', parsed.error);
      return data as Profile;
    }

    return parsed.data;
  },

  /**
   * Efetua o encerramento da sessão ativa (SignOut).
   */
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
};
