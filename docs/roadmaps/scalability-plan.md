# Plano de Escalabilidade — Unificado (3k → 50k+ Conexões Simultâneas)

> **Status:** Documento de referência estratégica. Implementação condicionada ao aceite do cliente.
> **Última atualização:** 2026-06-25
> **Revisão V2:** Alinhado com ADR-022 (connection pooling removido), BACKLOG_TECHNICAL_DEBT.md (prioridades P0-P3) e princípios "Medir → Validar → Justificar → Implementar".

---

## Objetivo

Garantir que a plataforma sustente **3.000 usuários simultâneos (média)** com picos de **10.000+** sem degradação de performance, com arquitetura preparada para escalar horizontalmente até **50.000+** no futuro.

---

## 1. Visão Geral da Arquitetura em Camadas

```
[Camada 1: Entrada]      → Vercel Edge (Wildcard + Domínios Customizados)
         │
[Camada 2: Aplicação]    → Next.js (CMS Admin) + Expo Web (App Aluno)
         │
[Camada 3: Cache]        → Vercel CDN (SWR) | Redis (Server) | localStorage | Cache Storage
         │
[Camada 4: Banco]        → Supabase Único (SDK HTTP + RLS + Write-Behind via Redis)
         │
[Camada 5: Mídia]        → Bunny.net / Cloudflare Stream (HLS Adaptativo)
         │
[Camada 6: Observabilidade] → Logs Estruturados | Métricas P95 | Alertas
```

---

## 2. Camada 1 — Entrada e Roteamento (Vercel Edge)

| Requisito | Solução |
|---|---|
| Domínio CMS central | `suaplataforma.com` (login com `tenant_id`) |
| Subdomínios aluno | `*.suaplataforma.com` (wildcard) |
| Domínios customizados | Vercel intercepta `Host` header → mesmo app Expo |
| Edge Functions | Autenticação JWT + rate limit checks |

**Resolução de tenant via middleware:**
```typescript
// middleware.ts — resolve tenant a partir do Host
export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';
  const tenantSlug = host.split('.')[0];
  // Anexa x-tenant-id ao request para downstream
}
```

---

## 3. Camada 2 — Aplicação Monorepo

| App | Stack | Responsabilidade |
|---|---|---|
| `apps/admin` | Next.js (App Router) | CMS, gestão de cursos, fórum, relatórios |
| `apps/student` | Expo Web (`npx expo export --platform web`) | Consumo de aulas, progresso, certificados |
| `packages/core` | Serviços + Domínio | `ProgressService`, `CertificateService`, `CourseService` |
| `packages/types` | Contratos + Zod | Validação de todos os payloads |
| `packages/ui` | Tamagui | Design System cross-platform |

---

## 4. Camada 3 — Cache e Resiliência

### 4.1 Cache Client-Side (Browser do Aluno)

| Camada | Onde | TTL | Limite |
|---|---|---|---|
| SWR (Revalidate) | Conteúdo de aulas e fóruns | 30s stale-while-revalidate | Global |
| localStorage | Textos e links do módulo atual (~2KB/aula) | Sessão | 5MB (exclusão automática do módulo anterior) |
| Cache Storage API | Vídeos brutos (1-2 aulas) | Sessão | 500MB-1GB (realista por browser) |

### 4.2 Cache Server-Side (Redis)

| Dado | TTL | Estratégia |
|---|---|---|
| Catálogo de cursos públicos | 60s | Cache-aside |
| Perfil do usuário | 300s | Write-through |
| Progresso do aluno (leitura) | 30s | Cache-aside |
| Sessão JWT | Até expirar | Write-through |
| Rate limit counters | 1s-60s | Sliding window |
| Fila de progresso | até processar | Write-Behind |

### 4.3 Write-Behind para Progresso

```
Expo (Aluno) → POST /api/progress → Redis Queue → Cron (10s) → Supabase (bulk upsert)
```

**Fallback se Redis cair:** Gravar direto no Supabase com rate limit (máx 10 writes/s por usuário).

Referência: [`docs/roadmaps/concentrador-de-dados.md`](./concentrador-de-dados.md)

---

## 5. Camada 4 — Banco de Dados (Supabase)

### 5.1 Modelagem Multitenant

```sql
-- Adicionar tenant_id em todas as tabelas de dados
ALTER TABLE courses ADD COLUMN tenant_id uuid REFERENCES tenants(id);
ALTER TABLE lessons ADD COLUMN tenant_id uuid REFERENCES tenants(id);
ALTER TABLE student_progress ADD COLUMN tenant_id uuid REFERENCES tenants(id);
-- ... demais tabelas
```

