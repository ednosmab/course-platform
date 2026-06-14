# CURRENT_STATE.md — Arquitetura Actual (As-Built)

> **Data:** 2026-06-13
> **Base:** Código fonte (não documentação)
> **Versão:** 1.0
> **Metodologia:** Auditoria directa do código — apenas o que existe em produção conta como implementado.

---

## 1. Arquitetura Actual

### 1.1 Visão Geral do Monorepo

```
plataforma_cursos/
├── apps/
│   ├── admin/          → Next.js 16.2 (App Router) — CMS Admin
│   └── student/        → Expo 54 (Web + Mobile) — Player do Aluno
├── packages/
│   ├── core/           → Serviços, Domínio, Adapters
│   ├── types/          → Contratos Zod
│   ├── ui/             → Design System Tamagui
│   └── renderer/       → Motor de Renderização de Blocos
├── supabase/
│   └── migrations/     → 13 migrações SQL
└── docs/               → Documentação do projecto
```

### 1.2 Stack Tecnológica

| Camada | Tecnologia | Versão |
|---|---|---|
| Frontend Admin | Next.js (App Router) | 16.2 |
| Frontend Student | Expo + React Native | 54 |
| Estilização | Tamagui | — |
| Validação | Zod | — |
| Banco de Dados | PostgreSQL (Supabase) | — |
| Auth | Supabase Auth (JWT) | — |
| Storage | Supabase Storage | — |
| Testes | Vitest + @testing-library/react | — |
| CI/CD | GitHub Actions | — |

### 1.3 Componentes Existentes

**Apps:**
- `apps/admin/` — CMS Admin (Next.js)
- `apps/student/` — Player do Aluno (Expo Web + Mobile)

**Packages:**
- `packages/core/` — Lógica de negócio e infraestrutura
- `packages/types/` — Contratos Zod centralizados
- `packages/ui/` — Design System cross-platform (Tamagui)
- `packages/renderer/` — Motor de renderização de blocos JSONB

### 1.4 Serviços Implementados (packages/core)

| Serviço | Arquivo | Linhas | Estado |
|---|---|---|---|
| `CourseService` | `packages/core/src/services/course.ts` | 295 | ✅ Completo |
| `LessonService` | `packages/core/src/services/lesson.ts` | 141 | ✅ Completo |
| `ProgressService` | `packages/core/src/services/progress.ts` | 250 | ✅ Completo |
| `AuthService` | `packages/core/src/services/auth.ts` | 62 | ✅ Completo |
| `CertificateService` | `packages/core/src/services/certificate.ts` | — | ✅ Completo |
| `StorageService` | `packages/core/src/services/storage.ts` | 38 | ⚠️ Parcial |

**Total:** 6 serviços, ~926+ linhas de código de domínio.

### 1.5 Adapters Implementados (packages/core)

| Adapter | Arquivo | Linhas | Port |
|---|---|---|---|
| `supabaseCourseRepository` | `adapters/supabase-course-repository.ts` | 330 | `ICourseRepository` |
| `supabaseLessonRepository` | `adapters/supabase-lesson-repository.ts` | 160 | `ILessonRepository` |
| `supabaseProgressRepository` | `adapters/supabase-progress-repository.ts` | 136 | `IProgressRepository` |
| `supabaseStorageProvider` | `adapters/supabase-storage-provider.ts` | 52 | `IStorageProvider` |
| `supabaseAuthGateway` | `adapters/supabase-auth-gateway.ts` | — | `IAuthGateway` |
| `supabaseCertificateRepository` | `adapters/supabase-certificate-repository.ts` | — | `ICertificateRepository` |

**Total:** 6 adapters, ~718+ linhas de infraestrutura.

### 1.6 Ports (Interfaces)

| Port | Arquivo | Linhas |
|---|---|---|
| `ICourseRepository` | `ports/ICourseRepository.ts` | 251 |
| `ILessonRepository` | `ports/ILessonRepository.ts` | 98 |
| `IProgressRepository` | `ports/IProgressRepository.ts` | 94 |
| `IStorageProvider` | `ports/IStorageProvider.ts` | 32 |
| `IAuthGateway` | `ports/IAuthGateway.ts` | — |
| `ICertificateRepository` | `ports/ICertificateRepository.ts` | — |

**Total:** 6 interfaces, ~475+ linhas de contratos.

### 1.7 Fluxos Implementados

**Fluxo de Publicação (ADR-008):**
1. Professor edita no Canvas Admin
2. Blocos JSONB salvos via `LessonService.saveDraft()` → `supabaseLessonRepository`
3. Publicação: `LessonService.publishLesson()` incrementa `version` column
4. Draft separado via UUID mangling (suffix `dddddddddddd`)

