'use client';

import React from 'react';
import { TamaguiProvider, config } from '@projeto/ui';
import { AdminI18nProvider } from '../providers/i18n-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TamaguiProvider config={config} defaultTheme="light">
      <AdminI18nProvider>
        {children}
      </AdminI18nProvider>
    </TamaguiProvider>
  );
}
