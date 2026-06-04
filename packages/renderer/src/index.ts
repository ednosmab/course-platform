import type { BlockPlugin } from './registry';

export { createRegistry, type BlockPlugin, type BlockRegistry } from './registry';

export function createRenderer(registry: Record<string, BlockPlugin>) {
  return {
    render(blockType: string, props: Record<string, unknown>) {
      const plugin = registry[blockType];
      if (!plugin) return null;
      return { component: plugin.component, props };
    },
  };
}

export { BlockRenderer, FONT_DESKTOP, FONT_MOBILE } from './BlockRenderer';
export type { BlockRendererProps } from './BlockRenderer';
