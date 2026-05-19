import React from 'react';
import type { GlobalProvider } from '@ladle/react';
import { TamaguiProvider, config } from '../src';

export const Provider: GlobalProvider = ({ children }) => (
  <TamaguiProvider config={config} defaultTheme={null}>
    {children}
  </TamaguiProvider>
);
