# 📋 BACKLOG — Plataforma de Cursos EAD com CMS

> **Priorização e SLA:** P0 (imediato, ≤ 7d), P1 (curto prazo, ≤ 30d), P2 (médio prazo, ≤ 90d), P3 (baixa prioridade, sem SLA).
>
> **Status:** `Backlog` | `In Progress` | `Paused [REVISIT: YYYY-MM-DD]` | `Done`
>
> **Severidade:** 🔴 Crítico | 🟠 Alto | 🟡 Médio | 🟢 Baixo
>
> **Regras vinculantes:** `docs/FORBIDDEN_OPERATIONS.md` secção 8 (DT-01 a DT-04).
>
> **Owner:** Agente que assume o item. Itens sem owner são `unassigned`.

---

## 🏆 P0 — Sprint Actual (≤ 7 dias)

### 💾 Salvar Progresso da Aula (Video + Quiz + Blocos Interactivos)

| Campo | Valor |
|---|---|
| **Status** | Done |
| **Severidade** | 🔴 Crítico |
| **Owner** | Agente |
| **Due** | 2026-06-25 |
| **Criado** | 2026-06-20 |
| **Concluído** | 2026-06-20 |
| **Descrição** | Sistema de save de progresso da aula do aluno via expo-sqlite: (1) Botão "Salvar" no sub-header de CourseLessons e LessonPlayer; (2) SQLite para save imediato client-side; (3) ProgressService para persistência no Supabase; (4) Restauração automática ao reabrir aula (cross-device); (5) Auto-save como rede de segurança (debounce 5s); (6) Sistema extensível via schema auto-declarativo para novos blocos interactivos; (7) Toast de feedback visual; (8) Sincronização bidirecional (syncService); (9) Download de módulos offline (contentCacheService); (10) Cache de mídia (mediaCacheService); (11) Monitor de conexão (useConnectionStatus); (12) Badge offline no StudentHeader. |
| **Critérios de sucesso** | (1) Botão Salvar funciona em CourseLessons e LessonPlayer; (2) Progresso do vídeo é salvo e restaurado; (3) Respostas de quiz são salvas e restauradas; (4) Cross-device sync funciona (login noutro dispositivo); (5) Offline: save fica em SQLite, sync ao reconectar; (6) Toast aparece e desaparece após 3s; (7) Auto-save dispara após 5s; (8) Schema auto-declarativo funciona para novos blocos; (9) Download de módulos funciona; (10) Badge offline aparece quando sem conexão |
| **Plano** | `docs/plans/2026-06-20-save-progress.md` |
| **ADR** | `docs/adrs/ADR-023-offline-first-sqlite.md` (superseded ADR-011) |

### 🧪 Validação Manual — Telas Alunos, Mídia e Relatórios

| Campo | Valor |
|---|---|
| **Status** | Backlog |
| **Severidade** | 🟠 Alto |
| **Owner** | unassigned |
| **Due** | 2026-06-26 |
| **Criado** | 2026-06-19 |
| **Descrição** | Testar manualmente as 3 novas telas admin: (1) **Alunos** — criar, editar, listar, ver detalhe com matrículas e progresso; (2) **Mídia** — upload, preview, eliminar, filtros por tipo; (3) **Relatórios** — validar KPIs, matrículas, ranking de cursos, certificados, top aulas, e a nova secção de **Revisitas de Aulas**. Requer aluno a interagir nos cursos para gerar dados reais de progresso e revisitas. Cenários: assistir aula completa (≥85%), reassistir aula já completa (verificar tracking de revisita), submeter quiz, verificar certificado emitido. |
| **Critérios de sucesso** | (1) Todas as telas carregam sem erros; (2) CRUD de alunos funciona; (3) Upload/eliminação de mídia funciona; (4) KPIs nos relatórios reflectem dados reais; (5) Revisitas aparecem no relatório quando aluno reassiste aula completa; (6) Timeline de revisitas mostra dados; (7) Alunos sem matrícula mostram aviso; (8) Período filtrado mostra dados consistentes; (9) **Gráfico de torre** na secção Matrículas — barras empilhadas verde (ativas), amarelo (expiradas), vermelho (canceladas) por curso |

### 🚦 Definir critério de push para origin (desbloqueia G-01)

