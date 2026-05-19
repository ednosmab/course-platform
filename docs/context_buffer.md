# 🧠 MEMÓRIA RAM ATIVA

## Status Atual
SESSAO ATIVA — Zod schemas relaxados, SafeAreaProvider corrigido, escalabilidade planejada, design extraction documentado, ADR-006 criado, 30 decisões técnicas auditadas.

## 🎯 Últimas Conquistas
- **Schemas relaxados:** IDs de `z.string().uuid()` → `z.string()`, `.strict()` removido dos `styles` em todos os 6 block schemas + QuizOptionSchema + CourseLessonContentSchema. Seed data corrigido para `crypto.randomUUID()`.
- **SafeAreaProvider fix:** Envolvidos os 3 blocos de renderização em `App.tsx` para eliminar crash "No safe area value available".
- **BACKLOG expandido:** Tasks de escalabilidade (SCL-01 a SCL-16), testes E2E (E2E-01 a E2E-10), infra (TASK-01 a TASK-07), design extraction (DASH-01, EDIT-01 a EDIT-07, TOKEN-01/02), 10 ADRs pendentes (ADR-007 a ADR-016), seção bloqueada (pagamentos, aulas ao vivo, fóruns, dashboard aluno).
- **ADR-006:** Criado — Student JSON headless rendering architecture.
- **30 decisões técnicas auditadas** no código vs documentação — 10 candidatas a ADR formal.

## 🕹️ Estado Atual do Projeto
- **Branch atual:** `feat/dsv2-reform`
- **Student app:** ✅ Build (Expo Web)
- **Admin app:** ✅ Build (Next.js)
- **Ladle:** ✅ Build (6 stories)
- **MVP ~30% completo** — Fundação sólida, aplicações (admin editor + student player) ainda precisam ser finalizadas.

## 📋 Checklist de Progresso
- [x] DSv2 Reform - Fase 0 (Tokens modulares + governança)
- [x] **Fase 1-3:** Admin + Student migrados para `@projeto/ui`
- [x] **Fase 4:** Sistema de Ícones (`Icon` wrapper + substituição)
- [x] **Fase 5:** Preview de Componentes (Ladle + stories)
- [x] **Fase 6:** Governança final (verify-ui-rules, AGENTS.md, CONTEXT_MAP)
- [x] **CI:** GitHub Actions workflow (build:verify + react-consistency + verify:ui + ladle:build)
- [x] **Schemas:** IDs relaxados, `.strict()` removido dos styles
- [x] **ADR-006:** Student JSON headless rendering
- [x] **BACKLOG:** Expandido com escalabilidade, E2E, design extraction, ADRs pendentes, itens bloqueados
- [x] **Auditoria:** 30 decisões técnicas não documentadas identificadas
- [ ] **Próximo passo:** TOKEN-01 — Migrar paleta Cloud White para tokens Tamagui
