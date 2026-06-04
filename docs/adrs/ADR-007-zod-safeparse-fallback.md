# ADR-007: Zod safeParse + fallback — validação estrita com degradação graciosa

**Status:** Aceito
**Data:** 2026-05-23
**Contexto:** Core adapters (progress, auth, certificate repos)

---

## Decisão

Todas as validações Zod devem usar `safeParse` em vez de `parse`. Em caso de falha de validação, o erro deve ser logado e os dados brutos retornados como fallback, sem crashar a requisição.

---

## Contexto

Os adapters do core (`supabase-progress-repository.ts`, `supabase-auth-gateway.ts`, `supabase-certificate-repository.ts`) recebem dados do banco que nem sempre correspondem exatamente aos schemas Zod definidos. Mudanças futuras no schema do banco ou dados corrompidos não devem derrubar o serviço inteiro.

Usar `parse()` lança uma exceção `ZodError` que, se não capturada, resulta em erro 500 para o usuário. Com `safeParse()`, a validação falha silenciosamente e o sistema continua operando com os dados disponíveis.

```typescript
// Exemplo do padrão adotado:
const result = schema.safeParse(data);
if (!result.success) {
  console.error('[Zod] Validation failed:', result.error.flatten());
  return data as T; // fallback com raw data
}
return result.data;
```

---

## Consequências

### Positivas
- **Resiliência:** Nenhuma falha de validação Zod causa crash em produção
- **Observabilidade:** Erros de validação são logados para diagnóstico
- **Tolerância a migrações:** Schemas do banco podem evoluir sem quebrar o frontend
- **Rollback seguro:** Dados antigos no formato legado continuam funcionando

### Negativas
- **Perda de tipagem estrita:** O `as T` no fallback contorna o type checker
- **Falsos positivos:** Dados inválidos podem ser processados sem que o admin perceba
- **Complexidade adicional:** Cada validação precisa de 4 linhas em vez de 1

---

## Referências

- `packages/core/src/adapters/supabase-progress-repository.ts`
- `packages/core/src/adapters/supabase-auth-gateway.ts`
- `packages/core/src/adapters/supabase-certificate-repository.ts`
- `packages/core/src/adapters/supabase-course-repository.ts`