**Fluxo de Progresso:**
1. Aluno assiste vídeo → `ProgressService.updateProgress()`
2. Debounce in-memory (5s) reduz writes ao Supabase
3. Regra 85%: `percentageWatched >= 85` → `completed = true`
4. Auto-issuance de certificado após conclusão

**Fluxo de Conteúdo:**
1. Student App busca aula via `LessonService.getLesson()`
2. Blocos JSONB retornados do Supabase
3. Validados via Zod (`packages/types`)
4. Renderizados por `BlockRenderer` (if-chain)
5. Polling 30s verifica `version` column para updates

### 1.8 Dependências Reais

**packages/core/package.json:**
- `@projeto/types`
- `@supabase/supabase-js`
- `zod`

**packages/ui/package.json:**
- `tamagui`
- `@tamagui/config`
- `lucide-react` (via wrapper)

**packages/renderer/package.json:**
- `react`
- `react-dom`

**Apps:**
- `next` (admin)
- `expo` (student)

**Não instalado:**
- ❌ `@upstash/redis`
- ❌ `ioredis`
- ❌ `rate-limiter-flexible`
- ❌ Qualquer dependência de cache distribuído

---

## 2. Banco de Dados

### 2.1 Migrações (13 ficheiros)

| # | Ficheiro | Propósito |
|---|---|---|
| 1 | `20260517000000_init_schema.sql` | Schema completo: 9 tabelas + RLS + triggers |
| 2 | `20260517000001_dev_permissions.sql` | Permissões dev (abertas) |
| 3 | `20260520000001_add_certificate_enabled.sql` | `certificate_enabled` em courses |
| 4 | `20260521000001_add_performance_indexes.sql` | Índices de performance (SCL-01) |
| 5 | `20260521000002_auto_confirm_users.sql` | Auto-confirm dev |
| 6 | `20260522000001_add_lesson_version.sql` | `version` column em lessons |
| 7 | `20260522000002_add_tests_completed.sql` | `tests_completed` JSONB em progress |
| 8 | `20260523000000_add_course_certificate_blocks.sql` | `certificate_blocks` em courses |
| 9 | `20260605000001_rename_uuid_bsgi_to_uuid_extranet.sql` | Rename coluna |
| 10 | `20260605000002_rename_index_uuid_bsgi_to_uuid_extranet.sql` | Rename índice |
| 11 | `20260610000001_add_course_access_control.sql` | course_access, plans, plan_courses, student_plans |
| 12 | `20260611000001_add_student_certificate_insert_policy.sql` | RLS INSERT certificates |
| 13 | `20260613000000_add_course_order_index.sql` | `order_index` em courses |

### 2.2 Tabelas Implementadas (11 tabelas)

| Tabela | Migração | Colunas Chave |
|---|---|---|
| `profiles` | init | id (uuid PK, FK auth.users), email, full_name, role |
| `courses` | init + 20260520 + 20260613 | id, author_id, title, is_published, certificate_blocks (JSONB), order_index |
| `lessons` | init + 20260522 | id, module_id, **blocks JSONB**, version, is_published |
| `modules` | init | id, course_id, title, order_index |
| `student_progress` | init + 20260522 | user_id, lesson_id, last_played_seconds, percentage_watched, completed, tests_completed (JSONB) |
| `enrollments` | init | user_id, course_id, path_id, status |
| `certificates` | init + 20260605 | user_id, course_id, uuid_extranet |
| `paths` | init | id, title, description, is_published |
| `path_courses` | init | path_id + course_id (composite PK), order_index |
| `course_access` | 20260610 | course_id, access_mode (free/progressive/restricted) |
| `plans` | 20260610 | id, name, description, is_active |
| `plan_courses` | 20260610 | plan_id + course_id (composite PK), order_index |
| `student_plans` | 20260610 | user_id, plan_id, assigned_at |

### 2.3 Índices Implementados

```sql
-- Performance (migração 20260521)
idx_courses_author ON courses(author_id)
idx_enrollments_user_course ON enrollments(user_id, course_id)
idx_modules_course_order ON modules(course_id, order_index)

-- JSONB (migração init)
idx_lessons_blocks_gin ON lessons USING gin(blocks)

-- Versionamento (migração 20260522)
idx_lessons_version ON lessons(id, version)
```

### 2.4 RLS Policies

**Implementado:** Todas as 11 tabelas têm RLS configurado na migração init (linhas 188-278).

