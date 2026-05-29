# 🧠 MEMÓRIA RAM ATIVA

## Status Atual
ATIVO — Diagnóstico e correção: certificado salvo não aparece no preview da config page.

## 🎯 Tarefa em Execução
Bug: Certificado com imagem não aparece no preview da config page após salvar no studio. Causa raiz: `CertificateMetaBlockSchema` com `id: z.string()` (obrigatório) mas o `__meta__` salvo no banco não possui `id`, fazendo `.catch([])` limpar todo o array. Fix: tornar `id` opcional.

Último commit: `c25a094`.

## 🕹️ Documentos Carregados via MCP
- `docs/FORBIDDEN_OPERATIONS.md` — Regras vinculantes
- `docs/DESDO.md` — Diretrizes de engenharia
- `docs/context_buffer.md` — Estado da última execução
- `docs/BACKLOG.md` — Prioridades do projeto
- `docs/roadmaps/design-system-reforma.md` — Plano do DS

## 🚀 Novidades desta sessão

### Certificado: Canvas A4 com presets fixos
- Canvas usa **presets A4 fixos** (700/900/1100/1300px), sem drag-resize volátil
- Altura sempre `largura / 1.414` (proporção A4 paisagem)
- Blocos posicionados com layout absoluto (`position: absolute`, `layout.x/y/w/h` em pixels)
- Imagem preenche 100% com `objectFit: fill`
- `@media print` força A4 paisagem (297×210mm) com margem zero
- CSS de print injetado via `useEffect` (exceção D-03)
- `CertificateMetaBlock` type-only em `packages/types/src/certificate-block.ts`
- `editor-modes.ts`: `A4_PRESETS`, `A4_RATIO`, `createCertificateModeConfig` com load/save/publish
- `EditorContext.tsx`: `certDesignWidth`, `certDesignHeight`, `certDesignChosen`, `setCertDesignSize`

### Modo certificado isolado
- `editor-modes.ts`: `CertificateCanvasPanel` com 4 presets A4
- `BlockSettings.tsx`: renderiza `CertificateCanvasPanel` quando `!activeBlock && mode === 'certificate'`
- `page.tsx`: `(activeBlockId || mode === 'certificate')` condiciona `BlockSettings`
- Modo aula e certificado completamente isolados
- Blocos incompatíveis filtrados no palette (só text/heading/image/divider)

### Preview e configurações
- Config page: `certDesignWidth` dinâmico do `__meta__`, `previewScale = Math.min(1, measuredWidth / certDesignWidth)`
- `CertificateBlockRenderer`: `fillContainer` para imagem, `scaleDim` para px
- `useA4Scale.ts` mantido (`DESIGN_W = 1050`) para compat app aluno

### EditorHeader colapsável
- Clique em qualquer lugar do header recolhe/expande
- Altura collapsed: `0` (antes 8), `overflow: hidden` removido
- Botão flutuante `position: fixed; right: 50; zIndex: 9999` com `ChevronDown`
- Botão com destaque suave: `bg #EFF6FF`, `borderColor $primary`, `opacity 0.55`, hover `opacity 1`
- Ícone `ChevronUp` sutil (opacity 0.35) no header expandido como dica
- Tudo encapsulado em `YStack position="relative"`

### Fixes aplicados
- `CertificateMetaBlockSchema`: `id` mudou de `z.string()` (obrigatório) para `z.string().optional()` — dados salvos de `__meta__` não têm `id`, o que impedia o parse e acionava `.catch([])` limpando o array
- `BlockSettings.tsx`: early return reestruturado (`if (!activeBlock) { if cert ... }`) elimina 116 erros TS
- `BlockSettings.tsx`: `useEffect` reseta `collapsed = false` quando `activeBlockId` muda (cert mode)
- `EditorCanvas.tsx`: removido `opacity: 0.35` em outOfBounds (confundia com imagem)
- `EditorCanvas.tsx`: removido tracejado A4 (redundante com borda amarela de overflow)

## Arquivos modificados nesta sessão
- `apps/admin/src/components/editor/BlockSettings.tsx` — CertificateCanvasPanel, collapsed fix, TS error fix
- `apps/admin/src/components/editor/EditorCanvas.tsx` — A4 guide line, overflow, opacity removed
- `apps/admin/src/components/editor/EditorHeader.tsx` — collapsible, floating button, ChevronUp hint
- `apps/admin/src/context/editor-modes.ts` — A4_PRESETS, createCertificateModeConfig
- `apps/admin/src/context/EditorContext.tsx` — certDesignWidth/Height/Chosen
- `apps/admin/src/app/studio/[courseId]/page.tsx` — BlockSettings conditional render
- `apps/admin/src/app/configuracoes/[courseId]/page.tsx` — dynamic certDesignWidth
- `packages/types/src/certificate-block.ts` — CertificateMetaBlock interface, CertificateMetaBlockSchema id optional
- `docs/context_buffer.md` — this update

## ⚠️ Impedimentos & Logs de Erro Recentes
*Nenhum erro ativo.*
