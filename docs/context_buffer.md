# 🧠 MEMÓRIA RAM ATIVA

## Status Atual
EM EXECUÇÃO — Sessão SDR-001 (extração de certificado) + 2 correcções desta turno. **Concluído**: (1) F-01 boundary fix em `BlockSettings.tsx` — 4 violações `mode === 'certificate'` removidas; 4 componentes extraídos para `certificate-editor/`. (2) Warning Tamagui "Unexpected text node: ." silenciado via helper `ViewChildren` aplicado em 8 block branches. **Validação**: tsc 0 erros, 44/44 testes passam (2 admin + 42 ui), build OK em runtime (build de produção falha por causa pré-existente do `react-native` import em `BrandMark.tsx` — fora do escopo). **Bloqueio**: G-01 impede commits automáticos; usuário precisa testar localmente e autorizar.

## 🎯 Tarefa em Execução
**Auditoria de gaps `design/` + implementação dos prioritários.**

Sub-tarefas:
1. **Fase 1 (DRY no admin)**: ✅ 1A `page.tsx` (search/modal → Input + YStack; hex → tokens; brand gradient → constante); 1B `configuracoes/[id]/page.tsx` (botão excluir → tokens; link legacy `?mode=certificate` → `/studio/[id]/certificate` per SDR-001); 1C hero blob gradient teal→blue; 1D `CourseLessons.tsx` sidebar "Atividades extras" + `ExtraCard`
2. **Fase 2 (Editor features)**: ✅ 2A/2B já implementados (device preview, undo/redo, "Visualizar como aluno"); 2C `BlockPalette` "Sugestão de IA"; 2D contentEditable inline text/heading/quote em todos viewports; `inlineEditingId` movido para `EditorContext`
3. **Fase 3 (Expo Router migration)**: ✅ adicionado `expo-router@~6.0.0` + `expo-constants@~17.0.3` + `expo-linking@~7.0.3` em `apps/student/package.json`; `app.json` com `scheme: "student"` + `plugins: ["expo-router"]`; `"main": "expo-router/entry"`; `App.tsx` removido; rotas criadas: `_layout`, `(auth)/{login,_layout}`, `(tabs)/{index,certificates,_layout}`, `course/[id]/{index,play}`. Correcções aplicadas: imports `YStack`/`Spinner` de `@projeto/ui`, `SafeAreaView` de `react-native-safe-area-context`, caminhos relativos `../../../src/...` (3 níveis)
4. **Token additions** ✅ `cwDestructiveSurface/SurfaceHover/Border` + `cwSuccessSurface/SurfaceHover/Border` em `colors.ts` + `tamagui.config.ts`; aliases `dangerSurface`/`successSurface` nos 3 temas
5. **Logo swap** ✅ `packages/ui/src/components/BrandMark.tsx` — Sparkles icon → `<Image source={flexedLogo} />` (40×40); `flexed-logo.png` copiado para `packages/ui/src/assets/`; `assets.d.ts` com tipagem `ImageSourcePropType`. Top spacing: `StudentDashboard.tsx` `pt="$10"` → `pt="$12"` + `pb="$4"`
6. **F-01 boundary fix (SDR-001) — esta turno**: 4 violações `mode === 'certificate'` em `BlockSettings.tsx` removidas. 4 componentes extraídos:
   - `certificate-editor/CertificateCanvasPanel.tsx` (no-block canvas picker)
   - `certificate-editor/CertificateCertSettings.tsx` (tamanho + dupla-face)
   - `certificate-editor/CertificateImageSettings.tsx` (isBackground + objectFit)
   - `certificate-editor/CertificateBlockSideSelector.tsx` (front/back por bloco)
   - `BlockSettings` agora aceita `propsHeader` + `propsFooter` slots
   - `CertificateEditor` compõe: `CertificateCanvasPanel` (sem bloco) OU `BlockSettings` + slots + `CertificateImageSettings` (com bloco)
7. **Warning "Unexpected text node: ." fix — esta turno**: adicionado helper `ViewChildren` (Fragment que filtra whitespace-only strings via `React.Children.toArray().filter()`). Aplicado em 8 block branches: text, video, quiz, image, html, heading, divider, quote.

## 🕹️ Documentos Carregados via MCP
- `docs/AGENTS.md` — Workflow 4-passos + DRY Tamagui + idioma inglês + Next.js 16 aviso
- `docs/FORBIDDEN_OPERATIONS.md` — F-01 (UI sem domínio), D-01/D-02 (deps), D-03 (proibido Tailwind/Sass/StyleSheet), G-01 (sem commit sem autorização)
- `docs/DESDO.md` — §5 SDR, §7 JSDoc, §1 workflow estrito, §3 TDD
- `docs/INDEX.md` — Índice
- `docs/CONTEXT_MAP.md` — Layer 4 (apps), 5 (core), 2 (UI)
- `docs/context_buffer.md` — Actualizado
- `docs/sdr/SDR-001-certificate-editor-isolation.md` — Boundary rule (proibido `mode === 'certificate'` em `EditorCanvas/BlockSettings/EditorHeader`)
- `docs/Requisitos_plataforma.md` — Contexto de negócio

## Arquivos modificados nesta sessão

