# 🧠 MEMÓRIA RAM ATIVA

## Status Atual
SESSAO ENCERRADA — Preview desktop/mobile/tablet com posicionamento absoluto, tablet viewport adicionado, mockups centralizados, notch unificado.

## 🎯 Últimas Conquistas
- **Schemas relaxados:** IDs de `z.string().uuid()` → `z.string()`, `.strict()` removido dos `styles` em todos os 6 block schemas + QuizOptionSchema + CourseLessonContentSchema. Seed data corrigido para `crypto.randomUUID()`.
- **SafeAreaProvider fix:** Envolvidos os 3 blocos de renderização em `App.tsx` para eliminar crash "No safe area value available".
- **BACKLOG expandido:** Tasks de escalabilidade (SCL-01 a SCL-16), testes E2E (E2E-01 a E2E-10), infra (TASK-01 a TASK-07), design extraction (DASH-01, EDIT-01 a EDIT-07, TOKEN-01/02), 10 ADRs pendentes (ADR-007 a ADR-016), seção bloqueada (pagamentos, aulas ao vivo, fóruns, dashboard aluno).
- **ADR-006:** Criado — Student JSON headless rendering architecture.
- **30 decisões técnicas auditadas** no código vs documentação — 10 candidatas a ADR formal.
- **TOKEN-01 — Cloud White palette migrada:** 30 novos tokens `cw*`, 2 shadow presets, 2 fontes (Space Grotesk, DM Sans), tema `cloudWhite` com 28 variantes semânticas. OKLCH convertido para hex cross-platform.
- **TOKEN-02 — BrandMark component:** Sparkles + gradient + "Mosaico."
- **DASH-01 — Admin dashboard:** Rota `/` com top bar, hero, stats, course grid. Editor movido para `/studio/[courseId]`.
- **Sidebars ocultas no preview:** BlockPalette e BlockSettings não renderizam em preview mode.
- **flex:1 no canvas-area:** Todos os containers canvas-area agora preenchem o espaço disponível.
- **Tablet viewport (768px):** Adicionado toggle Desktop/Tablet/Mobile com TableViewport para edição e preview.
- **Preview desktop com posicionamento absoluto:** Blocos renderizados com x, y, z-index (match edit mode), em vez de row-based layout.
- **Preview mobile/tablet com posicionamento absoluto:** Blocos escalados proporcionalmente (390/1100 ou 768/1100) com `BlockContent`, em vez de `MobileCanvas` flex.
- **Mockups centralizados:** MobileViewport e TableViewport agora usam `justifyContent: center`.
- **Preview mobile com notch idêntico ao edit mode:** Removido signal bar, mesmo notch pill + borderRadius 36.

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
- [x] **TOKEN-01:** Cloud White palette migrada para tokens Tamagui (30 `cw*` color tokens, 2 shadow presets, 2 novas fontes, tema `cloudWhite` com 28 variantes semânticas. OKLCH convertido para hex cross-platform)
- [x] **TOKEN-02 — BrandMark component:** Sparkles + gradient + "Mosaico."
- [x] **DASH-01 — Admin dashboard:** Rota `/` com top bar, hero, stats, course grid. Editor movido para `/studio/[courseId]`
- [x] **Sidebars ocultas no preview:** BlockPalette e BlockSettings não renderizam em preview mode
- [x] **flex:1 no canvas-area:** containers preenchem espaço disponível
- [x] **Tablet viewport:** toggle Desktop/Tablet/Mobile com TableViewport (768px)
- [x] **Preview desktop com posicionamento absoluto:** BlockContent com x, y, z-index
- [x] **Preview mobile/tablet com posicionamento absoluto:** blocos escalados (viewportWidth / CANVAS_W)
- [x] **Mockups centralizados:** justify-content center no MobileViewport e TableViewport
- [x] **Notch unificado:** preview mobile usa mesmo notch pill + borderRadius 36 do edit mode
- [ ] **Próximo passo:** A definir
