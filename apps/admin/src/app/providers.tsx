'use client';

import React from 'react';
import { TamaguiProvider, config } from '@projeto/ui';
import { I18nProvider } from '@projeto/core';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TamaguiProvider config={config} defaultTheme="light">
      <I18nProvider>
        {children}
      </I18nProvider>
    </TamaguiProvider>
  );
}
