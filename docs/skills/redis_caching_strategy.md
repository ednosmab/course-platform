# 🚀 SKILL: REDIS CACHING & WRITE-BEHIND STRATEGY

## 🎯 Objetivo
Implementar cache distribuído com Redis para proteger o banco de dados contra sobrecarga de leitura e escrita, garantindo resiliência em conexões móveis instáveis.

---

## 📋 Quando Usar Esta Skill
- Implementar cache de leitura para catálogo de cursos
- Implementar Write-Behind para progresso de aulas
- Configurar TTLs e estratégias de invalidação
- Implementar fallback quando Redis estiver indisponível

---

## 🏗️ Arquitetura

```
[Leitura]
Expo (Aluno) → Cache Local (SWR 30s) → Redis (60-300s) → Supabase

[Escrita - Progresso]
Expo (Aluno) → POST /api/progress → Redis Queue → Cron (10s) → Supabase (bulk upsert)
```

---

## 🛠️ Implementação

### 1. Configuração do Cliente Redis (Upstash)

```typescript
// packages/core/src/infrastructure/redis.ts
import { Redis } from '@upstash/redis';

export const redis = Redis.fromEnv();

// Verificação de saúde
export async function checkRedisHealth(): Promise<boolean> {
  try {
    await redis.ping();
    return true;
  } catch {
    return false;
  }
}
```

### 2. Cache de Leitura (Cache-Aside)

```typescript
// packages/core/src/services/catalog-cache.ts
import { redis } from '../infrastructure/redis';

const CACHE_TTL = {
  CATALOG: 60,        // 1 minuto - catálogo público
  COURSE_DETAIL: 300, // 5 minutos - detalhe do curso
  USER_PROFILE: 300,  // 5 minutos - perfil do usuário
  PROGRESS: 30,       // 30 segundos - progresso do aluno
} as const;

/**
 * Busca dado com cache-aside pattern
 * Se não existir no cache, busca no Supabase e salva
 */
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 60
): Promise<T> {
  // Tenta buscar do cache
  const cached = await redis.get<T>(key);
  if (cached) return cached;

  // Busca da fonte original
  const data = await fetcher();

  // Salva no cache com TTL
  await redis.set(key, data, { ex: ttl });

  return data;
}

/**
 * Invalida cache por padrão (wildcard)
 */
export async function invalidateCache(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
```

### 3. Write-Behind para Progresso

```typescript
// packages/core/src/services/progress-queue.ts
import { redis } from '../infrastructure/redis';

interface ProgressPayload {
  userId: string;
  lessonId: string;
  courseId: string;
  completed: boolean;
  updatedAt: string;
}

/**
 * Enfileira progresso para processamento em lote
 * Fallback: se Redis cair, grava direto no Supabase
 */
export async function enqueueProgress(payload: ProgressPayload): Promise<void> {
  try {
    await redis.rpush('queue:progress', JSON.stringify(payload));
  } catch (error) {
    // Fallback: grava direto no Supabase com rate limit
    console.warn('[ProgressQueue] Redis unavailable, writing directly to Supabase');
    await writeProgressDirectly(payload);
  }
}

/**
 * Processa fila de progresso em lote (bulk upsert)
 * Executado via cron a cada 10 segundos
 */
export async function processProgressQueue(): Promise<number> {
  const items = await redis.lrange('queue:progress', 0, -1);

  if (items.length === 0) return 0;

  // Remove itens processados
  await redis.ltrim('queue:progress', items.length, -1);

  // Converte para formato do banco
  const records = items.map((item) => {
    const parsed = JSON.parse(item) as ProgressPayload;
    return {
      user_id: parsed.userId,
      lesson_id: parsed.lessonId,
      course_id: parsed.courseId,
      is_completed: parsed.completed,
      updated_at: parsed.updatedAt,
    };
  });

  // Bulk upsert no Supabase
  const { error } = await supabase
    .from('student_progress')
    .upsert(records, { onConflict: 'user_id,lesson_id' });

  if (error) throw error;

  return records.length;
}
```

### 4. Fallback para Falha do Redis

```typescript
// packages/core/src/services/progress-fallback.ts

/**
 * Rate limit para fallback direto ao banco
 * Máximo 10 writes por segundo por usuário
 */
const userRateLimits = new Map<string, number[]>();

function checkRateLimit(userId: string, maxPerSecond = 10): boolean {
  const now = Date.now();
  const userTimestamps = userRateLimits.get(userId) ?? [];

  // Remove timestamps antigos (> 1 segundo)
  const recentTimestamps = userTimestamps.filter((t) => now - t < 1000);

  if (recentTimestamps.length >= maxPerSecond) {
    return false; // Rate limit excedido
  }

  recentTimestamps.push(now);
  userRateLimits.set(userId, recentTimestamps);

  return true;
}

/**
 * Grava progresso diretamente no Supabase (fallback)
 */
async function writeProgressDirectly(payload: ProgressPayload): Promise<void> {
  if (!checkRateLimit(payload.userId)) {
    console.warn(`[ProgressFallback] Rate limit exceeded for user ${payload.userId}`);
    return;
  }

  const { error } = await supabase.from('student_progress').upsert(
    {
      user_id: payload.userId,
      lesson_id: payload.lessonId,
      course_id: payload.courseId,
      is_completed: payload.completed,
      updated_at: payload.updatedAt,
    },
    { onConflict: 'user_id,lesson_id' }
  );

  if (error) {
    console.error('[ProgressFallback] Direct write failed:', error);
  }
}
```

---

## 📊 Métricas e Monitoramento

| Métrica | Descrição | Alerta |
|---|---|---|
| `redis_hit_rate` | % de hits no cache | < 80% |
| `redis_latency_ms` | Latência média do Redis | > 10ms |
| `queue_length` | Itens pendentes na fila | > 10.000 |
| `queue_process_rate` | Itens processados por ciclo | < 100/s |
| `fallback_rate` | Fallbacks para escrita direta | > 5% |

---

## ⚠️ Regras de Ouro

1. **Nunca usar Redis como fonte de verdade** — sempre validar no Supabase
2. **TTL obrigatório** — todo dado no Redis deve ter expiração
3. **Fallback sempre ativo** — se Redis cair, o sistema continua funcionando
4. **Monitorar fila** — alertar se fila crescer mais de 10k itens
5. **Invalidação de cache** — ao atualizar dados, invalidar chaves relacionadas

---

## 📂 Onde Aplicar

- `packages/core/src/infrastructure/redis.ts`
- `packages/core/src/services/catalog-cache.ts`
- `packages/core/src/services/progress-queue.ts`
- `apps/student/` (via API routes do Next.js)

---

## 🔗 Documentos Relacionados

- `docs/roadmaps/concentrador-de-dados.md` — Arquitetura Write-Behind completa
- `docs/roadmaps/scalability-plan.md` — Plano de escalabilidade
- `docs/skills/postgresql_performance.md` — Performance do banco
