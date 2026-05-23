import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 
  (typeof process !== 'undefined' && process.env ? (
    process.env.NEXT_PUBLIC_SUPABASE_URL || 
    process.env.EXPO_PUBLIC_SUPABASE_URL || 
    process.env.SUPABASE_URL
  ) : '') || '';

const supabaseAnonKey = 
  (typeof process !== 'undefined' && process.env ? (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
    process.env.SUPABASE_ANON_KEY
  ) : '') || '';

/**
 * @description Singleton Supabase client initialised with the project URL and anonymous (public) key. Reads credentials from environment variables in order of priority: NEXT_PUBLIC_SUPABASE_*, EXPO_PUBLIC_SUPABASE_*, or SUPABASE_* for Node environments. The client is safe for both Web (Next.js) and Mobile (Expo) runtimes, with session persistence and auto-refresh enabled. In browser environments it additionally detects the session from the URL (for OAuth / magic-link callbacks).
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: typeof window !== 'undefined',
  }
});
