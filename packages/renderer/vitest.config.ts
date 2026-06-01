import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environmentMatchGlobs: [
      ['src/BlockRenderer.test.tsx', 'jsdom'],
    ],
    setupFiles: ['./src/test-setup.ts'],
  },
});
