# 🧠 MEMÓRIA RAM ATIVA

## Status Atual
SESSAO ATIVA — Login com @supabase/ssr + role-based redirect concluído. i18n corrigido (dedup react-i18next). Build admin com erro de tipo pré-existente em EditorCanvas.tsx:248.

## 🎯 Tarefa em Execução
**Certificado — emissão automática + template + tela do aluno**

Objetivo: Implementar o fluxo completo de certificados — desde a lógica de emissão (disparada ao completar o curso) até a exibição/download no app do aluno, incluindo um template visual.

Camada Ativa: Core (lógica de emissão) + Supabase (queries) + Apps/Student (tela do aluno) + Apps/Admin (configuração de template)

Documentos Carregados:
- `docs/layers/core/domain-logic.md` (caso de uso `completeLesson`)
- `docs/layers/supabase/database_schema_plan.md` (schema `certificates`)
- `docs/layers/types/data-lifecycle.md` (feature flag `certificate_custom`)

## 🎯 Últimas Conquistas
- **Login fix:** Substituído `@supabase/supabase-js` por `@supabase/ssr` no admin. Login agora usa cookies (middleware enxerga sessão).
- **Role-based redirect:** Após login, busca `role` na tabela `profiles`. Se `student` → redireciona para student app (`localhost:8081`). Se `admin/teacher` → dashboard admin.
- **i18n dedup fix:** Havia 3 cópias do `react-i18next` (pnpm isolation). Movido `I18nProvider` para dentro do admin (`apps/admin/src/providers/i18n-provider.tsx`), removido do core. Agora `I18nextProvider` e `useTranslation` compartilham o mesmo React Context.
- **P3 a11y:** `aria-label` em todos botões de ícone, `role="button"` + `tabIndex` + teclado em elementos interativos, foco no canvas
- **P3 i18n:** `i18next + react-i18next` instalado, `packages/core/src/i18n/` com pt-BR/en, `I18nProvider` no admin, `EditorHeader.tsx` migrado
- **P1 completo:** 5 bugs de infra resolvidos (settings feedback + overflow + React + globals.css + env vars CI)
- **Ladle VRT fix:** Mocks de react-native e expo-av para build do Ladle (24/24 testes verdes)
- **React 19.1.0 unificado:** Admin downgradado, pnpm.overrides adicionado
- **globals.css:** 206→24 linhas, removido `:root` e classes mortas (Tamagui assume)
- **Env vars CI:** GitHub Secrets injetados no workflow

## 🕹️ Estado Atual do Projeto
- **Branch atual:** `feat/dsv2-reform`
- **Student app:** ✅ Build (Expo Web)
- **Admin app:** ✅ Build (Next.js)
- **Ladle:** ✅ Build (6 stories)
- **MVP ~35% completo** — CRUD de cursos, módulos e aulas funcional; reordenação e rename operacionais; certificado com toggle + pendências de escopo.

## 📋 Checklist de Progresso
- [x] DSv2 Reform - Fase 0 (Tokens modulares + governança)
- [x] **Fase 1-3:** Admin + Student migrados para `@projeto/ui`
- [x] **Fase 4:** Sistema de Ícones (`Icon` wrapper + substituição)
- [x] **Fase 5:** Preview de Componentes (Ladle + stories)
- [x] **Fase 6:** Governança final (verify-ui-rules, AGENTS.md, CONTEXT_MAP)
- [x] **CI:** GitHub Actions workflow
- [x] **DASH-01:** Admin dashboard + course CRUD + thumbnail upload
- [x] **Module/Lesson CRUD:** Criar, renomear, excluir, reordenar módulos e aulas
- [x] **Editor header dinâmico:** Breadcrumb Curso / Módulo / Aula
- [x] **Spinner contextual:** Mensagens amigáveis em todos os loading states
- [x] **Certificates:** Toggle no studio + migration + tabela `certificates` + pendência de escopo (por módulo/curso)
- [x] **BACKLOG:** Expandido com bugs de settings, certificado por módulo vs curso, spinner
- [x] **P1: BUG Salvar configurações** — Feedback de sucesso/erro com setTimeout
- [x] **P1: BUG Painel overflow** — h="100%" no BlockPalette/BlockSettings
- [x] **P1: React 19.1.0** — Unificado via downgrade admin + pnpm.overrides
- [x] **P1: globals.css** — Reduzido de 206→24 linhas, removido dead code
- [x] **P1: Env vars CI** — GitHub Secrets injetados no workflow
- [x] **Ladle VRT fix** — react-native + expo-av mocks para build
- [x] **Certificado — decisão de escopo:** Por curso (não por módulo). Já documentado no backlog como item bloqueado.
- [x] **Infra execution_plan:** TASK 01-06 completos (TDD estrito, CI p/ develop, 21 testes, CD pipeline). TASK-07 Living README adiado p/ pós-MVP.
- [x] **SCL-01:** Índices PostgreSQL compostos (SCL-02/03/04 adiados — sem Redis, sem SSR/API pública)
- [x] **E2E CRUD completo:** 5 novos testes (criar curso, validação, settings, módulo/aula CRUD, excluir) — `admin-crud.spec.ts`
- [x] **Snapshots E2E atualizados:** 5 baselines regenerados pós-DSv2 reform
- [x] **29/29 testes verdes:** 13 E2E + 16 Ladle VRT
- [x] **P3 a11y:** aria-label + role + tabIndex + teclado em todos elementos interativos do editor
- [x] **P3 i18n:** i18next + react-i18next instalado, provider no admin, EditorHeader migrado
- [x] **Auth E2E:** `admin-auth.spec.ts` com 2 testes (login admin → dashboard, login aluno → student app)
- [x] **Workflow docs:** Seção de autenticação adicionada em `docs/workflows/workflow_adm.md`
- [x] **E2E plan atualizado:** Login desbloqueado, cobertura 13→15 testes
- [x] **Backlog atualizado:** E2E-01 e E2E-06 marcados como concluídos
- [x] **BlockSettings colapsável:** BlockSettings agora colapsa (36px) / expande (320px) como BlockPalette — commit `a1c3565`
- [x] **CERT-01: Lógica de emissão** — `CertificateService` em `packages/core/src/services/certificate.ts`. Integrado ao `ProgressService.saveProgressImmediate`: ao marcar aula como concluída (≥85%), dispara `checkAndIssue` que verifica se curso está 100% completo e `certificate_enabled=true`, então gera `uuid_bsgi` (`BSGI-{uuid}`) e insere na tabela `certificates`. **Nova regra de conclusão de aula:** vídeo ≥ 85% + todos blocos com `isTest: true` ≥ 70% em `tests_completed`. **Nova regra do certificado:** média do curso ≥ 70%. 27/27 testes verdes.

