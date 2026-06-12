import { createSupabaseServerClient } from '../../lib/supabase-server';
import { NextResponse, NextRequest } from 'next/server';

/**
 * @description Logout route handler for the admin app. Creates a server-side Supabase client
 * to properly clear the SSR session cookies, then redirects to /login.
 * Business rule: Must use @supabase/ssr server client to clear cookies — calling
 * supabase.auth.signOut() from a client component only clears localStorage, leaving
 * stale SSR cookies that the middleware still considers valid.
 */
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(new URL('/login', request.url));
}
