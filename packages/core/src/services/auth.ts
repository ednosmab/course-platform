import type { IAuthGateway } from '../ports/IAuthGateway';

/**
 * @description Creates an authentication service that wraps an IAuthGateway to provide session
 * management, profile retrieval, role checking, sign-in, and logout operations for the CMS platform.
 * Business rule: All auth operations are delegated to the gateway adapter — this service
 * orchestrates multi-step flows (e.g., getCurrentProfile calls getUser then getProfile).
 * @param gateway - An implementation of IAuthGateway (e.g., SupabaseAuthGateway)
 * @returns An object with getSession, getCurrentProfile, getUserRole, signIn, and logout methods
 */
export function createAuthService(gateway: IAuthGateway) {
  return {
    /**
     * @description Retrieves the current Supabase session. Delegates directly to the gateway.
     * @returns The current Supabase session object, or null if no active session exists
     */
    async getSession() {
      return gateway.getSession();
    },

    /**
     * @description Retrieves the authenticated user's profile. First fetches the user from the
     * gateway; if no user is logged in, returns null. Otherwise fetches the full profile record.
     * @returns The user profile object, or null if no user is authenticated
     */
    async getCurrentProfile() {
      const user = await gateway.getUser();
      if (!user) return null;
      return gateway.getProfile(user.id);
    },

    /**
     * @description Retrieves the role of the currently authenticated user from Supabase.
     * Optionally accepts a custom Supabase client for role queries.
     * @param client - Optional auth client instance for custom-configured queries
     * @returns The user role string (e.g., 'admin', 'student'), or null if not determined
     */
    async getUserRole(client?: any) {
      return gateway.getUserRole(client);
    },

    /**
     * @description Authenticates a user with email and password via the gateway.
     * Optionally accepts a custom Supabase client for the sign-in request.
     * @param email - The user's email address
     * @param password - The user's password
     * @param client - Optional auth client instance for custom-configured sign-in
     * @returns The sign-in response from the gateway (session data or error)
     */
    async signIn(email: string, password: string, client?: any) {
      return gateway.signIn(email, password, client);
    },

    /**
     * @description Signs out the currently authenticated user by delegating to the gateway's signOut method.
     * @returns The result of the sign-out operation from the gateway
     */
    async logout() {
      return gateway.signOut();
    },
  };
}
