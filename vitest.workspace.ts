import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    test: {
      name: 'core',
      root: './packages/core',
      environment: 'node',
      include: ['src/**/*.test.{ts,tsx}'],
      globals: true,
    },
  },
  {
    test: {
      name: 'ui',
      root: './packages/ui',
      environment: 'jsdom',
      include: ['src/**/*.test.{ts,tsx}'],
      globals: true,
      setupFiles: [],
    },
  },
]);
