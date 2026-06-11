# Plano: CRUD de Planos no Admin

**Data:** 2026-06-11
**Autor do plano:** Agente (plan mode)
**Executor previsto:** Agente (build mode)
**Reviewer:** Agente (review mode)

## 🎯 Objectivo

Criar interface de gerenciamento de planos no admin para permitir que o admin crie planos, vincule cursos a planos e atribua alunos a planos (até ~300 manualmente).

## 📋 Steps

### Step 1: Tipos e Schemas Zod
- **Ficheiro:** `packages/types/src/database.ts`
- **Acção:** Adicionar schemas Zod para `Plan`, `PlanCourse`, `StudentPlan` (se não existirem)
- **Verificação:** `pnpm --filter @projeto/types test`
- [ ] (preenchido pelo build)

### Step 2: Portas e Repositório
- **Ficheiro:** `packages/core/src/ports/IPlanRepository.ts` (novo)
- **Acção:** Criar interface com métodos: `createPlan`, `updatePlan`, `deletePlan`, `getPlans`, `getPlanById`, `getCoursesByPlan`, `addCourseToPlan`, `removeCourseFromPlan`, `getStudentsByPlan`, `assignStudentToPlan`, `removeStudentFromPlan`
- **Verificação:** `pnpm --filter @projeto/core test`
- [ ] (preenchido pelo build)

### Step 3: Implementação Supabase
- **Ficheiro:** `packages/core/src/adapters/supabase-plan-repository.ts` (novo)
- **Acção:** Implementar repositório com queries Supabase para todas as operações
- **Verificação:** `pnpm --filter @projeto/core test`
- [ ] (preenchido pelo build)

### Step 4: Serviço
- **Ficheiro:** `packages/core/src/services/plan.ts` (novo)
- **Acção:** Criar `PlanService` com delegações para o repositório
- **Verificação:** `pnpm --filter @projeto/core test`
- [ ] (preenchido pelo build)

### Step 5: Rota API Listar Planos
- **Ficheiro:** `apps/admin/src/app/api/plans/route.ts` (novo)
- **Acção:** Criar GET para listar todos os planos
- **Verificação:** `curl http://localhost:3000/api/plans`
- [ ] (preenchido pelo build)

### Step 6: Rota API Criar/Editar/Excluir Plano
- **Ficheiro:** `apps/admin/src/app/api/plans/route.ts`
- **Acção:** Adicionar POST (criar), PUT (editar), DELETE (excluir)
- **Verificação:** Testar com curl ou Thunder Client
- [ ] (preenchido pelo build)

### Step 7: Rota API Vincular Cursos ao Plano
- **Ficheiro:** `apps/admin/src/app/api/plans/[planId]/courses/route.ts` (novo)
- **Acção:** Criar GET (listar cursos do plano), POST (adicionar curso), DELETE (remover curso)
- **Verificação:** Testar com curl
- [ ] (preenchido pelo build)

### Step 8: Rota API Atribuir Alunos ao Plano
- **Ficheiro:** `apps/admin/src/app/api/plans/[planId]/students/route.ts` (novo)
- **Acção:** Criar GET (listar alunos do plano), POST (atribuir aluno), DELETE (remover aluno)
- **Verificação:** Testar com curl
- [ ] (preenchido pelo build)

### Step 9: Tela de Planos (Lista)
- **Ficheiro:** `apps/admin/src/app/planos/page.tsx` (novo)
- **Acção:** Criar página com lista de planos, botão "Novo Plano", ações (editar, excluir)
- **Verificação:** Acessar `/planos` no browser
- [ ] (preenchido pelo build)

### Step 10: Modal de Criar/Editar Plano
- **Ficheiro:** `apps/admin/src/app/planos/page.tsx`
- **Acção:** Adicionar modal com campos: nome, descrição, status (ativo/inativo)
- **Verificação:** Criar um plano e salvar
- [ ] (preenchido pelo build)

### Step 11: Tela de Detalhe do Plano
- **Ficheiro:** `apps/admin/src/app/planos/[planId]/page.tsx` (novo)
- **Acção:** Criar página com abas: "Cursos do Plano" e "Alunos do Plano"
- **Verificação:** Acessar `/planos/[planId]` no browser
- [ ] (preenchido pelo build)

### Step 12: Vincular Cursos ao Plano (UI)
- **Ficheiro:** `apps/admin/src/app/planos/[planId]/page.tsx`
- **Acção:** Criar seção para adicionar/remover cursos do plano com dropdown de seleção
- **Verificação:** Adicionar um curso ao plano e salvar
- [ ] (preenchido pelo build)

### Step 13: Atribuir Alunos ao Plano (UI)
- **Ficheiro:** `apps/admin/src/app/planos/[planId]/page.tsx`
- **Acção:** Criar seção para adicionar/remover alunos do plano com busca por email/nome
- **Verificação:** Atribuir um aluno ao plano e salvar
- [ ] (preenchido pelo build)

### Step 14: Navegação no Admin
- **Ficheiro:** `apps/admin/src/app/layout.tsx` ou componente de sidebar
- **Acção:** Adicionar link "Planos" na navegação do admin
- **Verificação:** Link aparece e navega corretamente
- [ ] (preenchido pelo build)

### Step 15: Testes Unitários
- **Ficheiro:** `packages/core/src/services/plan.test.ts` (novo)
- **Acção:** Criar testes para PlanService (CRUD básico)
- **Verificação:** `pnpm --filter @projeto/core test`
- [ ] (preenchido pelo build)

## 🛡️ Salvaguardas S1..S6

- **S1:** Não fundir steps — executar um de cada vez
- **S2:** Não tocar código fora do escopo (não modificar outros services/apps)
- **S3:** Não avançar com falha — se um step falhar, parar e reportar
- **S4:** Respeitar G-01 — não commitar sem autorização
- **S5:** Não criar ficheiros fora dos paths especificados
- **S6:** Não adicionar dependências novas sem necessidade

## 📊 Métricas-alvo

- **Ficheiros criados:** ~8 (1 interface, 1 repositório, 1 serviço, 4 rotas API, 2 páginas)
- **Ficheiros modificados:** ~2 (types, layout)
- **Testes:** ~5-8 testes unitários
- **Tempo estimado:** 2-3 horas

## ⚠️ Pontos de pausa G-01

- Após Step 8 (APIs criadas) — testar todas as rotas antes de prosseguir para UI
- Após Step 14 (navegação) — verificar que tudo está acessível
- Antes de commit — executar `pnpm run lint` e `pnpm run test`
