# Health Check Endpoints

## Endpoints

### `/api/health` — Liveness

Verifica se o servidor está vivo e respondendo:

```typescript
// apps/admin/src/app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.APP_VERSION || 'dev',
  });
}
```

**Resposta esperada:** `200 OK` com JSON `{ status: 'ok', timestamp, uptime, version }`

### `/api/ready` — Readiness

Verifica se o servidor está pronto para receber tráfego (dependências disponíveis):

```typescript
export async function GET() {
  const checks = {
    database: await checkSupabaseConnection(),
    redis: await checkRedisConnection(), // se aplicável
    storage: await checkStorageConnection(),
  };
  const allOk = Object.values(checks).every(c => c.status === 'ok');
  return Response.json(
    { status: allOk ? 'ok' : 'degraded', checks },
    { status: allOk ? 200 : 503 }
  );
}
```

**Resposta esperada:** `200 OK` se tudo ok, `503 Service Unavailable` se alguma dependência falhar

### `/api/metrics` — Métricas Prometheus (futuro)

Endpoint para coleta de métricas no formato Prometheus:

```
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",path="/api/courses",status="200"} 1024

# HELP http_request_duration_seconds HTTP request duration
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.1"} 800
http_request_duration_seconds_bucket{le="0.5"} 950
http_request_duration_seconds_bucket{le="1.0"} 990
http_request_duration_seconds_bucket{le="+Inf"} 1024
```

## Uso

- Liveness probe (Kubernetes/Docker): `/api/health` a cada 30s
- Readiness probe (K8s/Docker): `/api/ready` a cada 60s
- Load balancer (target group): `/api/health` para determinar instâncias saudáveis
- Monitoring (Sentry/DataDog): `/api/metrics` a cada 15s

## Implementação

Implementar nos apps:
- `apps/admin/src/app/api/health/route.ts`
- `apps/admin/src/app/api/ready/route.ts`
- (Student app não expõe API, pode usar health check do servidor WebSocket)
