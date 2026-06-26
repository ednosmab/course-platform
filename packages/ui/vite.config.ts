import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  define: {
    'process.env': JSON.stringify({}),
    'process.platform': JSON.stringify('web'),
    'process.version': JSON.stringify(''),
    __DEV__: JSON.stringify(true),
  },
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      'expo-av': resolve(__dirname, 'src/__mocks__/expo-av.tsx'),
    },
  },
});
