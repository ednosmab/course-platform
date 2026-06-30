import React, { useState, useEffect, useCallback } from 'react';
import { Platform, StatusBar } from 'react-native';
import { YStack, XStack, Text, Button, ScrollView, Spinner, Icon } from '@projeto/ui';
import { BlockRenderer } from '../components/BlockRenderer';
import { StudentHeader } from '../components/StudentHeader';
import { CourseService, LessonService, ProgressService, AuthService } from '@projeto/core';
import type { LocalProgressData } from '../services/progressOfflineStore';
import { offlineStore, syncService, contentCache } from '../services/registry';
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
      console.error('Failed to load course data from server, trying offline cache:', err);

      // OFFLINE FALLBACK: try loading from cached modules
      if (courseId) {
        try {
          const cachedModules = await contentCache.listCachedModules(courseId);
          if (cachedModules.length > 0) {
            const allLessons: any[] = [];
            for (const mod of cachedModules) {
              const cached = await contentCache.getCachedModule(mod.moduleId);
              if (cached?.lessons) {
                allLessons.push(...cached.lessons.map((l: any) => ({
                  ...l,
                  moduleTitle: mod.title,
                })));
              }
            }

            if (allLessons.length > 0) {
              setLessons(allLessons);
              if (allLessons.length > 0) {
                setActiveLessonId(allLessons[0].id);
              }
              setError(null);
              setLoading(false);
              return;
            }
          }
        } catch (cacheErr) {
          console.error('Offline cache also failed:', cacheErr);
        }
      }

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

  // Start auto-sync when userId is available (pushes pending progress every 30s)
  useEffect(() => {
    if (!userId) return;

    syncService.startAutoSync(
      () => userId,
      () => lessons.map(l => l.id),
    );

    return () => {
      syncService.stopAutoSync();
    };
  }, [userId, lessons]);

  const refreshActiveLesson = async () => {
    if (!activeLessonId) return;

    // Offline: skip server, go straight to cache
    if (!isOnline && courseId) {
      try {
        const cachedModules = await contentCache.listCachedModules(courseId);
        for (const mod of cachedModules) {
          const cached = await contentCache.getCachedModule(mod.moduleId);
          if (cached?.lessons) {
            const cachedLesson = cached.lessons.find((l: any) => l.id === activeLessonId) as any;
            if (cachedLesson) {
              setLessons(prev => prev.map(les =>
                les.id === activeLessonId
                  ? { ...les, blocks: cachedLesson.blocks || [] }
                  : les
              ));
              setError(null);
              return;
            }
          }
        }
      } catch (cacheErr) {
        console.error('Offline cache failed for lesson:', cacheErr);
      }
      return;
    }

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
      console.error('Failed to reload active lesson from server, trying offline cache:', err);

      if (courseId) {
        try {
          const cachedModules = await contentCache.listCachedModules(courseId);
          for (const mod of cachedModules) {
            const cached = await contentCache.getCachedModule(mod.moduleId);
            if (cached?.lessons) {
            const cachedLesson = cached.lessons.find((l: any) => l.id === activeLessonId) as any;
              if (cachedLesson) {
                setLessons(prev => prev.map(les => {
                  if (les.id === activeLessonId) {
                    return {
                      ...les,
                      blocks: cachedLesson.blocks || [],
                    };
                  }
                  return les;
                }));
                setError(null);
                return;
              }
            }
          }
        } catch (cacheErr) {
          console.error('Offline cache also failed for lesson:', cacheErr);
        }
      }

      setError(getErrorMessage(err));
    }
  };

  useEffect(() => {
    refreshActiveLesson();
  }, [activeLessonId, isOnline]);

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
    if (Platform.OS !== 'web') return;

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
    await offlineStore.saveProgressLocal(userId || '', activeLessonId, localData);

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

  // Restore saved progress on mount
  useEffect(() => {
    if (!activeLessonId || !userId) return;
    let cancelled = false;

    const restoreProgress = async () => {
      try {
        const local = await offlineStore.getProgressLocal(userId, activeLessonId);
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

      const position = videoPositions[activeLessonId] || 0;
      const lessonBlocks = activeLesson?.blocks || [];
      const videoBlock = lessonBlocks.find((b: any) => b.type === 'video');
      const duration = videoBlock?.duration || 1;
      const percentage = Math.min(100, Math.round((position / duration) * 100));

      // Always save to local SQLite first (works offline)
      const localData: LocalProgressData = {
        videoPosition: position,
        percentageWatched: 100,
        blockStates: blockStates[activeLessonId] || {},
        savedAt: new Date().toISOString(),
      };
      await offlineStore.saveProgressLocal(userId, activeLessonId, localData);

      // Try server (may fail offline — queued for sync)
      try {
        await ProgressService.markLessonComplete(userId, activeLessonId);
      } catch {
        // Server unavailable — lesson is saved locally, will sync later
      }

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
  const currentIndex = lessons.findIndex((l) => l.id === activeLessonId);

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

      <XStack px="$4" py="$3" bg="$background" borderTopWidth={1} borderTopColor="$border" gap="$3" ai="center">
        <YStack flex={1} gap="$1">
          <XStack ai="center" gap="$2">
            <Text fontSize={13} fontWeight="700" color="$text">
              {completedCount}/{lessons.length} aulas
            </Text>
            <YStack w={1} h={12} bg="$border" />
            <Text fontSize={13} fontWeight="600" color="$primary">
              {progressPercent}%
            </Text>
          </XStack>
          <YStack h={3} bg="$secondary" borderRadius={999} overflow="hidden">
            <YStack h={3} bg="$primary" borderRadius={999} w={`${progressPercent}%`} />
          </YStack>
        </YStack>

        <XStack ai="center" gap="$2">
          {currentIndex > 0 && (
            <Button
              variant="ghost"
              px="$3"
              py="$2"
              onPress={() => setActiveLessonId(lessons[currentIndex - 1].id)}
            >
              <Icon name="ChevronLeft" size={18} color="$text" />
            </Button>
          )}

          {activeLessonId && completions[activeLessonId] ? (
            <Button bg="$success" onPress={onBack}>
              <Text color="$white" fontWeight="600">Voltar</Text>
            </Button>
          ) : (
            <Button bg="$primary" onPress={handleCompleteLesson} disabled={completing} opacity={completing ? 0.7 : 1}>
              {completing ? (
                <Spinner size="small" color="$white" />
              ) : (
                <Text color="$white" fontWeight="600">Concluir</Text>
              )}
            </Button>
          )}

          {currentIndex >= 0 && currentIndex < lessons.length - 1 && (
            <Button
              variant="ghost"
              px="$3"
              py="$2"
              onPress={() => setActiveLessonId(lessons[currentIndex + 1].id)}
            >
              <Icon name="ChevronRight" size={18} color="$text" />
            </Button>
          )}
        </XStack>
      </XStack>
      </>
      )}

    </YStack>
  );
}
