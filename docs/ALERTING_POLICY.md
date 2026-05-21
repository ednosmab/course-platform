# Política de Alertas

## Métricas Críticas Monitoradas

| Métrica | Limiar | Severidade | Ação |
|---------|--------|-----------|------|
| P95 response time | > 500ms | Warning | Investigar causa |
| P95 response time | > 1s | Critical | Página de plantão |
| Conexões DB ativas | > 80% pool | Warning | Escalar pool |
| Conexões DB ativas | > 95% pool | Critical | Página de plantão |
| Erros 5xx | > 1% das requests | Warning | Investigar |
| Erros 5xx | > 5% das requests | Critical | Página de plantão |
| Rate limit hits | > 1000/min | Warning | Verificar abuso |
| Rate limit hits | > 5000/min | Critical | Bloquear origem |
| Uptime | < 99.9% (móvel 30d) | Critical | Revisar infra |
| Disco DB | > 80% | Warning | Aumentar storage |
| Disco DB | > 90% | Critical | Ação imediata |
| Certificado SSL expirando | < 30 dias | Warning | Renovar |
| Certificado SSL | Expirado | Critical | Página de plantão |

## Canais de Notificação

| Severidade | Canal | Horário |
|-----------|-------|---------|
| Critical | SMS + Telegram/PagerDuty | 24/7 |
| Warning | Slack/E-mail | Horário comercial |
| Info | Dashboard | Apenas visual |

## Configuração Sugerida

### Sentry
- Erros >= 500: alerta crítico
- Erros 4xx: alerta informativo (rate limited a 1/hora)
- Erros de frontend: agrupados por tipo, alerta diário

### Supabase Logs
- Falhas de autenticação consecutivas (> 5/min): alerta warning
- Queries lentas (> 1s): log apenas
- RLS policy rejeitando acesso esperado: alerta crítico

### Health Check
- `/health` sem resposta > 10s: alerta crítico
- `/ready` retornando 503: alerta crítico
- `/metrics` mostrando memory > 80%: alerta warning

## Escalação

1. **Warning:** Time de engenharia notificado (Slack)
2. **Critical:** Tech Lead + DevOps notificados (SMS/Telegram)
3. **Sem resposta em 15 min:** Gerente de produto + suporte acionados
