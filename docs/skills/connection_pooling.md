# 🔌 SKILL: CONNECTION POOLING & PGBOUNCER

## 🎯 Objetivo
Gerenciar conexões com o PostgreSQL de forma eficiente, evitando exceder o limite de conexões do Supabase e garantindo performance sob carga.

---

## 📋 Quando Usar Esta Skill
- Configurar Pooler do Supabase (porta 6543)
- Decidir entre porta direta (5432) e Pooler (6543)
- Otimizar uso de conexões em Edge Functions
- Monitorar conexões ativas

---

## 🏗️ Visão Geral

| Porta | Modo | Uso Recomendado |
|---|---|---|
| `5432` | Direta | Migrations, operações admin, scripts |
| `6543` | Transaction (PgBouncer) | App do aluno, Edge Functions, writes |

---

## 🛠️ Implementação

### 1. Configuração do Supabase Client

```typescript
// packages/core/src/infrastructure/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Cliente para operações normais (usa Pooler automaticamente)
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Cliente com Service Role (para operações admin)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

### 2. Edge Functions — Sempre usar Pooler

```typescript
// apps/admin/app/api/courses/route.ts
// ✅ CORRETO: Edge Functions devem usar Pooler (porta 6543)
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  // O Supabase client já usa Pooler automaticamente em Edge Runtime
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('courses')
    .select('*');

  return Response.json(data);
}
```

### 3. Server Actions — Pooler para reads, Direta para migrations

```typescript
// apps/admin/app/actions/course-actions.ts
'use server';

import { createClient } from '@supabase/supabase-js';

// ✅ Server Actions em runtime Node.js podem usar porta 5432
// Mas Pooler (6543) também funciona e é mais seguro
export async function createCourse(data: CourseInput) {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: course, error } = await supabase
    .from('courses')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return course;
}
```

### 4. Monitoramento de Conexões

> ⚠️ **Nota (ADR-022):** A monitoramento de pool foi removida do código.
> O acesso é via SDK HTTP — o Supabase gere internamente o pool.
> Para monitoring de BD, usar o Supabase Dashboard (built-in).

/**
 * RPC para buscar estatísticas de conexões
 * Criar no Supabase:
 */
/*
CREATE OR REPLACE FUNCTION get_connection_stats()
RETURNS TABLE(active bigint, idle bigint, total bigint)
LANGUAGE sql
AS $$
  SELECT
    count(*) FILTER (WHERE state = 'active') as active,
    count(*) FILTER (WHERE state = 'idle') as idle,
    count(*) as total
  FROM pg_stat_activity
  WHERE datname = current_database();
$$;
*/
```

---

## 📊 Limites do Supabase

| Plano | Conexões Diretas (5432) | Pooler (6543) |
|---|---|---|
| Free | 60 | 200 |
| Pro | 90 | 400 |
| Team | 200 | 800 |

**Regra:** Em produção, sempre usar Pooler (6543) para apps.

---

## ⚠️ Regras de Ouro

1. **Edge Functions = Pooler** — sempre porta 6543 em Edge Runtime
2. **Nunca expor string de conexão direta** — usar variáveis de ambiente
3. **Monitorar conexões** — alertar quando > 80% do limite
4. **Fechar conexões** — nunca manter conexões abertas desnecessariamente
5. **Connection timeout** — configurar timeout de 30 segundos

---

## 📂 Onde Aplicar

- `packages/core/src/infrastructure/supabase.ts`
- `apps/admin/app/api/**/*.ts`
- `apps/student/app/api/**/*.ts`
- `supabase/functions/**/*.ts`

---

## 🔗 Documentos Relacionados

- `docs/skills/postgresql_performance.md` — Performance PostgreSQL
- `docs/skills/supabase_rls.md` — Segurança RLS
- `docs/roadmaps/scalability-plan.md` — Plano de escalabilidade
