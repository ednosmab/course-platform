# SDR-001: Certificate editor and lesson editor must be physically isolated

- **Data:** 2026-06-01
- **Problema:** The certificate preview, miniature and duplex print broke three times in a row (commits `ed231f7`, `cc1a903`, `a12ec7c`, `6b8ea7a`) because `EditorCanvas.tsx` is a 1450-line monolith that branches on `if (mode === 'certificate')` to render certificate blocks using the lesson `BlockContent` renderer. Any visual tweak to the lesson preview silently affects the certificate.
- **Causa Raiz:** Architectural coupling — the certificate editor is implemented as a variant of the lesson editor (`mode` prop) instead of an independent component. They share the canvas, the renderer, the viewport containers (mobile/tablet — meaningless for certificate), the preview chrome and the duplex logic, so every change to one leaks into the other.
- **Solução:** Promote the certificate editor to a dedicated route (`/studio/[courseId]/certificate`) with its own components (`CertificateCanvas`, `CertificateBlockSettings`, `CertificateEditor`). Keep the redirect from the legacy `?mode=certificate` URL. Both editors must share only the `CertificateBlockRenderer` and the Zod contracts in `packages/types` — never the canvas, the preview chrome or the resize/drag logic. Boundary rule added to `apps/admin/AGENTS.md`.
- **Arquivos:**
  - `apps/admin/src/components/editor/EditorCanvas.tsx` (lines 610-748, 1141-1198, 1285-1294) — remove `isCertMode` branches
  - `apps/admin/src/app/studio/[courseId]/certificate/page.tsx` (new) — dedicated route
  - `apps/admin/src/app/studio/[courseId]/page.tsx` (line 65-71) — 308 redirect
  - `apps/admin/src/components/certificate-editor/CertificateCanvas.tsx` (new) — uses `CertificateBlockRenderer` only
  - `apps/admin/src/components/certificate-editor/CertificateEditor.tsx` (new)
  - `apps/admin/src/components/certificate-editor/CertificateBlockSettings.tsx` (new)
  - `apps/admin/src/app/configuracoes/[courseId]/page.tsx` (line 609-613, 679-748) — restore duplex and `isDoubleSided` prop
  - `packages/ui/src/components/Certificate/CertificatePage.tsx` — restore two-canvas duplex loop
  - `packages/ui/src/components/Certificate/CertificateMiniature.tsx` — re-enable duplex rendering
  - `apps/admin/AGENTS.md` — boundary rule

---

## 📝 Decisão de Execução (Fase 3 — 2026-06-02)

A Fase 3 do refactor optou conscientemente por uma **extração arquitectural** em vez de uma **extração completa de internals**. Razões:

### O que está isolado (físico, no edge)
- Rota dedicada: `/studio/[courseId]/certificate/page.tsx` é a única entry point canônica
- Redirect 308 real: `apps/admin/next.config.ts` → `?mode=certificate` vira a nova rota no edge (antes do React hidratar)
- Entry component dedicado: `CertificateEditor.tsx` encapsula o comportamento de cert
- Branch `mode === 'certificate'` removido do `studio/[id]/page.tsx`

### O que NÃO está isolado (P1 deliberado)
- `EditorCanvas.tsx` (1453 linhas) ainda tem `isCertMode` em ~15 lugares
- `BlockSettings.tsx` (1355 linhas) ainda tem `mode === 'certificate'` em 5 lugares
- `EditorHeader.tsx` (209 linhas) ainda tem um branch de cert (linha 179)
- `BlockPalette.tsx` é partilhado sem branches (intencional — paleta é a mesma)

### Por que adiar a extracção de internals
1. **Risco vs. retorno marginal**: mover ~600 linhas entre ficheiros com surgical precision introduz risco alto de regressão visual no editor de aula. A boundary na URL + entry component já garante o objectivo principal (mudanças no editor de aula não quebram o cert) — o boundary nos internals é uma melhoria incremental.
2. **TDD estrito**: extrair `CertificateCanvas` sem testes seria violar RED-GREEN-REFACTOR. O teste suite actual (16 testes em `packages/ui/src/components/Certificate/`) protege a renderização de blocos, mas não protege a montagem de drag/drop/resize do canvas — o que seria o verdadeiro challenge.
3. **Acoplamento via `useViewportInteraction`**: o hook de drag/resize é partilhado entre cert e lesson. Extrair só a vista de canvas sem o hook deixaria a separação incompleta. Mover o hook para um ficheiro partilhado é trivial; duplicá-lo em dois ficheiros é duplicação que viola DRY.

### Roadmap de follow-up (Fase 5+)
1. Extrair `useViewportInteraction` para `apps/admin/src/components/editor/hooks/useViewportInteraction.ts`
2. Criar `CertificateCanvas.tsx` que depende desse hook + `CertificateBlockRenderer` (sem `isCertMode` branches)
3. Criar `CertificateBlockSettings.tsx` com a parte cert-only do `BlockSettings.tsx`
4. Remover os branches `mode === 'certificate'` do `EditorCanvas.tsx` e `EditorHeader.tsx`
5. Eliminar a prop `mode` do `EditorProvider` (passa a ser implícita pela rota)

Cada passo deve ser precedido de testes (TDD) que documentem o comportamento actual antes da refactor.

---

## 🔍 Revisão Exaustiva (Fase 5A — 2026-06-03)

Leitura real do código revelou dados mais precisos:

### Inventário Exacto de Branches `isCertMode`

