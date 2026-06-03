/**
 * Dashboard route (/). Wraps the existing StudentDashboard screen and
 * converts its callback-style navigation into router.push calls.
 */

import React, { useEffect, useState } from 'react';
import { YStack, Spinner } from '@projeto/ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StudentDashboard } from '../../src/screens/StudentDashboard';
import { AuthService } from '@projeto/core';

export default function DashboardRoute() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const maybeRedirect = async () => {
      const session = await AuthService.getSession();
      if (!session) {
        router.replace('/login');
        return;
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
      <StudentDashboard
        onPlay={(courseId) => router.push(`/course/${courseId}/play`)}
        onNavigateToCourseLessons={(courseId) => router.push(`/course/${courseId}`)}
        onNavigateToCertificates={() => router.push('/certificates')}
        onLogout={() => router.replace('/login')}
      />
    </SafeAreaView>
  );
}
