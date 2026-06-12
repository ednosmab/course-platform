# Sincronização Offline

## Estratégia de Cache

- **AsyncStorage** (mobile) / **IndexedDB** (web) como cache local
- Chave `outbox_progress` armazena fila de ações pendentes
- Cache de leitura: catálogo de cursos e aulas disponíveis offline (TTL 30 min)

## Resolução de Conflitos

- **Last-write-wins:** O último progresso enviado sobrescreve o anterior
- Timestamp de cada ação registrado no momento do agendamento (`queued_at`)
- Servidor compara `queued_at` vs `last_sync_at` para resolver conflitos
- Conflitos raros (progresso é monotônico — só aumenta)

## Fila Offline

```
saveProgressMobile()
  ├── Online? --> ProgressService.saveProgressDebounced()
  ├── Offline? --> AsyncStorage.setItem('outbox_progress', [...queue, item])
  └── Erro?    --> Fallback offline (mesmo caminho do offline)

syncPending()
  ├── Lê outbox_progress do AsyncStorage
  ├── Para cada item: ProgressService.saveProgressImmediate(item)
  ├── Sucesso? --> Remove da fila
  └── Falha?   --> Backoff exponencial (1s, 2s, 4s..., max 30s, 5 tentativas)
```

## Optimistic Updates

- Progresso do aluno atualizado na UI **antes** da confirmação do servidor
- Se o sync falhar após 5 tentativas, o item permanece na fila (não perde dados)
- Indicador visual `pendingCount` mostra quantos itens aguardam sincronização
- Sync automático a cada 30s + manual via botão "Sincronizar"
