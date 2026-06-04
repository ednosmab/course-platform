/**
 * Root layout for the student app (Expo Router).
 *
 * Wraps the entire app with TamaguiProvider, SafeAreaProvider and ErrorBoundary.
 * This is the equivalent of the previous App.tsx top-level providers, but
 * file-based routes underneath this layout control navigation.
 */

import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  TamaguiProvider,
  config,
  Theme,
  Spinner,
  YStack,
} from '@projeto/ui';
import { AuthService } from '@projeto/core';
import { ErrorBoundary } from '../src/components/ErrorBoundary';

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await AuthService.getSession();
      } catch {
        // ignore — auth state will be rechecked on protected screens
      }
      setReady(true);
    };
    init();
  }, []);

  if (!ready) {
    return (
      <SafeAreaProvider>
        <TamaguiProvider config={config} defaultTheme={null}>
          <YStack f={1} ai="center" jc="center">
            <Spinner size="large" color="$primary" />
          </YStack>
        </TamaguiProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <TamaguiProvider config={config} defaultTheme={null}>
        <Head>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap"
          />
        </Head>
        <Theme name="cloudWhite">
          <ErrorBoundary>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: 'transparent' },
              }}
            />
          </ErrorBoundary>
        </Theme>
      </TamaguiProvider>
    </SafeAreaProvider>
  );
}
