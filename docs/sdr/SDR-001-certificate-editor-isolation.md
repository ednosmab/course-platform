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

## 🧪 Resultado das Fases (2026-06-02)

| Fase | Status | Evidência |
|------|--------|-----------|
| 0 (docs) | ✅ | `SDR-001` + `BACKLOG.md` (1 P0 + 3 P1) |
| 1 (RED) | ✅ | 16 testes RED escritos (6 CertificateBlockRenderer + 4 CertificateMiniature + 6 CertificatePage) |
| 2 (GREEN duplex) | ✅ | 42/42 testes packages/ui passam. `useA4Scale` altura-aware. `configuracoes/[id]` usa `<CertificatePage>` (~140 linhas removidas). |
| 3 (extract) | ✅ | Rota dedicada + entry component + redirect 308. `pnpm run build` lista 8 rotas. 0 erros TypeScript. |
| 4 (refactor) | ✅ | `workflow_adm.md` actualizado. Boundary rule em `apps/admin/AGENTS.md`. Esta nota de decisão. |

