# 🧠 MEMÓRIA RAM ATIVA

## Status Atual
REVISÃO CONCLUÍDA — Plano Fase 5A definido. **Inventário do código real**: 13 branches `isCertMode` em `EditorCanvas.tsx` (1447 linhas), 3 em `BlockSettings.tsx`, 5 em `EditorContext.tsx`. **Bug crítico encontrado**: `EditorCanvas.tsx:1282` renderiza blocos do certificado com `BlockContent` (lesson renderer) em vez de `CertificateBlockRenderer`. **Plano**: 28 novos testes TDD (total 45), 5 commits, ~10h de trabalho. Fase 5B (hook, mode, init flow) adiada para depois.

## 🎯 Tarefas Concluídas

### F-01 boundary fix + CertificateImageSettings rewrite (commit `c921da5`)
- 4 violações `mode === 'certificate'` em `BlockSettings.tsx` removidas. 4 componentes extraídos para `certificate-editor/`
- `BlockSettings` agora aceita `imageSettingsSlot` como slot
- `CertificateEditor` compõe: `CertificateCanvasPanel` (sem bloco) OU `BlockSettings` + slots + `CertificateImageSettings` (com bloco)
- **Fix 1** — `addBlock` em cert mode: posiciona sempre top-left + offset `(40 + (count % 5) * 20)` em vez de coordenada aleatória fora da tela
- **Fix 2** — isBg zIndex: `-10` → `0` (DOM order já trata stacking via sort)
- **Fix 3** — `ImageUploadBlock` + "Remover Fundo" escondidos no cert mode via `{!isCertMode && ...}`
- **Fix 4** — `CertificateImageSettings` reescrito com upload próprio (cert-only, sem objectFit — partilhado do `BlockSettings`)

### Build fix (BrandMark + react-native + expo-asset)
- `apps/admin/next.config.ts`: aliases Turbopack + Webpack para `react-native` → `.rn-web-stub.cjs` e `expo-asset` → `.expo-asset-stub.cjs`
- `apps/admin/.rn-web-stub.cjs`: stub CommonJS puro sem dependências externas
- `apps/admin/.expo-asset-stub.cjs`: stub CommonJS de `expo-asset`
- `@tamagui/image@2.0.0-rc.42` adicionado a `packages/ui`
- Build admin compila: 8 rotas, 11.6s

### Interface de impressão: iframe srcdoc (commit `8c26b04`)
- **Causa raiz**: 5 commits consecutivos não resolveram o print blank. `@media print` no DOM principal tem race conditions: React re-renders + `useEffect` cleanup invalidam regras injectadas; CSS imports de monorepo packages não chegam ao DOM do Next.js; especificidade com `!important` em inline styles conflita com regras de print.
- **Solução**: `<iframe srcdoc>` com DOM + CSS estático isolado, sem competição com a app. `iframe.contentWindow.print()` após `onload`.
- **Dominio da solução**: `apps/admin/src/app/configuracoes/[courseId]/page.tsx` — função `handlePrint()` serializa `outerHTML` do `#certificate-modal-overlay` + CSS inline + CSS vars no `<iframe>` + chama print
- **Melhorias visuais**: modal `95vw/92vh` (max `1500×1100`), toggle "Frente / Verso" no header, previewSide state
- **CertificatePage**: `side='front'|'back'|'all'`, `visiblePages={number}`, ambos canvases renderizados quando `isDoubleSided`. Controlo de visibilidade via CSS `@media screen` + `data-preview-side`. CSS vars no `:root` com `document.documentElement.style.setProperty()`
- `@media print` removido do style injectado — agora apenas no iframe
- `CertificatePrint.css` reescrito: `position: absolute` no canvas, `page-break-after: always`, tudo via CSS vars

### Warning "Unexpected text node: ." — mitigado
- Filtro de `console.error` em `providers.tsx` silencia o dev-warning específico do Tamagui sem afectar outras mensagens