| Campo | Valor |
|---|---|
| **Status** | Backlog |
| **Severidade** | 🟠 Alto |
| **Owner** | unassigned |
| **Due** | Antes do MVP |
| **Criado** | 2026-06-04 |
| **Descrição** | Push para `origin` está bloqueado até que o critério objectivo de "MVP concluído" seja definido. Decisão do usuário (2026-06-04): "Definir mais tarde". Candidatos: P0 vazio + build verde + testes 100% + lint 0 erros + dívidas P1 resolvidas. Detalhes em `docs/runbooks/push-strategy.md`. |

### 🧩 Button-Screen Linking — itens que precisam de spec (deferred 2026-06-06)

| Campo | Valor |
|---|---|
| **Status** | Backlog |
| **Severidade** | 🟠 Alto |
| **Owner** | unassigned |
| **Due** | Antes do MVP |
| **Criado** | 2026-06-06 |
| **Label** | `needs-spec` |
| **Branch relacionada** | `feat/button-screen-linking` (3 commits implementados) |
| **Descrição** | Auditoria de fluxos (2026-06-06) identificou 4 itens implementáveis + 7 itens que dependem de decisões de produto/arquitectura. Os 4 implementáveis (service `certificate-actions`, wiring no `Certificates.tsx`, forwarding de `lessonId` como search param, ADR-020) foram entregues em 3 commits (`1067efb`, `daad3d3`, `c884961`). Os 7 itens abaixo foram adiados para o próximo sprint até que cada spec seja escrita. |

**Itens `needs-spec` (5 P0 + 2 P1):**

| # | Item | Prioridade | Spec necessária | Origem |
|---|---|---|---|---|
| 1 | Endpoint real de download de PDF (substituir placeholder `api.example.com`) | P0 | Decidir: Supabase Edge Function vs API route Next.js vs Bunny Stream signed URL | Plan §#1, G-01 #1 |
| 2 | URL de validação externa de certificados (substituir placeholder `validacao.example.com`) | P0 | Contrato com extranet parceira (RFC, auth scheme, formato de UUID) | Plan §#1, G-01 #1 |
| 3 | UX do "Voltar ao curso" — comportamento contextual após lição | P0 | Decidir: volta para `CourseLessons` com scroll para lição actual vs dashboard | Plan §#6, G-01 #1 |
| 4 | Semântica de "Continuar de onde parei" (milestone tracking) | P0 | Definir: % de progresso por aula vs módulo vs curso; qual é o ponto de "retomada" | Plan §#7, G-01 #1 |
| 5 | Política de storage para upload de imagens de certificado (PWA admin) | P0 | Decidir: bucket partilhado vs dedicado, RLS policies, max size, allowed MIME types | Plan §#A, G-01 #1 |
| 6 | Error fallback quando endpoint de PDF está down | P1 | Decidir: retry com backoff vs mensagem amigável + contact support | Plan §#1 follow-up |
| 7 | Telemetria de "compartilhar certificado" (analytics) | P1 | Decidir: qual evento, quais properties, integração com qual provider (PostHog? Plausible?) | Plan §#share follow-up |

**Commits da branch `feat/button-screen-linking` (3 entregues):**
- `1067efb` — `feat(student): add certificate-actions service with PDF/share/validate` (3 ficheiros, 5 testes)
- `daad3d3` — `feat(student): wire certificate actions in Certificates screen` (1 ficheiro, +4/-3)
- `c884961` — `feat(student): forward lessonId as search param to player route` (3 source files + ADR-020, 60 linhas)

**Próximo passo:** cada item `needs-spec` deve ser promovido a issue dedicado com secção "Decisão pendente" antes de entrar em sprint. Owner: alguém com acesso a product/architecture.

### 🔒 CONFID-01 — Regra vinculante de confidencialidade comercial

| Campo | Valor |
|---|---|
| **Status** | Done |
| **Severidade** | 🔴 Crítico |
| **Owner** | Agente 3 |
| **Due** | 2026-06-08 |
| **Criado** | 2026-06-05 |
| **Commit** | `d48f863` |
| **Descrição** | Regra absoluta CONFID-01 adicionada a `docs/FORBIDDEN_OPERATIONS.md` (secção 9): proíbe mencionar nomes de empresas-alvo, parceiros em negociação, ou entidades do sector-alvo em código, commits, BACKLOG, ADRs, SDRs, feedback, ou qualquer artefato versionado. Referência cruzada em `AGENTS.md` secção "Regras Vinculantes". Consequência: Crítica (commit rejeitado + correção imediata). |

