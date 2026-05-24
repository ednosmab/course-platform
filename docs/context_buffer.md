# 🧠 MEMÓRIA RAM ATIVA

## Status Atual
SESSAO ATIVA — Cleanup: remover código morto da abordagem de captura abandonada.

## 🎯 Tarefa em Execução
Limpeza de dead code: remover `html-to-image`, `useCertificateCapture`, `uploadCertificatePreview`, `certificate_url` e migration obsoleta de Storage RLS.

## 🕹️ Documentos Carregados via MCP
- `docs/FORBIDDEN_OPERATIONS.md` — Regras vinculantes
- `docs/DESDO.md` — Diretrizes de engenharia
- `docs/context_buffer.md` — Estado da última execução
- `docs/BACKLOG.md` — Prioridades do projeto
- `docs/roadmaps/design-system-reforma.md` — Plano do DS

## Implementação

### Abordagem atual: Preview ao vivo (sem captura)
O preview do certificado na página de configurações renderiza os blocos JSONB ao vivo via `CertificateBlockRenderer`, sem captura de screenshot. A abordagem anterior (captura com `html-to-image` + Storage) foi abandonada porque PNGs gerados de elementos off-screen (`opacity:0`) resultavam em arquivos inválidos.

### Flows
1. **Studio (certificate mode):** Usuário adiciona blocos de texto/imagem no editor → auto-save salva em `courses.certificate_blocks` (JSONB) → imagens uploaded para `certificate-images/{courseId}/certificates/{blockId}.ext`
2. **Config page preview:** Lê `certificate_blocks` do course → renderiza ao vivo via `CertificateBlockRenderer` → usa `<img>` nativo para imagens (não Tamagui Image, que falha no web)
3. **Editor mode strategy:** `editor-modes.ts` com `LessonModeConfig` e `CertificateModeConfig` evitam `if (mode === 'certificate')` espalhado

### Mudanças arquiteturais
- **Capture approach ABANDONADA:** removidos `useCertificateCapture`, `html-to-image` dependency, `uploadCertificatePreview` do IStorageProvider/storage service/supabase adapter, `certificate_url` do CourseSchema/ICourseRepository/course repository
- **Migrations removidas:** `20260523000002_add_certificate_url.sql` e `20260524000001_add_storage_rls_certificate.sql`
- **CertificateBlock schemas:** `.passthrough()` em vez de `.strict()` — aceita propriedades extras do editor sem falhar Zod
- **Dispatch functions:** `useCallback([])` no EditorContext para evitar loop infinito
- **Auto-save debounce:** reduzido de 10000ms para 500ms
- **SSR client injection:** `SupabaseClientInit` provider injeta `setSupabaseClient(createSupabaseBrowserClient())` no core

## Arquivos ativos do Certificate feature

### Types
- `packages/types/src/certificate-block.ts` — schemas com `.passthrough()`

### Core
- `packages/core/src/ports/IStorageProvider.ts` — `uploadCertificateImage` (mantido), `uploadCertificatePreview` (removido)
- `packages/core/src/adapters/supabase-storage-provider.ts` — upload de imagens de blocos para `certificate-images` bucket
- `packages/core/src/services/storage.ts` — `uploadCertificateImage` (mantido), `uploadCertificatePreview` (removido)
- `packages/core/src/ports/ICourseRepository.ts` — `certificate_blocks` no Pick, `certificate_url` removido
- `packages/core/src/adapters/supabase-course-repository.ts` — atualizado

### UI
- `packages/ui/src/components/Certificate/CertificateMiniature.tsx` — renderiza blocos ao vivo via `CertificateBlockRenderer`
- `packages/ui/src/components/Certificate/CertificateBlockRenderer.tsx` — renderizador com `<img>` nativo para imagem
- `packages/ui/src/components/Certificate/CertificatePage.tsx` — template A4 com molduras douradas, texto parametrizado (props)
- `packages/ui/src/components/Certificate/useA4Scale.ts` — hook de escala A4

### Admin
- `apps/admin/src/context/EditorContext.tsx` — dispatch com `useCallback`
- `apps/admin/src/context/editor-modes.ts` — strategy pattern
- `apps/admin/src/components/editor/BlockSettings.tsx` — config de blocos com upload de imagem
- `apps/admin/src/app/providers.tsx` — injeção SSR client

### Migrations mantidas
- `supabase/migrations/20260520000001_add_certificate_enabled.sql` — coluna `certificate_enabled boolean`
- `supabase/migrations/20260523000000_add_course_certificate_blocks.sql` — coluna `certificate_blocks jsonb`

## ⚠️ Impedimentos & Logs de Erro Recentes
*Nenhum erro ativo.*