### Validação
- `tsc --noEmit -p apps/admin/tsconfig.json` — 0 erros
- `tsc --noEmit -p packages/ui/tsconfig.json` — apenas erros pré-existentes em stories
- `pnpm run test apps/admin` — 2/2 passam
- `pnpm run test packages/ui` — 42/42 passam
- `pnpm run build apps/admin` — 8 rotas, 11.6s

## 🕹️ Documentos Carregados via MCP
- `docs/AGENTS.md` — Workflow 4-passos + DRY Tamagui + idioma inglês + Next.js 16 aviso
- `docs/FORBIDDEN_OPERATIONS.md` — F-01 (UI sem domínio), D-01/D-02 (deps), D-03 (proibido Tailwind/Sass/StyleSheet), G-01 (sem commit sem autorização)
- `docs/DESDO.md` — §5 SDR, §7 JSDoc, §1 workflow estrito, §3 TDD
- `docs/INDEX.md` — Índice
- `docs/CONTEXT_MAP.md` — Layer 4 (apps), 5 (core), 2 (UI)
- `docs/context_buffer.md` — Actualizado
- `docs/sdr/SDR-001-certificate-editor-isolation.md` — Boundary rule
- `docs/sdr/SDR-002-iframe-print-isolation.md` — Decisão arquitectural do print
- `docs/Requisitos_plataforma.md` — Contexto de negócio

## Arquivos modificados nesta sessão

### Commits
- `c921da5` — `fix(cert-editor): off-page positioning, isBg zIndex, dedicated upload UI`
- `8c26b04` — `fix(print): isolate certificate print via iframe srcdoc to bypass CSS race conditions`

### Build stubs
- `apps/admin/.rn-web-stub.cjs` — **NOVO** (stub react-native)
- `apps/admin/.expo-asset-stub.cjs` — **NOVO** (stub expo-asset)
- `apps/admin/next.config.ts` — **MODIFICADO** (aliases + redirects 308)

### Config pages
- `apps/admin/src/app/configuracoes/[courseId]/page.tsx` — **MODIFICADO** (modal 95vw/92vh, toggle F/V, iframe srcdoc, CSS vars no :root, `handlePrint()`)

### Certificate editor
- `apps/admin/src/components/certificate-editor/CertificateEditor.tsx` — **MODIFICADO** (slot `imageSettingsSlot`)
- `apps/admin/src/components/certificate-editor/CertificateImageSettings.tsx` — **REESCRITO** (upload cert-only, isBackground)
- `apps/admin/src/components/editor/BlockSettings.tsx` — **MODIFICADO** (slot imageSettingsSlot, isCertMode guards)

### UI components
- `packages/ui/src/components/Certificate/CertificatePage.tsx` — **MODIFICADO** (side, visiblePages, ambos canvases sempre renderizados, CSS vars)
- `packages/ui/src/components/Certificate/CertificatePrint.css` — **MODIFICADO** (position absolute, page-break-after)
- `packages/ui/src/components/Certificate/useA4Scale.ts` — **MODIFICADO** (pages option)
- `packages/ui/src/components/Certificate/CertificateBlockRenderer.tsx` — **MODIFICADO** (null guard url)
- `packages/ui/src/components/Certificate/CertificateMiniature.tsx` — **MODIFICADO** (duplex reativado)

### Logo swap
- `packages/ui/src/components/BrandMark.tsx` — **NÃO MODIFICAR** (conflito de edição concorrente)

### Memory docs
- `docs/context_buffer.md` — Actualizado
- `docs/BACKLOG.md` — Itens de duplex movidos para Done
- `docs/sdr/SDR-002-iframe-print-isolation.md` — **NOVO**

## ✅ Validação Final
- **tsc**: 0 erros admin + packages/ui (pré-existentes ignorados)
- **Testes**: 44/44 passam (2 admin + 42 ui)
- **Build**: `pnpm run build apps/admin` — 8 rotas, 11.6s

