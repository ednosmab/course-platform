import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';

function resolveEnv(key: 'url'): string;
function resolveEnv(key: 'key'): string;
function resolveEnv(key: 'service_role'): string;
function resolveEnv(key: 'url' | 'key' | 'service_role'): string {
  if (typeof process === 'undefined' || !process.env) return '';
  if (key === 'url') {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      || process.env.EXPO_PUBLIC_SUPABASE_URL
      || process.env.SUPABASE_URL
      || '';
  }
  if (key === 'service_role') {
    return process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  }
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    || process.env.SUPABASE_ANON_KEY
    || '';
}

let _supabase: SupabaseClient | null = null;
let _supabaseOverride: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

/**
 * @description Injects an externally-created Supabase client (e.g. from @supabase/ssr)
 * so that all core services share the same client instance and auth session.
 * Must be called once during app startup, before any core service is used.
 * @param client - A Supabase client instance (e.g. from createBrowserClient)
 */
export function setSupabaseClient(client: SupabaseClient): void {
  _supabaseOverride = client;
}

/**
 * @description Returns a lazily-initialised Supabase client singleton.
 * The client is created on first access rather than at module scope,
 * preventing SSR crashes when environment variables are unavailable
 * during server-side rendering of 'use client' components.
 * Once created, the instance is cached and reused for the lifetime
 * of the process.
 * @returns A Supabase client instance configured with the project URL
 * and anonymous key from environment variables.
 */
export function getSupabaseClient() {
  if (_supabaseOverride) return _supabaseOverride;
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
 * @description Returns a Supabase admin client with Service Role key.
 * This client bypasses Row Level Security (RLS) and should only be used
 * for server-side operations that require elevated privileges.
 * WARNING: Never expose this client to client-side code.
 * @returns A Supabase client instance configured with Service Role key.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    const supabaseUrl = resolveEnv('url');
    const serviceRoleKey = resolveEnv('service_role');

    if (!serviceRoleKey) {
      console.warn(
        '[Supabase] SUPABASE_SERVICE_ROLE_KEY not configured. ' +
        'Admin operations will fail. See .env.example for setup.'
      );
    }

    _supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return _supabaseAdmin;
}

/**
 * @description Convenience re-export of getSupabaseClient() for backward compatibility.
 * This is a function, not a constant — it must be called each time you need the client.
 * Existing import `import { supabase } from '../supabase'` will continue to work
 * because the binding is a getter proxy that delegates to getSupabaseClient().
 */
export const supabase = new Proxy({} as SupabaseClient, {
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

/**
 * @description Convenience export of getSupabaseAdmin() for backward compatibility.
 * Use this for server-side operations that require elevated privileges.
 */
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabaseAdmin();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
  set(_, prop, value) {
    const client = getSupabaseAdmin();
    (client as any)[prop] = value;
    return true;
  },
});
