import { Profile } from '@projeto/types';

/**
 * @description Gateway interface for authentication and authorization operations.
 * Defines the contract for session management, user identity resolution, role-based
 * access control, and profile retrieval.
 * Business rule: All auth operations must go through this gateway to decouple
 * the application from the underlying auth provider (Supabase Auth).
 */
export interface IAuthGateway {
  /**
   * @description Retrieves the current auth session from the provider.
   * Business rule: Used to check if a user is currently authenticated.
   * @returns Promise resolving to the session object (shape depends on auth provider).
   */
  getSession(): Promise<any>;

  /**
   * @description Resolves the currently authenticated user's identity.
   * Business rule: Returns null when no valid session exists.
   * @param client - Optional SupabaseClient instance for server-side or custom client usage.
   * @returns Promise resolving to an object with the user's id, or null if unauthenticated.
   */
  getUser(client?: any): Promise<{ id: string } | null>;

  /**
   * @description Retrieves the full profile data for a given user.
   * Business rule: Profiles contain display name, avatar, and role information.
   * @param userId - The UUID of the user whose profile to fetch.
   * @returns Promise resolving to the Profile object, or null if not found.
   */
  getProfile(userId: string): Promise<Profile | null>;

  /**
   * @description Retrieves the role string for the currently authenticated user.
   * Business rule: Used for authorization checks (admin vs. student).
   * @param client - Optional SupabaseClient instance for server-side or custom client usage.
   * @returns Promise resolving to the role string (e.g. 'admin', 'student'), or null.
   */
  getUserRole(client?: any): Promise<string | null>;

  /**
   * @description Authenticates a user with email and password credentials.
   * Business rule: Credentials are validated by the auth provider; no plain-text
   * passwords are handled by the application.
   * @param email - The user's email address.
   * @param password - The user's password.
   * @param client - Optional SupabaseClient instance for custom client usage.
   * @returns Promise resolving when authentication succeeds.
   * @throws Error if credentials are invalid or authentication fails.
   */
  signIn(email: string, password: string, client?: any): Promise<void>;

  /**
   * @description Terminates the current user session.
   * Business rule: Clears local session state and invalidates tokens.
   * @returns Promise resolving when sign-out completes.
   */
  signOut(): Promise<void>;
}
