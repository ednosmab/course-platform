# 🧠 MEMÓRIA RAM ATIVA

## Status Atual
SESSAO ATIVA — Correção de schema cache: migration `certificate_blocks` aplicada ao remote.

## 🎯 Tarefa em Execução
**Corrigir erro PGRST204: coluna `certificate_blocks` ausente no schema cache do Supabase**

## 🕹️ Documentos Carregados via MCP
- `docs/FORBIDDEN_OPERATIONS.md` — Regras vinculantes
- `docs/DESDO.md` — Seção 8 (Tamagui governance)
- `docs/context_buffer.md` — Estado da última execução

## Diagnóstico
- **Causa raiz:** Migration `20260523000000_add_course_certificate_blocks.sql` existia no repositório, mas **nunca foi aplicada** ao banco remoto Supabase.
- **Sintoma:** `console.error("Failed to save draft: ... PGRST204 ... Could not find the 'certificate_blocks' column of 'courses' in the schema cache")` em `EditorContext.tsx:479` ao tentar salvar rascunho no modo certificate.
- **Migrations pendentes encontradas:** `20260522000002` (tests_completed) e `20260523000000` (certificate_blocks).

## Correção
- [x] Aplicadas ambas as migrations via `supabase db push`
- [x] Adicionado `if not exists` no SQL da migration `20260523000000_add_course_certificate_blocks.sql` para idempotência
- [x] Comentário traduzido para inglês (AGENTS.md compliance)

## Verificação
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name='courses' AND column_name='certificate_blocks';
-- Resultado: certificate_blocks | jsonb | NO
```

## Key Decisions
- **`if not exists` adicionado:** Evita crash em re-aplicação acidental da migration.
- **Comentário em inglês:** Conformidade com AGENTS.md (idioma único inglês em código fonte).

## Relevant Files (Sessão Atual)
- `supabase/migrations/20260523000000_add_course_certificate_blocks.sql` — Adicionado `if not exists`, comentário em inglês
- `apps/admin/src/context/EditorContext.tsx` — Onde o erro era disparado (linha 479)

## ⚠️ Impedimentos & Logs de Erro Recentes
*Nenhum erro ativo.*
