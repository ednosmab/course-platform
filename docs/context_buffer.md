# 🧠 MEMÓRIA RAM ATIVA

## Status Atual
SESSAO ATIVA — P3 a11y e i18n concluídos. Build admin com erro de tipo pré-existente em EditorCanvas.tsx:248.

## 🎯 Últimas Conquistas
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

## Key Decisions
- **order_index append:** 1ª aula criada = topo, última = final. Reordenação manual via ↑↓.
- **Inline rename:** Input + botão "Salvar" (Enter/blur também salvam). Cor `$secondaryForeground`.
- **Editor breadcrumb:** Dados vivos do Supabase via `lessonMeta.module_id` → module.title → course.title.
- **Backlog items:** Bugs de settings (P1) e decisão de certificado (bloqueado) adicionados.
- **Living README:** Adiado para pós-MVP.
- **SCL-02/03/04:** Adiados — sem Redis, sem SSR, sem API pública no momento.
- **i18n lib:** `i18next + react-i18next` (compartilhado web + native), `packages/core/src/i18n/`, `I18nProvider` no admin

## Relevant Files
- `apps/admin/src/app/studio/[courseId]/page.tsx`: CourseOverview (module/lesson CRUD, reorder, rename, settings, certificate)
- `apps/admin/src/context/EditorContext.tsx`: courseTitle, moduleTitle, lessonTitle expostos; fetch de nomes via module_id
- `apps/admin/src/components/editor/EditorHeader.tsx`: Breadcrumb dinâmico (Curso / Módulo / Aula)
- `apps/admin/src/app/page.tsx`: Dashboard com spinner contextual "Carregando cursos…"
- `docs/BACKLOG.md`: Bugs de settings, certificado por módulo vs curso, spinner concluído
- `tests/e2e/admin-crud.spec.ts`: 5 novos testes E2E (CRUD curso + módulo/aula + settings + delete)
- `supabase/migrations/20260521000001_add_performance_indexes.sql`: 6 índices compostos
- `.github/workflows/cd.yml`: CD pipeline develop→main
- `docs/layers/infra/execution_plan.md`: TASK 01-06 completos
- `docs/layers/testing/e2e_playwright_plan.md`: 4/10 fluxos testados
- `docs/roadmaps/scalability-plan.md`: SCL-01 completo, demais adiados
- `packages/core/src/i18n/`: Config i18next + locales pt-BR/en
