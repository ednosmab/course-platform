# 📋 BACKLOG — Plataforma de Cursos EAD com CMS

> **Instruções:** Itens neste arquivo seguem o formato `[Priority] Layer: Descrição`.
> Prioridades: **P0** (imediato), **P1** (curto prazo), **P2** (médio prazo), **P3** (baixa prioridade).
> Status: `Backlog` | `In Progress` | `Done`

---

## 🏆 P0 — Imediato (Sprint Atual)

### ⏳ **Refactor: Fase 5A — Isolamento definitivo do editor de certificado**
**Contexto**: SDR-001. Inventário real: 13 branches `isCertMode` em `EditorCanvas.tsx`, 3 em `BlockSettings.tsx`, 5 em `EditorContext.tsx`, 1 em `EditorHeader.tsx`. Bug crítico: `EditorCanvas.tsx:1282` renderiza cert com `BlockContent` (lesson) em vez de `CertificateBlockRenderer`. Plano: 28 novos testes TDD (total 45), 5 commits, ~10h.

**Sub-itens (TDD estrito, por ordem)**:
- [ ] **5A.1: CertificatePalette** — 7 testes, ~2h (novo componente + extrair BlockBtn)
- [ ] **5A.2: CertificateCanvas** — 11 testes, ~3.5h (render com CertificateBlockRenderer, duplex, offset)
- [ ] **5A.3: CertificateEditor refactor** — 7 testes, ~1.5h (compor novos componentes, 3 testes estáticos boundary)
- [ ] **5A.4: EditorCanvas cleanup** — remover 13 branches `isCertMode` (~2h)
- [ ] **5A.5: EditorContext testes mínimos** — 3 testes (~45min)

**Adiado para Fase 5B**:
- Extrair `useViewportInteraction` para ficheiro dedicado
- Eliminar prop `mode` do `EditorProvider`
- Limpar 3 branches de init do `EditorContext`
- Corrigir bug: cert render com `BlockContent`

## ✅ Done

- **Feat: Student app — tela de aulas e exercícios extras** — Implementado em `CourseLessons.tsx`.
- **Feat: Student app — central de certificados** — Implementado em `Certificates.tsx`.
- **Feat: Student app — Dashboard: botões contextuais** — Botões "Iniciar aula", "Continuar aula", "Próxima aula", "Ver certificado" baseados no status real do progresso.
- **Feat: Student app — Dashboard: botão "Ver aulas"** — Botão estilizado com borda primary para navegar para lista de módulos.
- **Feat: Student app — Dashboard: remover badge redundante** — Badge "64% concluído" removido do thumbnail do card.
- **Feat: Student app — CourseLessons: botão hero contextual** — Botão muda entre "Retomar aula", "Próxima aula", "Ver certificado" baseado no status.
- **Chore: ProgressService — getProgressByLessons** — Método adicionado ao serviço para buscar progresso de múltiplas aulas.
- **Refactor: Student app — TopBar HTML→Tamagui + tokens** — `<ul>/<li>/<a>` migrados para `YStack/XStack` com tokens (`$border`, `$surface`, `$popover`). `useRef<HTMLDivElement>` → `useRef<View>`. `onMouseEnter/Leave` → `hoverStyle/pressStyle`. Dropdown usa `shadowPresets.cwPop`.
- **Refactor: Shadow presets activos no design system** — `Card` agora consome `shadowPresets.cwSoft` como base + variant `elevated` (`cwPop`). Exports de `shadowPresets` adicionados ao `@projeto/ui`. `elevation={N}` ad-hoc substituídos por `shadowPresets.cwSoft` (TopBar) e `elevated` (hero cards) em todo o student app.
- **Fix: XSS sanitization no BlockRenderer (S-01)** — Adicionado `dompurify` + `sanitizeHtml()` em `packages/ui/src/utils/sanitize.ts` com guard `typeof window` (cross-platform Web + Native). 3 sítios `dangerouslySetInnerHTML` corrigidos: `packages/renderer/src/BlockRenderer.tsx`, `apps/admin/src/components/editor/EditorCanvas.tsx`, `packages/ui/src/blocks/HtmlBlock.tsx`. Bug pré-existente no regex de detecção `/<[a-z][\s>]/i` corrigido para `/<\w+[\s>\/]/i` (multi-char tags). 20 testes unitários + 8 testes de integração cobrindo `<script>`, `<img onerror>`, `<iframe>`, `<svg onload>`, `javascript:`, `data:`, `vbscript:`, event handlers, meta refresh, etc.
- **BUG: Impressão duplex só mostra 1 face** — Resolvido via iframe srcdoc (SDR-002) + `side='all'` + CSS `@media screen` toggle. Ambos os canvases renderizados sempre quando `isDoubleSided`.
- **BUG: `CertificateMiniature` perdeu prop `isDoubleSided`** — Resolvido pela arquitectura `CertificatePage` com `side='all'`. Miniature reactivado com duplex.
- **Validação: iframe print + Supabase Storage** — Bucket `certificate-images` confirmado público; URLs `/object/public/` funcionam em iframe com `srcdoc` sem auth (SDR-002). Risco mitigado.
- **BUG: Drag-and-drop de imagem no placeholder (cert + lesson)** — Resolvido em desktop via commits `13b7da3` (cert editor, prop `onImageDrop` no `CertificateBlockRenderer`) e `729a1c6` (lesson editor, `onDrop`/`onDragOver` no block outer div em `EditorCanvas.tsx:1228`). Causa raiz: o `<svg>` interior no placeholder do `BlockContent` interceptava a propagação do evento `drop`; solução foi mover os handlers para um elemento pai que cobre 100% da área. 12 testes TDD + validação manual 2026-06-03.

