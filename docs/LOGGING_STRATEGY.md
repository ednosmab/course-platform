# Estratégia de Logs Centralizados

## Formato Estruturado

Todos os logs em produção DEVEM ser emitidos no formato JSON:

```typescript
logger.info({
  level: 'info',
  service: 'admin',
  operation: 'create_course',
  userId: 'uuid',
  duration: 150,
  requestId: 'uuid',
  // error?: string (apenas em nível error)
});
```

## Níveis

| Nível | Uso | Exemplo |
|-------|-----|---------|
| `debug` | Desenvolvimento local | `logger.debug('block render', { type, props })` |
| `info` | Operações normais | `logger.info('course created', { courseId })` |
| `warn` | Situação anormal não crítica | `logger.warn('retry attempt 2/3', { operation })` |
| `error` | Falha operacional | `logger.error('save failed', { error: err.message })` |

## Logger (WIP)

```typescript
// packages/core/src/logger.ts
export const logger = {
  info: (msg: string, meta?: Record<string, unknown>) =>
    console.log(JSON.stringify({ level: 'info', msg, ...meta, timestamp: new Date().toISOString() })),
  warn: (msg: string, meta?: Record<string, unknown>) =>
    console.warn(JSON.stringify({ level: 'warn', msg, ...meta, timestamp: new Date().toISOString() })),
  error: (msg: string, meta?: Record<string, unknown>) =>
    console.error(JSON.stringify({ level: 'error', msg, ...meta, timestamp: new Date().toISOString() })),
};
```

## Centralização (Backlog)

- **Curto prazo:** Logs no stdout coletados pela Vercel/Supabase
- **Médio prazo:** Sentry para erros + Grafana Loki para logs estruturados
- **Longo prazo:** ELK Stack (Elasticsearch + Logstash + Kibana) para busca e correlação

## Regras

1. Proibido logar PII (CPF, email, senha) — usar `[REDACTED]`
2. Proibido logar tokens ou chaves de API
3. Toda operação CRUD deve ter `operation` e `duration`
4. `requestId` obrigatório para correlação entre serviços
5. Logs de desenvolvimento (`console.log`) proibidos em produção — verificar via lint

## Supabase Logs

Monitorar via painel Supabase > Logs para:
- Queries lentas (> 1s)
- Falhas de autenticação
- Erros de RLS
- Rate limiting ativado