### 5.2 RLS Otimizado

| Regra | Implementação |
|---|---|
| Filtrar por `tenant_id` | `WHERE tenant_id = current_setting('app.current_tenant')::uuid` |
| Evitar subqueries | Usar `IN` com arrays ou joins simples |
| Índices compostos | `(tenant_id, user_id)`, `(tenant_id, course_id)` |
| security_invoker | Aplicar em views para herdar contexto do chamador |

### 5.3 Connection Pooling

> ⚠️ **Nota (ADR-022):** O acesso à BD é exclusivamente via SDK HTTP (`supabase-js`). O Supabase gere internamente o pool de conexões PostgreSQL. Não há pool client-side. A task SCL-05 foi removida. Ver `docs/adrs/ADR-022-connection-pooling-removal.md` para detalhes.
>
> **Referência histórica** (não requer acção): A porta 6543 do Supabase usa PgBouncer internamente, mas a aplicação não precisa de a gerir — o SDK HTTP já a utiliza automaticamente quando a URL do Supabase aponta para o Pooler.

### 5.4 Índices Obrigatórios

```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_tenant ON courses(tenant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lessons_tenant ON lessons(tenant_id, module_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_progress_tenant_user ON student_progress(tenant_id, user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_enrollments_tenant ON enrollments(tenant_id, user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_tenant ON audit_logs(tenant_id, created_at DESC);
```

### 5.5 Read Replicas (50k+)

- Supabase Read Replicas para queries de relatório e catálogo
- Conexão separada: `SUPABASE_DB_URL_READER`

---

## 6. Camada 5 — Mídia e Streaming

| Provedor | Protocolo | Recurso |
|---|---|---|
| Bunny.net | HLS adaptativo (480p/720p/1080p) | CDN global, URLs assinadas (1h) |
| Cloudflare Stream | HLS adaptativo | Alternativa, mesma latência |
| Supabase Storage | Signed URLs | PDFs, thumbnails (não vídeos) |

**Cache de chunks:** CDN edge caching para reduzir latência em regiões com alta concentração de alunos.

---

## 7. Camada 6 — Observabilidade

### 7.1 Métricas Essenciais

| Métrica | Onde | Alerta em |
|---|---|---|
| P95 response time | API endpoints | > 500ms |
| Conexões DB ativas | Supabase Dashboard | > 80% pool |
| Rate limit hits | Redis | > 1000/min |
| Erros 5xx | API | > 1% |
| Realtime conexões | Supabase | > 80% limite |
| Fila de progresso (Redis) | `queue:progress` length | > 10.000 itens |

### 7.2 Logs Estruturados

```typescript
console.log(JSON.stringify({
  level: 'error',
  service: 'student',
  operation: 'sync_progress',
  tenantId: tenant.id,
  userId: user.id,
  duration: Date.now() - start,
  error: err.message,
  requestId: crypto.randomUUID(),
}));
```

---

## 8. Evolução por Fase (Com Custos Estimados)

| Fase | Alunos Simultâneos | Ações | Custos Estimados |
|---|---|---|---|
| **1. Fundação** | Até 3.000 | Supabase Pro, Vercel Hobby, observabilidade básica | $25-50/mês |
| **2. Tração** | 3.000 - 15.000 | Upgrade Supabase Compute, Redis Upstash, cache layer | $80-130/mês |
| **3. Alta Escala** | 15.000 - 50.000 | Supabase Large, Read Replicas, WebSocket, CDN | $345-505/mês |
| **4. Massiva** | 50.000+ | Sharding por tenant, CDN multi-região, Auto-scaling | $500+/mês |

---

## 9. Plano de Execução (Tasks)

> ⚠️ **Autoridade de Priorização:** As tasks abaixo são alinhadas com `BACKLOG_TECHNICAL_DEBT.md` (fonte de verdade para priorização operacional). Itens marcados com ⏭️ estão adiados por falta de pré-condições (métricas, gate de dados).

### Fase 1 — Segurança e Fundação (sem gate)
- [x] **SCL-01:** Configurar índices PostgreSQL para consultas frequentes
- [x] **P0-01:** Rate limiting in-memory (sliding window) — *Feito 2026-06-13*
- [x] **P0-02:** Dev RLS override — advertência de segurança — *Feito 2026-06-13*
- [x] **P0-03:** Database connectivity — ENCERRADO (ADR-022) — *Concluído 2026-06-13*
- [ ] **P1-01:** Observabilidade (logs JSON, métricas P95, alertas) ⏭️ *Pendente — pré-requisito para Fase 3*
- [ ] **P1-02:** Testes de carga (k6/artillery) ⏭️ *Pendente — depende de P1-01*

