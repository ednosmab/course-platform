import React, { useState, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { YStack, XStack, Text, Button, ScrollView, Spinner, Icon } from '@projeto/ui';
import { useMobileProgress } from '../hooks/useMobileProgress';
import { BlockRenderer } from '../components/BlockRenderer';
import { CourseService, LessonService } from '@projeto/core';

type LessonPlayerProps = {
  courseId?: string | null;
  lessonId?: string | null;
  onBack: () => void;
};

export function LessonPlayer({ courseId, lessonId, onBack }: LessonPlayerProps) {
  const { saveProgressMobile } = useMobileProgress();
  const [lessons, setLessons] = useState<any[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(lessonId ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [completions, setCompletions] = useState<Record<string, boolean>>({});
  const [videoPositions, setVideoPositions] = useState<Record<string, number>>({});

  const getErrorMessage = (err: any): string => {
    if (!err) return 'Erro desconhecido';
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message;
    if (typeof err === 'object') {
      const parts = [];
      if (err.message) parts.push(err.message);
      if (err.details) parts.push(err.details);
      if (err.hint) parts.push(`Dica: ${err.hint}`);
      if (err.code) parts.push(`Código: ${err.code}`);
      if (parts.length > 0) return parts.join(' | ');
      return JSON.stringify(err);
    }
    return String(err);
  };

  const loadCourseData = async () => {
    try {
      setLoading(true);
      setError(null);

      let targetCourseId = courseId;

      if (!targetCourseId) {
        const coursesData = await CourseService.getPublishedCourses();

        if (!coursesData || coursesData.length === 0) {
          throw new Error('No courses found. Create and publish a course in the CMS panel first.');
        }

        targetCourseId = coursesData[0].id;
      }

      const struct = await CourseService.getCourseStructure(targetCourseId);
      const allLessons = struct.modules.flatMap(mod => mod.lessons);
      setLessons(allLessons);
      if (allLessons.length > 0) {
        setActiveLessonId(allLessons[0].id);
      }
    } catch (err) {
      console.error('Failed to load course data:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourseData();
  }, []);

  const refreshActiveLesson = async () => {
    if (!activeLessonId) return;
    try {
      setError(null);

      const lesson = await LessonService.getLesson(activeLessonId);

      if (lesson) {
        setLessons(prev => prev.map(les => {
          if (les.id === activeLessonId) {
            return {
              ...les,
              blocks: lesson.blocks || [],
            };
          }
          return les;
        }));
      }
    } catch (err) {
      console.error('Failed to reload active lesson blocks:', err);
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => {
    refreshActiveLesson();
  }, [activeLessonId]);

  // Polling: checa version (1 int) a cada 30s
  useEffect(() => {
    if (!activeLessonId) return;
    let knownVersion: number | null = null;
    const interval = setInterval(async () => {
      try {
        const version = await LessonService.getLessonVersion(activeLessonId);
        if (version === null) return;
        if (knownVersion !== null && version === knownVersion) return;
        knownVersion = version;

        const blocks = await LessonService.getLessonBlocks(activeLessonId);
        if (blocks.length > 0) {
          setLessons((prev) =>
            prev.map((les) =>
              les.id === activeLessonId
                ? { ...les, blocks }
                : les,
            ),
          );
        }
      } catch {
        // silencioso
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [activeLessonId]);

  // Refresh ao focar a aba
  useEffect(() => {
    if (!activeLessonId) return;
    const onFocus = async () => {
      const lesson = await LessonService.getLesson(activeLessonId);
      if (!lesson?.blocks) return;
      setLessons((prev) =>
        prev.map((les) =>
          les.id === activeLessonId
            ? { ...les, blocks: lesson.blocks, title: lesson.title || les.title }
            : les,
        ),
      );
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [activeLessonId]);

  const activeLesson = lessons.find((l) => l.id === activeLessonId) || lessons[0];

  const handleVideoProgress = async (progressSec: number, durationSec: number) => {
    if (!activeLessonId) return;

    setVideoPositions((prev) => ({
      ...prev,
      [activeLessonId]: progressSec,
    }));

    await saveProgressMobile(activeLessonId, progressSec, durationSec);

    const percent = progressSec / durationSec;
    if (percent >= 0.85 && !completions[activeLessonId]) {
      setCompletions((prev) => ({
        ...prev,
        [activeLessonId]: true,
      }));
    }
  };

  if (error) {
    return (
      <YStack flex={1} jc="center" ai="center" p="$6" bg="$background">
        <StatusBar barStyle="light-content" />
        <Icon name="AlertCircle" size={48} color="$danger" />
        <Text color="$danger" fontSize={16} fontWeight="700" mt="$4" textAlign="center">
          Erro ao Conectar ao Supabase
        </Text>
        <Text color="$textMuted" fontSize={12} mt="$2" textAlign="center" lineHeight={18}>
          {error}
        </Text>
        <Button variant="secondary" mt="$6" onPress={loadCourseData}>
          Tentar Novamente
        </Button>
      </YStack>
    );
  }

  if (loading || !activeLesson) {
    return (
      <YStack flex={1} jc="center" ai="center" bg="$background">
        <StatusBar barStyle="light-content" />
        <Spinner size="large" color="$primary" />
        <Text color="$textMuted" mt="$4" fontSize={13} fontWeight="600">
          Carregando plataforma de alunos real...
        </Text>
      </YStack>
    );
  }

  const completedCount = Object.values(completions).filter(Boolean).length;
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <YStack flex={1} bg="$background">
      <StatusBar barStyle="dark-content" />

      <XStack
        ai="center"
        jc="space-between"
        py="$2"
        px="$4"
        borderBottomWidth={1}
        bg="$background"
        borderBottomColor="$border"
      >
        <XStack ai="center" gap="$2">
          <Button variant="ghost" px="$2" py="$2" onPress={onBack}>
            <Icon name="ChevronLeft" size={20} color="$text" />
          </Button>
        </XStack>
      </XStack>

      <ScrollView flex={1} contentContainerStyle={{ paddingBottom: 40 }}>
        <BlockRenderer
          blocks={activeLesson.blocks || []}
          onVideoProgress={handleVideoProgress}
          savedPosition={videoPositions[activeLessonId || ''] || 0}
        />
      </ScrollView>
    </YStack>
  );
}
