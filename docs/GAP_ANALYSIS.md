# GAP_ANALYSIS.md — Documentado vs Implementado

> **Data:** 2026-06-13
> **Metodologia:** Comparação item por item — documentação vs código real
> **Base:** `CURRENT_STATE.md` (arquitetura as-built) + auditoria directa do código

---

## 1. Legenda

| Status | Significado |
|---|---|
| ✅ **OK** | Implementado conforme documentado |
| ⚠️ **Parcial** | Implementado mas difere do documentado ou incompleto |
| 🔀 **Divergente** | Implementado de forma diferente do documentado |
| ❌ **Não implementado** | Documentado mas zero código |
| 🚫 **Inexistente** | Não documentado nem implementado |

---

## 2. Tabela Comparativa — Infraestrutura

| Capacidade | Documentado Em | Implementado Em | Estado | Evidência |
|---|---|---|---|---|
| **Redis Cache** | `docs/skills/redis_caching_strategy.md` (249 linhas) | Nenhum ficheiro | ❌ Não implementado | Directorio `packages/core/src/infrastructure/` não existe; zero dependências `@upstash/redis` em package.json |
| **Rate Limiting** | `docs/skills/rate_limiting.md` (233 linhas) | Nenhum ficheiro | ❌ Não implementado | Zero código `checkRateLimit`; zero headers `X-RateLimit-*`; zero respostas 429 |
| **Database Health Monitoring** | `docs/skills/connection_pooling.md` (176 linhas) | `packages/core/src/supabase.ts` | ✅ Resolvido (ADR-022) | Acesso via SDK HTTP — pooling gereado pelo Supabase internamente. Não há pool client-side. `getSupabaseAdmin()` mantido para operações server-side. Artefatos de pooling removidos. |
| **CDN Streaming** | `Requisitos_plataforma.md` + `docs/skills/video_streaming_cdn.md` | Nenhum ficheiro | ❌ Não implementado | Vídeos apenas URLs externas (YouTube/Vimeo); sem Bunny.net/Cloudflare |
| **Multitenancy** | `docs/skills/multitenancy_rls.md` | Nenhum ficheiro | ❌ Não implementado | Zero colunas `tenant_id` em 13 migrações |
| **Read Replicas** | `docs/roadmaps/scalability-plan.md` (SCL-10) | Nenhum ficheiro | ❌ Não implementado | Zero configuração; apenas roadmap item |
| **Write-Behind** | `docs/roadmaps/concentrador-de-dados.md` | Nenhum ficheiro | ❌ Não implementado | Apenas debounce in-memory (5s) em progress.ts |
| **SWR/ISR** | `docs/skills/nextjs_performance_seo.md` | Nenhum ficheiro | ❌ Não implementado | Zero uso de `useSWR`; `next.config.ts` sem revalidate |
| **Observabilidade** | `docs/layers/infra/observability.md` (6 linhas stub) | Nenhum ficheiro | ❌ Não implementado | Stub vazio; zero métricas, alertas, tracing |
| **Health Checks** | Implícito em boas práticas | `apps/admin/src/app/api/health/route.ts` | ✅ OK | 2 endpoints funcionais (health + ready) |

---

## 3. Tabela Comparativa — Banco de Dados

| Capacidade | Documentado Em | Implementado Em | Estado | Evidência |
|---|---|---|---|---|
| **Schema Completo** | `docs/layers/supabase/database_schema_plan.md` | `20260517000000_init_schema.sql` | ✅ OK | 11 tabelas implementadas conforme spec |
| **JSONB Blocks** | `docs/layers/supabase/database_schema_plan.md` | `init_schema.sql:83` | ✅ OK | `blocks jsonb not null default '[]'::jsonb` |
| **GIN Index** | `docs/layers/supabase/database_schema_plan.md` | `init_schema.sql:131` | ✅ OK | `idx_lessons_blocks_gin ON lessons USING gin(blocks)` |
| **Performance Indexes** | `docs/roadmaps/scalability-plan.md` (SCL-01) | `20260521000001_add_performance_indexes.sql` | ✅ OK | 5+ índices compostos implementados |
| **RLS Policies** | `docs/skills/supabase_rls.md` | `init_schema.sql:188-278` | ⚠️ Parcial | Implementado mas dev permissions removem restrições |
| **Versionamento** | ADR-008 | `20260522000001_add_lesson_version.sql` + `supabase-lesson-repository.ts` | ✅ OK | UUID mangling + version column + polling |
| **tenant_id** | `docs/skills/multitenancy_rls.md` | Nenhuma migração | ❌ Não implementado | Zero colunas tenant_id em todas as tabelas |
| **Payment Tables** | `Requisitos_plataforma.md` | Nenhuma migração | ❌ Não implementado | Sem tabelas de pagamento/facturação |
| **Forum Tables** | Implícito em requisitos | Nenhuma migração | ❌ Não implementado | Sem tabelas de fórum |
| **Notification Tables** | Implícito em requisitos | Nenhuma migração | ❌ Não implementado | Sem tabelas de notificações |
| **Audit Log Tables** | `docs/layers/supabase/security-policies.md` | Nenhuma migração | ❌ Não implementado | Sem tabelas de auditoria |
| **Storage Buckets** | `docs/layers/supabase/database_schema_plan.md` | `supabase-storage-provider.ts` | ⚠️ Parcial | Apenas `course-thumbnails` (público) + `certificate-images`; bucket `course-media` (privado) não configurado |
| **Signed URLs** | `docs/skills/supabase_storage.md` | Nenhum código | ❌ Não implementado | Zero uso de `createSignedUrl` |

