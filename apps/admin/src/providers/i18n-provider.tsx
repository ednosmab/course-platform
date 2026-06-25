'use client';

import React from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@projeto/core/i18n';

export function AdminI18nProvider({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}
