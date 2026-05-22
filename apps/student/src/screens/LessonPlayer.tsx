import React, { useState, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { YStack, XStack, Text, Button, ScrollView, Spinner, Icon } from '@projeto/ui';
import { useMobileProgress } from '../hooks/useMobileProgress';
import { BlockRenderer } from '../components/BlockRenderer';
import { AnyBlock } from '@projeto/types';
import { CourseService, supabase } from '@projeto/core';

type LessonPlayerProps = {
  courseId?: string | null;
  onBack: () => void;
};

export function LessonPlayer({ courseId, onBack }: LessonPlayerProps) {
  const { isOffline, setIsOffline, pendingCount, saveProgressMobile, syncPending } = useMobileProgress();
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

      if (courseId) {
        const struct = await CourseService.getCourseStructure(courseId);
        setCourse(struct.course);
        const allLessons = struct.modules.flatMap(mod => mod.lessons);
        setLessons(allLessons);
        if (allLessons.length > 0) {
          setActiveLessonId(allLessons[0].id);
        }
      } else {
        const { data: coursesCheck, error: checkErr } = await supabase
          .from('courses')
          .select('*');

        if (checkErr) throw checkErr;

        if (!coursesCheck || coursesCheck.length === 0) {
          throw new Error('Nenhum curso cadastrado no banco de dados. Crie e publique um curso no painel do CMS para começar!');
        }

        const activeCourse = coursesCheck[0];
        const struct = await CourseService.getCourseStructure(activeCourse.id);
        setCourse(struct.course);

        const allLessons = struct.modules.flatMap(mod => mod.lessons);
        setLessons(allLessons);

        if (allLessons.length > 0) {
          setActiveLessonId(allLessons[0].id);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar dados do curso de forma dinâmica:', err);
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
      setRefreshing(true);
      setError(null);
      const { data: lessonData, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', activeLessonId)
        .single();

      if (error) throw error;

      setLessons(prev => prev.map(les => {
        if (les.id === activeLessonId) {
          return {
            ...les,
            blocks: lessonData.blocks || []
          };
        }
        return les;
      }));
    } catch (err) {
      console.error('Erro ao recarregar blocos da aula ativa:', err);
      setError(getErrorMessage(err));
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    refreshActiveLesson();
  }, [activeLessonId]);

  useEffect(() => {
    if (!activeLessonId) return;

    const channel = supabase
      .channel(`lesson-realtime-${activeLessonId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lessons',
          filter: `id=eq.${activeLessonId}`,
        },
        (payload: any) => {
          if (payload.new && payload.new.blocks) {
            setLessons((prev) =>
              prev.map((les) => {
                if (les.id === activeLessonId) {
                  return {
                    ...les,
                    blocks: payload.new.blocks,
                    title: payload.new.title || les.title,
                  };
                }
                return les;
              })
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeLessonId]);

  // Polling: checa version (1 int) a cada 30s — só busca blocks se mudou
  useEffect(() => {
    if (!activeLessonId) return;
    let knownVersion: number | null = null;
    const interval = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from('lessons')
          .select('version')
          .eq('id', activeLessonId)
          .single();
        if (error) return;
        if (data && knownVersion !== null && data.version === knownVersion) return;
        knownVersion = data?.version ?? null;
        if (!data) return;
        // version mudou ou é a primeira checagem — busca blocks
        const { data: full } = await supabase
          .from('lessons')
          .select('blocks, title')
          .eq('id', activeLessonId)
          .single();
        if (full?.blocks) {
          setLessons((prev) =>
            prev.map((les) =>
              les.id === activeLessonId
                ? { ...les, blocks: full.blocks, title: full.title || les.title }
                : les
            )
          );
        }
      } catch {
        // silencioso
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [activeLessonId]);

  // Refresh ao focar a aba (usuário voltou do CMS)
  useEffect(() => {
    if (!activeLessonId) return;
    const onFocus = async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('blocks, title')
        .eq('id', activeLessonId)
        .single();
      if (error || !data?.blocks) return;
      setLessons((prev) =>
        prev.map((les) =>
          les.id === activeLessonId
            ? { ...les, blocks: data.blocks, title: data.title || les.title }
            : les
        )
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

  const handleManualComplete = () => {
    if (!activeLessonId) return;
    setCompletions((prev) => ({
      ...prev,
      [activeLessonId]: !prev[activeLessonId],
    }));
  };

  const toggleNetwork = async () => {
    const nextState = !isOffline;
    setIsOffline(nextState);
    if (!nextState) {
      await syncPending();
      await loadCourseData();
    }
  };

  if (error) {
    return (
      <YStack flex={1} jc="center" ai="center" p="$6" bg="$gray1">
        <StatusBar barStyle="light-content" />
        <Icon name="AlertCircle" size={48} color="#f43f5e" />
        <Text color="$danger" fontSize={16} fontWeight="700" mt="$4" textAlign="center">
          Erro ao Conectar ao Supabase
        </Text>
        <Text color="$gray4" fontSize={12} mt="$2" textAlign="center" lineHeight={18}>
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
      <YStack flex={1} jc="center" ai="center" bg="$gray1">
        <StatusBar barStyle="light-content" />
        <Spinner size="large" color="$primary" />
        <Text color="$gray4" mt="$4" fontSize={13} fontWeight="600">
          Carregando plataforma de alunos real...
        </Text>
      </YStack>
    );
  }

  const completedCount = Object.values(completions).filter(Boolean).length;
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <YStack flex={1} bg="$gray1">
      <StatusBar barStyle="dark-content" />

      <XStack
        ai="center"
        jc="space-between"
        py="$2"
        px="$4"
        borderBottomWidth={1}
        bg="$background"
        borderColor={isOffline ? '$danger' : '$success'}
      >
        <XStack ai="center" gap="$2">
          <Button variant="ghost" px="$2" py="$2" onPress={onBack}>
            <Icon name="ChevronLeft" size={20} color="$text" />
          </Button>
          {isOffline ? (
            <>
              <Icon name="WifiOff" size={14} color="#f43f5e" />
              <Text color="$gray3" fontSize={11} fontWeight="600">Modo Offline</Text>
            </>
          ) : (
            <>
              <Icon name="Wifi" size={14} color="#10b981" />
              <Text color="$gray3" fontSize={11} fontWeight="600">Modo Online Conectado</Text>
            </>
          )}
        </XStack>

        <XStack ai="center" gap="$2">
          <Button
            variant="ghost"
            disabled={refreshing}
            onPress={refreshActiveLesson}
            px="$2"
            py="$1"
          >
            {refreshing ? (
              <Spinner size="small" color="$primary" />
            ) : (
              <Icon name="RefreshCw" size={12} color="$primary" />
            )}
            <Text color="$primary" fontSize={9} fontWeight="700" ml="$1">Sincronizar CMS</Text>
          </Button>

          <Button variant="secondary" px="$2" py="$1" onPress={toggleNetwork}>
            <Text color="$gray3" fontSize={9} fontWeight="700">Alternar Rede</Text>
          </Button>
        </XStack>
      </XStack>

      <ScrollView flex={1} contentContainerStyle={{ padding: 16, gap: 20, paddingBottom: 40 }}>
        <YStack
          bg="$white"
          borderRadius="$6"
          borderWidth={1}
          borderColor="$gray2"
          p="$5"
          gap="$4"
        >
          <Text variant="h3" color="$gray9" mb="$2">{activeLesson.title}</Text>

          <BlockRenderer
            blocks={activeLesson.blocks || []}
            onVideoProgress={handleVideoProgress}
            savedPosition={videoPositions[activeLessonId || ''] || 0}
          />
        </YStack>
      </ScrollView>
    </YStack>
  );
}