### 🎯 ICP-01 — Re-brand genérico do backlog e buffer

| Campo | Valor |
|---|---|
| **Status** | Done |
| **Severidade** | 🟠 Alto |
| **Owner** | Agente 3 |
| **Due** | 2026-06-08 |
| **Criado** | 2026-06-05 |
| **Done** | 2026-06-05 |
| **Commit** | `6b5f17d` |
| **Descrição** | Reescrita genérica aplicada a `BACKLOG.md`, `context_buffer.md`, `Requisitos_plataforma.md`, `database_schema_plan.md`, ADRs. ICP genérico validado: "B2B PaaS — plataforma para organizações que querem criar, distribuir e monetizar conhecimento". Validação: `grep -riE "(uuid_bsgi|bsgi|bsb|bss|empresa-alvo|setor-alvo)"` retorna apenas auto-referências ao CONFID-01 (audit trail permitido). |

### ⏳ Fase 5A — Isolamento definitivo do editor de certificado

| Campo | Valor |
|---|---|
| **Status** | Done |
| **Severidade** | 🔴 Crítico |
| **Owner** | Agente 3 (Eng. Sênior) |
| **Due** | 2026-06-15 |
| **Criado** | 2026-06-01 |
| **Done** | 2026-06-05 |
| **SDR** | SDR-001 |
| **Commits** | `39a9957`, `1dd3854`, `0dd269b`, `9f2a0ba`, `043d601` |
| **Descrição** | Inventário real: 13 branches `isCertMode` em `EditorCanvas.tsx`, 3 em `BlockSettings.tsx`, 5 em `EditorContext.tsx`, 1 em `EditorHeader.tsx`. Bug crítico: `EditorCanvas.tsx:1282` renderiza bloco de certificado com `BlockContent` (renderer de aula) em vez de `CertificateBlockRenderer`. **Resolvido:** 5A.1-5A.5 todos Done (45 testes TDD passam, 88/88 admin tests verde). |

**Sub-itens (prioridade de ataque):**

| # | Item | Testes | Tempo | Status | Owner |
|---|---|---|---|---|---|
| 🔴 **5A.4** | **EditorCanvas cleanup — remover 13 branches `isCertMode` (fix `EditorCanvas.tsx:1282`)** | — | ~2h | **Done** | **Agente 3** |
| 5A.5 | EditorContext testes mínimos (3 testes) | 3 | ~45min | Done | Agente 3 |

**Refactor separado (sprint à parte) ✅ Concluído em 2026-06-04:**
Causa raiz: refactor 5A.1-5A.3 não é pré-requisito técnico do fix da linha 1282; 5A.4 pode ser atacado independentemente. Documentado em `docs/history/2026-06-03-sessao-governanca.md` (secção "Decisão arquitectural").

| # | Item | Testes | Tempo | Status | Owner |
|---|---|---|---|---|---|
| 5A.1 | CertificatePalette (novo componente + extrair BlockBtn) | 7 | ~2h | Done | Agente 3 |
| 5A.2 | CertificateCanvas (render com CertificateBlockRenderer, duplex, offset) | 11 | ~3.5h | Done | Agente 3 |
| 5A.3 | CertificateEditor refactor (compor novos componentes, testes boundary) | 7 | ~1.5h | Done | Agente 3 |

**Fase 5B — Done (2026-06-12):**

| Item | Status | Causa raiz do adiamento |
|---|---|---|
| Extrair `useViewportInteraction` para ficheiro dedicado | **Done (2026-06-12)** | Extraído para `hooks/useViewportInteraction.ts` com `editor-types.ts` partilhado — #5B-Item1 |
| Eliminar prop `mode` do `EditorProvider` | **Done (2026-06-12)** | `mode` agora implícito via `modeConfig.mode` — #5B-Item2 |
| Limpar 3 branches de init do `EditorContext` | **Done (2026-06-12)** | Branches movidas para `modeConfig.load()`; initDatabase mode-agnostic — #5B-Item3 |

---

## ✅ Done

