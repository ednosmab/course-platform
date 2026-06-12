import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      'expo-av': './src/__mocks__/expo-av.tsx',
    },
  },
});
