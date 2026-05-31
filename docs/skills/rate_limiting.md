# 🛡️ SKILL: RATE LIMITING

## 🎯 Objetivo
Proteger a aplicação contra abuso e brute force implementando rate limiting em endpoints críticos.

---

## 📋 Quando Usar Esta Skill
- Proteger endpoint de login
- Limitar tentativas de criação de conteúdo
- Controlar writes de progresso
- Proteger APIs públicas contra scraping

---

## 🏗️ Estratégias

| Endpoint | Rate Limit | Janela |
|---|---|---|
| Login | 5 tentativas | 1 minuto |
| Cadastro | 3 registros | 1 hora |
| Progresso write | 10 writes | 1 segundo |
| API pública (leitura) | 100 requests | 1 minuto |
| Upload de arquivo | 10 uploads | 1 hora |

---

## 🛠️ Implementação

### 1. Rate Limiter com Redis (Produção)

```typescript
// packages/core/src/infrastructure/rate-limiter.ts
import { redis } from './redis';

interface RateLimitConfig {
  windowMs: number;    // Janela em milissegundos
  maxRequests: number; // Máximo de requests na janela
}

/**
 * Sliding window rate limiter usando Redis
 * Mais preciso que fixed window
 */
export async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  const multi = redis.multi();

  // Remove timestamps antigos
  multi.zremrangebyscore(key, 0, windowStart);

  // Adiciona timestamp atual
  multi.zadd(key, now, `${now}-${crypto.randomUUID()}`);

  // Conta requests na janela
  multi.zcard(key);

  // Define TTL da chave
  multi.expire(key, Math.ceil(config.windowMs / 1000));

  const results = await multi.exec();
  const requestCount = results[2] as number;

  return {
    allowed: requestCount <= config.maxRequests,
    remaining: Math.max(0, config.maxRequests - requestCount),
  };
}

/**
 * Middleware de rate limiting para API Routes
 */
export function withRateLimit(config: RateLimitConfig) {
  return async function rateLimitMiddleware(
    request: Request,
    handler: () => Promise<Response>
  ): Promise<Response> {
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    const key = `ratelimit:${ip}:${request.url}`;

    const { allowed, remaining } = await checkRateLimit(key, config);

    if (!allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': String(config.maxRequests),
            'X-RateLimit-Remaining': '0',
            'Retry-After': String(Math.ceil(config.windowMs / 1000)),
          },
        }
      );
    }

    const response = await handler();

    // Adiciona headers de rate limit na resposta
    response.headers.set('X-RateLimit-Limit', String(config.maxRequests));
    response.headers.set('X-RateLimit-Remaining', String(remaining));

    return response;
  };
}
```

### 2. Rate Limiting por Usuário (para progresso)

```typescript
// packages/core/src/services/progress-rate-limit.ts
import { checkRateLimit } from '../infrastructure/rate-limiter';

/**
 * Rate limit para writes de progresso
 * Máximo 10 writes por segundo por usuário
 */
export async function checkProgressRateLimit(
  userId: string
): Promise<boolean> {
  const { allowed } = await checkRateLimit(`progress:${userId}`, {
    windowMs: 1000, // 1 segundo
    maxRequests: 10,
  });

  return allowed;
}
```

### 3. Rate Limiting para Login

```typescript
// apps/admin/app/api/auth/login/route.ts
import { checkRateLimit } from '@projeto/core/infrastructure/rate-limiter';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  // Rate limit por email
  const { allowed } = await checkRateLimit(`login:${email}`, {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 5,
  });

  if (!allowed) {
    return Response.json(
      { error: 'Too many login attempts. Try again later.' },
      { status: 429 }
    );
  }

  // ... lógica de login
}
```

### 4. Fallback sem Redis (Desenvolvimento)

```typescript
// packages/core/src/infrastructure/rate-limiter-memory.ts

/**
 * Rate limiter em memória para desenvolvimento
 * NÃO usar em produção - não persiste entre instâncias
 */
const requestCounts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimitMemory(
  key: string,
  config: { windowMs: number; maxRequests: number }
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = requestCounts.get(key);

  // Se não existe ou janela expirou, criar nova entrada
  if (!entry || now > entry.resetAt) {
    requestCounts.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return { allowed: true, remaining: config.maxRequests - 1 };
  }

  // Incrementar contador
  entry.count++;

  return {
    allowed: entry.count <= config.maxRequests,
    remaining: Math.max(0, config.maxRequests - entry.count),
  };
}
```

---

## 📊 Métricas e Monitoramento

| Métrica | Descrição | Alerta |
|---|---|---|
| `rate_limit_hits` | Requests bloqueados por rate limit | > 100/min |
| `rate_limit_by_endpoint` | Hits por endpoint | Investigar padrões |
| `rate_limit_by_ip` | Hits por IP | Possível ataque |

---

## ⚠️ Regras de Ouro

1. **Login sempre protegido** — rate limit obrigatório em autenticação
2. **Headers de resposta** — sempre retornar `X-RateLimit-*` headers
3. **Retry-After** — informar quando o usuário pode tentar novamente
4. **Fallback em memória** — para desenvolvimento, nunca para produção
5. **Monitorar padrões** — alertar se um IP estiver sendo bloqueado frequentemente

---

## 📂 Onde Aplicar

- `packages/core/src/infrastructure/rate-limiter.ts`
- `apps/admin/app/api/auth/**/*.ts`
- `apps/student/app/api/**/*.ts`

---

## 🔗 Documentos Relacionados

- `docs/skills/redis_caching_strategy.md` — Cache Redis
- `docs/roadmaps/scalability-plan.md` — Plano de escalabilidade
- `docs/skills/security_xss_prevention.md` — Segurança
