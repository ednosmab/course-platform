# Versionamento JSONB

## Runtime Migration

Blocos armazenados como JSONB na coluna `blocks` da tabela `lessons`. Cada bloco tem um campo `version`:

```typescript
type Block = {
  id: string;
  type: string;
  version: number;
  props: Record<string, unknown>;
};
```

Ao carregar um bloco com `version` anterior à atual do schema, uma migração runtime é aplicada:

```typescript
function migrateBlock(block: Block): Block {
  const migrations = {
    1: (b: Block) => ({ ...b, props: { ...b.props, align: 'left' } }),
    2: (b: Block) => ({ ...b, props: { ...b.props, spacing: 16 } }),
  };
  let migrated = block;
  for (let v = block.version; v < CURRENT_VERSION; v++) {
    migrated = migrations[v](migrated);
  }
  return migrated;
}
```

## Schemas .strict()

Todo schema Zod de bloco usa `.strict()` para rejeitar props desconhecidas:

```typescript
const VideoBlockSchema = z.object({
  url: z.string().url(),
  autoplay: z.boolean().default(false),
  aspectRatio: z.number().default(16/9),
}).strict();
```

Props extras salvas no JSONB são ignoradas silenciosamente (não quebram renderização).

## Compatibilidade entre versões

- Blocos antigos **sempre** renderizam — migração é aplicada em tempo de leitura
- Blocos novos podem ter props que blocos antigos não conhecem (ignoradas)
- Toda mudança de schema incrementa `version` e adiciona entry em `migrations`
- Remoção de props: nunca removida do schema — apenas marcada como deprecated com `z.never()`

## Source of Truth via Zod

- **Zod é a única fonte da verdade** para estrutura de blocos
- Check constraints SQL complementam (ex: `blocks IS JSON`) mas não duplicam validação
- Schemas em `packages/types/src/blocks/` são os canônicos
- Apps e core importam os mesmos schemas — sem drift entre camadas
