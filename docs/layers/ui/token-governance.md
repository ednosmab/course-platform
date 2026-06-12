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

- **É PROIBIDO** usar valores hardcoded (hex, px, em) em **props de componentes Tamagui** — use sempre `$token`.
- **EXCEÇÃO:** Em `<div style={{}}>` nativo (posicionamento absoluto, guides de alinhamento, `boxShadow`), tokens Tamagui não resolvem. Use hex explícito ou constantes nomeadas. Para demais casos, prefira `YStack`/`XStack` do Tamagui.
- **EXCEÇÃO — Print CSS (Certificados):** `@page { size: A4 landscape; }` e `@media print` não têm API em React/Tamagui. Um arquivo CSS minimalista (`CertificatePrint.css`) é permitido exclusivamente para certificados A4, contendo apenas `@page`, `@media print` e `print-color-adjust`. É a única exceção à proibição de CSS (D-03).
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

## Tokens da Paleta Cloud White

Os tokens Cloud White usam prefixo `cw` (ex: `cwBackground`, `cwPrimary`, `cwForeground`) e estão definidos em `colors.ts`. Foram convertidos de OKLCH para hex para compatibilidade cross-platform.

### Tema Cloud White

O tema `cloudWhite` está registrado em `tamagui.config.ts` e mapeia todos os tokens `cw*` para nomes semânticos (`$background`, `$primary`, `$foreground`, etc.).

**Fontes adicionais:**
- `$display` — Space Grotesk (display/headings alternativos)
- `$sans` — DM Sans (body alternativo)

**Sombras adicionais:** `cwSoft` e `cwPop` em `shadows.ts`.

### Padrão de Sombras (Shadow Policy)

**Decisão (2026-06-07):** O projeto **não usa sombras** em Cards e componentes de interface.

**Regra vinculante:**
- `Card` (componente base) **não deve ter sombra por padrão** — apenas `borderWidth: 1` e `borderColor: '$border'` para definir limites visuais.
- Sombras **só são permitidas** quando explicitamente activas via variante `elevated` do Card, e mesmo assim com valores sutis (`shadowOpacity <= 0.08`).
- É **PROIBIDO** espalhar `shadowPresets.*` directamente em `XStack`/`YStack`/`Card` fora do contexto de hover/press.

**Justificativa:** Sombras em background claro (tema do aluno) criam ruído visual e fogem do design flat/clean do admin. O admin usa sombras mínimas porque o background é escuro (tema `dark`); o student usa background claro onde sombras ficam pesadas.

**Exemplo correcto (Card sem sombra):**
```tsx
<Card p={0} overflow="hidden" br="$4">
  {/* conteúdo */}
</Card>
```

**Exemplo incorrecto (Card com sombra explícita):**
```tsx
<Card p={0} {...shadowPresets.cwSoft}>  {/* VIOLAÇÃO */}
  {/* conteúdo */}
</Card>
```

### Ativação

O tema ativo é `dark` (default). Para usar Cloud White em runtime:
```ts
import { useThemeName } from '@tamagui/core';
// ou via TamaguiProvider com theme="cloudWhite"
```
