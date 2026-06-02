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
    setSupabaseClient(createSupabaseBrowserClient() as any);
  }, []);
  return null;
}

/**
 * Silencia o dev-mode warning do Tamagui que imprime
 * "Unexpected text node: . A text node cannot be a child of a <View>."
 *
 * O warning dispara quando o dev-mode do `@tamagui/web` encontra uma
 * string (qualquer texto JSX entre children) como filho directo de
 * um componente Tamagui nao-Text (YStack, XStack, etc.). E um check
 * de validacao em dev - nao bloqueia funcionalidade - mas polui o
 * console com falsos positivos originados por whitespace em JSX
 * (comentarios multiline, expressoes condicionais com string literals).
 *
 * A solucao arquitectural correcta e wrappear children com o helper
 * `ViewChildren` (ver `BlockSettings.tsx`). Este filtro e uma rede
 * de seguranca adicional enquanto essa migracao decorre.
 *
 * Ver tambem: `docs/sdr/SDR-001-certificate-editor-isolation.md` e
 * os 8 block branches com ViewChildren em BlockSettings.tsx.
 */
function installTamaguiDevWarningFilter() {
  if (process.env.NODE_ENV === 'production') return;
  if (typeof window === 'undefined') return;
  const original = console.error;
  // @ts-expect-error - property may already exist in some envs
  if (window.__tamaguiDevWarningFilterInstalled) return;
  // @ts-expect-error - intentional flag
  window.__tamaguiDevWarningFilterInstalled = true;
  console.error = (...args: unknown[]) => {
    const first = args[0];
    if (
      typeof first === 'string' &&
      first.includes('Unexpected text node') &&
      first.includes('A text node cannot be a child of a')
    ) {
      return;
    }
    original.apply(console, args);
  };
}

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    installTamaguiDevWarningFilter();
  }, []);

  return (
    <TamaguiProvider config={config} defaultTheme="cloudWhite">
      <AdminI18nProvider>
        <SupabaseClientInit />
        {children}
      </AdminI18nProvider>
    </TamaguiProvider>
  );
}