- `packages/types/src/layout.ts`: `isTest: z.boolean().optional().default(false)` adicionado ao `BlockLayoutsSchema`
- `packages/types/src/database.ts`: `tests_completed: z.record(z.string(), z.number()).optional().default({})` no `StudentProgressSchema`
- `supabase/migrations/20260522000002_add_tests_completed.sql`: coluna `tests_completed jsonb` em `student_progress`
- `packages/core/src/services/progress.ts`: `submitTestScore()` + `evaluateLessonCompletion()` (video + all tests ≥ 70%). `saveProgressImmediate` não define mais `completed` diretamente.
- `packages/core/src/services/certificate.ts`: `getLessonScore()`, `getCourseAverage()` — certificado exige média ≥ 70%
- [ ] **CERT-02: Template do certificado** — Layout visual (HTML/CSS) do certificado
- [ ] **CERT-03: Tela do aluno** — Rota no student app para visualizar/baixar certificado
- [ ] **CERT-04: Código BSGI** — Geração do `uuid_bsgi` único (incluído na CERT-01)
- [ ] **CERT-05: Upload customizado** — Upload PDF/imagem + editor de tamanho (pós-MVP)

## Key Decisions
- **Certificado por curso:** Decisão de escopo — certificado emitido por curso completo, não por módulo. Feature flag `certificate_custom` para template customizado (pós-MVP).
- **order_index append:** 1ª aula criada = topo, última = final. Reordenação manual via ↑↓.
- **Inline rename:** Input + botão "Salvar" (Enter/blur também salvam). Cor `$secondaryForeground`.
- **Editor breadcrumb:** Dados vivos do Supabase via `lessonMeta.module_id` → module.title → course.title.
- **Backlog items:** Bugs de settings (P1) e decisão de certificado (bloqueado) adicionados.
- **Living README:** Adiado para pós-MVP.
- **SCL-02/03/04:** Adiados — sem Redis, sem SSR, sem API pública no momento.
- **i18n lib:** `i18next + react-i18next` (compartilhado web + native), `packages/core/src/i18n/`, `I18nProvider` no admin
- **i18n dedup:** `react-i18next` movido para peerDependency do core. `I18nProvider` movido para admin para evitar duplicatas do pnpm.
- **Login SSR:** Admin usa `@supabase/ssr` com cookies (createBrowserClient). Middleware usa createServerClient com getAll/setAll.
- **Role redirect:** Perfil com role `student` → student app. `admin/teacher` → dashboard admin.

## Relevant Files
- `packages/types/src/database.ts`: Schema Zod `Certificate` + tipo TypeScript + `StudentProgressSchema` com `tests_completed`
- `packages/types/src/layout.ts`: `BlockLayoutsSchema` com `isTest`
- `supabase/migrations/20260517000000_init_schema.sql`: Tabela `certificates` + RLS
- `supabase/migrations/20260520000001_add_certificate_enabled.sql`: Coluna `certificate_enabled` em `courses`
- `supabase/migrations/20260522000002_add_tests_completed.sql`: Coluna `tests_completed jsonb` em `student_progress`
- `apps/admin/src/app/studio/[courseId]/page.tsx`: CourseOverview (CRUD, settings, certificate toggle)
- `docs/layers/core/domain-logic.md`: Caso de uso `completeLesson` (disparar certificado)
- `docs/layers/supabase/database_schema_plan.md`: Schema `certificates` documentado
- `docs/layers/types/data-lifecycle.md`: Feature flag `certificate_custom`
- `packages/core/src/services/certificate.ts`: CertificateService (checkAndIssue, isCourseCompleted, getCompletedLessonCount, getLessonScore, getCourseAverage)
- `packages/core/src/services/progress.ts`: saveProgressImmediate + evaluateLessonCompletion + submitTestScore
- `packages/core/src/services/certificate.test.ts`: 10 testes (getCourseIdFromLesson, counts, isCompleted, issue, duplicates, list)
- `packages/core/src/services/progress.test.ts`: 9 testes (save, evaluateCompletion, test scores, clamp)
