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
| **Status** | In Progress |
| **Severidade** | 🟠 Alto |
| **Owner** | Agente 3 |
| **Due** | 2026-06-08 |
| **Criado** | 2026-06-05 |
| **Descrição** | Reescrever todos os artefactos versionados com ICP genérico: "plataforma B2B PaaS de cursos online para organizações que querem criar, distribuir e monetizar conhecimento (escolas, ONGs, empresas, comunidades)". Substituir qualquer referência a sector específico, exemplo de cliente, contexto de negociação, OU fornecedor técnico específico. Artefatos a tocar: `docs/BACKLOG.md`, `docs/context_buffer.md`, `docs/Requisitos_plataforma.md`, `docs/layers/supabase/database_schema_plan.md`, eventuais ADRs. Validação: `grep -ri "termos-confidenciais" docs/` deve retornar **zero matches** em artefactos versionados. Renomeação técnica: campo `uuid_extranet` aplicado ao schema (P1 follow-up: nova migration para renomeação do campo legado). |

### ⏳ Fase 5A — Isolamento definitivo do editor de certificado

| Campo | Valor |
|---|---|
| **Status** | In Progress |
| **Severidade** | 🔴 Crítico |
| **Owner** | Agente 3 (Eng. Sênior) |
| **Due** | 2026-06-15 |
| **Criado** | 2026-06-01 |
| **SDR** | SDR-001 |
| **Descrição** | Inventário real: 13 branches `isCertMode` em `EditorCanvas.tsx`, 3 em `BlockSettings.tsx`, 5 em `EditorContext.tsx`, 1 em `EditorHeader.tsx`. Bug crítico: `EditorCanvas.tsx:1282` renderiza bloco de certificado com `BlockContent` (renderer de aula) em vez de `CertificateBlockRenderer`. Plano: 28 novos testes TDD (total 45), 5 commits, ~10h. |

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
| Bug: cert render com `BlockContent` | **Bug da linha 1282** — subsumido em 5A.4 (prioridade máxima) |

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

---

## 📌 P1 — Curto Prazo (≤ 30 dias)

| Item | Severidade | Status | Due | Owner |
|---|---|---|---|---|
| Testes E2E Playwright para drag-and-drop de imagem | 🟡 Médio | Backlog | 2026-06-30 | Agente 3 |
| Student app — ErrorBoundary | 🟡 Médio | Backlog | 2026-06-30 | Agente 3 |
| Fix build admin — `@tamagui/constants` missing como dependência explícita | 🟠 Alto | Backlog | 2026-06-10 | Agente 2 |
| Fix renderer test — `BlockRenderer.test.tsx` syntax error (XSS test) | 🟡 Médio | Backlog | 2026-06-15 | Agente 1 |

**Contexto GTM (2026-06-05):** Estes dois P1 bloqueiam staging push (sem build verde não há demo). Sem demo, validação MVP com cliente piloto fica comprometida. Atacar antes de qualquer trabalho em MVP Coverage.

---

## 🗓️ P2 — Médio Prazo (≤ 90 dias)

| Item | Severidade | Status | Due | Owner |
|---|---|---|---|---|
| Student app — Alinhar layout com design reference | 🟢 Baixo | Backlog | 2026-07-15 | Agente 3 |
| BUG: Student app — Dashed border cor errada | 🟢 Baixo | Paused [REVISIT: 2026-07-01] | 2026-07-01 | Agente 3 |
| Admin — seção de exercícios extras | 🟢 Baixo | Backlog | 2026-07-30 | Agente 2 |
| Student app — CourseLessons: duração real das aulas | 🟡 Médio | Backlog | 2026-08-01 | Agente 3 |
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
