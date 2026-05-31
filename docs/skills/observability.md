# 📊 SKILL: OBSERVABILITY & LOGGING

## 🎯 Objetivo
Implementar monitoramento completo da aplicação com logs estruturados, métricas e alertas para identificar problemas antes dos usuários.

---

## 📋 Quando Usar Esta Skill
- Adicionar logs em operações críticas
- Configurar métricas de performance
- Definir alertas para anomalias
- Rastrear erros em produção

---

## 🏗️ Pilar da Observabilidade

```
[Logs]     → O que aconteceu (eventos, erros)
[Metrics]  → Quanto/quando (numeros, tendências)
[Traces]   → Onde/por quê (caminho da requisição)
```

---

## 🛠️ Implementação

### 1. Logger Estruturado

```typescript
// packages/core/src/infrastructure/logger.ts

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  service: string;
  operation: string;
  message: string;
  duration?: number;
  error?: string;
  requestId?: string;
  tenantId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Logger estruturado para produção
 * Formato JSON para fácil parsing por ferramentas de observabilidade
 */
export class Logger {
  private service: string;

  constructor(service: string) {
    this.service = service;
  }

  private log(entry: Omit<LogEntry, 'timestamp'>): void {
    const fullEntry: LogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };

    // Em produção, enviar para serviço de logging
    // Por agora, console.log formatado
    console.log(JSON.stringify(fullEntry));
  }

  info(operation: string, message: string, metadata?: Record<string, unknown>): void {
    this.log({ level: 'info', service: this.service, operation, message, metadata });
  }

  warn(operation: string, message: string, metadata?: Record<string, unknown>): void {
    this.log({ level: 'warn', service: this.service, operation, message, metadata });
  }

  error(
    operation: string,
    message: string,
    error?: Error,
    metadata?: Record<string, unknown>
  ): void {
    this.log({
      level: 'error',
      service: this.service,
      operation,
      message,
      error: error?.stack ?? error?.message,
      metadata,
    });
  }

  /**
   * Log com duração (para medir performance)
   */
  withDuration<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    const start = Date.now();
    return fn()
      .then((result) => {
        this.info(operation, 'Completed', {
          ...metadata,
          duration: Date.now() - start,
        });
        return result;
      })
      .catch((error) => {
        this.error(operation, 'Failed', error, {
          ...metadata,
          duration: Date.now() - start,
        });
        throw error;
      });
  }
}

// Instâncias pré-configuradas
export const logger = {
  auth: new Logger('auth'),
  courses: new Logger('courses'),
  progress: new Logger('progress'),
  certificates: new Logger('certificates'),
  api: new Logger('api'),
};
```

### 2. Middleware de Request ID

```typescript
// packages/core/src/infrastructure/request-id.ts

/**
 * Gera ID único para cada requisição
 * Útil para correlacionar logs em requisições distribuídas
 */
export function generateRequestId(): string {
  return crypto.randomUUID();
}

/**
 * Middleware para adicionar request ID a todas as respostas
 */
export function withRequestId(handler: Function) {
  return async (request: Request, context?: unknown) => {
    const requestId = request.headers.get('x-request-id') ?? generateRequestId();

    // Adiciona requestId ao contexto
    const response = await handler(request, { ...context, requestId });

    // Adiciona header na resposta
    response.headers.set('x-request-id', requestId);

    return response;
  };
}
```

### 3. Métricas de Performance

```typescript
// packages/core/src/infrastructure/metrics.ts

interface MetricEntry {
  name: string;
  value: number;
  tags?: Record<string, string>;
  timestamp: number;
}

/**
 * Coletor de métricas simples
 * Em produção: usar Datadog, Prometheus, ou Vercel Analytics
 */
class MetricsCollector {
  private metrics: MetricEntry[] = [];

  /**
   * Registra uma métrica
   */
  record(name: string, value: number, tags?: Record<string, string>): void {
    this.metrics.push({
      name,
      value,
      tags,
      timestamp: Date.now(),
    });

    // Em produção, enviar periodicamente para serviço de métricas
    if (this.metrics.length >= 100) {
      this.flush();
    }
  }

  /**
   * Registra duração de uma operação
   */
  duration(name: string, startMs: number, tags?: Record<string, string>): void {
    const duration = Date.now() - startMs;
    this.record(name, duration, tags);

    // Alertar se lento
    if (duration > 500) {
      console.warn(`[Metrics] Slow operation: ${name} took ${duration}ms`);
    }
  }

  /**
   * Envia métricas acumuladas
   */
  flush(): void {
    // Em produção: enviar para Datadog/Prometheus
    this.metrics = [];
  }
}

export const metrics = new MetricsCollector();

/**
 * Helper para medir duração
 */
export async function measureDuration<T>(
  name: string,
  fn: () => Promise<T>,
  tags?: Record<string, string>
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    metrics.duration(name, start, tags);
    return result;
  } catch (error) {
    metrics.duration(name, start, { ...tags, status: 'error' });
    throw error;
  }
}
```

