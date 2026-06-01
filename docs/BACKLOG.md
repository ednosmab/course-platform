# 📋 BACKLOG — Plataforma de Cursos EAD com CMS

> **Instruções:** Itens neste arquivo seguem o formato `[Priority] Layer: Descrição`.
> Prioridades: **P0** (imediato), **P1** (curto prazo), **P2** (médio prazo), **P3** (baixa prioridade).
> Status: `Backlog` | `In Progress` | `Done`

---

## 🏆 P0 — Imediato (Sprint Atual)

- **Refactor: separar editor de certificado do editor de curso** — `EditorCanvas.tsx` (1450 linhas) trata os dois modos via `if (isCertMode)`. Promover certificado a rota dedicada `/studio/[id]/certificate` com `CertificateCanvas` próprio. Boundary rule: compartilham apenas `CertificateBlockRenderer` e contratos Zod. Ver `docs/sdr/SDR-001-certificate-editor-isolation.md`.

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

## 📌 P1 — Curto Prazo

- **BUG: Student app — LessonPlayer crash** — ✅ CORRIGIDO — Usa polling funcional (linhas 109-135) + refresh ao focar aba.
- **BUG: Student app — UUID hardcoded** — ✅ CORRIGIDO — `useMobileProgress.ts` agora usa `AuthService.getSession()` para obter o ID real do usuário.
- ~~**BUG: Student app — TopBar HTML tags e cores hardcoded**~~ — ✅ Concluído.
- ~~**BUG: Student app — Shadow presets não usados**~~ — ✅ Concluído.
- **BUG: Editor canvas de certificado usa renderer errado** — `EditorCanvas.tsx:1285-1294` renderiza blocos do certificado com `BlockContent` (renderer de aula) em vez de `CertificateBlockRenderer`. Corrigido em P0 (extrair `CertificateCanvas`).
- **BUG: Impressão duplex só mostra 1 face** — `configuracoes/[id]/page.tsx` perdeu o loop de 2 canvases no commit `ed231f7`. Restaurar em `CertificatePage.tsx` + ajustar `CertificatePrint.css` para 2 páginas A4 com `page-break-after: always`.
- **BUG: `CertificateMiniature` perdeu prop `isDoubleSided`** — `configuracoes/[id]/page.tsx:609` removeu a prop na chamada. Componente ainda aceita, só precisa passar.
- ~~**BUG: Zod schema — `LessonSchema.blocks` missing `heading` e `divider`**~~ — ✅ Concluído (verificado em `packages/types/src/database.ts:96-97`).
- ~~**Chore: Student app — sanitização XSS**~~ — ✅ Concluído (ver `Fix: XSS sanitization` no Done).

## 🗓️ P2 — Médio Prazo

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