**Problema:** A migração `20260517000001_dev_permissions.sql` remove as policies estritas e substitui por `USING (true) WITH CHECK (true)` em courses, lessons, paths, path_courses, modules — acesso totalmente aberto em dev.

### 2.5 Estratégia de Versionamento

**Implementada (ADR-008):**
- Published lessons: UUID real
- Draft lessons: UUID modificado (24 chars + suffix `dddddddddddd`)
- `version` column: Incrementada a cada publish
- Polling: Cliente verifica version a cada 30s

### 2.6 O que NÃO existe

- ❌ `tenant_id` em qualquer tabela (multitenancy)
- ❌ Tabelas de pagamento/facturação
- ❌ Tabelas de fórum
- ❌ Tabelas de notificações
- ❌ Tabelas de audit logs
- ❌ Read replicas configuradas
- ❌ Connection pooling configurado (porta 6543)

---

## 3. Renderização

### 3.1 Motor de Renderização (packages/renderer)

**Ficheiro principal:** `packages/renderer/src/BlockRenderer.tsx` (360 linhas)

**Abordagem:** If-chain (não usa registry apesar de existir)

**Tipos suportados:** 8

| Tipo | Componente | Estado |
|---|---|---|
| `text` | TextBlockRenderer | ✅ Implementado |
| `video` | VideoBlockRenderer | ✅ Implementado (placeholder estático) |
| `image` | ImageBlockRenderer | ✅ Implementado |
| `heading` | HeadingBlockRenderer | ✅ Implementado |
| `divider` | DividerBlockRenderer | ✅ Implementado |
| `quote` | QuoteBlockRenderer | ✅ Implementado |
| `html` | HtmlBlockRenderer | ✅ Implementado (iframe sandboxed) |
| `quiz` | QuizBlockRenderer | ✅ Implementado (display apenas) |

### 3.2 Componentes UI (packages/ui/src/blocks/)

| Bloco | Ficheiro | Linhas | Plataformas |
|---|---|---|---|
| `TextBlock` | `TextBlock.tsx` | 41 | Web + Mobile |
| `VideoBlock` | `VideoBlock.tsx` | 117 | Web (iframe) + Mobile (expo-av) |
| `QuizBlock` | `QuizBlock.tsx` | 129 | Web + Mobile |
| `ImageBlock` | `ImageBlock.tsx` | 35 | Web + Mobile |
| `HtmlBlock` | `HtmlBlock.tsx` | 40 | Web (iframe) + Mobile (text strip) |
| `QuoteBlock` | `QuoteBlock.tsx` | 41 | Web + Mobile |

### 3.3 Registry (packages/renderer/src/registry.ts)

**Existe:** Factory function `createRegistry()` com interface `BlockPlugin`.

**Problema:** Não é utilizado pelo `BlockRenderer` — este usa if-chain directamente.

### 3.4 Fluxo Real de Renderização

```
Supabase (JSONB blocks)
    ↓
Validação Zod (packages/types)
    ↓
BlockRenderer.tsx (if-chain)
    ↓
Componente Tamagui (packages/ui/src/blocks/)
    ↓
UI renderizada
```

### 3.5 Limitações Actuais

- ❌ Sem `React.lazy()` — todos os blocos são importados estaticamente
- ❌ Sem `IntersectionObserver` — blocos abaixo da dobra carregam na carga inicial
- ❌ Sem `<Skeleton />` — sem fallback de carregamento
- ❌ Registry existe mas não é utilizado
- ❌ Sem code splitting por bloco
- ❌ Sem Error Boundary por bloco (apenas global)

---

## 4. Cache

### 4.1 O que existe

| Tipo | Implementação | Localização |
|---|---|---|
| **Debounce in-memory** | Object JS `{}` com setTimeout 5s | `packages/core/src/services/progress.ts` (linhas 4-12, 219-248) |
| **Supabase client singleton** | Uma instância por processo | `packages/core/src/supabase.ts` (linha 19) |
| **DOMPurify cache** | Singleton purifier | `packages/ui/src/utils/sanitize.ts` (linhas 37-43) |

### 4.2 O que NÃO existe

