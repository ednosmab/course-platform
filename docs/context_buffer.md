# 🧠 MEMÓRIA RAM ATIVA

## 📋 Quick Board (snapshot kanban — 2026-06-10)
- 🔴 **Em curso:** Controle de Acesso a Cursos (plano `docs/plans/2026-06-10-controle-acesso.md`)
- 🟡 **Parado:** Nenhum
- ⏭️ **Próximo:** Execução dos steps 1-5, 7-15 (MiMo V2.5 Free) + steps 6a/6b/6c (Nemotron 3 Ultra Free)

## Status Atual
**Sessão 2026-06-10 — Explorar Cursos + Plano de Controle de Acesso + Skills.**
- Tela "Explorar Cursos" criada e funcionando (rota, navegação, filtros).
- Plano formal salvo em `docs/plans/2026-06-10-controle-acesso.md` (17 steps: 15 + 6a/6b/6c).
- Step 6 dividido em 3 sub-tarefas (6a query, 6b upsert, 6c DFS) para Nemotron.
- Skill `senior-engineer.md` traduzida para PT-BR e salva em `docs/skills/`.
- Skill `tdd-agent.md` salva em `docs/skills/`.
- Ambas as skills adicionadas como obrigatórias no AGENTS.md (regras #7 e #8).
- "controlo" renomeado para "controle" em todo o repo.

## 🎯 Tarefa em Execução
**Plano de Controle de Acesso** — aguarda execução dos steps.

### Tracking do Plano (passo actual)

| Step | Modelo | Estado | Última sessão |
|---|---|---|---|
| 1 | MiMo V2.5 Free | [ ] Pendente | — |
| 2 | MiMo V2.5 Free | [ ] Pendente | — |
| 3 | MiMo V2.5 Free | [ ] Pendente | — |
| 4 | MiMo V2.5 Free | [ ] Pendente | — |
| 5 | MiMo V2.5 Free | [ ] Pendente | — |
| 6a | Nemotron 3 Ultra Free | [ ] Pendente | — |
| 6b | Nemotron 3 Ultra Free | [ ] Pendente | — |
| 6c | Nemotron 3 Ultra Free | [ ] Pendente | — |
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
- `feat/admin-cursos` (HEAD) — explorar cursos + plano de controle + skills.
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
- `docs/plans/2026-06-10-controle-acesso.md` (novo — plano formal 17 steps + tracking)
- `docs/workflows/workflow_adm.md` (seção 11 — Controle de Acesso)
- `docs/BACKLOG.md` (item P2 — Controle de Acesso)
- `docs/skills/senior-engineer.md` (novo — skill PT-BR)
- `docs/skills/tdd-agent.md` (novo — skill PT-BR)
- `docs/AGENTS.md` (regras #7 e #8 obrigatórias)
- `docs/FORBIDDEN_OPERATIONS.md` (controlo → controle)
- `apps/admin/src/components/certificate-editor/CertificateImageSettings.tsx` (controlo → controle)

## ✅ Validações (regra 7 AGENTS.md)
**verify:ui** ✅ · **Student 7/7** ✅ · **Admin 92/92** ✅ · **Core 46/46** ✅
- UI tests: 55/57 (2 falhas pré-existentes em BrandMark.test.tsx — não relacionadas)

## 📌 Próximos Passos
1. Executar Step 1 do plano (Migration SQL — MiMo V2.5 Free)
2. Seguir sequência do plano até step 5
3. Steps 6a/6b/6c: trocar para Nemotron 3 Ultra Free
4. Steps 7-15: MiMo V2.5 Free
