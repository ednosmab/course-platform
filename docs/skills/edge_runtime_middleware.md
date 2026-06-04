# ⚡ SKILL: EDGE RUNTIME & MIDDLEWARE

## 🎯 Objetivo
Usar Edge Runtime do Next.js para operações que exigem baixa latência: autenticação JWT, rate limiting, resolução de tenant e redirects.

---

## 📋 Quando Usar Esta Skill
- Verificar tokens JWT
- Resolver tenant a partir do hostname
- Aplicar rate limiting
- Fazer redirects baseados em regras
- Geolocalização para conteúdo regional

---

## 🏗️ Edge vs Node.js Runtime

| Feature | Edge Runtime | Node.js Runtime |
|---|---|---|
| Latência | < 5ms (global) | 50-200ms (regional) |
| APIs disponíveis | Fetch, Web Crypto | Todas (fs, net, etc) |
| Bundle size | Limitado | Ilimitado |
| Uso recomendado | Auth, rate limit, redirects | DB queries, file ops |

---

## 🛠️ Implementação

### 1. Middleware Básico (Autenticação)

```typescript
// apps/admin/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('session')?.value;

  // Rotas protegidas
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Validação básica do JWT (verificação de assinatura via Edge)
    try {
      const payload = decodeJwtPayload(token);
      if (!payload || payload.exp < Date.now() / 1000) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

/**
 * Decodifica payload do JWT sem verificar assinatura
 * IMPORTANTE: Para validação completa, usar API route
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

### 2. Middleware com Resolução de Tenant

```typescript
// apps/student/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';

  // Extrai slug do tenant do hostname
  // "escola.suaplataforma.com" → "escola"
  // "escola.com" → usa domínio customizado
  const tenantSlug = extractTenantSlug(host);

  if (!tenantSlug) {
    return NextResponse.json(
      { error: 'Invalid tenant' },
      { status: 404 }
    );
  }

  // Busca tenant_id (em produção, usar cache)
  const tenantId = await resolveTenantId(tenantSlug);

  if (!tenantId) {
    return NextResponse.json(
      { error: 'Tenant not found' },
      { status: 404 }
    );
  }

  // Adiciona tenant_id nos headers
  const response = NextResponse.next();
  response.headers.set('x-tenant-id', tenantId);

  return response;
}

/**
 * Extrai slug do tenant do hostname
 */
function extractTenantSlug(host: string): string | null {
  // Remove porta
  const hostname = host.split(':')[0];

  // Domínio customizado (sem subdomínio de platform)
  if (!hostname.endsWith('.suaplataforma.com')) {
    return hostname; // Usar como slug
  }

  // Subdomínio da plataforma
  const parts = hostname.split('.');
  return parts[0];
}

/**
 * Resolve tenant_id pelo slug
 * Em produção: usar cache (Redis ou in-memory)
 */
async function resolveTenantId(slug: string): Promise<string | null> {
  // TODO: Implementar com cache
  // Por agora, busca direto no banco
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', slug)
    .single();

  return data?.id ?? null;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### 3. Edge API Route (Rate Limiting)

```typescript
// apps/admin/app/api/auth/login/route.ts
export const runtime = 'edge'; // Força Edge Runtime

import { NextResponse } from 'next/server';

// Rate limit em memória (Edge Runtime não tem acesso ao Redis diretamente)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export async function POST(request: Request) {
  const { email } = await request.json();

  // Rate limit por email
  const key = `login:${email}`;
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (entry && now < entry.resetAt) {
    if (entry.count >= 5) {
      return NextResponse.json(
        { error: 'Too many attempts' },
        { status: 429 }
      );
    }
    entry.count++;
  } else {
    rateLimitMap.set(key, { count: 1, resetAt: now + 60000 });
  }

  // ... lógica de login
}
```

### 4. Edge Function para Geolocalização

```typescript
// apps/admin/app/api/edge/geo/route.ts
export const runtime = 'edge';

export async function GET(request: Request) {
  const country = request.headers.get('x-vercel-ip-country');
  const city = request.headers.get('x-vercel-ip-city');

  return Response.json({
    country: country ?? 'unknown',
    city: city ?? 'unknown',
  });
}
```

---

## 📊 Casos de Uso por Runtime

| Operação | Runtime | Motivo |
|---|---|---|
| Login/Logout | Edge | Baixa latência global |
| Rate Limiting | Edge | Verificação rápida |
| Resolução de Tenant | Edge | Antes de atingir o banco |
| Upload de Arquivo | Node.js | Acesso ao filesystem |
| Queries Complexas ao DB | Node.js | Tempo de processamento |
| Geração de PDF | Node.js | Bibliotecas pesadas |

---

## ⚠️ Regras de Ouro

1. **Edge = operações leves** — não fazer queries pesadas no Edge
2. **Rate limit em memória** — Edge não tem Redis, usar Map()
3. **Middleware = rápido** — máximo 10ms de processamento
4. **Headers para downstream** — usar x- headers para dados resolvidos
5. **Fallback Node.js** — se Edge não suportar, usar API route normal

---

## 📂 Onde Aplicar

- `apps/admin/middleware.ts`
- `apps/student/middleware.ts`
- `apps/admin/app/api/**/*.ts` (com `export const runtime = 'edge'`)

---

## 🔗 Documentos Relacionados

- `docs/skills/rate_limiting.md` — Rate limiting completo
- `docs/skills/multitenancy_rls.md` — Resolução de tenant
- `docs/roadmaps/scalability-plan.md` — Plano de escalabilidade
