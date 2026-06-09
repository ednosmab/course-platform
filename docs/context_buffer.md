# 🧠 MEMÓRIA RAM ATIVA

## 📋 Quick Board (snapshot kanban — 2026-06-07)
- 🔴 **Em curso:** Nenhum — feature completa
- 🟡 **Parado:** Nenhum
- ⏭️ **Próximo:** Merge na develop

## Status Atual
**Sessão 2026-06-07 — Componentização de Filtros e Ordenação.**
- Extraídos componentes reutilizáveis `FilterBar`, `FilterDropdown`, `SortDropdown`, `FilterChip` para `packages/ui/src/components/Filter/`.
- Refatorada página `/cursos` do admin para usar `FilterBar` em vez de JSX inline.
- Criada tela `StudentCourses` em `apps/student/src/screens/StudentCourses.tsx` usando `FilterBar`.
- Criada rota `(tabs)/courses.tsx` no student app.
- Atualizado `StudentDashboard` para navegar para a tela de cursos.

## 🎯 Tarefa em Execução
Feature concluída. Aguardando merge na develop.

## 🌿 Estado de Branches (2026-06-07)
- `feat/admin-cursos` (HEAD) — contém a implementação da nova página de Cursos, componentização de filtros e tela de cursos do student.
- `develop` — integração de features, base estável.
- `main` — inalterada, push bloqueado.

## 🛠️ Alterações desta sessão
- `packages/ui/src/components/Filter/FilterBar.tsx` (novo)
- `packages/ui/src/components/Filter/FilterDropdown.tsx` (novo)
- `packages/ui/src/components/Filter/SortDropdown.tsx` (novo)
- `packages/ui/src/components/Filter/FilterChip.tsx` (novo)
- `packages/ui/src/components/Filter/index.ts` (novo)
- `packages/ui/src/index.ts` (atualizado com exports dos filtros)
- `apps/admin/src/app/cursos/page.tsx` (refatorado para usar FilterBar)
- `apps/admin/src/app/cursos/cursos.test.tsx` (mock atualizado)
- `apps/student/src/screens/StudentCourses.tsx` (novo)
- `apps/student/app/(tabs)/courses.tsx` (novo)
- `apps/student/src/screens/StudentDashboard.tsx` (atualizado com navegação para cursos)
- `apps/student/app/(tabs)/index.tsx` (atualizado com prop de navegação)

## ✅ Validações (regra 7 AGENTS.md)
**92/92 ✅** (admin vitest passando) · `verify:ui` ✅ · `tsc --noEmit` ✅ (admin) · working tree clean

## 📌 Próximos Passos
- Merge na develop