| Item | Severidade | Resolução |
|---|---|---|
| Feat: Student app — tela de aulas e exercícios extras | 🟡 Médio | Implementado em `CourseLessons.tsx` |
| Feat: Student app — central de certificados | 🟡 Médio | Implementado em `Certificates.tsx` |
| Feat: Student app — Dashboard: botões contextuais | 🟡 Médio | Botões "Iniciar/Continuar/Próxima/Ver certificado" baseados no progresso real |
| Feat: Student app — Dashboard: botão "Ver aulas" | 🟢 Baixo | Botão estilizado com borda primary |
| Feat: Student app — Dashboard: remover badge redundante | 🟢 Baixo | Badge "64% concluído" removido do thumbnail |
| Feat: Student app — CourseLessons: botão hero contextual | 🟡 Médio | Botão muda entre "Retomar/Próxima/Ver certificado" |
| Chore: ProgressService — getProgressByLessons | 🟢 Baixo | Método adicionado ao serviço |
| Refactor: Student app — TopBar HTML→Tamagui + tokens | 🟡 Médio | `<ul>/<li>/<a>` migrados para YStack/XStack com tokens |
| Refactor: Shadow presets activos no design system | 🟡 Médio | Card consome `shadowPresets.cwSoft` + variant `elevated` |
| Fix: XSS sanitization no BlockRenderer (S-01) | 🔴 Crítico | `dompurify` + `sanitizeHtml()` em 3 sítios, 20+8 testes |
| BUG: Impressão duplex só mostra 1 face | 🟠 Alto | Resolvido via iframe srcdoc (SDR-002) + `side='all'` |
| BUG: CertificateMiniature perdeu prop isDoubleSided | 🟡 Médio | Resolvido pela arquitectura CertificatePage com `side='all'` |
| Validação: iframe print + Supabase Storage | 🟡 Médio | Bucket público confirmado, URLs `/object/public/` sem auth |
| BUG: Drag-and-drop de imagem no placeholder (cert + lesson) | 🟠 Alto | commits `13b7da3` (cert), `729a1c6` (lesson), 12 testes TDD |
| Refactor: extract uploadCertificateImageToBlock helper | 🟡 Médio | commit `e41d643`, 11 testes, DRY entre Canvas + ImageSettings |
| BUG: Student app — LessonPlayer crash | 🟠 Alto | Polling funcional + refresh ao focar aba |
| BUG: Student app — UUID hardcoded | 🟠 Alto | `useMobileProgress.ts` agora usa `AuthService.getSession()` |
| BUG: Student app — TopBar HTML tags e cores hardcoded | 🟡 Médio | Migrado para Tamagui |
| BUG: Student app — Shadow presets não usados | 🟡 Médio | Shadow presets aplicados |
| BUG: Zod schema — missing `heading` e `divider` | 🟠 Alto | Verificado em `packages/types/src/database.ts:96-97` |
| BUG: Drag-and-drop de imagem (mobile/tablet viewports) | 🟠 Alto | commit `c80d309`, cobertura mobile/tablet |
| Refactor: Fase 5A.1 — CertificatePalette + BlockBtn extraído | 🟡 Médio | commit `39a9957` (2026-06-03), 7 testes TDD passam |
| Refactor: Fase 5A.2 — CertificateCanvas com zoom + side filter | 🟡 Médio | commit `1dd3854` (2026-06-03), 11 testes TDD passam |
| Refactor: Fase 5A.3 — CertificateEditor decomposição + boundary tests | 🟡 Médio | commit `0dd269b` (2026-06-03) criou `CertificateEditor.boundary.test.ts` (7 testes); composição clean em `CertificateEditor.tsx:23-52` |
| Refactor: Fase 5A.4 — EditorCanvas cleanup (remove 13 branches `isCertMode`, fix bug linha 1282) | 🔴 Crítico | commit `9f2a0ba` (2026-06-03); bug crítico `cert render com BlockContent` resolvido |
| Refactor: Fase 5A.5 — EditorContext testes mínimos | 🟡 Médio | commit `043d601` (2026-06-04); 3 testes boundary do context passam |
| Governance: CONFID-01 — regra vinculante de confidencialidade comercial | 🔴 Crítico | commit `d48f863` (2026-06-05); `FORBIDDEN_OPERATIONS.md` secção 9, consequência Crítica |
| Governance: ICP-01 — re-brand genérico (B2B PaaS) em artefactos versionados | 🟠 Alto | commit `6b5f17d` (2026-06-05); 5 ficheiros reescritos com ICP genérico |
| Governance: ICP-02 — rename `uuid_bsgi` → `uuid_extranet` (código + 2 DB migrations) | 🔴 Crítico | commits `dabef56`, `29853af` (2026-06-05); 8 source files + 2 migrations SQL aplicadas manualmente no Supabase |

