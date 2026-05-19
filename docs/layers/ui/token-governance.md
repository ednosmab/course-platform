# Token Governance — Design System (DSv2)

## Regras de Nomenclatura

| Token | Padrão | Exemplo |
|---|---|---|
| Cor | `lowerCamelCase` | `primary`, `gray4`, `success` |
| Espaçamento | Número inteiro | `size.4` (16px), `space.-2` (-8px) |
| Tipografia | Escala numérica | `size.1` (12px heading), `size.3` (15px body) |
| Shadow | `lowerCamelCase` | `sm`, `md`, `lg` |
| Animação | `lowerCamelCase` | `fast`, `medium`, `slow` |

## Proibições

- **É PROIBIDO** usar valores hardcoded (hex, px, em) em componentes.
- **É PROIBIDO** criar tokens duplicados — sempre reutilizar os existentes.
- **É PROIBIDO** importar tokens fora de `packages/ui/src/tokens/`.
- **É PROIBIDO** modificar tokens sem atualizar `tamagui.config.ts`.

## Como Criar Novo Token

1. Identificar se o valor já existe em `packages/ui/src/tokens/`.
2. Se não existir, adicionar no arquivo temático correto (`colors.ts`, `spacing.ts`, etc).
3. Reexportar em `packages/ui/src/tokens/index.ts`.
4. Atualizar `tamagui.config.ts` se necessário.
5. Documentar o novo token neste arquivo.

## Estrutura de Arquivos

```
packages/ui/src/tokens/
  index.ts       — barrel export
  colors.ts      — paleta de cores
  spacing.ts     — size, space, radius, zIndex
  typography.ts  — heading & body fonts
  shadows.ts     — shadow presets
  animations.ts  — spring animation presets
```