| Capacidade | Estado | Evidência |
|---|---|---|
| **Redis** | ❌ NÃO IMPLEMENTADO | Directorio `packages/core/src/infrastructure/` não existe; zero dependências em package.json |
| **Cache distribuído** | ❌ NÃO IMPLEMENTADO | Zero código Redis/Memcached |
| **SWR** | ❌ NÃO IMPLEMENTADO | Zero uso de `useSWR` em qualquer ficheiro |
| **ISR** | ❌ NÃO IMPLEMENTADO | `next.config.ts` sem configuração revalidate |
| **Cache-aside** | ❌ NÃO IMPLEMENTADO | Apenas documentado em `docs/skills/redis_caching_strategy.md` |
| **Write-Behind** | ❌ NÃO IMPLEMENTADO | Apenas documentado em `docs/roadmaps/concentrador-de-dados.md` |
| **Cache headers** | ❌ NÃO IMPLEMENTADO | Zero `Cache-Control` em API routes |
| **Webhook invalidation** | ❌ NÃO IMPLEMENTADO | Zero webhook handlers |

### 4.3 Estratégia Actual de Sincronização

**Polling de versão (ADR-017):**
```typescript
// apps/student/src/components/LessonPlayer.tsx (linhas 115-141)
useEffect(() => {
  const interval = setInterval(async () => {
    const version = await LessonService.getLessonVersion(activeLessonId);
    if (version !== knownVersion) {
      const blocks = await LessonService.getLessonBlocks(activeLessonId);
      // actualizar estado
    }
  }, 30000); // 30 segundos
}, []);
```

**Realtime (ADR-013):**
- Subscrição directa ao Supabase Realtime
- Hook: `apps/student/src/hooks/useRealtimeSubscription.ts`
- Sem middleware de transformação

**Refresh no focus:**
- Re-fetch quando aba ganha focus (linhas 143-159)

---

## 5. Segurança

### 5.1 Middleware

**Admin App (`apps/admin/src/middleware.ts` — 78 linhas):**
- ✅ JWT validation via `@supabase/ssr`
- ✅ `supabase.auth.getUser()` no edge
- ✅ Redirect para login se não autenticado
- ✅ Bypass para paths públicos (`/login`, `/api/health`, etc.)
- ✅ E2E_BYPASS_AUTH para testes Playwright

**Student App:** ❌ NÃO EXISTE middleware (Expo, não Next.js)

### 5.2 Autenticação

**Implementada via Supabase Auth:**
- `AuthService.getSession()` — sessão activa
- `AuthService.signIn()` — login
- `AuthService.signOut()` — logout
- `AuthService.getProfile()` — perfil do utilizador
- JWT tokens via cookies (Admin) e AsyncStorage (Student)

### 5.3 Permissões

**RLS (Row Level Security):**
- ✅ Implementado em todas as 11 tabelas (migração init)
- ⚠️ Dev permissions removem restrições (acesso aberto)
- ❌ Sem multitenancy (sem `tenant_id`)

**Roles:**
- `student` — Aluno (padrão)
- `teacher` — Professor
- `admin` — Administrador

### 5.4 Rate Limiting

❌ **NÃO IMPLEMENTADO**

- Zero código de rate limiting
- Zero dependências de rate limiting
- Zero headers `X-RateLimit-*`
- Zero respostas 429
- Apenas documentado em `docs/skills/rate_limiting.md`

### 5.5 XSS Prevention

✅ **IMPLEMENTADO:**
- DOMPurify em `packages/ui/src/utils/sanitize.ts`
- HTML blocks em iframe sandboxed (`srcDoc`)
- Validação Zod em todos os inputs

### 5.6 Outros

- ❌ Sem WAF configurado
- ❌ Sem encryptação de dados pessoais para além do Supabase padrão
- ❌ Sem audit logs

---

## 6. Observabilidade

### 6.1 O que existe

| Capacidade | Estado | Evidência |
|---|---|---|
| **Logs estruturados** | ❌ STUB APENAS | `docs/layers/infra/observability.md` tem 6 linhas (cabeçalhos vazios) |
| **Métricas P95** | ❌ NÃO IMPLEMENTADO | Zero código de métricas |
| **Alertas** | ❌ NÃO IMPLEMENTADO | Zero configuração de alertas |
| **Tracing** | ❌ NÃO IMPLEMENTADO | Zero código de tracing |
| **Health checks** | ✅ IMPLEMENTADO | `/api/health` e `/api/ready` em admin |

### 6.2 Logs Actuais

- `console.log` / `console.error` dispersos no código
- Sem formato estruturado (JSON)
- Sem níveis de log (info, warn, error)
- Sem correlação de requests

### 6.3 Métricas Actuais

- Nenhuma métrica collectada
- Sem dashboards
- Sem SLIs/SLOs definidos

---

## 7. Escalabilidade

### 7.1 Classificação por Capacidade

