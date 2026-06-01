import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
    globals: true,
    environmentMatchGlobs: [
      ['src/utils/sanitize.test.ts', 'jsdom'],
    ],
  },
});
