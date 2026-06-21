# Habilidade: Extensibilidade de Blocos

> Como criar novos tipos de blocos interactivos que se integram com o sistema de save-progress.

## Visão Geral

O sistema de save-progress utiliza um padrão auto-declarativo de esquema: os blocos declaram `interactive: true` e `stateSchema` no seu esquema Zod, e o renderer descobre e conecta automaticamente.

## Criando um Novo Bloco Interactivo

### Passo 1: Definir o Esquema do Bloco

Em `packages/types/src/<block>.ts`, adicione `interactive` e `stateSchema` ao esquema Zod:

```ts
import { z } from 'zod';

const MyBlockSchema = z.object({
  type: z.literal('my_block'),
  id: z.string().uuid(),
  content: z.string(),
  interactive: z.literal(true).optional(),
  stateSchema: z.object({
    userAnswer: z.string().optional(),
    submitted: z.boolean().optional(),
  }).optional(),
});
```

### Passo 2: Exportar o Tipo de Estado

```ts
export type MyBlockState = z.infer<typeof MyBlockSchema>['stateSchema'];
```

### Passo 3: Criar o Componente UI

Em `packages/ui/src/blocks/MyBlock.tsx`, implemente `InteractiveBlockProps<TState>`:

```tsx
import React from 'react';
import { YStack, Text } from 'tamagui';
import type { InteractiveBlockProps } from '@projeto/types';

type MyBlockState = { userAnswer?: string; submitted?: boolean };

export function MyBlockRenderer({ block, defaultState, onStateChange }: InteractiveBlockProps<MyBlockState>) {
  const [state, setState] = React.useState<MyBlockState>(defaultState ?? {});

  const handleChange = (value: string) => {
    const next = { ...state, userAnswer: value };
    setState(next);
    onStateChange?.(block.id, next);
  };

  return (
    <YStack p="$4" gap="$3">
      <Text fontWeight="600">{block.content}</Text>
      {/* Seu UI interactiva aqui */}
    </YStack>
  );
}
```

### Passo 4: Exportar do Pacote UI

Em `packages/ui/src/index.ts`:
```ts
export * from './blocks/MyBlock';
```

### Passo 5: Registrar no SharedBlockRenderer

Em `packages/renderer/src/BlockRenderer.tsx`, adicione o import e o branch de renderização:

```tsx
import { MyBlockRenderer } from '@projeto/ui';

// Dentro da função BlockRenderer:
if (block.type === 'my_block') {
  return (
    <MyBlockRenderer
      block={block}
      defaultState={savedStates[block.id] ?? null}
      onStateChange={onBlockStateChange}
    />
  );
}
```

### Passo 6: Verificar que o Save Funciona

O sistema de save-progress salva automaticamente:
- `block_states[blockId]` no SQLite + Supabase
- Restaura `defaultState` a partir de `savedStates[blockId]` ao montar
- Nenhuma ligação adicional necessária

## Interfaces Principais

### InteractiveBlockProps<TState>

```ts
interface InteractiveBlockProps<TState> {
  block: { id: string; type: string; [key: string]: any };
  defaultState: TState | null;
  onStateChange?: (blockId: string, state: TState) => void;
}
```

### LocalProgressData

```ts
interface LocalProgressData {
  videoPosition: number;
  percentageWatched: number;
  blockStates: Record<string, any>;
  savedAt: string;
}
```

## Checklist de Validação

- [ ] Esquema tem `interactive: z.literal(true).optional()`
- [ ] Esquema tem `stateSchema` com tipos Zod
- [ ] Componente implementa `InteractiveBlockProps<TState>`
- [ ] Componente chama `onStateChange` na interacção do utilizador
- [ ] Bloco exportado de `packages/ui/src/index.ts`
- [ ] Bloco registado no `SharedBlockRenderer`
- [ ] `pnpm run verify:ui` passa
