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

### 🎨 Extrair Design de `design/create-teach-module/`

Protótipo funcional (TanStack Router + shadcn/ui + Tailwind) com o layout do Estúdio e Dashboard. Implementar no nosso ecossistema (Next.js + Tamagui + `@projeto/ui`).

- [x] **DASH-01 — Dashboard do admin**
  - Rota `/`: Top bar (BrandMark, navegação, busca, notificações, avatar)
  - Hero (status pill, headline, botões, 4 stats cards)
  - Grid de cursos (6 cards mockados, cover gradient, badge, metadata, progress bar)
  - Editor realocado para `/studio/[courseId]`
  - Tema `cloudWhite` aplicado via `<Theme name="cloudWhite">`
  - Fontes Space Grotesk + DM Sans via `next/font/google`
  - Referência: `design/create-teach-module/src/routes/index.tsx`
- [ ] **EDIT-01 — Layout 3 colunas do Estúdio**
  - Esquerda: paleta de blocos (9 tipos) com drag-and-drop (referência: `studio.$courseId.tsx:27-37`)
  - Centro: canvas com preview por dispositivo (desktop/tablet/mobile)
  - Direita: painel de propriedades sensível ao tipo de bloco selecionado
- [ ] **EDIT-02 — Novos tipos de bloco**
  - `heading` (H1-H3 editável inline)
  - `checklist` (lista numerada com checkbox visual)
  - `code` (bloco monoespaçado com syntax highlight)
  - `divider` (linha horizontal separadora)
  - Adicionar schemas Zod em `packages/types/` e componentes em `packages/ui/src/blocks/`
- [ ] **EDIT-03 — Inline editing via `contentEditable`**
  - Clicar direto no texto do canvas para editar, sem abrir formulário
  - `onBlur` salva no estado do bloco
- [ ] **EDIT-04 — Drag-and-drop reordering**
  - Arrastar blocos na paleta ou no canvas para reordenar
  - Indicador visual de drop zone (referência: `studio.$courseId.tsx:93-98`)
- [ ] **EDIT-05 — Device preview toggle**
  - Botões Desktop / Tablet / Mobile no topo do canvas
  - Canvas se redimensiona (`max-w-[380px]` mobile, `max-w-[720px]` tablet, `max-w-[860px]` desktop)
- [ ] **EDIT-06 — Propriedades por tipo de bloco**
  - Painel direito mostra campos diferentes conforme o tipo (texto, heading level, URL do vídeo, upload de imagem, espaçamento, visibilidade)
  - Referência: `studio.$courseId.tsx:469-543`
- [ ] **EDIT-07 — Hover toolbar em cada bloco**
  - Ícones: reordenar (grip), duplicar, mais opções, excluir
  - Aparece no hover ou quando o bloco está selecionado
  - Referência: `studio.$courseId.tsx:310-320`
- [x] **TOKEN-01 — Migrar paleta "Cloud White" (OKLCH) para Tamagui**
  - Cores: 30 tokens `cw*` em `colors.ts` (convertidos OKLCH → hex)
  - Sombras: `cwSoft` e `cwPop` em `shadows.ts`
  - Gradientes: `cwGradientFrom`, `cwGradientTo` em `colors.ts`
  - Fontes: `spaceGroteskFont`, `dmSansFont` em `typography.ts`
  - Tema: `cloudWhite` em `tamagui.config.ts` (28 variantes semânticas)
  - Grid pattern: item em separado (não tokenizável — utility CSS puro)
  - Referência: `design/create-teach-module/src/styles.css:54-104`
- [x] **TOKEN-02 — Atualizar Brand Mark**
  - Componente `apps/admin/src/components/brand-mark.tsx`
  - Sparkles icon + gradient primary + "Mosaico." com ponto azul
  - Integrado no dashboard (`/`) e exportado para uso no editor

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
- [ ] **Remover `design/create-teach-module/` após extração**
  - Projeto externo com shadcn/ui + Tailwind (viola regras do DS)
  - 50+ componentes UI duplicados não integrados ao `@projeto/ui`
  - Usa `bun` em vez de `pnpm`
  - Manter apenas após DASH-01 a TOKEN-02 concluídos
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

### 📜 ADRs Pendentes (decisões técnicas não documentadas)

- [ ] **ADR-007:** Zod `safeParse` + fallback — validação estrita com degradação graciosa
- [ ] **ADR-008:** Draft/Published lesson versioning via UUID mangling
- [ ] **ADR-009:** Undo/Redo via `useReducer` + history stack (snapshots completos)
- [ ] **ADR-010:** RLS-First security — anon key exposto, toda autorização no banco
- [ ] **ADR-011:** Offline outbox pattern — AsyncStorage + flush síncrono
- [ ] **ADR-012:** Cross-platform file convention (`.tsx` vs `.native.tsx`)
- [ ] **ADR-013:** Supabase Realtime subscriptions direto do student app (sem API layer)
- [ ] **ADR-014:** Auto-save com debounce 1.5s + state machine (`idle→saving→saved→error`)
- [ ] **ADR-015:** Gap arquitetural — TanStack Query/Zustand prescritos mas não implementados
- [ ] **ADR-016:** Tamagui compile-time optimization (babel plugin, zero runtime CSS-in-JS)

### 🔍 Pós-MVP

- [ ] **Auditoria geral do projeto** — Analisar todo o código após MVP estabilizado: schema drift, performance, segurança, cobertura de testes, dependências obsoletas, dívida técnica acumulada. Referência: `docs/DECISOES_ARQUITETURAIS_RECOMENDACOES.md`

### 🧹 Documentação

- [ ] **Atualizar `docs/layers/ui/execution_plan.md`** — marcar TASK-32 a TASK-38 como concluídas
- [ ] **Criar `docs/history/`** com resumo da sessão (Fase 4-6 + CI + schemas)

---

### 🔒 Bloqueado (aguardando aprovação do PO)

- [ ] **Pagamentos** — Pix, cartão, assinatura recorrente, checkout, webhooks de billing
- [ ] **Aulas ao vivo** — WebRTC, sinalização, chat em tempo real, gravação
- [ ] **Fóruns de discussão** — Threads por aula, moderação, notificações
- [ ] **Dashboard do aluno** — Página inicial do app mobile com overview de cursos, progresso, próximas aulas

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
