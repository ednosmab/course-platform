# 🧠 MEMÓRIA RAM ATIVA

## 📋 Quick Board (snapshot kanban — 2026-06-07)
- 🔴 **Em curso:** Nenhum — feature completa
- 🟡 **Parado:** Nenhum
- ⏭️ **Próximo:** Merge na develop

## Status Atual
**Sessão 2026-06-07 — Componentização de Filtros, Correções Student e Padrão de Sombras.**
- Extraídos componentes reutilizáveis `FilterBar`, `FilterDropdown`, `SortDropdown`, `FilterChip` para `packages/ui/src/components/Filter/`.
- Refatorada página `/cursos` do admin para usar `FilterBar`.
- Criada tela `StudentCourses` e rota `(tabs)/courses.tsx` no student app.
- Corrigido erro `Cannot read properties of undefined (reading 'title')` no StudentDashboard.
- Removidas sombras de todos os Cards (padrão flat/clean documentado em `token-governance.md`).
- Filtros: fonte Montserrat (`$display`), sem bold, ícones alinhados, chevron rotativa, dropdown 100% largura.

## 🎯 Tarefa em Execução
Feature concluída. Aguardando merge na develop.

## 🌿 Estado de Branches (2026-06-07)
- `feat/admin-cursos` (HEAD) — implementação completa de filtros, student courses e correções.
- `develop` — integração de features, base estável.
- `main` — inalterada, push bloqueado.

## 🛠️ Alterações desta sessão
- `packages/ui/src/components/Filter/` (5 arquivos novos)
- `packages/ui/src/index.ts` (exports dos filtros)
- `packages/ui/src/components/Card.tsx` (sombras removidas do default)
- `apps/admin/src/app/cursos/page.tsx` (refatorado com FilterBar)
- `apps/admin/src/app/cursos/cursos.test.tsx` (mock atualizado)
- `apps/student/src/screens/StudentCourses.tsx` (novo)
- `apps/student/app/(tabs)/courses.tsx` (novo)
- `apps/student/src/screens/StudentDashboard.tsx` (navegação, null checks, sombras removidas)
- `apps/student/src/screens/CourseLessons.tsx` (sombras removidas)
- `apps/student/app/(tabs)/index.tsx` (prop de navegação)
- `docs/layers/ui/token-governance.md` (padrão de sombras documentado)

## ✅ Validações (regra 7 AGENTS.md)
**92/92 ✅** (admin) · **7/7 ✅** (student) · `verify:ui` ✅ · `tsc --noEmit` ✅ · working tree clean

## 📌 Próximos Passos
- Merge na develop
