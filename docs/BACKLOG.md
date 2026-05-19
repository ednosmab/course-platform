# 📋 BACKLOG — Plataforma de Cursos com CMS

## 🎯 Prioridades (ordenadas por impacto)

### P0 — Crítico (bloqueia progresso)

- [ ] **Fase 1 real — Migrar Admin Editor para `@projeto/ui`**
  - `apps/admin/src/components/editor/*.tsx` (5 arquivos) ainda usam `<div>`, `<button>`, `<h3>`, `<span>`, `<p>`, `<input>`, `<select>`, `<textarea>`, CSS classes e cores hardcoded
  - Substituir por `YStack`, `XStack`, `Text`, `Button`, `Card`, `Icon` de `@projeto/ui`
  - Referência: `docs/roadmaps/design-system-reforma.md` (Fase 1)
- [ ] **Reconciliar `docs/layers/ui/execution_plan.md`**
  - TASK-32 a TASK-38 marcadas como pendentes, mas já foram executadas
  - Atualizar checkboxes para refletir realidade

### P1 — Alta

- [ ] **Compatibilizar versões do React entre apps**
  - `student` usa React 19.1.0, `admin` usa 19.2.4
  - Unificar para evitar conflitos de resolução
- [ ] **Migrar `apps/admin/src/app/globals.css`**
  - 195 linhas com resets, grid patterns, form classes, palette classes
  - Manter apenas CSS de canvas/infra; migrar estilos para tokens Tamagui
- [ ] **Criptografar variáveis de ambiente no CI**
  - `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` necessárias no workflow
  - Adicionar secrets no GitHub Actions

### P2 — Média

- [ ] **Criar stories faltantes no Ladle**
  - VideoBlock, QuizBlock, ImageBlock, HtmlBlock, Container
- [ ] **Criar testes unitários para `@projeto/ui`**
  - Testes para Button, Card, Text, Icon renderizarem sem crash
- [ ] **Criar testes para `@projeto/core`**
  - Apenas `progress.test.ts` existe; faltam testes para `course.ts` e `auth.ts`
- [ ] **Pipeline de testes E2E (Playwright)**
  - Configurar Playwright + criar specs para fluxo crítico (admin publica aula → aluno consome)
- [ ] **Modo offline no student app**
  - Hook `useMobileProgress` implementa fila offline, mas faltam testes de integração
- [ ] **Configurar infra de testes (vitest + testing-library)**
  - Seguir `docs/layers/infra/execution_plan.md` TASK-01 a TASK-07:
    - TASK-01: Modificar AGENTS.md para TDD Estrito
    - TASK-02: Instalar vitest + testing-library
    - TASK-03: Adicionar scripts test/test:watch no package.json raiz
    - TASK-04: Criar CI workflow para branch develop
    - TASK-05: Testar localmente execução do pnpm test
    - TASK-06: Configurar pipeline de CD develop -> main
    - TASK-07: Implementar rotina "Living README" com badges

### P3 — Baixa / Refinamento

- [ ] **Tokens de sombra (`shadows.ts`) — verificar uso**
  - Arquivo existe mas não é claro se `tamagui.config.ts` consome os presets
- [ ] **Eliminar `as any` (27 ocorrências)**
  - `apps/admin/src/context/EditorContext.tsx` (4)
  - `apps/admin/src/components/editor/BlockSettings.tsx` (5)
  - `apps/admin/src/components/editor/EditorCanvas.tsx` (9)
  - `apps/admin/src/components/editor/PositionPanel.tsx` (2)
  - `apps/student/App.tsx` (1)
  - `packages/ui/src/components/Icon.tsx` / `Icon.native.tsx` (2)
  - `packages/ui/src/components/Button.tsx` (1)
  - `packages/core/src/services/course.ts` (1)
  - `packages/core/src/services/progress.test.ts` (2)
- [ ] **Remover `console.log` de depuração (18 ocorrências)**
  - `apps/admin/src/context/EditorContext.tsx` (8)
  - `apps/student/App.tsx` (5)
  - `scripts/verify-ui-rules.ts` (4)
  - Migrar para logger estruturado quando aplicável
- [ ] **Eliminar cores hex hardcoded (25+ violações DS)**
  - `apps/admin/src/components/editor/EditorCanvas.tsx`, `BlockSettings.tsx`, `PositionPanel.tsx`, `EditorHeader.tsx`
  - `apps/student/App.tsx`, `packages/ui/src/blocks/` (stories e componentes)
