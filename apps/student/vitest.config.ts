import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  assetsInclude: ['**/*.png'],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      'expo-av': path.resolve(__dirname, '__mocks__/expo-av.tsx'),
      'expo-modules-core': path.resolve(__dirname, '__mocks__/expo-modules-core.ts'),
    },
  },
  ssr: {
    noExternal: [
      '@projeto/ui',
      '@projeto/types',
      '@projeto/core',
      '@projeto/renderer',
    ],
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
});
