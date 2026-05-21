# 📋 BACKLOG — Plataforma de Cursos com CMS

## 🎯 Prioridades (ordenadas por impacto)

### P0 — Crítico (bloqueia progresso)

- [x] **Fase 1 real — Migrar Admin Editor para `@projeto/ui`**
  - 5 arquivos do editor migrados: usam `YStack`, `XStack`, `Text`, `Button`, `Icon` de `@projeto/ui`
  - Raw HTML remanescente: `<input>`/`<select>`/`<textarea>` em formulários (BlockSettings) e `<div>`/`<iframe>` no canvas de posicionamento absoluto (casos legítimos sem equivalente Tamagui)
- [x] **Reconciliar `docs/layers/ui/execution_plan.md`**
  - Checkboxes atualizadas refletindo estado real (TASK-32 a TASK-38 concluídas, nota TASK-15/16 corrigida)

### P1 — Alta

- [x] **BUG: Salvar configurações do curso** — Já implementado com `setSaveMessage` e feedback de sucesso/erro (linhas 164-195). Fechamento automático após 2s (sucesso) ou 5s (erro).
- [x] **BUG: Painel de configurações não expande** — `overflow="hidden"` está no `StudioLayout`, mas o `CourseOverview` (onde fica o painel) não tem essa restrição. Layout já funciona corretamente.
- [x] **Compatibilizar versões do React** — Ambos os apps já usam `react@19.1.0`. Resolvido.
- [ ] **Migrar `apps/admin/src/app/globals.css`**
  - 39 linhas restantes: reset, scrollbar customizada, `.canvas-bg` (grid pattern)
  - Manter apenas CSS de canvas/infra (resets + grid pattern são casos legítimos)
- [x] **Criptografar variáveis de ambiente no CI** — `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` já configurados via secrets no `ci.yml:63-64`.

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

- [x] **Mensagem amigável no Spinner por contexto** — Adicionado texto "Carregando cursos…" (dashboard admin) e "Carregando curso…" (studio admin). Student app já tinha "Carregando plataforma de alunos real...".
- [x] **Criar stories faltantes no Ladle**
  - VideoBlock, QuizBlock, ImageBlock, HtmlBlock, Container, Avatar, BrandMark, GridBackground, ProgressBar — 9 novas stories adicionadas
- [x] **Criar testes unitários para `@projeto/ui`**
  - Testes para Button, Card, Icon (6 testes, 3 files em `packages/ui/src/components/*.test.tsx`)
- [x] **Criar testes para `@projeto/core`**
  - `course.test.ts` (5 testes), `auth.test.ts` (3 testes) — cobertura total dos 3 services
- [x] **Pipeline de testes E2E (Playwright)**
  - Playwright já configurado com 2 projetos (admin + student), rodando no CI
- [x] **Modo offline no student app**
  - Hook `useMobileProgress` já existe; 4 testes de integração adicionados em `apps/student/src/hooks/useMobileProgress.test.ts`
- [x] **Configurar infra de testes (vitest + testing-library)**
  - vitest instalado em `@projeto/core`, `@projeto/ui`, `admin`, `student`
  - `@testing-library/react` + `jsdom` instalados no root
  - Script `test` no root roda `pnpm -r --if-present run test` (21 testes, todos passando)
  - CI workflow atualizado com CodeQL + `pnpm run test`

### P3 — Concluídos nesta sessão

- [x] **Tokens de sombra (`shadows.ts`) — verificar uso**
- [x] **Eliminar `as any`** — 37 ocorrências removidas em 9 arquivos
- [x] **Remover `console.log` de depuração** — 14 logs removidos
- [x] **Remover dependências não utilizadas** — Nenhuma removível (todas necessárias)
- [x] **Resolver `eslint-disable-next-line react-hooks/exhaustive-deps`** — Convertido para variável síncrona

### P3 — Pendentes

- [ ] **Eliminar cores hex hardcoded** — ~20 violações restantes em inline styles nativos (requer refatoração maior)
- [ ] **Internacionalização (i18n)**
- [ ] **Acessibilidade (a11y)**
- [ ] **Remover `design/create-teach-module/`** — Aguardar extração completa
- [x] **Preencher docs stub (6 arquivos vazios)** — Concluído em P2

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

### 🔒 SEG — Segurança e Compliance

Itens identificados na análise `docs/REQUISITOS_SEGURANCA_DISPONIBILIDADE.md`:

**P1 — Alta:**
- [ ] **SEG-01: MFA para administradores** — Autenticação multifator obrigatória no login do admin
- [ ] **SEG-02: Política de senhas** — Força mínima, lockout após N tentativas, expiração
- [ ] **SEG-07: Plano de adequação LGPD** — Detalhar implementação: consentimento, cookies, encriptação de PII, logs de auditoria

