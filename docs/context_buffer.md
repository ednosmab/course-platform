# 🧠 MEMÓRIA RAM ATIVA

## 📋 Quick Board (snapshot kanban — 2026-06-07)
- 🔴 **Em curso:** Nenhum — feature completa
- 🟡 **Parado:** Nenhum
- ⏭️ **Próximo:** Merge na develop

## Status Atual
**Sessão 2026-06-07 — Componentização de Filtros, Correções Student, Padrão de Sombras e Extração de StudentHeader.**
- Extraídos componentes reutilizáveis `FilterBar`, `FilterDropdown`, `SortDropdown`, `FilterChip` para `packages/ui/src/components/Filter/`.
- Refatorada página `/cursos` do admin para usar `FilterBar`.
- Criada tela `StudentCourses` e rota `(tabs)/courses.tsx` no student app.
- Corrigido erro `Cannot read properties of undefined (reading 'title')` no StudentDashboard.
- Removidas sombras de todos os Cards (padrão flat/clean documentado em `token-governance.md`).
- Filtros: fonte Montserrat (`$display`), sem bold, ícones alinhados, chevron rotativa, dropdown 100% largura.
- **StudentHeader extraído** — componente compartilhado em `apps/student/src/components/StudentHeader.tsx`. Removido código inline duplicado de TopBar de `StudentDashboard` e `StudentCourses`.

## 🎯 Tarefa em Execução
Feature concluída. Aguardando merge na develop.

## 🌿 Estado de Branches (2026-06-07)
- `feat/admin-cursos` (HEAD) — implementação completa de filtros, student courses, correções e StudentHeader.
- `develop` — integração de features, base estável.
- `main` — inalterada, push bloqueado.

## 🛠️ Alterações desta sessão
- `packages/ui/src/components/Filter/` (5 arquivos novos)
- `packages/ui/src/index.ts` (exports dos filtros)
- `packages/ui/src/components/Card.tsx` (sombras removidas do default)
- `apps/admin/src/app/cursos/page.tsx` (refatorado com FilterBar)
- `apps/admin/src/app/cursos/cursos.test.tsx` (mock atualizado)
- `apps/student/src/components/StudentHeader.tsx` (novo — header compartilhado)
- `apps/student/src/screens/StudentCourses.tsx` (refatorado com StudentHeader)
- `apps/student/app/(tabs)/courses.tsx` (novo)
- `apps/student/src/screens/StudentDashboard.tsx` (refatorado com StudentHeader, TopBar removido)
- `apps/student/src/screens/CourseLessons.tsx` (sombras removidas)
- `apps/student/app/(tabs)/index.tsx` (prop de navegação)
- `docs/layers/ui/token-governance.md` (padrão de sombras documentado)

## ✅ Validações (regra 7 AGENTS.md)
**92/92 ✅** (admin) · `verify:ui` ✅ · working tree clean
- **Bug fix:** `Image` import adicionado de volta em `StudentDashboard.tsx` (crash "Failed to construct 'Image'" resolvido — `Image` era usado na Stats Panel mas foi removido acidentalmente na extração do StudentHeader).

## 📌 Próximos Passos
- Merge na develop
