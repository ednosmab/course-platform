import type { ReactElement } from 'react';

export interface BlockPlugin {
  type: string;
  component: React.ComponentType<any>;
  schema: any;
  icon: string;
  label: string;
  defaultProps: Record<string, unknown>;
}

export interface BlockRegistry {
  plugins: Record<string, BlockPlugin>;
  register(plugin: BlockPlugin): void;
  get(type: string): BlockPlugin | undefined;
  getAll(): BlockPlugin[];
}

export function createRegistry(): BlockRegistry {
  const plugins: Record<string, BlockPlugin> = {};

  return {
    plugins,
    register(plugin: BlockPlugin) {
      plugins[plugin.type] = plugin;
    },
    get(type: string) {
      return plugins[type];
    },
    getAll() {
      return Object.values(plugins);
    },
  };
}
