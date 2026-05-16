# 🛡️ SKILL: SUPABASE TYPE SAFETY & SCHEMA SYNC

## 🎯 Objetivo
Manter o código TypeScript e o esquema do banco de dados em perfeita sincronia, evitando erros de tempo de execução por tipos desatualizados.

## 🛠️ Workflow de Tipagem
1. **CLI Code Gen:** Utilize o comando `supabase gen types typescript --local > packages/types/src/database.types.ts` sempre que alterar o esquema via migrations.
2. **Integração com Zod:** Use os tipos gerados pelo Supabase como base para seus esquemas Zod, garantindo que a validação de entrada reflita o banco.
3. **Strict Generic Types:** Ao usar o cliente do Supabase, sempre passe o tipo gerado: `createClient<Database>(...)`.
4. **Enums de Banco:** Prefira definir enums no PostgreSQL e deixá-los ser gerados como uniões de strings no TypeScript para manter a consistência.
5. **Relacionamentos:** Entenda como o gerador de tipos lida com chaves estrangeiras e joins para acessar propriedades aninhadas com segurança de tipo.

## 📂 Onde Aplicar
- `packages/types/`
- Clientes Supabase em Apps e Edge Functions.
