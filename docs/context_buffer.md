# 🧠 MEMÓRIA RAM ATIVA

## Status Atual
SESSAO ATIVA — Reordenação de módulos/aulas, rename inline, breadcrumb dinâmico, spinner contextual.

## 🎯 Últimas Conquistas
- **Reordenação de módulos e aulas:** Setas ↑↓ em cada módulo/aula com swap de `order_index` no Supabase. Ordem persistida via `order_index` ASC.
- **Rename inline:** Clicar "Renomear" → input inline com botão "Salvar". Enter/blur salvam, Escape cancela. Cor `$secondaryForeground` (`#38384A`).
- **Breadcrumb dinâmico no editor:** Cabeçalho agora mostra `Curso / Módulo / Aula` (buscado do Supabase via `lessonMeta.module_id`).
- **courseTitle, moduleTitle, lessonTitle** expostos no `EditorContext` — fetch das tabelas `modules` e `courses` ao carregar metadados.
- **Novas aulas/módulos no topo revertido:** Volta ao append (1ª criada = primeira na lista, última criada = última).
- **Spinner contextual:** "Carregando cursos…" (dashboard) e "Carregando curso…" (studio) adicionados.
- **BACKLOG expandido:** Bugs de salvar configurações e expansão do painel de settings adicionados. Spinner task marcado como concluído.

## 🕹️ Estado Atual do Projeto
- **Branch atual:** `feat/dsv2-reform`
- **Student app:** ✅ Build (Expo Web)
- **Admin app:** ✅ Build (Next.js)
- **Ladle:** ✅ Build (6 stories)
- **MVP ~35% completo** — CRUD de cursos, módulos e aulas funcional; reordenação e rename operacionais; certificado com toggle + pendências de escopo.

## 📋 Checklist de Progresso
- [x] DSv2 Reform - Fase 0 (Tokens modulares + governança)
- [x] **Fase 1-3:** Admin + Student migrados para `@projeto/ui`
- [x] **Fase 4:** Sistema de Ícones (`Icon` wrapper + substituição)
- [x] **Fase 5:** Preview de Componentes (Ladle + stories)
- [x] **Fase 6:** Governança final (verify-ui-rules, AGENTS.md, CONTEXT_MAP)
- [x] **CI:** GitHub Actions workflow
- [x] **DASH-01:** Admin dashboard + course CRUD + thumbnail upload
- [x] **Module/Lesson CRUD:** Criar, renomear, excluir, reordenar módulos e aulas
- [x] **Editor header dinâmico:** Breadcrumb Curso / Módulo / Aula
- [x] **Spinner contextual:** Mensagens amigáveis em todos os loading states
- [x] **Certificates:** Toggle no studio + migration + tabela `certificates` + pendência de escopo (por módulo/curso)
- [x] **BACKLOG:** Expandido com bugs de settings, certificado por módulo vs curso, spinner
- [ ] **BUG: Salvar configurações do curso** — Sem feedback de sucesso/erro
- [ ] **BUG: Painel de configurações** — Container não expande com `overflow="hidden"`
- [ ] **Certificado — decisão de escopo:** Por módulo, por curso ou ambos
- [ ] **Próximo passo:** A definir

## Key Decisions
- **order_index append:** 1ª aula criada = topo, última = final. Reordenação manual via ↑↓.
- **Inline rename:** Input + botão "Salvar" (Enter/blur também salvam). Cor `$secondaryForeground`.
- **Editor breadcrumb:** Dados vivos do Supabase via `lessonMeta.module_id` → module.title → course.title.
- **Backlog items:** Bugs de settings (P1) e decisão de certificado (bloqueado) adicionados.

## Relevant Files
- `apps/admin/src/app/studio/[courseId]/page.tsx`: CourseOverview (module/lesson CRUD, reorder, rename, settings, certificate)
- `apps/admin/src/context/EditorContext.tsx`: courseTitle, moduleTitle, lessonTitle expostos; fetch de nomes via module_id
- `apps/admin/src/components/editor/EditorHeader.tsx`: Breadcrumb dinâmico (Curso / Módulo / Aula)
- `apps/admin/src/app/page.tsx`: Dashboard com spinner contextual "Carregando cursos…"
- `docs/BACKLOG.md`: Bugs de settings, certificado por módulo vs curso, spinner concluído