## ⚠️ Impedimentos & Logs de Erro Recentes
- **Build de produção**: resolvido (aliases + stubs). `pnpm run build` compila com sucesso.
- **Warning "Unexpected text node: ."**: mitigado via filtro de `console.error`. Pendente solução arquitectural P1 (filtrar todos os YStacks).
- **Imagens Supabase no iframe**: validação concluída — bucket `certificate-images` é público, URLs `/object/public/` sem TTL. Risco mitigado. (Ver secção "Validação de Segurança" acima e SDR-002.)
- `apps/student` tsc: erro `Maximum call stack size exceeded` pré-existente (não introduzido nesta sessão).

## 🎯 Tarefa em Execução
**Revisão exaustiva do isolamento cert-editor + plano Fase 5A (SDR-001).**

Inventário real via leitura do código:
- `EditorCanvas.tsx`: **1447 linhas**, **13 branches `isCertMode`** (não 15 como estimado antes)
- `BlockSettings.tsx`: 1255 linhas, **3 branches** `isCertMode` (só image block)
- `EditorContext.tsx`: 646 linhas, **5 branches** `mode === 'certificate'`
- `EditorHeader.tsx`: 209 linhas, **1 branch**
- `BlockContent` (linhas 185-538 do EditorCanvas) é **privado** e renderiza 8 tipos de bloco da lesson
- **Bug crítico encontrado**: `EditorCanvas.tsx:1282` renderiza blocos do certificado com `BlockContent` (lesson renderer) em vez de `CertificateBlockRenderer`. Isto viola o SDR-001.
- `BlockPalette` é mode-aware via `allowedBlockTypes` (funciona, sem branches)

Plano Fase 5A refinado: 5 commits TDD, **28 novos testes (total 45)**. Prioridade: CertificatePalette (7 testes) → CertificateCanvas (11 testes) → CertificateEditor refactor (7 testes) → EditorCanvas cleanup (13 branches removidos) → EditorContext mínimo (3 testes). Fase 5B (useViewportInteraction, mode prop, init flow) adiada.

## 🛠️ Decisões Arquitecturais
- **SDR-002 (iframe print isolation)**: ver `docs/sdr/SDR-002-iframe-print-isolation.md`
- **Aliases em `next.config.ts`** em vez de modificar `BrandMark.tsx` — solução permanente para conflito de edição concorrente
- **Slot `imageSettingsSlot`** em vez de coluna separada — composição declarativa
- **`CertificatePage` renderiza ambos os canvases sempre** quando `isDoubleSided`; CSS `@media screen` + `data-preview-side` controla visibilidade
- **Risco iframe + imagens Supabase**: mitigado — bucket `certificate-images` é público, URLs são `/object/public/...` (sem TTL, sem auth header necessário)

## ✅ Validação de Segurança (iframe + Supabase Storage)
- **Bucket `certificate-images`**: confirmado público via Dashboard (badge `PUBLIC`)
- **URL pattern**: `https://<project>.supabase.co/storage/v1/object/public/certificate-images/...`
- **Imagens no modal**: 2 imagens, `loaded=true`, `naturalWidth=1920` e `1600`
- **Conclusão**: risco de auth/TTL zero na config actual. Mitigação documentada em SDR-002 para referência futura.

## Próximos Passos
### Opções para avançar:
1. **A) Começar pela Fase 5A.1 (CertificatePalette)** — 7 testes TDD, ~2h, baixo risco
2. **B) Criar branch dedicado `feat/cert-editor-isolation`** antes de começar a implementar
3. **C) Rever alguma secção específica** (testes estáticos de boundary, decisão de adiar Fase 5B)

### Fase 5B (adiada):
- Extrair `useViewportInteraction` para ficheiro próprio
- Eliminar prop `mode` do `EditorProvider`
- Limpar 3 branches de init do `EditorContext`
- Corrigir bug: `EditorCanvas` renderiza cert com `BlockContent` (latente na linha 1282)

