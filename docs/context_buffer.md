# 🧠 MEMÓRIA RAM ATIVA

## 📋 Quick Board (snapshot kanban — 2026-06-07)
- 🔴 **Em curso:** Refatoração admin para usar FilterBar + Student Courses Screen
- 🟡 **Parado:** Nenhum
- ⏭️ **Próximo:** Commit das mudanças de refatoração

## Status Atual
**Sessão 2026-06-07 — Componentização de Filtros e Ordenação.**
- Extraídos componentes reutilizáveis `FilterBar`, `FilterDropdown`, `SortDropdown`, `FilterChip` para `packages/ui/src/components/Filter/`.
- Refatorada página `/cursos` do admin para usar `FilterBar` em vez de JSX inline.
- Removidos states não utilizados: `showSortDropdown`, `showFilterDropdown`, `sortDropdownRef`, `filterDropdownRef`, `sortLabel`.
- Corrigidos imports de `Icon` nos componentes Filter (de `tamagui` para `../Icon`).
- Atualizado mock de `@projeto/ui` nos testes para incluir `FilterBar`.

## 🎯 Tarefa em Execução
Finalizar refatoração admin e criar student courses screen.

## 🌿 Estado de Branches (2026-06-07)
- `feat/admin-cursos` (HEAD) — contém a implementação da nova página de Cursos, componentização de filtros.
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

## ✅ Validações (regra 7 AGENTS.md)
**92/92 ✅** (admin vitest passando) · `verify:ui` ✅ · `tsc --noEmit` ✅ · working tree clean

## 📌 Próximos Passos
- Commit das mudanças de refatoração
- Criar student courses screen em `apps/student/src/screens/StudentCourses.tsx`
- Criar rota em `apps/student/app/(tabs)/courses.tsx`
