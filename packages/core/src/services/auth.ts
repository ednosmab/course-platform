import type { IAuthGateway } from '../ports/IAuthGateway';
import type { SupabaseClient } from '@supabase/supabase-js';

export function createAuthService(gateway: IAuthGateway) {
  return {
    async getSession() {
      return gateway.getSession();
    },

    async getCurrentProfile() {
      const user = await gateway.getUser();
      if (!user) return null;
      return gateway.getProfile(user.id);
    },

    async getUserRole(client?: SupabaseClient) {
      return gateway.getUserRole(client);
    },

    async signIn(email: string, password: string, client?: SupabaseClient) {
      return gateway.signIn(email, password, client);
    },

    async logout() {
      return gateway.signOut();
    },
  };
}
