/**
 * Login route (/login). Wraps the existing StudentLogin screen and converts
 * its callback-style navigation into router.push.
 */

import React, { useEffect, useState } from 'react';
import { YStack, Spinner } from '@projeto/ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StudentLogin } from '../../src/screens/StudentLogin';
import { AuthService } from '@projeto/core';

export default function LoginRoute() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const maybeRedirect = async () => {
      const session = await AuthService.getSession();
      if (session) {
        router.replace('/');
      }
      setChecking(false);
    };
    maybeRedirect();
  }, [router]);

  if (checking) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <YStack f={1} ai="center" jc="center">
          <Spinner size="large" color="$primary" />
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StudentLogin onLoginSuccess={() => router.replace('/')} />
    </SafeAreaView>
  );
}