---

## 🔧 Sessão: Cert Editor UX bug fixes (header refactor + marquee + side toggle + overlay)

**Trigger:** Relatos do usuário sobre UX inconsistente entre o cert editor e o lesson editor.

### Bugs reportados & fixes aplicados

1. **Header custom pequeno (Award icon + título + Voltar)** — substituído pelo `EditorHeader` partilhado para consistência visual.
   - `EditorHeader.tsx`: adicionado `saveActionLabel?` prop; removido `mode` do destructure; removido `mode === 'certificate'` branch do save button.
   - `CertificateEditorHeader.tsx` (NOVO): wrapper fino `<EditorHeader courseId={courseId} saveActionLabel="Salvar" />` — segue SDR-001.
   - `CertificateEditor.tsx`: removido header custom; trocado `EditorHeader` directo por `<CertificateEditorHeader>`; restaurado wrapper `YStack f={1} h="100vh" w="100vw" overflow="hidden"` que tinha sido perdido na remoção (causava área branca abaixo do canvas).

2. **Marquee bloqueado por background block** — `onBlockMouseDown` agora retorna early para `isBackground` ANTES de `e.stopPropagation()`, deixando o click borbulhar para `pageRootRef` e iniciar o marquee.

3. **Seleção perdida ao arrastar multi-seleccionados** — `onBlockMouseDown` e `onHandleMouseDown` só chamam `setActiveBlockId(block.id)` quando o bloco NÃO está em multi-seleccção (`selectedBlockIds.length > 1`).

4. **Sem toggle Frente/Verso visível** — adicionado controlo segmentado no toolbar do `CertificateCanvas` (visível só se `isDoubleSided=true`), wired ao `setActiveSide` do context.

5. **Marquee dropa primeiro bloco** — substituído `clearSelection() + forEach(toggleSelectBlock)` por `setActiveBlockId(selected[0]) + setSelectedBlocks(selected)`. O reducer `TOGGLE_SELECT_BLOCK` side-effecta `activeBlockId`, causando o bug; `SET_SELECTED_BLOCKS` só toca `selectedBlockIds`.

6. **Não dá para iniciar marquee no padding ao redor do certificado** — adicionado overlay invisível `data-testid="canvas-overlay"` com `position: absolute; inset: 0; zIndex: 0` e `onMouseDown` que computa coords via `pageRootRef.current.getBoundingClientRect()`. YStack do canvas com `position: 'relative'` e `canvasRef` wrapper com `position: 'relative'; zIndex: 1`.

### Tests added
- `CertificateCanvas.test.tsx`: +3 testes no describe `canvas overlay (padding around the cert)` (total **35/35 passam**, antes eram 32).
  - zIndex 0 + position absolute
  - mousedown no overlay → `setActiveBlockId(null)` + `clearSelection()` + (após mousemove/mouseup) `setSelectedBlocks(['b1'])`
  - mousedown no overlay com rect menor → só `near` é seleccionado (AABB filtering)

### Validação
- `pnpm vitest run` em `apps/admin` → **52/52 passam** (CertificateCanvas 35 + CertificateEditor boundary 7 + CertificatePalette 8 + arch/coupling 1 + api/health 1)
- `tsc --noEmit` em `apps/admin` → **0 erros**
- `pnpm build` em `apps/admin` → **8 rotas, 9.2s**
- **Sem commits** (G-01 — aguardando autorização do usuário)

### Decisões
- `EditorHeader` é 100% mode-agnostic; o label "Salvar" cert-specific vive em `CertificateEditorHeader` (SDR-001).
- Guard defensivo no overlay: `if (pageRootRef.current.contains(e.target as Node)) return;` — não testável em JSDOM (event bubbling ignora zIndex), mas é belt-and-suspenders contra violações de stacking.
- Coordenadas do marquee divididas por `zoom` para ficarem em design space.
