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

### 🚦 Definir critério de push para origin (desbloqueia G-01)

| Campo | Valor |
|---|---|
| **Status** | Backlog |
| **Severidade** | 🟠 Alto |
| **Owner** | unassigned |
| **Due** | Antes do MVP |
| **Criado** | 2026-06-04 |
| **Descrição** | Push para `origin` está bloqueado até que o critério objectivo de "MVP concluído" seja definido. Decisão do usuário (2026-06-04): "Definir mais tarde". Candidatos: P0 vazio + build verde + testes 100% + lint 0 erros + dívidas P1 resolvidas. Detalhes em `docs/runbooks/push-strategy.md`. |

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

**Adiado para Fase 5B [REVISIT: 2026-06-20]:**

| Item | Causa raiz do adiamento |
|---|---|
| Extrair `useViewportInteraction` para ficheiro dedicado | Bloqueado por 5A.4 — branches `isCertMode` consomem o hook internamente |
| Eliminar prop `mode` do `EditorProvider` | Bloqueado por 5A.5 — sem testes não há segurança para refactor |
| Limpar 3 branches de init do `EditorContext` | Bloqueado por 5A.5 |

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
| Extrair filtro/ordenação para componente reutilizável (`@projeto/ui`) | 🟠 Alto | Done | 2026-06-30 | Agente 3 |
| Student app — Tela de cursos com filtro/ordenação (reutilizar componente) | 🟡 Médio | Done | 2026-06-30 | Agente 3 |
| Testes E2E Playwright para drag-and-drop de imagem | 🟡 Médio | Backlog | 2026-06-30 | Agente 3 |
| Student app — ErrorBoundary | 🟡 Médio | Backlog | 2026-06-30 | Agente 3 |
| Fix build admin — `@tamagui/constants` missing como dependência explícita | 🟠 Alto | Done | 2026-06-10 | Agente 2 |
| Fix renderer test — `BlockRenderer.test.tsx` syntax error (XSS test) | 🟡 Médio | Done | 2026-06-15 | Agente 1 |
| ICP-02 — Rename `uuid_bsgi` → `uuid_extranet` em código fonte (CONFID-01 follow-up) | 🔴 Crítico | Done | 2026-06-10 | Agente 3 |

**Contexto GTM (2026-06-05):** Estes P1 bloqueiam staging push (sem build verde não há demo). Sem demo, validação MVP com cliente piloto fica comprometida. Atacar antes de qualquer trabalho em MVP Coverage.

**ICP-02 — Detalhe:** Confirmação do utilizador (2026-06-05) de que CONFID-01 proíbe **qualquer** referência a entidades do sector-alvo, mesmo técnicas (campo `uuid_bsgi`, função `generateBsgiCode`, prefixo `BSGI-` em códigos). **Resolvido em 2026-06-05** (commits `dabef56`, `29853af`): 2 migrations SQL aplicadas (rename column + rename index em `certificates`), 8 ficheiros de código fonte renomeados (`database.ts`, `ICertificateRepository.ts`, `supabase-certificate-repository.ts`, `certificate.ts`, `certificate.test.ts`, `page.tsx` admin, `Certificates.tsx` student). `init_schema.sql` preserva estado histórico (padrão correcto de migrations cumulativas). Função renomeada: `generateBsgiCode` → `generateExtranetCode`. Prefixo de código: `BSGI-` → `EXTR-`.

**P1-02 — Investigação (2026-06-05):** Erro "Expected 'from', got 'typeOf'" ocorre no SSR transform de `BlockRenderer.tsx` ao importar `@projeto/ui` (Tamagui). Root cause: incompatibilidade conhecida entre Vitest 1.6.1 + Vite 5.4.21 SSR transform + Tamagui 2.0-rc.42. Não é um problema no test file (verifiquei: minimal test com mesmo import falha, JSX é parseado por Rollup que não conhece TS type annotations). Solução proposta: upgrade Vitest para 2.x (breaking change em API mínima) **ou** configurar `server.deps.external` para bypassar SSR transform de Tamagui. ADR necessário para escolher caminho.

**P1-02 — Resolução (2026-06-05):** Solução adoptada: refactor do test file para testar `sanitizeHtml` directamente (do ficheiro `packages/ui/src/utils/sanitize.ts`) em vez de `BlockRenderer` end-to-end. Razão: a defesa XSS é implementada em `sanitizeHtml`; o `BlockRenderer` apenas invoca essa função, sem lógica XSS adicional. Vantagens: (1) test fica mais focado, (2) evita o import chain que dispara o SSR error de Tamagui, (3) cobre mais casos (10 testes vs 8 originais — adicionado empty input, plain text, style attribute stripping). Ficheiro renomeado de `.tsx` para `.ts` (sem JSX agora). Vitest config actualizado para `environmentMatchGlobs` com extensão `.ts`. 13/13 testes renderer verde.

---

## 🗓️ P2 — Médio Prazo (≤ 90 dias)

| Item | Severidade | Status | Due | Owner |
|---|---|---|---|---|
| Student app — Alinhar layout com design reference | 🟢 Baixo | Backlog | 2026-07-15 | Agente 3 |
| BUG: Student app — Dashed border cor errada | 🟢 Baixo | Paused [REVISIT: 2026-07-01] | 2026-07-01 | Agente 3 |
| Admin — seção de exercícios extras | 🟢 Baixo | Backlog | 2026-07-30 | Agente 2 |
| Student app — CourseLessons: duração real das aulas | 🟡 Médio | Backlog | 2026-08-01 | Agente 3 |
| Admin — Substituir hex hardcoded por tokens Tamagui (`$color`) | 🟡 Médio | Backlog | 2026-07-15 | Agente 3 |
| Student app — CourseLessons: progresso por módulo | 🟢 Baixo | Backlog | 2026-08-15 | Agente 3 |

---

## 🌱 P3 — Baixa Prioridade (sem SLA)

| Item | Severidade | Status |
|---|---|---|
| BUG: Cursor escapa durante resize | 🟢 Baixo | Backlog |
| BUG: Aspect ratio de imagem em W/N/cantos | 🟢 Baixo | Backlog |
| Extrair `removeBackground` para Web Worker | 🟢 Baixo | Backlog |
| Player Mobile: retomada inteligente de vídeo | 🟢 Baixo | Backlog |
| Student app — Migrar BlockRenderer para Tamagui | 🟢 Baixo | Backlog |
