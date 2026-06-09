/**
 * Student courses route (/courses). Shows all enrolled courses with filtering and sorting.
 */

import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StudentCourses } from '../../src/screens/StudentCourses';

export default function StudentCoursesRoute() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StudentCourses
        onSelectCourse={(courseId) => router.push(`/course/${courseId}`)}
        onBack={() => router.back()}
        onLogout={() => router.replace('/login')}
        onNavigateToDashboard={() => router.push('/')}
        onNavigateToCertificates={() => router.push('/certificates')}
      />
    </SafeAreaView>
  );
}