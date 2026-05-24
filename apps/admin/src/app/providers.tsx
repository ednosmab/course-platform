'use client';

import React, { useEffect } from 'react';
import { TamaguiProvider, config } from '@projeto/ui';
import { AdminI18nProvider } from '../providers/i18n-provider';
import { setSupabaseClient } from '@projeto/core';
import { createSupabaseBrowserClient } from '../lib/supabase-client';

/**
 * @description Injects the admin's SSR-compatible Supabase client into core services
 * so that storage, auth, and data layers share the same session (cookies + localStorage).
 * Must run once on mount, before any core service is called.
 */
function SupabaseClientInit() {
  useEffect(() => {
    setSupabaseClient(createSupabaseBrowserClient());
  }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TamaguiProvider config={config} defaultTheme="cloudWhite">
      <AdminI18nProvider>
        <SupabaseClientInit />
        {children}
      </AdminI18nProvider>
    </TamaguiProvider>
  );
}
