# 🛠️ SKILL-01: MODELAGEM DE DATA SCHEMA ULTRA-ESTRITO

## 🚨 Leis de Validação (Zod & TypeScript)
1. **Sem Vazamentos:** O uso do modificador `.strict()` é obrigatório em todos os objetos Zod. Propriedades extras injetadas no JSONB devem disparar erro de validação.
2. **Padrão de ID:** Todos os IDs de blocos devem utilizar `z.string().uuid()` para compatibilidade nativa com o Supabase.
3. **Formatos de Conteúdo:** 
   - Texto deve aceitar strings brutas simulando HTML limpo (`z.string()`).
   - Vídeo exige `z.string().url()` e enum estrito para provedor (`'youtube' | 'vimeo' | 'storage_supabase'`).
4. **Tipagem Inferida:** Exporte sempre o tipo TypeScript derivado diretamente do Zod para manter uma única fonte de verdade:
   ```typescript
   export type Bloco = z.infer<typeof BlocoSchema>;
   ```