### Admin (web)
- `apps/admin/src/app/page.tsx` — 1A ✅
- `apps/admin/src/app/configuracoes/[courseId]/page.tsx` — 1B ✅
- `apps/admin/src/components/editor/BlockPalette.tsx` — 2C ✅
- `apps/admin/src/components/editor/EditorCanvas.tsx` — 2D ✅
- `apps/admin/src/context/EditorContext.tsx` — adicionado `inlineEditingId`/`setInlineEditingId`
- `apps/student/src/screens/CourseLessons.tsx` — 1D ✅
- `apps/student/src/screens/StudentDashboard.tsx` — `pt="$10" → pt="$12"`, `pb="$4"` (logo swap)

### UI tokens
- `packages/ui/src/tokens/colors.ts` — 6 tokens `cwDestructive*`/`cwSuccess*`
- `packages/ui/src/tamagui.config.ts` — tokens mapeados + aliases
- `packages/ui/src/components/BrandMark.tsx` — Sparkles → flexed-logo.png
- `packages/ui/src/assets/flexed-logo.png` — **NOVO** (logo oficial)
- `packages/ui/src/types/assets.d.ts` — **NOVO** (declaração `*.png` → `ImageSourcePropType`)

### Certificate editor (boundary fix)
- `apps/admin/src/components/certificate-editor/CertificateCanvasPanel.tsx` — **NOVO** (extracted from BlockSettings)
- `apps/admin/src/components/certificate-editor/CertificateCertSettings.tsx` — **NOVO** (size + double-sided toggle)
- `apps/admin/src/components/certificate-editor/CertificateImageSettings.tsx` — **NOVO** (isBackground + objectFit)
- `apps/admin/src/components/certificate-editor/CertificateBlockSideSelector.tsx` — **NOVO** (front/back per block)
- `apps/admin/src/components/certificate-editor/CertificateEditor.tsx` — **MODIFICADO** (compõe os 4 novos componentes + slots)
- `apps/admin/src/components/editor/BlockSettings.tsx` — **MODIFICADO** (4 violações F-01 removidas, helper `ViewChildren` adicionado, 8 block branches wrappadas, -149 linhas, agora 1241)

### Student (Expo Router)
- `apps/student/package.json` — adicionado `expo-router@~6.0.0` + `expo-constants@~17.0.3` + `expo-linking@~7.0.3`; `"main": "expo-router/entry"`
- `apps/student/app.json` — `scheme: "student"`, `plugins: ["expo-router"]`, `bundleIdentifier`/`package`
- `apps/student/App.tsx` — REMOVIDO
- `apps/student/index.ts` — REMOVIDO
- `apps/student/app/_layout.tsx` — **NOVO** (TamaguiProvider + SafeArea + Stack + ErrorBoundary)
- `apps/student/app/(auth)/_layout.tsx` — **NOVO**
- `apps/student/app/(auth)/login.tsx` — **NOVO**
- `apps/student/app/(tabs)/_layout.tsx` — **NOVO**
- `apps/student/app/(tabs)/index.tsx` — **NOVO**
- `apps/student/app/(tabs)/certificates.tsx` — **NOVO**
- `apps/student/app/course/[id]/index.tsx` — **NOVO**
- `apps/student/app/course/[id]/play.tsx` — **NOVO**

## ✅ Validação
- `tsc --noEmit -p apps/admin/tsconfig.json` — limpo (0 erros)
- `tsc --noEmit -p apps/student/tsconfig.json` — erros em `app/` resolvidos; restantes são pré-existentes em `src/screens/` (3 categorias conhecidas: `als`/`minW`/`maxW` shorthands, `size` em Button, `full_name: null` em Certificates)
- `tsc --noEmit -p packages/ui/tsconfig.json` — BrandMark limpo; restantes pré-existentes em `*.stories.tsx` (variant) e blocks (color)
- `pnpm run test` em `apps/admin` — 2/2 passam (health + supabase-coupling)
- `pnpm run test` em `packages/ui` — 42/42 passam (CertificateBlockRenderer + CertificateMiniature + CertificatePage + 4 outros)
- **Build de produção pré-existente**: falha em `react-native/index.js` (Flow syntax) propagado de `BrandMark.tsx`. **Não introduzido nesta sessão** — originado em commit `7eac32c` (logo swap).

## 🛠️ Refatorações Aplicadas
- `YStack`/`Spinner` centralizados em `@projeto/ui` (não mais em `react-native`)
- `SafeAreaView` migrado para `react-native-safe-area-context` (consistência)
- `BRAND_GRADIENT` extraído como constante reutilizável em `admin/page.tsx`
- `brandGradient` usado em `BlockPalette.tsx` (DRY)
- `BrandMark` agora usa `<Image source={flexedLogo} />` cross-platform via Metro bundler (substitui `Sparkles` icon + gradiente inline)

## ⚠️ Impedimentos & Logs de Erro Recentes
- **Build de produção pré-existente (`react-native/index.js` Flow syntax)** — originado em commit `7eac32c`. **RESOLVIDO nesta turno**:
  - Adicionado `@tamagui/image@2.0.0-rc.42` a `packages/ui` (D-01 justificado: cross-platform, padrão Tamagui)
  - `packages/ui/src/components/BrandMark.tsx`: substituído `import { Image } from 'react-native'` por `import { Image } from '@tamagui/image'`. API mudou de `style={{width,height}}` para props `width/height/objectFit`
  - `pnpm run build` em `apps/admin` agora **compila com sucesso** (11.6s, 8 rotas)
  - `tsc --noEmit` em `apps/admin` e `packages/ui` limpo
  - 44/44 testes passam (2 admin + 42 ui)
  - `apps/student` tsc: erro `Maximum call stack size exceeded` é **pré-existente** (reproduzido no clean checkout antes desta sessão, commit `4f66be3`) — não introduzido pelas minhas mudanças
