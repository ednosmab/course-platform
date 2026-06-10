# 🧠 MEMÓRIA RAM ATIVA

## 📋 Quick Board (snapshot kanban — 2026-06-10)
- 🔴 **Em curso:** Controlo de Acesso a Cursos (plano `docs/plans/2026-06-10-controlo-acesso.md`)
- 🟡 **Parado:** Nenhum
- ⏭️ **Próximo:** Execução dos steps 1-5, 7-15 (MiMo V2.5 Free) + step 6 (Nemotron 3 Ultra Free)

## Status Atual
**Sessão 2026-06-10 — Explorar Cursos + Plano de Controlo de Acesso.**
- Botão "Explorar" renomeado para "Explorar Cursos" no StudentHeader.
- Tela `StudentExplore` criada com grid de cursos e filtros (`apps/student/src/screens/StudentExplore.tsx`).
- Rota `/explore` criada (`apps/student/app/(tabs)/explore.tsx`).
- Navegação actualizada em Dashboard, Courses e rotas (props `onNavigateToExplore`).
- Workflow admin documentado (seção 11 — Controlo de Acesso).
- Backlog actualizado (item P2 com referência ao plano).
- Plano formal salvo em `docs/plans/2026-06-10-controlo-acesso.md` (15 steps, 2 modelos).

## 🎯 Tarefa em Execução
**Plano de Controlo de Acesso** — aguarda execução dos steps.

### Tracking do Plano (passo actual)

| Step | Modelo | Estado | Última sessão |
|---|---|---|---|
| 1 | MiMo V2.5 Free | [ ] Pendente | — |
| 2 | MiMo V2.5 Free | [ ] Pendente | — |
| 3 | MiMo V2.5 Free | [ ] Pendente | — |
| 4 | MiMo V2.5 Free | [ ] Pendente | — |
| 5 | MiMo V2.5 Free | [ ] Pendente | — |
| 6 | Nemotron 3 Ultra Free | [ ] Pendente | — |
| 7 | MiMo V2.5 Free | [ ] Pendente | — |
| 8 | MiMo V2.5 Free | [ ] Pendente | — |
| 9 | MiMo V2.5 Free | [ ] Pendente | — |
| 10 | MiMo V2.5 Free | [ ] Pendente | — |
| 11 | MiMo V2.5 Free | [ ] Pendente | — |
| 12 | MiMo V2.5 Free | [ ] Pendente | — |
| 13 | MiMo V2.5 Free | [ ] Pendente | — |
| 14 | MiMo V2.5 Free | [ ] Pendente | — |
| 15 | MiMo V2.5 Free | [ ] Pendente | — |

**Próximo step a executar:** Step 1 (Migration SQL — MiMo V2.5 Free)

## 🌿 Estado de Branches (2026-06-10)
- `feat/admin-cursos` (HEAD) — explorar cursos + plano de controlo de acesso.
- `develop` — integração de features, base estável.
- `main` — inalterada, push bloqueado.

## 🛠️ Alterações desta sessão
- `apps/student/src/components/StudentHeader.tsx` (label "Explorar" → "Explorar Cursos")
- `apps/student/app/(tabs)/explore.tsx` (novo — rota da tela)
- `apps/student/src/screens/StudentExplore.tsx` (novo — tela de exploração)
- `apps/student/src/screens/StudentDashboard.tsx` (prop onNavigateToExplore + case explore)
- `apps/student/src/screens/StudentCourses.tsx` (prop onNavigateToExplore + case explore)
- `apps/student/app/(tabs)/index.tsx` (prop onNavigateToExplore)
- `apps/student/app/(tabs)/courses.tsx` (prop onNavigateToExplore)
- `docs/plans/2026-06-10-controlo-acesso.md` (novo — plano formal 15 steps + tracking)
- `docs/workflows/workflow_adm.md` (seção 11 — Controlo de Acesso)
- `docs/BACKLOG.md` (item P2 — Controlo de Acesso)

## ✅ Validações (regra 7 AGENTS.md)
**verify:ui** ✅ · **Student 7/7** ✅ · **Admin 92/92** ✅ · **Core 46/46** ✅
- UI tests: 55/57 (2 falhas pré-existentes em BrandMark.test.tsx — não relacionadas)

## 📌 Próximos Passos
1. Executar Step 1 do plano (Migration SQL — MiMo V2.5 Free)
2. Seguir sequência do plano até step 5
3. Step 6: trocar para Nemotron 3 Ultra Free
4. Steps 7-15: MiMo V2.5 Free