---

## 📌 P1 — Curto Prazo (≤ 30 dias)

| Item | Severidade | Status | Due | Owner |
|---|---|---|---|---|
| P1-01: Observabilidade (métricas, logs estruturados, alertas) | 🔴 Crítico | Backlog | 2026-06-30 | unassigned |
| P1-02: Testes de Carga (k6/artillery, validação ADR-017) | 🟠 Alto | Backlog | 2026-06-30 | unassigned |
| Continuar construção de telas do student app | 🟠 Alto | Backlog | 2026-06-30 | unassigned |
| Skill: TopBar/Header — padrão de cabeçalho compartilhado (admin + student) | 🟡 Médio | Backlog | 2026-06-30 | unassigned |
| Skill: Student Screen — padrão de construção de telas do aluno | 🟡 Médio | Backlog | 2026-06-30 | unassigned |
| Extrair filtro/ordenação para componente reutilizável (`@projeto/ui`) | 🟠 Alto | Done | 2026-06-30 | Agente 3 |
| Student app — Tela de cursos com filtro/ordenação (reutilizar componente) | 🟡 Médio | Done | 2026-06-30 | Agente 3 |
| Testes E2E Playwright para drag-and-drop de imagem | 🟡 Médio | Backlog | 2026-06-30 | Agente 3 |
| Student app — ErrorBoundary | 🟡 Médio | Backlog | 2026-06-30 | Agente 3 |
| Fix build admin — `@tamagui/constants` missing como dependência explícita | 🟠 Alto | Done | 2026-06-10 | Agente 2 |
| Fix renderer test — `BlockRenderer.test.tsx` syntax error (XSS test) | 🟡 Médio | Done | 2026-06-15 | Agente 1 |
| ICP-02 — Rename `uuid_bsgi` → `uuid_extranet` em código fonte (CONFID-01 follow-up) | 🔴 Crítico | Done | 2026-06-10 | Agente 3 |

**P1-01 Observabilidade — Detalhe:** Sistema operando às cegas. Zero métricas de performance, zero logs estruturados, zero alertas. Impossível detectar degradação ou justificar optimizações (Redis, CDN, etc.). Critérios: library de métricas instalada, dashboard com request rate/error rate/latency P50/P95/P99, alertas para P95 > 500ms e error rate > 1%, logs estruturados JSON com requestId/userId/duration. Detalhes em `docs/BACKLOG_TECHNICAL_DEBT.md` §P1-01. Dependências: Nenhuma (condição prévia para todos os P1 de infraestrutura).

**P1-02 Testes de Carga — Detalhe:** Zero testes k6/artillery no repositório. Impossível justificar Redis/CDN sem dados de performance sob carga. Critérios: script k6 ou artillery, cenários 100/500/1000/5000 users simultâneos, métricas throughput/latência P95/error rate, trigger thresholds ADR-017 validados. Detalhes em `docs/BACKLOG_TECHNICAL_DEBT.md` §P1-02. Dependências: P1-01 (métricas precisam existir).

**Contexto GTM (2026-06-05):** Estes P1 bloqueiam staging push (sem build verde não há demo). Sem demo, validação MVP com cliente piloto fica comprometida. Atacar antes de qualquer trabalho em MVP Coverage.

**ICP-02 — Detalhe:** Confirmação do utilizador (2026-06-05) de que CONFID-01 proíbe **qualquer** referência a entidades do sector-alvo, mesmo técnicas (campo `uuid_bsgi`, função `generateBsgiCode`, prefixo `BSGI-` em códigos). **Resolvido em 2026-06-05** (commits `dabef56`, `29853af`): 2 migrations SQL aplicadas (rename column + rename index em `certificates`), 8 ficheiros de código fonte renomeados (`database.ts`, `ICertificateRepository.ts`, `supabase-certificate-repository.ts`, `certificate.ts`, `certificate.test.ts`, `page.tsx` admin, `Certificates.tsx` student). `init_schema.sql` preserva estado histórico (padrão correcto de migrations cumulativas). Função renomeada: `generateBsgiCode` → `generateExtranetCode`. Prefixo de código: `BSGI-` → `EXTR-`.

