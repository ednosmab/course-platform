/**
 * Certificates route (/certificates). Wraps the existing Certificates screen.
 */

import React from 'react';
import { SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Certificates } from '../../src/screens/Certificates';

export default function CertificatesRoute() {
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Certificates
        onNavigateToDashboard={() => router.push('/')}
        onNavigateToCourses={() => router.push('/courses')}
        onNavigateToExplore={() => router.push('/explore')}
        onLogout={() => router.replace('/login')}
      />
    </SafeAreaView>
  );
}