### Fase 2 — 3.000 Alunos (gate: métricas P1-01 colectadas)
- [ ] **SCL-06:** Otimizar RLS policies (remover subqueries, índices compostos)
- [ ] **SCL-07:** Estratégia de fallback Realtime-to-polling
- [ ] **SCL-08:** Backoff exponencial no mobile
- [ ] **SCL-20:** Cache client-side (SWR + localStorage + Cache Storage)
- [ ] **P1-03:** Cache invalidation (SWR, cache headers) — *gate: hit rate < 80%*
- [ ] **P2-01:** Cache Redis (cache-aside) — *gate: queries > 50/s (ADR-017)*
- [ ] **P2-02:** Write-Behind para progresso — *gate: writes > 100/s (substitui SCL-19)*
- [ ] **P1-04:** Monitoramento de conexões (RPC + dashboard) — *gate: P1-01 funcional*

### Fase 3 — 10.000+ Alunos (gate: 1.000+ users activos mensais)
- [ ] **SCL-09:** Migrar para Edge Runtime em rotas críticas
- [ ] **SCL-10:** Implementar read replicas do PostgreSQL — *gate: 5k+ users*
- [ ] **SCL-11:** WebSocket próprio para realtime — *gate: >80% limite Supabase Realtime*
- [ ] **SCL-12:** Cache distribuído com Redis Cluster — *evolução de P2-01 para escala*
- [ ] **P3-01:** CDN para vídeo (Bunny.net) — *gate: 1k+ users activos*

### Fase 4 — 50.000+ Alunos (gate: escala extrema)
- [ ] **SCL-13:** Auto-scaling de instâncias Next.js
- [ ] **SCL-14:** Sharding de banco de dados por organização/tenant
- [ ] **SCL-15:** CDN multi-região para vídeos
- [ ] **SCL-16:** Service Workers para cache offline avançado
- [ ] **P3-03:** Read Replicas — *gate: 5k+ users simultâneos*
- [ ] **P3-04:** WebSocket próprio — *gate: >500 users Realtime*
- [ ] **P3-05:** Service Workers — *gate: 10k+ users*

### Multitenancy — Condicional ao Modelo de Negócio
> A implementação de multitenancy depende do modelo de comercialização:
> - **B2B SaaS (white-label):** Multitenancy é pré-requisito → atacar em Fase 1/2
> - **Marketplace (tipo Hotmart):** Multitenancy NÃO é necessário → remover SCL-17/SCL-18
>
> **Referência:** `BACKLOG_TECHNICAL_DEBT.md` §P3-02 (gate: >1 cliente formal)

- [ ] **SCL-17:** Adicionar `tenant_id` em todas as tabelas ⏭️ *Adiado — aguarda decisão de modelo de negócio*
- [ ] **SCL-18:** Middleware de resolução de tenant via hostname ⏭️ *Adiado — aguarda SCL-17*

---

## 10. Documentos Relacionados

- [`docs/roadmaps/concentrador-de-dados.md`](./concentrador-de-dados.md) — Write-Behind Cache para progresso
- [`docs/layers/core/offline-strategy.md`](../layers/core/offline-strategy.md) — Estratégia offline-first
- [`docs/skills/optimistic_ui.md`](../skills/optimistic_ui.md) — Optimistic updates
- [`docs/skills/postgresql_performance.md`](../skills/postgresql_performance.md) — Performance PostgreSQL
- [`docs/skills/supabase_rls.md`](../skills/supabase_rls.md) — Segurança RLS
- [`docs/BACKLOG_TECHNICAL_DEBT.md`](../BACKLOG_TECHNICAL_DEBT.md) — Fonte de verdade para priorização P0-P3
- [`docs/adrs/ADR-017-version-sync-trava.md`](../adrs/ADR-017-version-sync-trava.md) — Trava contra refatoração prematura
- [`docs/adrs/ADR-022-connection-pooling-removal.md`](../adrs/ADR-022-connection-pooling-removal.md) — Remoção de connection pooling code
- [`docs/adrs/ADR-023-offline-first-sqlite.md`](../adrs/ADR-023-offline-first-sqlite.md) — Offline-first com expo-sqlite

---

> ⚠️ **Nota:** Este plano é um documento de referência. As prioridades operacionais seguem `BACKLOG_TECHNICAL_DEBT.md`. A implementação é condicionada ao princípio "Medir → Validar → Justificar → Implementar".