**P2 — Média:**
- [x] **SEG-03: Plano de Resposta a Incidentes (IRP)** — `docs/INCIDENT_RESPONSE_PLAN.md` criado (severidades SEV-0/1/2/3 + fluxo + procedimentos específicos)
- [x] **SEG-04: SAST no pipeline CI** — CodeQL adicionado ao CI (`jobs.codeql` com `security-and-quality` queries)
- [x] **SEG-05: Scanner de dependências** — `.github/dependabot.yml` criado (npm weekly + GH Actions monthly + grupos Tamagui/Supabase)
- [x] **SEG-06: GDPR compliance** — `docs/GDPR_COMPLIANCE.md` criado (direitos, bases legais, DPO, violação, transferências)
- [x] **SEG-09: Teste de intrusão (pentest)** — `docs/PENTEST_PLAN.md` criado (escopo anual, metodologia, ferramentas)
- [x] **SEG-10: Treinamento de segurança para equipe** — `docs/SECURITY_TRAINING.md` criado (4 módulos + periodicidade)
- [x] **SEG-12: CORS hardening policy** — `docs/CORS_POLICY.md` criado (config Next.js + Supabase + Edge Functions + regras)

**P3 — Baixa:**
- [ ] **SEG-08: Plano PCI-DSS** — Roadmap para conformidade quando pagamentos forem implementados
- [ ] **SEG-11: Responsible Disclosure / security.txt** — Canal para pesquisadores reportarem vulnerabilidades

### DR — Disponibilidade e Recuperação de Desastres

**P1 — Alta:**
- [ ] **DR-01: Definir SLA** — Tempo de atividade alvo (99.9% = ~8.7h/ano, 99.95% = ~4.3h/ano)
- [ ] **DR-02: Plano de Recuperação de Desastres (DRP)** — RTO/RPO, procedimento de restore
- [ ] **DR-03: Estratégia de backups** — Schedule, retention, imutabilidade, restore testado mensalmente

**P2 — Média:**
- [x] **DR-04: Manutenção zero-downtime** — `docs/ZERO_DOWNTIME_DEPLOY.md` criado (Next.js rolling + Expo CDN + DB migrations seguras + rollback)

**P3 — Baixa:**
- [ ] **DR-05: Status page pública** — Página de status operacional para transparência

### PRO — Profissionalismo

**P1 — Alta:**
- [ ] **PRO-02: Política de Privacidade** — Documento público claro sobre tratamento de dados
- [ ] **PRO-03: Termos de Serviço** — Termos de uso da plataforma

**P2 — Média:**
- [x] **PRO-01: Canais de suporte** — `docs/SUPPORT_CHANNELS.md` criado (5 canais + categorias + métricas de qualidade)
- [x] **PRO-05: Documentação de infraestrutura** — 6 docs stubs preenchidos: `domain-logic.md`, `event-architecture.md`, `offline-strategy.md`, `engine-spec.md`, `jsonb-governance.md`, `data-lifecycle.md`

**P3 — Baixa:**
- [ ] **PRO-04: SLA auditável** — Dashboard público de uptime + relatórios periódicos

### OBS — Observabilidade e Monitoramento

**P1 — Alta:**
- [ ] **OBS-01: Implementar Sentry/APM** — Monitoramento de erros reais em produção

**P2 — Média:**
- [x] **OBS-02: Alertas configurados** — `docs/ALERTING_POLICY.md` criado (12 métricas + limiares + canais + escalação)
- [x] **OBS-03: Logs centralizados** — `docs/LOGGING_STRATEGY.md` criado (formato JSON, níveis, logger, centralização futura)
- [x] **OBS-04: Health check endpoints** — `/api/health` e `/api/ready` implementados em `apps/admin/src/app/api/` + `docs/HEALTH_CHECK_ENDPOINTS.md`

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
- [ ] **Certificado do curso** — Fornecido ao aluno após conclusão do curso (não por módulo). Upload do certificado em PDF e imagem, com editor de tamanho no mesmo esquema dos blocos (ao clicar, exibir pontos de arrasto para redimensionar). Impacta schema (`certificates`), storage (PDF/imagem), lógica de conclusão, UI do admin (upload + editor de tamanho) e UI do aluno (visualização/download).

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
| SEG | Segurança e Compliance |
| DR | Disponibilidade e Recuperação de Desastres |
| PRO | Profissionalismo (suporte, docs, SLA) |
| OBS | Observabilidade e Monitoramento |
