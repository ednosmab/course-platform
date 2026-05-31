# 🏢 SKILL: MULTITENANCY WITH RLS

## 🎯 Objetivo
Implementar isolamento de dados entre tenants (escolas/clientes) usando Row Level Security (RLS) do PostgreSQL, garantindo que cada tenant só acesse seus próprios dados.

---

## 📋 Quando Usar Esta Skill
- Adicionar `tenant_id` em todas as tabelas
- Criar políticas RLS para isolamento
- Configurar `current_setting('app.current_tenant')`
- Validar isolamento entre tenants

---

## 🏗️ Arquitetura

```
[Request] → Middleware (resolve tenant) → SET LOCAL app.current_tenant → RLS filtra automaticamente
```

---

## 🛠️ Implementação

### 1. Tabela de Tenants

```sql
-- supabase/migrations/001_create_tenants.sql
CREATE TABLE tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,          -- "escola-abc"
  name text NOT NULL,                  -- "Escola ABC"
  domain text UNIQUE,                  -- "escolaabc.com" (custom domain)
  plan text DEFAULT 'free',            -- 'free', 'pro', 'enterprise'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índice para busca por slug (resolução de tenant)
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_domain ON tenants(domain);
```

### 2. Adicionar tenant_id em Tabelas Existentes

```sql
-- supabase/migrations/002_add_tenant_id.sql

-- Função para adicionar tenant_id em tabela existente
CREATE OR REPLACE FUNCTION add_tenant_id(table_name text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  EXECUTE format(
    'ALTER TABLE %I ADD COLUMN tenant_id uuid REFERENCES tenants(id)',
    table_name
  );
  EXECUTE format(
    'CREATE INDEX idx_%s_tenant ON %I(tenant_id)',
    table_name, table_name
  );
END;
$$;

-- Aplicar em todas as tabelas
SELECT add_tenant_id('courses');
SELECT add_tenant_id('modules');
SELECT add_tenant_id('lessons');
SELECT add_tenant_id('enrollments');
SELECT add_tenant_id('student_progress');
SELECT add_tenant_id('certificates');
SELECT add_tenant_id('forum_posts');
```

### 3. Habilitar RLS e Criar Políticas

```sql
-- supabase/migrations/003_enable_rls.sql

-- Habilitar RLS em todas as tabelas
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

-- Função para obter tenant_id do contexto atual
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT nullif(current_setting('app.current_tenant', true), '')::uuid;
$$;

-- Política para courses (leitura)
CREATE POLICY courses_tenant_isolation ON courses
  FOR SELECT
  USING (tenant_id = current_tenant_id());

-- Política para courses (escrita - admin/editor)
CREATE POLICY courses_tenant_insert ON courses
  FOR INSERT
  WITH CHECK (
    tenant_id = current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
      AND tenant_id = current_tenant_id()
    )
  );

-- Política para modules
CREATE POLICY modules_tenant_isolation ON modules
  FOR ALL
  USING (tenant_id = current_tenant_id());

-- Política para lessons
CREATE POLICY lessons_tenant_isolation ON lessons
  FOR ALL
  USING (tenant_id = current_tenant_id());

-- Política para enrollments (aluno vê suas matrículas)
CREATE POLICY enrollments_tenant_user ON enrollments
  FOR SELECT
  USING (
    tenant_id = current_tenant_id()
    AND user_id = auth.uid()
  );

-- Política para student_progress (aluno vê/edita seu progresso)
CREATE POLICY progress_tenant_user ON student_progress
  FOR ALL
  USING (
    tenant_id = current_tenant_id()
    AND user_id = auth.uid()
  );
```

### 4. Middleware para Configurar Tenant

```typescript
// apps/admin/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';
  const tenantSlug = host.split('.')[0];

  // Busca tenant_id pelo slug
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', tenantSlug)
    .single();

  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  }

  // Adiciona tenant_id nos headers para downstream
  const response = NextResponse.next();
  response.headers.set('x-tenant-id', tenant.id);

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### 5. Configurar Contexto no Supabase Client

```typescript
// packages/core/src/infrastructure/supabase-tenant.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Cria cliente Supabase com contexto de tenant
 * IMPORTANTE: Usar em Server-Side (Server Actions, API Routes)
 */
export function createTenantClient(tenantId: string): SupabaseClient {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'x-tenant-id': tenantId,
        },
      },
    }
  );

  return supabase;
}

/**
 * Para usar com RPC que configura o tenant
 */
export async function setTenantContext(
  supabase: SupabaseClient,
  tenantId: string
): Promise<void> {
  await supabase.rpc('set_tenant_context', { p_tenant_id: tenantId });
}
```

### 6. RPC para Configurar Tenant

```sql
-- supabase/migrations/004_set_tenant_context.sql
CREATE OR REPLACE FUNCTION set_tenant_context(p_tenant_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM set_config('app.current_tenant', p_tenant_id::text, true);
END;
$$;
```

---

## 📊 Validação de Isolamento

```sql
-- Teste de isolamento entre tenants
-- Rodar como usuário autenticado de um tenant

-- Deve retornar apenas cursos do tenant atual
SELECT * FROM courses; -- RLS filtra automaticamente

-- Não deve conseguir acessar curso de outro tenant
UPDATE courses SET title = 'HACKED'
WHERE id = 'curso-de-outro-tenant'; -- RLS bloqueia
```

---

## ⚠️ Regras de Ouro

1. **TODA tabela com tenant_id** — sem exceção
2. **RLS sempre habilitado** — NUNCA desabilitar em produção
3. **current_tenant_id() immutable** — não pode ser alterado pelo cliente
4. **Service Role ignora RLS** — usar com cuidado, apenas para operações admin
5. **Testar isolamento** — sempre validar que um tenant não acessa dados de outro

---

## 📂 Onde Aplicar

- `supabase/migrations/` — Todas as migrations de tabelas
- `packages/core/src/infrastructure/supabase-tenant.ts`
- `apps/admin/middleware.ts`
- `apps/student/middleware.ts`

---

## 🔗 Documentos Relacionados

- `docs/skills/supabase_rls.md` — RLS básico
- `docs/layers/supabase/database_schema_plan.md` — Schema do banco
- `docs/roadmaps/scalability-plan.md` — Plano de escalabilidade
