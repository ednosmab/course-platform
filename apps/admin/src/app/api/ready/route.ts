export async function GET() {
  const checks: Record<string, { status: string; error?: string }> = {};

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    checks.supabase = supabaseUrl
      ? { status: 'ok' }
      : { status: 'degraded', error: 'SUPABASE_URL not configured' };
  } catch {
    checks.supabase = { status: 'degraded', error: 'connection check failed' };
  }

  const allOk = Object.values(checks).every((c) => c.status === 'ok');

  return Response.json(
    { status: allOk ? 'ok' : 'degraded', checks, timestamp: new Date().toISOString() },
    { status: allOk ? 200 : 503 },
  );
}