---

## 4. Tabela Comparativa — Serviços Core

| Capacidade | Documentado Em | Implementado Em | Estado | Evidência |
|---|---|---|---|---|
| **CourseService** | `docs/layers/core/domain-logic.md` | `packages/core/src/services/course.ts` (295 linhas) | ✅ OK | CRUD completo, estrutura, access control |
| **LessonService** | `docs/layers/core/domain-logic.md` | `packages/core/src/services/lesson.ts` (141 linhas) | ✅ OK | Draft/published, versioning, breadcrumb |
| **ProgressService** | `docs/layers/core/domain-logic.md` | `packages/core/src/services/progress.ts` (250 linhas) | ⚠️ Parcial | Implementado mas debounce in-memory (não Redis como documentado) |
| **AuthService** | `docs/layers/core/domain-logic.md` | `packages/core/src/services/auth.ts` (62 linhas) | ✅ OK | Session, profile, role, sign-in, logout |
| **CertificateService** | Implícito em requisitos | `packages/core/src/services/certificate.ts` | ✅ OK | Emissão automática |
| **StorageService** | `docs/layers/core/domain-logic.md` | `packages/core/src/services/storage.ts` (38 linhas) | ⚠️ Parcial | Apenas thumbnails + certificados; sem upload de vídeo |
| **PaymentService** | `Requisitos_plataforma.md` | Nenhum ficheiro | ❌ Não implementado | Sem serviço de pagamento |
| **NotificationService** | `Requisitos_plataforma.md` | Nenhum ficheiro | ❌ Não implementado | Sem serviço de notificações |
| **ForumService** | Implícito em requisitos | Nenhum ficheiro | ❌ Não implementado | Sem serviço de fórum |
| **Ports & Adapters** | `docs/layers/core/domain-logic.md` | `packages/core/src/ports/` + `adapters/` | ✅ OK | 6 ports + 6 adapters implementados |

---

## 5. Tabela Comparativa — Renderização

| Capacidade | Documentado Em | Implementado Em | Estado | Evidência |
|---|---|---|---|---|
| **BlockRenderer** | `docs/layers/renderer/engine-spec.md` | `packages/renderer/src/BlockRenderer.tsx` (360 linhas) | ⚠️ Parcial | Usa if-chain (não registry como documentado) |
| **Block Registry** | `docs/layers/renderer/engine-spec.md` | `packages/renderer/src/registry.ts` | 🔀 Divergente | Registry existe mas não é utilizado pelo BlockRenderer |
| **Text Block** | `docs/layers/renderer/engine-spec.md` | `packages/ui/src/blocks/TextBlock.tsx` (41 linhas) | ✅ OK | Implementado com markdown + sanitização |
| **Video Block** | `docs/layers/renderer/engine-spec.md` | `packages/ui/src/blocks/VideoBlock.tsx` (117 linhas) | ⚠️ Parcial | Web (iframe) + Mobile (expo-av); sem streaming adaptativo |
| **Quiz Block** | `docs/layers/renderer/engine-spec.md` | `packages/ui/src/blocks/QuizBlock.tsx` (129 linhas) | ⚠️ Parcial | Display apenas; sem lógica de submissão |
| **Image Block** | Documentado em UI plan | `packages/ui/src/blocks/ImageBlock.tsx` (35 linhas) | ✅ OK | Implementado |
| **HTML Block** | `docs/layers/renderer/engine-spec.md` | `packages/ui/src/blocks/HtmlBlock.tsx` (40 linhas) | ✅ OK | iframe sandboxed (web) + text strip (mobile) |
| **Quote Block** | Documentado em UI plan | `packages/ui/src/blocks/QuoteBlock.tsx` (41 linhas) | ✅ OK | Implementado |
| **Heading Block** | Não documentado explicitamente | `packages/renderer/src/BlockRenderer.tsx` (linha 225) | 🚫 Inexistente | Implementado mas não documentado como tipo separado |
| **Divider Block** | Não documentado explicitamente | `packages/renderer/src/BlockRenderer.tsx` (linha 256) | 🚫 Inexistente | Implementado mas não documentado como tipo separado |
| **React.lazy()** | `docs/layers/renderer/engine-spec.md` (linha 26) | Nenhum código | ❌ Não implementado | Zero uso de `lazy()` em qualquer ficheiro |
| **IntersectionObserver** | `docs/layers/renderer/engine-spec.md` (linha 37) | Nenhum código | ❌ Não implementado | Zero uso em código |
| **Skeleton Loading** | `docs/layers/renderer/engine-spec.md` (linha 40) | Nenhum código | ❌ Não implementado | Sem componentes Skeleton |
| **Error Boundary** | `docs/DESDO.md` (§8) | Nenhum código específico | ❌ Não implementado | Sem Error Boundary por bloco |
| **Plugin System** | `docs/layers/renderer/engine-spec.md` (linhas 48-63) | `packages/renderer/src/registry.ts` | ⚠️ Parcial | Interface definida mas sem marketplace |

