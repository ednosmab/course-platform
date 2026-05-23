import { createClient } from '@supabase/supabase-js';

function resolveEnv(key: 'url'): string;
function resolveEnv(key: 'key'): string;
function resolveEnv(key: 'url' | 'key'): string {
  if (typeof process === 'undefined' || !process.env) return '';
  if (key === 'url') {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      || process.env.EXPO_PUBLIC_SUPABASE_URL
      || process.env.SUPABASE_URL
      || '';
  }
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    || process.env.SUPABASE_ANON_KEY
    || '';
}

let _supabase: ReturnType<typeof createClient> | null = null;

/**
 * @description Returns a lazily-initialised Supabase client singleton.
 * The client is created on first access rather than at module scope,
 * preventing SSR crashes when environment variables are unavailable
 * during server-side rendering of `'use client'` components.
 * Once created, the instance is cached and reused for the lifetime
 * of the process.
 * @returns A Supabase client instance configured with the project URL
 * and anonymous key from environment variables.
 */
export function getSupabaseClient() {
  if (!_supabase) {
    const supabaseUrl = resolveEnv('url');
    const supabaseAnonKey = resolveEnv('key');
    _supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: typeof window !== 'undefined',
      },
    });
  }
  return _supabase;
}

/**
 * @description Convenience re-export of getSupabaseClient() for backward compatibility.
 * This is a function, not a constant — it must be called each time you need the client.
 * Existing import `import { supabase } from '../supabase'` will continue to work
 * because the binding is a getter proxy that delegates to getSupabaseClient().
 */
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_, prop) {
    const client = getSupabaseClient();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
  set(_, prop, value) {
    const client = getSupabaseClient();
    (client as any)[prop] = value;
    return true;
  },
});