### 4. Alertas Críticos

```typescript
// packages/core/src/infrastructure/alerts.ts

interface AlertConfig {
  webhookUrl: string; // Slack, Discord, ou outro webhook
}

const config: AlertConfig = {
  webhookUrl: process.env.ALERT_WEBHOOK_URL!,
};

/**
 * Enviar alerta para canal de notificação
 */
export async function sendAlert(
  level: 'warning' | 'critical',
  title: string,
  message: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const embed = {
    title: `[${level.toUpperCase()}] ${title}`,
    description: message,
    color: level === 'critical' ? 0xff0000 : 0xffaa00,
    fields: metadata
      ? Object.entries(metadata).map(([key, value]) => ({
          name: key,
          value: String(value),
          inline: true,
        }))
      : [],
    timestamp: new Date().toISOString(),
  };

  try {
    await fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    });
  } catch (error) {
    console.error('[Alerts] Failed to send alert:', error);
  }
}

/**
 * Alertas pré-definidos
 */
export const alerts = {
  highErrorRate: (rate: number) =>
    sendAlert('critical', 'High Error Rate', `${rate}% of requests failing`),

  slowResponse: (endpoint: string, duration: number) =>
    sendAlert('warning', 'Slow Response', `${endpoint} took ${duration}ms`),

  rateLimitExceeded: (ip: string, count: number) =>
    sendAlert('warning', 'Rate Limit Hit', `IP ${ip} hit rate limit ${count} times`),

  redisDown: () =>
    sendAlert('critical', 'Redis Down', 'Falling back to direct DB writes'),

  queueBacklog: (length: number) =>
    sendAlert('warning', 'Queue Backlog', `${length} items pending in queue`),
};
```

### 5. Uso nos Serviços

```typescript
// Exemplo de uso em um serviço
import { logger, measureDuration } from '../infrastructure/logger';
import { alerts } from '../infrastructure/alerts';

export async function syncProgress(userId: string, lessonId: string) {
  return measureDuration(
    'progress.sync',
    async () => {
      logger.progress.info('sync', 'Syncing progress', { userId, lessonId });

      try {
        // ... lógica de sincronização
        logger.progress.info('sync', 'Progress synced successfully', { userId, lessonId });
      } catch (error) {
        logger.progress.error('sync', 'Failed to sync progress', error as Error, {
          userId,
          lessonId,
        });
        throw error;
      }
    },
    { userId, lessonId }
  );
}
```

---

## 📊 Métricas Essenciais

| Métrica | Tipo | Alerta |
|---|---|---|
| `api.response_time` | Histogram | P95 > 500ms |
| `api.error_rate` | Counter | > 1% |
| `db.connections_active` | Gauge | > 80% do pool |
| `redis.hit_rate` | Gauge | < 80% |
| `queue.length` | Gauge | > 10.000 |
| `auth.login_attempts` | Counter | Anomalia |

---

## ⚠️ Regras de Ouro

1. **Logs em JSON** — sempre estruturados para facilitar parsing
2. **Request ID em todo lugar** — correlacionar logs de uma requisição
3. **Nunca logar senhas** — apenas metadados (email, userId)
4. **Alertar proativamente** — não esperar o usuário reportar
5. **Manter contexto** — sempre incluir tenantId, userId nos logs

---

## 📂 Onde Aplicar

- `packages/core/src/infrastructure/logger.ts`
- `packages/core/src/infrastructure/metrics.ts`
- `packages/core/src/infrastructure/alerts.ts`
- Todos os serviços e API routes

---

## 🔗 Documentos Relacionados

- `docs/skills/error_handling_observability.md` — Tratamento de erros
- `docs/layers/infra/observability.md` — Observabilidade completa
- `docs/roadmaps/scalability-plan.md` — Plano de escalabilidade
