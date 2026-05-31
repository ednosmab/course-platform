# 🧠 MEMÓRIA RAM ATIVA

## Status Atual
CONCLUÍDO — Bordas, sombras e border-radius removidos do preview desktop em EditorCanvas.tsx. Fundo branco agora preenche toda a tela. Canvas de edição mantido intacto.

## 🎯 Tarefa em Execução
Remoção de bordas do preview desktop concluída. Aguardando próxima tarefa.

## 🕹️ Documentos Carregados via MCP
- `docs/FORBIDDEN_OPERATIONS.md` — Regras vinculantes
- `docs/DESDO.md` — Diretrizes de engenharia
- `docs/context_buffer.md` — Estado da última execução
- `docs/CONTEXT_MAP.md` — Mapeamento de camadas
- `docs/BACKLOG.md` — Backlog actualizado
- `apps/student/src/screens/StudentDashboard.tsx` — Dashboard com TopBar HTML
- `apps/student/src/screens/CourseLessons.tsx` — CourseLessons sem sidebar
- `apps/student/src/screens/Certificates.tsx` — Certificates com dashed border errado
- `apps/student/src/screens/LessonPlayer.tsx` — Player com tokens legados
- `apps/student/App.tsx` — Navegação principal
- `desing/src/routes/aluno.tsx` — Design reference Dashboard
- `desing/src/routes/aluno.curso.$courseId.aulas.tsx` — Design reference CourseLessons
- `desing/src/routes/aluno.certificados.tsx` — Design reference Certificates
- `docs/adrs/ADR-005-preview-fidelity-law.md` — Lei de fidelidade do preview
- `packages/ui/src/tokens/shadows.ts` — Shadow presets definidos mas não usados
- `apps/admin/src/components/editor/EditorCanvas.tsx` — Preview canvas (bordas removidas)

## Arquivos modificados nesta sessão
- `docs/BACKLOG.md` — 4 novos itens adicionados (P1: 2, P2: 2, P3: 1)
- `apps/admin/src/components/editor/EditorCanvas.tsx` — Bordas, sombras e border-radius removidos do preview desktop
- `docs/context_buffer.md` — Este log

## ✅ Resultado da Implementação
1. **Zod fix** ✅ — `HeadingBlockSchema` e `DividerBlockSchema` adicionados ao `LessonSchema` em `packages/types/src/database.ts`
2. **ErrorBoundary** ✅ — Componente criado em `apps/student/src/components/ErrorBoundary.tsx` e aplicado no `App.tsx`
3. **Cursor resize** ✅ — Migrado de `document.body.style.cursor` para injeção de `<style id="resize-cursor-override">` com `!important` em `EditorCanvas.tsx`

## ⚠️ Impedimentos & Logs de Erro Recentes
- `apps/student` — 3 testes pré-existentes quebrados em `useMobileProgress.test.ts` (mock do AuthService) — não relacionados às alterações.