**P1-02 — Investigação (2026-06-05):** Erro "Expected 'from', got 'typeOf'" ocorre no SSR transform de `BlockRenderer.tsx` ao importar `@projeto/ui` (Tamagui). Root cause: incompatibilidade conhecida entre Vitest 1.6.1 + Vite 5.4.21 SSR transform + Tamagui 2.0-rc.42. Não é um problema no test file (verifiquei: minimal test com mesmo import falha, JSX é parseado por Rollup que não conhece TS type annotations). Solução proposta: upgrade Vitest para 2.x (breaking change em API mínima) **ou** configurar `server.deps.external` para bypassar SSR transform de Tamagui. ADR necessário para escolher caminho.

**P1-02 — Resolução (2026-06-05):** Solução adoptada: refactor do test file para testar `sanitizeHtml` directamente (do ficheiro `packages/ui/src/utils/sanitize.ts`) em vez de `BlockRenderer` end-to-end. Razão: a defesa XSS é implementada em `sanitizeHtml`; o `BlockRenderer` apenas invoca essa função, sem lógica XSS adicional. Vantagens: (1) test fica mais focado, (2) evita o import chain que dispara o SSR error de Tamagui, (3) cobre mais casos (10 testes vs 8 originais — adicionado empty input, plain text, style attribute stripping). Ficheiro renomeado de `.tsx` para `.ts` (sem JSX agora). Vitest config actualizado para `environmentMatchGlobs` com extensão `.ts`. 13/13 testes renderer verde.

---

## 🗓️ P2 — Médio Prazo (≤ 90 dias)

| Item | Severidade | Status | Due | Owner |
|---|---|---|---|---|
| Concorrência de progresso multi-dispositivo (version check + merge inteligente) | 🟡 Médio | Backlog [REVISIT: 2026-08-01] | 2026-08-01 | unassigned |
| Student app — Alinhar layout com design reference | 🟢 Baixo | Backlog | 2026-07-15 | Agente 3 |
| BUG: Student app — Dashed border cor errada | 🟢 Baixo | Paused [REVISIT: 2026-07-01] | 2026-07-01 | Agente 3 |
| Admin — seção de exercícios extras | 🟢 Baixo | Backlog | 2026-07-30 | Agente 2 |
| Student app — CourseLessons: duração real das aulas | 🟡 Médio | Backlog | 2026-08-01 | Agente 3 |
| Admin — Substituir hex hardcoded por tokens Tamagui (`$color`) | 🟡 Médio | Backlog | 2026-07-15 | Agente 3 |
| Student app — CourseLessons: progresso por módulo | 🟢 Baixo | Backlog | 2026-08-15 | Agente 3 |
| 🛡️ Controle de Acesso a Cursos via Planos (SaaS Multi-Tenant) | 🟠 Alto | Concluído | 2026-06-10 | Agente |

**Detalhe Controle de Acesso:** Sistema de controle de acesso a cursos no modelo SaaS. Admin configura por curso (Livre/Progressivo/Restrito) na tela de configurações (acima do toggle de publicação). Aluno vê estado na tela "Explorar Cursos". Plano completo: `docs/plans/2026-06-10-controle-acesso.md` | Workflow: `docs/workflows/workflow_adm.md` secção 11.

---

## 🌱 P3 — Baixa Prioridade (sem SLA)

| Item | Severidade | Status |
|---|---|---|
| CRUD de Planos no Admin (criar/editar planos, vincular cursos, atribuir alunos) | 🟢 Baixo | Backlog |
| BUG: Cursor escapa durante resize | 🟢 Baixo | Backlog |
| BUG: Aspect ratio de imagem em W/N/cantos | 🟢 Baixo | Backlog |
| Extrair `removeBackground` para Web Worker | 🟢 Baixo | Backlog |
| Player Mobile: retomada inteligente de vídeo | 🟢 Baixo | Backlog |
| Student app — Migrar BlockRenderer para Tamagui | 🟢 Baixo | Backlog |