---

## 6. Tabela Comparativa — Apps

| Capacidade | Documentado Em | Implementado Em | Estado | Evidência |
|---|---|---|---|---|
| **Admin Middleware** | Boas práticas Next.js | `apps/admin/src/middleware.ts` (78 linhas) | ✅ OK | JWT validation, redirect, bypass |
| **Student Middleware** | N/A (Expo) | Nenhum ficheiro | 🚫 Inexistente | Expo não usa Next.js middleware |
| **Admin Auth Flow** | `docs/workflows/workflow_adm.md` | `apps/admin/src/middleware.ts` + `lib/supabase-*.ts` | ✅ OK | Implementado com @supabase/ssr |
| **Student Auth Flow** | `docs/layers/apps/mobile_player_plan.md` | `packages/core/src/services/auth.ts` | ✅ OK | Implementado via AuthService |
| **Admin Canvas** | `docs/layers/apps/admin_canvas_plan.md` | `apps/admin/src/context/EditorContext.tsx` | ⚠️ Parcial | Auto-save, undo/redo; sem DnD verification |
| **Student Player** | `docs/layers/apps/mobile_player_plan.md` | `apps/student/src/components/LessonPlayer.tsx` | ✅ OK | Video, progress, polling |
| **Offline Support** | `docs/skills/offline_first.md` | `apps/student/src/hooks/useMobileProgress.ts` | ⚠️ Parcial | AsyncStorage outbox; sem SQLite; sem conflict resolution |
| **Zod Validation** | `docs/skills/zod_validation.md` | `packages/types/src/index.ts` | ✅ OK | Schemas centralizados |

---

## 7. Tabela Comparativa — Segurança

| Capacidade | Documentado Em | Implementado Em | Estado | Evidência |
|---|---|---|---|---|
| **JWT Validation** | `docs/skills/supabase_auth_jwt.md` | `apps/admin/src/middleware.ts` | ✅ OK | Via @supabase/ssr |
| **RLS** | `docs/skills/supabase_rls.md` | `init_schema.sql:188-278` | ⚠️ Parcial | Implementado mas dev permissions abertas |
| **XSS Prevention** | `docs/skills/security_xss_prevention.md` | `packages/ui/src/utils/sanitize.ts` | ✅ OK | DOMPurify + iframe sandboxed |
| **Rate Limiting** | `docs/skills/rate_limiting.md` | Nenhum ficheiro | ❌ Não implementado | Zero código |
| **WAF** | `docs/REQUISITOS_SEGURANCA_DISPONIBILIDADE.md` | Nenhum ficheiro | ❌ Não implementado | Zero configuração |
| **Audit Logs** | `docs/layers/supabase/security-policies.md` | Nenhuma tabela | ❌ Não implementado | Sem tabelas de auditoria |
| **LGPD Compliance** | `Requisitos_plataforma.md` | Parcial | ⚠️ Parcial | Sem consent logs; sem data encryption específica |
| **Secrets Management** | `docs/FORBIDDEN_OPERATIONS.md` (DB-03) | `process.env` usage | ✅ OK | Sem hardcoded secrets |

---

## 8. Tabela Comparativa — Design System

| Capacidade | Documentado Em | Implementado Em | Estado | Evidência |
|---|---|---|---|---|
| **Tamagui Only** | `docs/AGENTS.md` (D-03) | `packages/ui/` | ✅ OK | Zero CSS inline, zero Tailwind |
| **Token System** | `docs/layers/ui/tamagui_tokenization_skill.md` | `packages/ui/src/tokens/` | ✅ OK | Colors, spacing, typography |
| **Cross-Platform** | `docs/layers/ui/execution_plan.md` | `packages/ui/src/index.ts` | ✅ OK | Entry points `.main` + `./native` |
| **Icon System** | `docs/AGENTS.md` (§GOVERNANÇA) | `packages/ui/src/components/Icon.tsx` | ✅ OK | Wrapper cross-platform |
| **Component Library** | `docs/layers/ui/execution_plan.md` | `packages/ui/src/components/` | ✅ OK | Button, YStack, XStack, Text, etc. |
| **Ladle Stories** | `docs/layers/ui/execution_plan.md` | `packages/ui/src/**/*.stories.tsx` | ✅ OK | 6+ stories |
| **Verify Script** | `docs/AGENTS.md` (§GOVERNANÇA) | `scripts/verify-ui-rules.ts` | ✅ OK | Validação automatizada |

