import { describe, it, expect } from 'vitest';
import { createRegistry } from './registry';

describe('BlockRegistry', () => {
  it('should register and retrieve a plugin', () => {
    const registry = createRegistry();
    registry.register({
      type: 'text',
      component: () => null,
      schema: {},
      icon: 'Text',
      label: 'Text Block',
      defaultProps: { content: '' },
    });

    const plugin = registry.get('text');
    expect(plugin).toBeDefined();
    expect(plugin?.type).toBe('text');
    expect(plugin?.label).toBe('Text Block');
  });

  it('should return undefined for unregistered type', () => {
    const registry = createRegistry();
    expect(registry.get('unknown')).toBeUndefined();
  });

  it('should return all registered plugins', () => {
    const registry = createRegistry();
    registry.register({
      type: 'text', component: () => null, schema: {}, icon: 'Text', label: 'Text', defaultProps: {},
    });
    registry.register({
      type: 'video', component: () => null, schema: {}, icon: 'Video', label: 'Video', defaultProps: {},
    });

    const all = registry.getAll();
    expect(all).toHaveLength(2);
  });
});
