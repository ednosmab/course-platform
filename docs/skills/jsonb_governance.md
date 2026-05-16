# 🗄️ SKILL: GOVERNANÇA DE DADOS JSONB (SUPABASE)

## 🎯 Objetivo
Manter a flexibilidade do esquema NoSQL dentro do PostgreSQL sem perder a consistência e a performance.

## 📜 Regras de Governança
1. **Schema-on-Read com Zod:** Nunca confie nos dados puramente como vêm do banco. Valide sempre com Zod antes do uso.
2. **Indexing Estratégico:** Use índices GIN (`jsonb_path_ops`) para acelerar buscas em chaves específicas dentro do JSONB.
3. **Imutabilidade de Chaves:** Uma vez definida uma chave no JSONB, nunca a altere ou remova sem um plano de migração de dados.
4. **Campos Obrigatórios:** Use `CHECK constraints` no PostgreSQL para garantir a presença de campos vitais (ex: `type`, `id`) no JSONB.
5. **Nivelamento (Flattening):** Se um dado dentro do JSONB for usado frequentemente para filtros complexos ou joins, considere promovê-lo a uma coluna relacional real.

## 📂 Onde Aplicar
- Definição de tabelas no Supabase.
- Schemas em `packages/types`.
