# 🧠 MEMÓRIA RAM ATIVA

## Status Atual
AGUARDANDO_APROVACAO_USUARIO

## 🎯 Tarefa em Execução
- Conclusão da FASE 2B: Criação e homologação física da migration SQL `20260517000000_init_schema.sql` com tabelas core, triggers, índices GIN e políticas de segurança RLS baseadas em JWT no Supabase.

## 🕹️ Camada Ativa e Documentos Carregados via MCP
- Camada: Persistência, Banco de Dados e Segurança (Supabase)
- `docs/layers/supabase/database_schema_plan.md`
- `docs/layers/supabase/rls_governance_skill.md`
- `docs/layers/supabase/security-policies.md`
- `docs/Requisitos_plataforma.md`

## Critérios de Aceitação
- [x] TASK-01: Criar pasta `supabase/migrations/` se necessário.
- [x] TASK-02: Escrever migration SQL `20260517000000_init_schema.sql` com tabelas core (profiles, paths, courses, modules, lessons, enrollments, progress, certificates).
- [x] TASK-03: Implementar triggers de updated_at e sincronização automatizada profiles com auth.users.
- [x] TASK-04: Implementar índices de performance GIN (para jsonb blocks) e B-Tree.
- [x] TASK-05: Habilitar RLS e criar políticas estritas para profiles, courses, modules, lessons, paths.
- [x] TASK-06: Criar políticas RLS estritas de isolamento de dados de estudantes para enrollments, student_progress e certificates.

## ⚠️ Impedimentos & Logs de Erro Recentes
- *Nenhum erro ativo. Migration inicial escrita com 100% de sucesso.*

## Próxima Task
- Iniciar a FASE 2C: Definição dos contratos de tipos e esquemas no pacote `@projeto/types`.
