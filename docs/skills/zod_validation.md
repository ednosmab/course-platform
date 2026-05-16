# 🛠️ SKILL: MODELAGEM DE DATA SCHEMA ULTRA-ESTRITO (AGENTE 1)

## 🎯 Objetivo
Garantir que todos os contratos de dados entre o CMS, o Banco de Dados e as Aplicações sejam resilientes, validados e auto-documentados.

## 🚨 Leis de Validação (Zod & TypeScript)
1. **Sem Vazamentos (Strict Mode):** O uso do modificador `.strict()` é OBRIGATÓRIO em todos os objetos Zod. Propriedades extras injetadas no JSONB devem disparar erro de validação para evitar lixo no banco.
2. **Padrão de ID:** Todos os IDs de blocos e entidades devem utilizar `z.string().uuid()` para compatibilidade nativa com o Supabase/PostgreSQL.
3. **Formatos de Conteúdo:** 
   - **Texto:** Deve aceitar strings que representem HTML sanitizado ou markdown (`z.string()`).
   - **Vídeo:** Exige `z.string().url()` e enum estrito para provedor (`'youtube' | 'vimeo' | 'storage_supabase'`).
   - **Quiz:** Deve validar a presença de pelo menos uma alternativa correta e IDs únicos para cada opção.
4. **Tipagem Inferida:** Exporte sempre o tipo TypeScript derivado diretamente do Zod para manter uma única fonte de verdade:
   ```typescript
   export const BlocoSchema = z.object({ ... }).strict();
   export type Bloco = z.infer<typeof BlocoSchema>;
   ```
5. **Composição de Blocos:** Use `z.discriminatedUnion('type', [...])` para a árvore de componentes da aula, permitindo inferência de tipo baseada no campo `type`.

## 📂 Onde Aplicar
- `packages/types/src/`
- Schemas de validação de Edge Functions.
