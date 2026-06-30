/**
 * Root layout for the student app (Expo Router).
 *
 * Wraps the entire app with TamaguiProvider, SafeAreaProvider and ErrorBoundary.
 * This is the equivalent of the previous App.tsx top-level providers, but
 * file-based routes underneath this layout control navigation.
 */

import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
  Montserrat_900Black,
} from '@expo-google-fonts/montserrat';
import {
  TamaguiProvider,
  config,
  Theme,
  Spinner,
  YStack,
} from '@projeto/ui';
import { AuthService } from '@projeto/core';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { initOfflineServices } from '../src/services/registry';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Montserrat_900Black,
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (typeof window === 'undefined' || !(window as any).__E2E_BYPASS_AUTH__) {
        try {
          await AuthService.getSession();
        } catch {
          // ignore — auth state will be rechecked on protected screens
        }
      }
      await initOfflineServices();
      setReady(true);
    };
    init();
  }, []);

  if (!ready || !fontsLoaded) {
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
