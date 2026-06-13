/**
 * Lesson player route (/course/[id]/play). Renders the actual lesson content
 * for the course whose ID is in the dynamic segment. Checks course access
 * (prerequisites, plan assignment) before rendering.
 */

import React from 'react';
import { YStack, Spinner, Text, Button, Icon } from '@projeto/ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LessonPlayer } from '../../../src/screens/LessonPlayer';
import { useCourseAccess } from '../../../src/hooks/useCourseAccess';

const accessReasonLabels: Record<string, string> = {
  prerequisite_not_completed: 'Complete o pré-requisito deste curso primeiro.',
  not_assigned_to_plan: 'Acesso restrito — requer atribuição de plano.',
  not_authenticated: 'Faça login para acessar este curso.',
  error: 'Não foi possível verificar o acesso ao curso.',
};

export default function LessonPlayerRoute() {
  const { id, lessonId } = useLocalSearchParams<{ id: string; lessonId?: string | string[] }>();
  const router = useRouter();
  const courseId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';
  const resolvedLessonId = typeof lessonId === 'string' ? lessonId : Array.isArray(lessonId) ? lessonId[0] : null;
  const { hasAccess, reason, loading } = useCourseAccess(courseId || null);

  if (!courseId || loading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <YStack f={1} ai="center" jc="center">
          <Spinner size="large" color="$primary" />
        </YStack>
      </SafeAreaView>
    );
  }

  if (!hasAccess) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <YStack f={1} ai="center" jc="center" p="$6" gap="$4">
          <Icon name="Lock" size={48} color="$textMuted" />
          <Text fontSize={18} fontWeight="700" textAlign="center">
            Acesso bloqueado
          </Text>
          <Text fontSize={14} color="$textMuted" textAlign="center" lineHeight={20}>
            {accessReasonLabels[reason] || 'Você não tem acesso a este curso.'}
          </Text>
          <Button variant="secondary" mt="$4" onPress={() => router.back()}>
            <Icon name="ArrowLeft" size={16} color="$text" />
            <Text ml="$2">Voltar</Text>
          </Button>
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
