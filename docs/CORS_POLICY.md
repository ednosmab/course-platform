# CORS Hardening Policy

## Política Atual

**Status:** Não implementada. Origin permitida é implícita (nenhum header CORS configurado).

## Política Desejada

### API (Next.js)

```typescript
// next.config.js ou middleware.ts
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || 'https://app.mosaico.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400', // 24h preflight cache
};
```

### Supabase

Configurar CORS no painel Supabase > API > Settings:
- Allowed origins: domínios específicos (nunca `*`)
- Admin app: `https://admin.mosaico.com` (ou `localhost:3000` em dev)
- Student app: `https://app.mosaico.com` (ou `localhost:8081` em dev)

### Edge Functions

Todas as funções devem implementar CORS handling:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGINS') || 'https://app.mosaico.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

## Regras

1. **Nunca** usar `Access-Control-Allow-Origin: *` com credenciais
2. `localhost` permitido apenas em desenvolvimento (controlado por ENV var)
3. Métodos OPTIONS devem responder 204 sem autenticação
4. Métodos não listados no `Allow-Methods` devem ser rejeitados com 405
5. Headers não listados no `Allow-Headers` devem ser rejeitados

## Verificação

- Testar com `curl -X OPTIONS -H "Origin: https://evil.com" -H "Access-Control-Request-Method: GET" <endpoint>`
- Esperado: resposta sem header `Access-Control-Allow-Origin`
- Checar no CI com script de validação de CORS
