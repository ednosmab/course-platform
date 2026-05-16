# 🚀 SKILL: POSTGRESQL PERFORMANCE & OPTIMIZATION

## 🎯 Objetivo
Garantir que o banco de dados responda rapidamente mesmo com grandes volumes de dados e acessos simultâneos.

## 🛠️ Dicas de Performance
1. **Explain Analyze:** Sempre que uma query estiver lenta, use o comando `EXPLAIN ANALYZE` no console do Supabase para identificar gargalos (scans sequenciais, joins pesados).
2. **Índices Inteligentes:** Crie índices B-Tree para colunas usadas em filtros (`WHERE`) e joins. Use índices Parciais para filtrar subconjuntos de dados.
3. **Prevenção de N+1:** Evite múltiplas chamadas ao Supabase em loops. Use filtros `in` ou RPCs para buscar dados relacionados de uma só vez.
4. **Connection Pooling:** Entenda a diferença entre a porta `5432` (direta) e `6543` (pooler - PgBouncer). Use o pooler em Edge Functions e Serverless.
5. **Views e Materialized Views:** Use Views para simplificar queries complexas e Materialized Views para dados pesados que não mudam com frequência.

## 📂 Onde Aplicar
- Em todas as definições de esquema e consultas ao banco.