## 📌 P1 — Curto Prazo

- **BUG: Student app — LessonPlayer crash** — ✅ CORRIGIDO — Usa polling funcional (linhas 109-135) + refresh ao focar aba.
- **BUG: Student app — UUID hardcoded** — ✅ CORRIGIDO — `useMobileProgress.ts` agora usa `AuthService.getSession()` para obter o ID real do usuário.
- ~~**BUG: Student app — TopBar HTML tags e cores hardcoded**~~ — ✅ Concluído.
- ~~**BUG: Student app — Shadow presets não usados**~~ — ✅ Concluído.
- **BUG: Editor canvas de certificado usa renderer errado** — `EditorCanvas.tsx:1285-1294` renderiza blocos do certificado com `BlockContent` (renderer de aula) em vez de `CertificateBlockRenderer`. Corrigido em P0 (extrair `CertificateCanvas`).
- ~~**BUG: Zod schema — `LessonSchema.blocks` missing `heading` e `divider`**~~ — ✅ Concluído (verificado em `packages/types/src/database.ts:96-97`).
- ~~**Chore: Student app — sanitização XSS**~~ — ✅ Concluído (ver `Fix: XSS sanitization` no Done).
- ~~**BUG: Drag-and-drop de imagem para dentro do placeholder não funciona**~~ — ✅ Concluído em desktop (cert + lesson). Commits `13b7da3` (cert) e `729a1c6` (lesson) + validação manual 2026-06-03. **Pendentes separados**: (a) cobertura mobile/tablet viewports; (b) testes E2E automatizados (Playwright).

## 🗓️ P2 — Médio Prazo

- **Refactor: extrair `uploadCertificateImageToBlock` helper** — Duplicação entre `CertificateCanvas.handleImageDrop` (linha 89) e `CertificateImageSettings.handleFile` (linha 29): ambos validam size ≤5MB + MIME JPEG/PNG/WebP, chamam `StorageService.uploadCertificateImage`, e fazem `updateBlock({ url })`. Criar helper partilhado em `apps/admin/src/components/certificate-editor/`, adicionar testes unitários.
- **BUG: Drag-and-drop não funciona em mobile/tablet viewports** — `EditorCanvas` tem paths separados para `MobileViewport` (linha 754) e `TableViewport` (linha 784) que ainda usam o handler antigo do YStack interior (mesma causa raiz do bug desktop original). Replicar fix do commit `729a1c6` para esses paths.
- **Chore: testes E2E Playwright para drag-and-drop de imagem** — Criar spec em `tests/e2e/` que arrasta ficheiro real e valida `block.url` actualizado em ambos os modos.
- **Chore: Student app — ErrorBoundary** — Adicionar ErrorBoundary no `App.tsx` para evitar crash total em erros não tratados.
- **Feat: Student app — Alinhar layout com design reference** — Headers `px="$6"` (24px), main `py="$8"` (32px), hero `br="$6"` (16px), dashed borders `$borderStrong`, sidebar CourseLessons "Atividades extras", botão "Ver materiais" no hero, certificates hero stats à direita, certificates cards `aspect-[4/3]`.
- **BUG: Student app — Dashed border usa cor errada** — `Certificates.tsx` linha 243: `borderStyle="dashed" borderColor="$border"` deveria ser `$borderStrong`.
- **Feat: Admin — seção de exercícios extras** — Adicionar no admin uma seção/aba para criar e gerenciar exercícios extras por aula/curso.
- **Feat: Student app — CourseLessons: duração real das aulas** — Remover mock `Math.random()` de duração. Usar campo real do banco ou duração calculada a partir do bloco de vídeo.
- **Feat: Student app — CourseLessons: progresso por módulo** — Adicionar barra de progresso visual individual em cada módulo (ex: preenchimento proporcional às aulas concluídas).

## 🌱 P3 — Baixa Prioridade (Backlog)

- **BUG: Cursor escapa durante resize** — `document.body.style.cursor` não sobrescreve cursor de elementos filhos (text blocks, botões).
- **BUG: Aspect ratio de imagem não funciona em W/N/cantos** — fixed-corner approach falha em handles esquerdo/superior.
- **Renderização:** Extrair `removeBackground` para Web Worker para não travar UI em imagens grandes.
- **Player Mobile:** Implementar retomada inteligente de vídeo (salvar timestamp no Supabase).
- **Chore: Student app — Migrar BlockRenderer para Tamagui** — `BlockRenderer.tsx` usa `blockToHtml()` + `dangerouslySetInnerHTML`. Migrar para componentes Tamagui nativos (`TextBlockRenderer`, `VideoBlockRenderer`, etc.) de `packages/ui/src/blocks/`.
