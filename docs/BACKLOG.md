# 📋 BACKLOG — Plataforma de Cursos com CMS

## 🎯 Prioridades (ordenadas por impacto)

### P0 — Crítico (bloqueia progresso)

- [ ] **Fase 1 real — Migrar Admin Editor para `@projeto/ui`**
  - `apps/admin/src/components/editor/*.tsx` (5 arquivos) ainda usam `<div>`, `<button>`, `<h3>`, `<span>`, `<p>`, `<input>`, `<select>`, `<textarea>`, CSS classes e cores hardcoded
  - Substituir por `YStack`, `XStack`, `Text`, `Button`, `Card`, `Icon` de `@projeto/ui`
  - Referência: `docs/roadmaps/design-system-reforma.md` (Fase 1)
- [ ] **Reconciliar `docs/layers/ui/execution_plan.md`**
  - TASK-32 a TASK-38 marcadas como pendentes, mas já foram executadas
  - Atualizar checkboxes para refletir realidade

### P1 — Alta

- [ ] **Compatibilizar versões do React entre apps**
  - `student` usa React 19.1.0, `admin` usa 19.2.4
  - Unificar para evitar conflitos de resolução
- [ ] **Migrar `apps/admin/src/app/globals.css`**
  - 195 linhas com resets, grid patterns, form classes, palette classes
  - Manter apenas CSS de canvas/infra; migrar estilos para tokens Tamagui
- [ ] **Criptografar variáveis de ambiente no CI**
  - `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` necessárias no workflow
  - Adicionar secrets no GitHub Actions

### P2 — Média

- [ ] **Criar stories faltantes no Ladle**
  - Container (se aplicável), VideoBlock, QuizBlock, ImageBlock, HtmlBlock
- [ ] **Criar testes unitários para `@projeto/ui`**
  - Testes para Button, Card, Text, Icon renderizarem sem crash
- [ ] **Criar testes para `@projeto/core`**
  - Apenas `progress.test.ts` existe; faltam testes para `course.ts` e `auth.ts`
- [ ] **Pipeline de testes E2E (Playwright)**
  - Configurar Playwright + criar specs para fluxo crítico (admin publica aula → aluno consome)
- [ ] **Modo offline no student app**
  - Hook `useMobileProgress` implementa fila offline, mas faltam testes de integração

### P3 — Baixa / Melhorias

- [ ] **Tokens de sombra (`shadows.ts`) — verificar uso**
  - Arquivo existe mas não é claro se `tamagui.config.ts` consome os presets
- [ ] **TypeScript strict mode**
  - Vários `any` espalhados (especialmente em EditorContext.tsx e App.tsx)
  - Ativar `strict: true` no `tsconfig.json` e resolver erros
- [ ] **Internacionalização (i18n)**
  - Código mistura português (mensagens de erro, labels) com inglês (código fonte)
  - Decidir idioma oficial e extrair strings
- [ ] **Acessibilidade (a11y)**
  - Editor admin usa vários `<button>` sem `aria-label` e elementos sem foco gerenciado
- [ ] **Remover dependências não utilizadas**
  - `@projeto/ui` tem `expo-av` em peerDeps mas VideoBlock está no entry nativo apenas
  - Verificar se `lucide-react-native` ainda é necessário como peerDep

### 🧹 Documentação

- [ ] **Atualizar `docs/layers/ui/execution_plan.md`** — marcar TASK-32 a TASK-38 como concluídas
- [ ] **Criar `docs/history/`** com resumo desta sessão (Fase 4-6 + CI)

---

## 📊 Legenda

| Prefixo | Significado |
|---------|-------------|
| P0 | Bloqueia progresso ou quebra build |
| P1 | Funcionalidade principal incompleta |
| P2 | Qualidade, testes, cobertura |
| P3 | Refinamento, débito técnico, docs |
