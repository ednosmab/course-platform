/**
 * Student explore route (/explore). Shows all available courses for discovery.
 */

import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StudentExplore } from '../../src/screens/StudentExplore';

export default function StudentExploreRoute() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StudentExplore
        onSelectCourse={(courseId) => router.push(`/course/${courseId}`)}
        onBack={() => router.back()}
        onLogout={() => router.replace('/login')}
        onNavigateToDashboard={() => router.push('/')}
        onNavigateToCourses={() => router.push('/courses')}
        onNavigateToCertificates={() => router.push('/certificates')}
      />
    </SafeAreaView>
  );
}
