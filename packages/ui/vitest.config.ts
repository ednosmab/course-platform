import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    environmentMatchGlobs: [
      ['src/utils/sanitize.test.ts', 'jsdom'],
      ['src/components/Certificate/**/*.test.tsx', 'jsdom'],
    ],
  },
});
