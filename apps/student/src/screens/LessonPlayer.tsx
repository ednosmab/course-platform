import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'react-native';
import { YStack, XStack, Text, Button, ScrollView, Spinner, Icon, Toast } from '@projeto/ui';
import { BlockRenderer } from '../components/BlockRenderer';
import { StudentHeader } from '../components/StudentHeader';
import { CourseService, LessonService, ProgressService, AuthService } from '@projeto/core';
import {
  progressOfflineStore,
  type LocalProgressData,
} from '../services/progressOfflineStore';
import { syncService } from '../services/syncService';
import { useConnectionStatus } from '../hooks/useConnectionStatus';

type LessonPlayerProps = {
  courseId?: string | null;
  lessonId?: string | null;
  onBack: () => void;
  onLogout: () => void;
  onTabAction: (action: string) => void;
};

export function LessonPlayer({ courseId, lessonId, onBack, onLogout, onTabAction }: LessonPlayerProps) {
  const { isOnline } = useConnectionStatus();
  const [lessons, setLessons] = useState<any[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(lessonId ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [completions, setCompletions] = useState<Record<string, boolean>>({});
  const [videoPositions, setVideoPositions] = useState<Record<string, number>>({});
  const [blockStates, setBlockStates] = useState<Record<string, Record<string, any>>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [userProfile, setUserProfile] = useState<{ full_name: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    AuthService.getCurrentProfile().then((profile) => {
      setUserProfile(profile);
    }).catch(() => {});
  }, []);

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

      // Sync pending progress to server on mount
      if (userProfile?.id) {
        syncService.pushPendingProgress().catch(() => {});
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

  useEffect(() => {
    const loadUser = async () => {
      const session = await AuthService.getSession();
      if (session?.user?.id) {
        setUserId(session.user.id);
      }
    };
    loadUser();
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

    // Save to local SQLite store
    const localData: LocalProgressData = {
      videoPosition: progressSec,
      percentageWatched: Math.round((progressSec / durationSec) * 100),
      blockStates: blockStates[activeLessonId] || {},
      savedAt: new Date().toISOString(),
    };
    await progressOfflineStore.saveProgressLocal(userId || '', activeLessonId, localData);

    const percent = progressSec / durationSec;
    if (percent >= 0.85 && !completions[activeLessonId]) {
      setCompletions((prev) => ({
        ...prev,
        [activeLessonId]: true,
      }));
    }
  };

  const handleBlockStateChange = useCallback((blockId: string, state: any) => {
    if (!activeLessonId) return;
    setBlockStates((prev) => ({
      ...prev,
      [activeLessonId]: { ...(prev[activeLessonId] || {}), [blockId]: state },
    }));
  }, [activeLessonId]);

  const handleSaveProgress = useCallback(async () => {
    if (!activeLessonId || !userId) return;
    try {
      setSaving(true);
      const position = videoPositions[activeLessonId] || 0;
      const lessonBlocks = activeLesson?.blocks || [];
      const videoBlock = lessonBlocks.find((b: any) => b.type === 'video');
      const duration = videoBlock?.duration || 1;
      const percentage = Math.min(100, Math.round((position / duration) * 100));

      const localData: LocalProgressData = {
        videoPosition: position,
        percentageWatched: percentage,
        blockStates: blockStates[activeLessonId] || {},
        savedAt: new Date().toISOString(),
      };

      await progressOfflineStore.saveProgressLocal(userId, activeLessonId, localData);

      if (isOnline) {
        await ProgressService.saveLessonState(userId, activeLessonId, {
          lastPlayedSeconds: position,
          percentageWatched: percentage,
          blockStates: blockStates[activeLessonId] || {},
        });
      }
      setShowToast(true);
    } catch (err) {
      console.error('Failed to save progress:', err);
    } finally {
      setSaving(false);
    }
  }, [activeLessonId, userId, videoPositions, blockStates, activeLesson, isOnline]);

  // Restore saved progress on mount
  useEffect(() => {
    if (!activeLessonId || !userId) return;
    let cancelled = false;

    const restoreProgress = async () => {
      try {
        const local = await progressOfflineStore.getProgressLocal(userId, activeLessonId);
        if (cancelled) return;

        if (local) {
          setVideoPositions((prev) => ({ ...prev, [activeLessonId]: local.videoPosition }));
          setBlockStates((prev) => ({ ...prev, [activeLessonId]: local.blockStates }));
        }

        const server = await ProgressService.getLessonProgress(userId, activeLessonId);
        if (cancelled) return;

        if (server) {
          setVideoPositions((prev) => ({ ...prev, [activeLessonId]: server.last_played_seconds }));
          if (server.block_states) {
            setBlockStates((prev) => ({ ...prev, [activeLessonId]: server.block_states }));
          }
          if (server.completed) {
            setCompletions((prev) => ({ ...prev, [activeLessonId]: true }));
          }
        }
      } catch (err) {
        console.error('Failed to restore progress:', err);
      }
    };

    restoreProgress();
    return () => { cancelled = true; };
  }, [activeLessonId, userId]);

  const handleCompleteLesson = async () => {
    if (!activeLessonId || !userId || completing) return;

    try {
      setCompleting(true);
      await ProgressService.markLessonComplete(userId, activeLessonId);
      setCompletions((prev) => ({
        ...prev,
        [activeLessonId]: true,
      }));

      const currentIndex = lessons.findIndex((l) => l.id === activeLessonId);
      if (currentIndex < lessons.length - 1) {
        setActiveLessonId(lessons[currentIndex + 1].id);
      }
    } catch (err) {
      console.error('Failed to mark lesson as complete:', err);
    } finally {
      setCompleting(false);
    }
  };

  const completedCount = Object.values(completions).filter(Boolean).length;
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <YStack flex={1} bg="$background">
      <StudentHeader
        userProfile={userProfile}
        onLogout={onLogout}
        onTabAction={onTabAction}
        activeTab="courses"
      />

      {error ? (
        <YStack flex={1} jc="center" ai="center" p="$6">
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
      ) : loading || !activeLesson ? (
        <YStack flex={1} jc="center" ai="center">
          <StatusBar barStyle="light-content" />
          <Spinner size="large" color="$primary" />
          <Text color="$textMuted" mt="$4" fontSize={13} fontWeight="600">
            Carregando plataforma de alunos real...
          </Text>
        </YStack>
      ) : (
        <>
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
          savedStates={blockStates[activeLessonId || ''] || {}}
          onBlockStateChange={handleBlockStateChange}
        />
      </ScrollView>

      <XStack px="$4" py="$3" bg="$background" borderTopWidth={1} borderTopColor="$border" gap="$3">
        {!completions[activeLessonId] && (
          <Button
            flex={1}
            variant="secondary"
            onPress={handleSaveProgress}
            disabled={saving}
            opacity={saving ? 0.7 : 1}
          >
            {saving ? (
              <Spinner size="small" color="$text" />
            ) : (
              <>
                <Icon name="Save" size={16} color="$text" />
                <Text color="$text" fontWeight="600">Salvar</Text>
              </>
            )}
          </Button>
        )}

        {completions[activeLessonId] ? (
          <Button
            flex={1}
            bg="$success"
            onPress={onBack}
          >
            <Text color="$white" fontWeight="600">
              Voltar ao curso
            </Text>
          </Button>
        ) : (
          <Button
            flex={1}
            bg="$primary"
            onPress={handleCompleteLesson}
            disabled={completing}
            opacity={completing ? 0.7 : 1}
          >
            {completing ? (
              <Spinner size="small" color="$white" />
            ) : (
              <Text color="$white" fontWeight="600">
                Concluir aula
              </Text>
            )}
          </Button>
        )}
      </XStack>
      </>
      )}

      {showToast && (
        <Toast
          message="Progresso salvo"
          type="success"
          onDismiss={() => setShowToast(false)}
        />
      )}
    </YStack>
  );
}