| Capacidade | Estado | Evidência |
|---|---|---|
| **Database Health Monitoring** | ✅ RESOLVIDO (ADR-022) | Hipótese de pooling invalidada — acesso via SDK HTTP, Supabase gere pool internamente. `getSupabaseAdmin()` mantido. Artefatos de pooling removidos. |
| **Rate Limiting** | ❌ NÃO IMPLEMENTADO | Zero código; zero dependências; zero headers |
| **Cache Redis** | ❌ NÃO IMPLEMENTADO | Zero código; zero dependências; directorio infrastructure não existe |
| **CDN Streaming** | ❌ NÃO IMPLEMENTADO | Vídeos apenas como URLs externas (YouTube/Vimeo); sem Bunny.net/Cloudflare |
| **Multitenancy** | ❌ NÃO IMPLEMENTADO | Zero colunas `tenant_id` em 13 migrações |
| **Read Replicas** | ❌ NÃO IMPLEMENTADO | Zero configuração; apenas documentado em scalability-plan.md |
| **Cache Invalidation** | ⚠️ PARCIAL | Polling 30s (não é invalidação real); sem SWR/ISR/webhooks |
| **Debounce Writes** | ✅ IMPLEMENTADO | 5s debounce in-memory em progress.ts |
| **Version Polling** | ✅ IMPLEMENTADO | 30s interval em LessonPlayer.tsx |
| **Realtime** | ✅ IMPLEMENTADO | Subscrição directa Supabase Realtime (ADR-013) |
| **JSONB + GIN Index** | ✅ IMPLEMENTADO | `blocks` column + `idx_lessons_blocks_gin` |
| **Performance Indexes** | ✅ IMPLEMENTADO | 5+ índices compostos (SCL-01) |

### 7.2 Gargalos Identificados

**Críticos (sem mitigação):**
1. **Conexões Supabase:** 400 pooler (Pro) vs 10k users = potencial deadlock
2. **Rate Limiting:** Zero protecção contra abuso
3. **Cache Redis:** Cada request = query directa ao banco

**Altos:**
4. **CDN:** Vídeos 1080p = ~5MB/min × 10k users = sobrecarga
5. **Polling 30s:** 10k users × 2 queries/min = 20k queries/min
6. **Multitenancy:** Dados misturados entre organizações

### 7.3 Limites Supabase (Plano Pro)

| Recurso | Limite | Utilização Actual |
|---|---|---|
| Conexões diretas (5432) | 90 | Desconhecido |
| Conexões Pooler (6543) | 400 | Não configurado |
| Storage | 100GB | Parcial (thumbnails + certificados) |
| Realtime conexões | 200 | Desconhecido |
| Edge Functions | 500k/mês | Não utilizado |

---

## 8. Resumo Executivo

### O que está implementado (40%):
- ✅ Banco de dados completo (13 migrações, 11 tabelas)
- ✅ 6 serviços de domínio com Ports & Adapters
- ✅ Motor de renderização com 8 tipos de blocos
- ✅ Design System Tamagui cross-platform
- ✅ Middleware de auth no Admin
- ✅ RLS em todas as tabelas
- ✅ Debounce de progresso
- ✅ Polling de versão

### O que está documentado mas NÃO implementado (50%):
- ❌ Redis cache
- ❌ Rate limiting
- ❌ Connection pooling
- ❌ CDN streaming
- ❌ Multitenancy
- ❌ Observabilidade
- ❌ Write-Behind
- ❌ SWR/ISR
- ❌ Read replicas

### O que está parcialmente implementado (10%):
- ⚠️ Cache invalidation (apenas polling)
- ⚠️ StorageService (apenas thumbnails)
- ⚠️ Registry de blocos (existe mas não é usado)

---

## 9. Referências

**Evidências de código:**
- `packages/core/src/services/` — 6 serviços
- `packages/core/src/adapters/` — 6 adapters
- `packages/core/src/ports/` — 6 interfaces
- `packages/renderer/src/BlockRenderer.tsx` — 360 linhas
- `packages/ui/src/blocks/` — 6 componentes
- `supabase/migrations/` — 13 ficheiros SQL
- `apps/admin/src/middleware.ts` — 78 linhas

**Documentos de referência (não utilizados como fonte):**
- `docs/roadmaps/scalability-plan.md` — Plano futuro
- `docs/skills/redis_caching_strategy.md` — Design Redis
- `docs/skills/rate_limiting.md` — Design rate limiting
- `docs/skills/connection_pooling.md` — Design pooling

---

> ⚠️ **Nota:** Este documento é a fonte de verdade para a arquitetura actual. Qualquer decisão de escalabilidade deve considerar apenas o que está documentado aqui, não o que está em roadmaps ou ADRs futuros.