---

## 9. Tabela Comparativa — Testes

| Capacidade | Documentado Em | Implementado Em | Estado | Evidência |
|---|---|---|---|---|
| **Unit Tests (Vitest)** | `docs/layers/infra/execution_plan.md` | `packages/*/src/**/*.test.ts` | ✅ OK | 21+ testes |
| **Integration Tests** | `docs/skills/tdd_workflow.md` | Limitado | ⚠️ Parcial | Alguns testes de serviço |
| **E2E Tests (Playwright)** | `docs/layers/testing/e2e_playwright_plan.md` | `tests/e2e/*.spec.ts` | ⚠️ Parcial | Config existe; testes limitados |
| **UI Component Tests** | `docs/layers/ui/execution_plan.md` | `packages/ui/src/**/*.test.tsx` | ⚠️ Parcial | Alguns testes de bloco |
| **Coverage Thresholds** | Boas práticas | Nenhum ficheiro | ❌ Não implementado | Sem thresholds configurados |

---

## 10. Resumo Estatístico

| Status | Contagem | Percentual |
|---|---|---|
| ✅ OK | 28 | 42% |
| ⚠️ Parcial | 14 | 21% |
| 🔀 Divergente | 1 | 2% |
| ❌ Não implementado | 20 | 30% |
| 🚫 Inexistente | 3 | 5% |
| **Total** | **66** | **100%** |

---

## 11. Análise de Desvios Críticos

### Desvio 1: Redis Cache (Impacto: CRÍTICO)
- **Documentado:** Sistema completo de cache com Redis, TTLs, invalidação, Write-Behind
- **Implementado:** Zero código Redis
- **Causa:** ADR-017 bloqueia implementação até 500+ estudantes simultâneos
- **Risco:** Sem cache, cada request = query directa ao Supabase

### Desvio 2: Rate Limiting (Impacto: CRÍTICO)
- **Documentado:** Sistema completo com sliding window, headers, fallback in-memory
- **Implementado:** Zero código
- **Causa:** Dependência de Redis (não implementado)
- **Risco:** Vulnerável a brute force, scraping, DDoS

### Desvio 3: Connection Pooling (Impacto: ELIMINADO — ADR-022)
- **Documentado:** PgBouncer na porta 6543, monitoramento de conexões
- **Investigação:** Acesso é exclusivamente via SDK HTTP (supabase-js). Zero imports de `pg`, `knex`, `prisma`. O Supabase gere internamente o pool de conexões PostgreSQL.
- **Conclusão:** Hipótese invalidada. Não há pool client-side. Artefatos de pooling removidos.

### Desvio 4: ProgressService Cache (Impacto: ALTO)
- **Documentado:** Cache Redis com TTL 30s para leitura
- **Implementado:** Debounce in-memory (5s) para escrita
- **Causa:** ADR-017 bloqueia Redis
- **Risco:** Sem cache de leitura, queries frequentes ao banco

### Desvio 5: BlockRenderer vs Registry (Impacto: MÉDIO)
- **Documentado:** Registry pattern com lookup dinâmico
- **Implementado:** If-chain hardcoded
- **Causa:** Implementação inicial simplificada
- **Risco:** Dificuldade para adicionar novos tipos de bloco

### Desvio 6: Dev RLS Override (Impacto: ALTO)
- **Documentado:** RLS estrito em todas as tabelas
- **Implementado:** `USING (true) WITH CHECK (true)` em dev
- **Causa:** Facilitar desenvolvimento
- **Risco:** Dados abertos se dev permissions subirem para produção

---

## 12. Recomendações

### Imediatas (antes de novas features):
1. **Remover dev permissions** ou criar política de separação dev/prod
2. **Documentar dev RLS override** como risco conhecido

### Para escalar (10k users):
1. **Implementar Redis** (desbloqueado por ADR-017 quando >500 users)
2. **Implementar Rate Limiting** (já implementado in-memory no P0-01)

### Para optimização:
1. **Implementar React.lazy()** para code splitting
2. **Adicionar IntersectionObserver** para lazy loading
3. **Wiring Registry** no BlockRenderer

---

> ⚠️ **Nota:** Este documento deve ser actualizado sempre que houver novas implementações ou mudanças de arquitetura.