| Ficheiro | Branches Reais | Earlier Estimate |
|---|---|---|
| `EditorCanvas.tsx` (1447 linhas) | **13** (linhas 621, 639, 1138, 1139, 1141, 1158, 1185×2, 1197, 1207, 1222, 1224, 1357) | ~15 |
| `BlockSettings.tsx` (1255 linhas) | **3** (linhas 476, 958, 968) — só image block | ~5 |
| `EditorContext.tsx` (646 linhas) | **5** (linhas 400, 440, 462, 467, 485) | ~5 |
| `EditorHeader.tsx` (209 linhas) | **1** (linha 179) | ~1 |
| `BlockPalette.tsx` | **0** (usa `allowedBlockTypes` data-driven) | — |
| **Total** | **22** | ~26 |

### Bug Crítico Encontrado
`EditorCanvas.tsx:1282` renderiza blocos do certificado com `BlockContent` (inline lesson renderer, linhas 185-538, 350 linhas privadas) em vez de `CertificateBlockRenderer` (de `packages/ui`). Isto viola a boundary rule do SDR-001. Não foi corrigido em Fase 3 porque o refactor foi adiado.

### Complexidade do `EditorCanvas` (1447 linhas)
```
 8-16: Constantes (CANVAS_W, PAGE_W, MOBILE_W, TABLET_W, A4_RATIO)
18-21: isOutOfBounds()
23-58: parseSimpleMarkdown() — privado, lesson-only
90-109: getLayout() — partilhável
111-169: computeBlockGuides() — partilhável
171-180: HANDLES — partilhável
185-538: BlockContent — privado, lesson-only, 8 tipos de bloco
540-580: renderViewportBlocks() — helper partilhável
613-751: PreviewCanvas() — branches cert/lesson/mobile/tablet/desktop
754-782: MobileViewport() — lesson-only
784-812: TableViewport() — lesson-only
814-1447: EditorCanvas (export) — drag/resize/marquee/inline-edit
```

### Estrutura do `BlockSettings` (1255 linhas)
- Tabs "Propriedades" / "HTML Fonte" — partilhável (lesson usa ambas, cert só Properties)
- 8 branches por tipo de bloco (text/video/image/heading/quote/divider/html/quiz)
- `isCertMode` só afecta image block (esconde `ImageUploadBlock` + "Remover Fundo")

### Plano Fase 5A (28 novos testes, 45 total, ~10h)

#### Fase 5A.1: CertificatePalette (7 testes, ~2h)
- Novo componente `CertificatePalette.tsx` + `certificate-block-types.ts`
- Extrair `BlockBtn` partilhado de `BlockPalette.tsx` para `components/editor/BlockBtn.tsx`
- Testes: boundary (4 tipos cert, excluir quiz/video/html/quote), section title, toggle, addBlock dispatch, single-source-of-truth (7)

#### Fase 5A.2: CertificateCanvas (11 testes, ~3.5h)
- Novo componente `CertificateCanvas.tsx` — render com `CertificateBlockRenderer` (NUNCA `BlockContent`)
- Propriedades: `isDoubleSided`, `blocks`, `designWidth`, `designHeight`, `activeSide`
- Sem viewport toggles, sem inline-edit, sem marquee, sem drag/resize
- Testes: duplex (1/2 canvases), aspect ratio A4, offset rule, overflow hidden, usa CertificateBlockRenderer (11)

#### Fase 5A.3: CertificateEditor refactor (7 testes, ~1.5h)
- Trocar imports: `BlockPalette` → `CertificatePalette`, `EditorCanvas` → `CertificateCanvas`
- 3 testes estáticos de boundary (grep no source: não importa BlockPalette/EditorCanvas)
- 4 testes de composição (Provider + slots + navegação)

#### Fase 5A.4: EditorCanvas cleanup (~2h)
- Remover 13 branches `isCertMode` do `EditorCanvas.tsx`
- Reduzir de 1447 para ~1100 linhas (só lesson)
- Validar com `grep "isCertMode" EditorCanvas.tsx` = 0

#### Fase 5A.5: EditorContext mínimo (3 testes, ~45min)
- Testar `addBlock` offset em cert mode
- Testar `addBlock` position em lesson mode
- Testar `entityId` cert = `courseId`, lesson = `activeLessonId`

### Adiado para Fase 5B
- Extrair `useViewportInteraction` para ficheiro próprio (requer mock infrastructure)
- Eliminar prop `mode` do `EditorProvider` (requer estratégia de modeConfig)
- Limpar 3 branches de init do `EditorContext` (init flow complexo)
- Corrigir bug "EditorCanvas renderiza cert com BlockContent" (corrigido implicitamente pelo CertificateCanvas)
- `editor-modes.test.ts` (4 testes — contract tests do core package)
- `EditorHeader.test.tsx` (3 testes — i18n + auth, flaky sem infra)

---

## 🧪 Resultado das Fases (2026-06-02 e 2026-06-03)

| Fase | Status | Evidência |
|------|--------|-----------|
| 0 (docs) | ✅ | `SDR-001` + `BACKLOG.md` (1 P0 + 3 P1) |
| 1 (RED) | ✅ | 16 testes RED escritos (6 CertificateBlockRenderer + 4 CertificateMiniature + 6 CertificatePage) |
| 2 (GREEN duplex) | ✅ | 42/42 testes packages/ui passam. `useA4Scale` altura-aware. `configuracoes/[id]` usa `<CertificatePage>` (~140 linhas removidas). |
| 3 (extract) | ✅ | Rota dedicada + entry component + redirect 308. `pnpm run build` lista 8 rotas. 0 erros TypeScript. |
| 4 (refactor) | ✅ | `workflow_adm.md` actualizado. Boundary rule em `apps/admin/AGENTS.md`. Esta nota de decisão. |
| 5A (isolation plan) | 📋 **Plan** | 28 novos testes TDD, 5 commits, ~10h. Ver secção "🔍 Revisão Exaustiva" acima para detalhes. |