- [ ] **Internacionalização (i18n)**
  - Código mistura português (mensagens de erro, labels) com inglês
  - Decidir idioma oficial e extrair strings
  - `throw new Error` em português em `App.tsx:51` e `tests/e2e/1-admin-cms.spec.ts:22`
- [ ] **Acessibilidade (a11y)**
  - Editor admin usa vários `<button>` sem `aria-label`
  - Elementos sem foco gerenciado no canvas
- [ ] **Remover dependências não utilizadas**
  - `@projeto/ui` tem `expo-av` em peerDeps mas VideoBlock está no entry nativo apenas
  - Verificar se `lucide-react-native` ainda é necessário como peerDep
- [ ] **Resolver `// eslint-disable-next-line react-hooks/exhaustive-deps`**
  - `apps/admin/src/components/editor/BlockSettings.tsx:320`
- [ ] **Integrar ou remover `design/create-teach-module/`**
  - Projeto externo com shadcn/ui + Tailwind (viola regras do DS)
  - 50+ componentes UI duplicados não integrados ao `@projeto/ui`
  - Usa `bun` em vez de `pnpm`
- [ ] **Preencher docs stub (6 arquivos vazios)**
  - `docs/layers/core/domain-logic.md`, `event-architecture.md`, `offline-strategy.md`
  - `docs/layers/renderer/engine-spec.md`
  - `docs/layers/types/jsonb-governance.md`, `data-lifecycle.md`

### ⚡ Escalabilidade e Performance

Tasks do plano `docs/roadmaps/scalability-plan.md`:

**Fase 1 — Fundação:**
- [ ] **SCL-01:** Configurar índices PostgreSQL para consultas frequentes
  - `idx_courses_org`, `idx_enrollments_user`, `idx_lessons_course`, `idx_progress_user_lesson`, `idx_audit_logs_user`
- [ ] **SCL-02:** Implementar rate limiting com Redis (sliding window)
- [ ] **SCL-03:** Adicionar cache headers em todas as rotas GET públicas
- [ ] **SCL-04:** Configurar ISR para páginas de catálogo (`revalidate: 60s`)

**Fase 2 — Otimização de Conexões (3k usuários):**
- [ ] **SCL-05:** Implementar connection pooling (PgBouncer, transaction mode)
- [ ] **SCL-06:** Otimizar RLS policies (remover subqueries, adicionar índices)
- [ ] **SCL-07:** Estratégia de fallback Realtime-to-polling
- [ ] **SCL-08:** Backoff exponencial no mobile (já implementado parcialmente em `useMobileProgress`)

**Fase 3 — Alta Escala (10k+):**
- [ ] **SCL-09:** Migrar para Edge Runtime em rotas críticas (auth JWT, rate limiting)
- [ ] **SCL-10:** Implementar read replicas do PostgreSQL
- [ ] **SCL-11:** WebSocket próprio para realtime (alternativa ao Supabase Realtime)
- [ ] **SCL-12:** Cache distribuído com Redis Cluster

**Fase 4 — Escala Futura (50k+):**
- [ ] **SCL-13:** Auto-scaling de instâncias Next.js
- [ ] **SCL-14:** Sharding de banco de dados por organização
- [ ] **SCL-15:** CDN multi-região para vídeos
- [ ] **SCL-16:** Service Workers para cache offline avançado

### 🧪 E2E Playwright

Tasks do plano `docs/layers/testing/e2e_playwright_plan.md`:

**Admin:**
- [ ] **E2E-01:** Login do admin
- [ ] **E2E-02:** CRUD de curso
- [ ] **E2E-03:** Canvas de aula (adicionar/mover/remover blocos)
- [ ] **E2E-04:** Gerenciamento de usuários
- [ ] **E2E-05:** Relatórios

**Aluno:**
- [ ] **E2E-06:** Login do aluno
- [ ] **E2E-07:** Catálogo de cursos
- [ ] **E2E-08:** Player de aula
- [ ] **E2E-09:** Quiz
- [ ] **E2E-10:** Certificado

### 🧹 Documentação

- [ ] **Atualizar `docs/layers/ui/execution_plan.md`** — marcar TASK-32 a TASK-38 como concluídas
- [ ] **Criar `docs/history/`** com resumo da sessão (Fase 4-6 + CI + schemas)

---

## 📊 Legenda

| Prefixo | Significado |
|---------|-------------|
| P0 | Bloqueia progresso ou quebra build |
| P1 | Funcionalidade principal incompleta |
| P2 | Qualidade, testes, cobertura |
| P3 | Refinamento, débito técnico, docs |
| SCL | Escalabilidade (4 fases: fundação → 3k → 10k → 50k+) |
| E2E | Testes end-to-end com Playwright |
