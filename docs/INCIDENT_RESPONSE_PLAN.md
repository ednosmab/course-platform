# Plano de Resposta a Incidentes (IRP)

## Níveis de Severidade

| Nível | Definição | SLA resposta | Exemplos |
|-------|-----------|-------------|----------|
| **SEV-0** | Indisponibilidade total da plataforma | 15 min | Queda DB, crash do Next.js, vazamento de dados |
| **SEV-1** | Funcionalidade crítica degradada | 30 min | Login quebrado, player de vídeo falhando, perda de progresso |
| **SEV-2** | Funcionalidade não crítica afetada | 2h | Erro em relatório, bug visual no canvas admin |
| **SEV-3** | Problema cosmético / baixo impacto | 24h | Typo, cor incorreta em botão, link quebrado |

## Fluxo de Resposta

```
Detection (alerta / usuário reporta)
  → Triage (classificar severidade)
    → SEV-0/1:
      → Notificar equipe (canal dedicado)
      → Aplicar hotfix ou rollback
      → Post-mortem em 48h
    → SEV-2:
      → Criar issue no repositório
      → Agendar para próximo sprint
    → SEV-3:
      → Criar issue no repositório
      → Agendar para backlog
```

## Contatos

| Função | Responsável | Canal |
|--------|-------------|-------|
| Tech Lead | A definir | [placeholder] |
| DevOps | A definir | [placeholder] |
| Suporte | A definir | [placeholder] |

## Procedimentos Específicos

### Vazamento de Dados (SEV-0)
1. Isolar serviço afetado (desabilitar acesso externo)
2. Rotacionar chaves e tokens expostos
3. Notificar usuários afetados em até 72h (LGPD art. 48)
4. Registrar cronologia detalhada para ANPD
5. Conduzir análise de causa raiz

### Indisponibilidade (SEV-0)
1. Verificar status do Supabase (status.supabase.com)
2. Verificar logs de deploy recente
3. Aplicar rollback para última versão estável
4. Restaurar backup se necessário
5. Verificar health checks antes de reabrir

### Ataque em Andamento
1. Bloquear IP/origem no WAF
2. Ativar rate limiting mais restritivo
3. Revisar logs de autenticação
4. Se confirmado, seguir procedimento de vazamento

## Post-Mortem

Template obrigatório após incidente SEV-0/1:
- **Resumo:** O que aconteceu
- **Cronologia:** Timestamps de cada ação
- **Causa Raiz:** Por que aconteceu
- **Impacto:** Usuários afetados, dados perdidos, duração
- **Ações Corretivas:** O que será feito para evitar recorrência
- **Responsável:** Quem está cuidando de cada ação
