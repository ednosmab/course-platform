'use client';

import React from 'react';
import { TamaguiProvider, config } from '@projeto/ui';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TamaguiProvider config={config} defaultTheme="light">
      {children}
    </TamaguiProvider>
  );
}
