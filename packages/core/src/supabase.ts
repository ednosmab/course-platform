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

// Inicialização segura do cliente Supabase para Web e Mobile
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: typeof window !== 'undefined',
  }
});
