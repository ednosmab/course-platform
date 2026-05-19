# ADR-006: Renderização do Aluno via JSON Headless CMS

**Status:** Aceito  
**Data:** 2026-05-19  
**Autor:** Edson

---

## Decisão

> **O Student App (web + mobile) recebe exclusivamente JSON do Supabase e renderiza os blocos nativamente no dispositivo. O servidor nunca gera HTML para o aluno.**

---

## Contexto

O CMS armazena aulas como um array de blocos JSONB no PostgreSQL:

```json
{
  "blocks": [
    { "id": "uuid", "type": "text", "content": "...", "styles": {...}, "layout": {...} },
    { "id": "uuid", "type": "video", "url": "...", "provider": "youtube", "layout": {...} },
    { "id": "uuid", "type": "quiz", "question": "...", "options": [...], "layout": {...} }
  ]
}
```

Havia duas abordagens possíveis:

1. **Server-side rendering (SSR):** Servidor monta HTML final e envia pronto para o cliente
2. **Client-side rendering (CSR) com JSON:** Servidor envia JSON puro, cliente renderiza com componentes nativos

## Opção Rejeitada: SSR

- Aula renderizada no servidor = 50-200KB de HTML por requisição × 3k/10k usuários
- CDN cacheia mal HTML dinâmico (cada aula pode ter dados de progresso individuais)
- App mobile (Expo) não consome HTML — precisaria de WebView = performance péssima

## Opção Escolhida: JSON Headless

- JSON de aula = ~5-15KB por requisição
- Cacheável em CDN (Cloudflare, Vercel Edge) sem estado
- Offline-first: JSON é trivial de persistir localmente (AsyncStorage, IndexedDB)
- Processamento distribuído: cada dispositivo roda o renderizador, sem custo de CPU no servidor
- Mesmo componente renderizador serve web e mobile (basta o `packages/ui` ser cross-platform)

## Consequências

- `packages/core/src/services/course.ts` valida JSON com Zod e repassa ao cliente
- `packages/ui/src/blocks/` contém os renderizadores (TextBlock, VideoBlock, etc.) — reutilizados no preview do admin e no player do aluno
- Realtime subscriptions entregam JSON atualizado para sincronização de progresso
- Escalabilidade é resolvida com cache + CDN + otimizações de banco, nunca com SSR
