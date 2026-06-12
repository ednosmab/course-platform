/**
 * Lesson player route (/course/[id]/play). Renders the actual lesson content
 * for the course whose ID is in the dynamic segment.
 */

import React from 'react';
import { YStack, Spinner } from '@projeto/ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LessonPlayer } from '../../../src/screens/LessonPlayer';

export default function LessonPlayerRoute() {
  const { id, lessonId } = useLocalSearchParams<{ id: string; lessonId?: string | string[] }>();
  const router = useRouter();
  const courseId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';
  const resolvedLessonId = typeof lessonId === 'string' ? lessonId : Array.isArray(lessonId) ? lessonId[0] : null;

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
      <LessonPlayer
        courseId={courseId}
        lessonId={resolvedLessonId}
        onBack={() => router.push(`/course/${courseId}`)}
      />
    </SafeAreaView>
  );
}
