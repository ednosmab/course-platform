/**
 * Course lessons route (/course/[id]). Renders the module/lesson list for
 * the course whose ID is in the dynamic segment.
 */

import React, { useEffect, useState } from 'react';
import { YStack, Spinner } from '@projeto/ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CourseLessons } from '../../../src/screens/CourseLessons';

export default function CourseLessonsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const courseId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';

  if (!courseId) {
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
      <CourseLessons
        courseId={courseId}
        onSelectLesson={(lessonId) => router.push(`/course/${courseId}/play?lessonId=${lessonId}`)}
        onBack={() => router.back()}
        onViewCertificate={() => router.push('/certificates')}
      />
    </SafeAreaView>
  );
}
