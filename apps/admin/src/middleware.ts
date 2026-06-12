/**
 * ⚠️ TEST-ONLY ESCAPE HATCH ⚠️
 *
 * The `E2E_BYPASS_AUTH=1` env var is consumed ONLY by the Playwright
 * test suite (set in `playwright.config.ts` → `webServer.env`). It
 * must NEVER be set in:
 *   - `.env*` files committed to the repo
 *   - Vercel/Deploy environment configuration
 *   - Any production environment
 *
 * Setting it in production would disable all authentication at the
 * edge, exposing every protected route. CI lint check enforces this
 * contract — see `scripts/check-test-env-vars.sh` and
 * `docs/skills/e2e_testing.md`.
 *
 * Why this exists: `supabase.auth.getUser()` runs in the Next.js
 * Edge Runtime, making a server-side fetch that cannot be intercepted
 * by Playwright's `page.route` (which only sees browser requests). The
 * flag lets the middleware short-circuit auth for the test runtime.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (process.env.E2E_BYPASS_AUTH === '1') {
    return NextResponse.next({ request });
  }

  const publicPaths = ['/login', '/logout', '/api/health', '/api/ready'];
  const isPublic = publicPaths.some(p => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname === '/';

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isPublic && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
