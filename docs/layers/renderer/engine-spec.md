# Render Engine Independente

## Registry de Componentes

```typescript
const blockRegistry = {
  text: TextBlock,
  video: VideoBlock,
  quiz: QuizBlock,
  image: ImageBlock,
  html: HtmlBlock,
  quote: QuoteBlock,
} as const;

type BlockType = keyof typeof blockRegistry;
```

Registro centralizado em `packages/ui/src/registry.ts`. Cada bloco registrado tem:
- `type` — identificador único (ex: `'video'`)
- `component` — React component a ser renderizado
- `schema` — Validação Zod dos props
- `defaultProps` — Valores padrão para novos blocos

## Dynamic Imports

Blocos renderizados via `React.lazy()` para code splitting:

```typescript
const VideoBlock = lazy(() => import('@projeto/ui/blocks/VideoBlock'));
const QuizBlock = lazy(() => import('@projeto/ui/blocks/QuizBlock'));
```

Cada bloco em chunk separado. Carregado sob demanda conforme o tipo do bloco no JSONB.

## Lazy Loading

- **Blocos abaixo da dobra:** Carregados via IntersectionObserver
- **Blocos de quiz:** Carregados apenas quando o aluno chega neles no scroll
- **Blocos de vídeo:** Player carregado, mas stream só inicia quando visível
- **Fallback:** `<Skeleton />` do Tamagui enquanto o bloco carrega

## Plugins

Interface para extensões futuras do CMS:

```typescript
interface BlockPlugin {
  type: string;
  component: React.ComponentType<BlockProps>;
  schema: z.ZodType<any>;
  icon: string;
  label: string;
}
```

Plugins registrados via `registerBlock(plugin)` no runtime. Permite marketplace de terceiros sem modificar o core.

## Marketplace Futuro

- Blocos instaláveis via pacotes npm (`@projeto/plugin-*`)
- Schema de validação enviado junto com o plugin
- Sandbox via iframe (web) ou WebView (mobile) para plugins não confiáveis
- API de hooks para estender comportamento (ex: `onSave`, `onRender`, `onInteraction`)
