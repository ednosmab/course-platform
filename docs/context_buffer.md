# 🧠 MEMÓRIA RAM ATIVA

## Status Atual
SESSAO ATIVA — Implementar preview do certificado como imagem (captura + Storage).

## 🎯 Tarefa em Execução
**Preview do certificado: capturar screenshot no Studio, salvar no Supabase Storage, exibir na config page.**

## 🕹️ Documentos Carregados via MCP
- `docs/FORBIDDEN_OPERATIONS.md` — Regras vinculantes
- `docs/DESDO.md` — Diretrizes de engenharia
- `docs/context_buffer.md` — Estado da última execução
- `docs/BACKLOG.md` — Prioridades do projeto
- `docs/roadmaps/design-system-reforma.md` — Plano do DS

## Implementação

### Novo fluxo: Certificate Preview como imagem
Quando o usuário edita o certificado no Studio e salva (auto-save ou publish):
1. Um `CertificatePage` oculto (offscreen) é renderizado com os blocos atuais
2. `html-to-image` captura o DOM como PNG (via `useCertificateCapture` hook)
3. O blob é enviado para Supabase Storage (bucket `certificate-images`, path `{courseId}/certificate-preview.png`)
4. A URL retornada é salva em `courses.certificate_url`
5. Na tela de configurações, `CertificateMiniature` exibe a imagem do Storage (com fallback para preview simplificado dos blocos)

## Arquivos criados/modificados

### Migration
- `supabase/migrations/20260523000002_add_certificate_url.sql` — coluna `certificate_url TEXT` em `courses`

### Types (packages/types)
- `database.ts` — `certificate_url: z.string().nullable().optional()` no `CourseSchema`

### Core (packages/core)
- `ports/IStorageProvider.ts` — método `uploadCertificatePreview(blob, courseId)`
- `adapters/supabase-storage-provider.ts` — implementação (converte Blob → File, faz upload como PNG)
- `services/storage.ts` — `StorageService.uploadCertificatePreview`
- `ports/ICourseRepository.ts` — `certificate_url` no `Pick` do `updateCourse()`
- `adapters/supabase-course-repository.ts` — JSDoc + Pick type atualizados

### Admin (apps/admin)
- `hooks/useCertificateCapture.ts` — hook que captura ref com `html-to-image`, faz upload, salva URL
- `app/studio/[courseId]/page.tsx` — `CertificateEditor` renderiza `CertificatePage` oculto para captura; gatilho via `saveStatus === 'saved'`
- `app/configuracoes/[courseId]/page.tsx` — passa `certificateUrl` para `CertificateMiniature`
- `package.json` — adicionado `html-to-image`

### UI (packages/ui)
- `CertificateMiniature.tsx` — exibe imagem do Storage quando `certificateUrl` existe; fallback para preview simplificado

## ⚠️ Impedimentos & Logs de Erro Recentes
*Nenhum erro ativo.*
