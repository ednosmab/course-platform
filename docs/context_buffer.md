# 🧠 MEMÓRIA RAM ATIVA

## Status Atual
EM EXECUÇÃO — P0: Isolamento total do editor de certificado vs editor de curso. SDR-001 criado. 4 itens adicionados ao BACKLOG. Próximo: Fase 1 (testes RED).

## 🎯 Tarefa em Execução
**P0 — Refactor: separar editor de certificado do editor de curso.**

Sub-tarefas (4 fases):
1. **Fase 0 (docs)**: ✅ SDR-001 + BACKLOG actualizado
2. **Fase 1 (RED)**: Testes para `CertificateBlockRenderer`, `CertificateMiniature`, `CertificatePage`, E2E duplex print
3. **Fase 2 (GREEN duplex)**: Reativar 2-canvas duplex em `CertificatePage` + `CertificatePrint.css`; passar `isDoubleSided` em `CertificateMiniature`; trocar div inline do `configuracoes/[id]/page.tsx` por `<CertificatePage>`
4. **Fase 3 (GREEN extract)**: Criar `apps/admin/src/components/certificate-editor/{CertificateCanvas,CertificateEditor,CertificateBlockSettings}.tsx` + rota `/studio/[id]/certificate` + redirect 308 + remover `isCertMode` do `EditorCanvas.tsx`
5. **Fase 4 (REFACTOR)**: Atualizar `docs/workflows/workflow_adm.md` + `apps/admin/AGENTS.md` (boundary rule) + verificações finais

## 🕹️ Documentos Carregados via MCP
- `docs/FORBIDDEN_OPERATIONS.md` — F-01 (UI sem domínio), F-02 (Renderer stateless), F-06 (sem estado global no Renderer)
- `docs/DESDO.md` — §5 (SDR para debugging longo), §7 (JSDoc obrigatório)
- `docs/AGENTS.md` — Workflow 4-passos + DRY Tamagui + idioma inglês + Next.js 16 aviso
- `docs/CONTEXT_MAP.md` — Layers 4 (apps) e 5 (core)
- `docs/BACKLOG.md` — Status actualizado
- `docs/sdr/SDR-001-certificate-editor-isolation.md` — **NOVO** — Decisão documentada
- `docs/CONTEXT_HIERARCHY.md` — P0-P4 leitura preguiçosa
- `apps/admin/src/components/editor/EditorCanvas.tsx` — Monolito identificado (1450 linhas, isCertMode em 618, 1141, 1285-1294)
- `apps/admin/src/app/studio/[courseId]/page.tsx` — Redirect 308 a adicionar
- `apps/admin/src/app/configuracoes/[courseId]/page.tsx` — Preview inline (linhas 663-758) e miniature sem isDoubleSided (609-613)
- `apps/admin/src/context/editor-modes.ts` — EditorModeConfig (strategy pattern, sem alterações planejadas)
- `apps/admin/src/context/EditorContext.tsx` — activeSide, certIsDoubleSided state (mantém)
- `apps/admin/src/components/editor/BlockSettings.tsx` — Block settings da aula
- `packages/ui/src/components/Certificate/CertificateBlockRenderer.tsx` — Single source of truth (fonte de render)
- `packages/ui/src/components/Certificate/CertificateMiniature.tsx` — Prop isDoubleSided existe mas não é passada
- `packages/ui/src/components/Certificate/CertificatePage.tsx` — Duplex 2-canvas perdido
- `packages/ui/src/components/Certificate/CertificatePrint.css` — Regras @media print
- `packages/types/src/certificate-block.ts` — Schemas Zod (mantidos intactos)
- `apps/admin/AGENTS.md` — Receberá boundary rule em Fase 4

## Arquivos modificados nesta sessão
- `docs/sdr/SDR-001-certificate-editor-isolation.md` — **NOVO** — Decisão de arquitetura
- `docs/BACKLOG.md` — 1 P0 + 3 P1 adicionados
- `docs/context_buffer.md` — Este log

## ✅ Resultado da Fase 0
1. **SDR-001** ✅ — Documenta causa raiz (acoplamento via `mode` prop) e solução (rota dedicada + boundary rule)
2. **BACKLOG** ✅ — Itens adicionados em P0 (refactor) e P1 (3 bugs)
3. **Context buffer** ✅ — Limpo e actualizado para nova task

## ⚠️ Impedimentos & Logs de Erro Recentes
- *Nenhum erro ativo.*
