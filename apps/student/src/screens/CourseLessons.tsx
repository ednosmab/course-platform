import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, XStack, YStack, Text, Button, Card, Icon, Spinner, Input } from '@projeto/ui';
import { CourseService, ProgressService, AuthService } from '@projeto/core';
import type { Course, Module, Lesson } from '@projeto/types';
import { StudentHeader } from '../components/StudentHeader';
import {
  progressOfflineStore,
  type LocalProgressData,
} from '../services/progressOfflineStore';

import { contentCacheService } from '../services/contentCacheService';
import { Platform } from 'react-native';

type CourseLessonsProps = {
  courseId: string;
  onSelectLesson: (lessonId: string) => void;
  onBack: () => void;
  onViewCertificate?: () => void;
  onLogout: () => void;
  onTabAction: (action: string) => void;
};

type LessonStatus = 'done' | 'current' | 'todo' | 'locked';

interface LessonWithStatus extends Lesson {
  status: LessonStatus;
  moduleTitle: string;
  duration?: string;
  type?: 'video' | 'leitura' | 'audio';
  percentageWatched?: number;
}

interface ModuleWithLessons extends Module {
  lessons: LessonWithStatus[];
  summary?: string;
}

const statusConfig = {
  done: { icon: 'CheckCircle2' as const, color: '$success', bg: '$success' + '15' },
  current: { icon: 'Play' as const, color: '$primary', bg: '$primary' + '10' },
  todo: { icon: 'Circle' as const, color: '$textMuted', bg: 'transparent' },
  locked: { icon: 'Lock' as const, color: '$textMuted', bg: 'transparent' },
};

const typeConfig = {
  video: { icon: 'Play' as const, label: 'Vídeo', color: '$primary' },
  leitura: { icon: 'FileText' as const, label: 'Leitura', color: '$textMuted' },
  audio: { icon: 'Headphones' as const, label: 'Áudio', color: '$textMuted' },
};

export function CourseLessons({ courseId, onSelectLesson, onBack, onViewCertificate, onLogout, onTabAction }: CourseLessonsProps) {
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<ModuleWithLessons[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [userProfile, setUserProfile] = useState<{ full_name: string } | null>(null);

  const [downloadingModules, setDownloadingModules] = useState<Record<string, boolean>>({});
  const [cachedModules, setCachedModules] = useState<Record<string, boolean>>({});
  const scrollViewRef = useRef<ScrollView>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const profile = await AuthService.getCurrentProfile();
      setUserProfile(profile);

      const structure = await CourseService.getCourseStructure(courseId);
      setCourse(structure.course);

      const lessonIds = structure.modules.flatMap(mod => mod.lessons.map(l => l.id));
      const progressData = await ProgressService.getProgressByLessons(profile?.id || '', lessonIds);

      const modulesWithStatus: ModuleWithLessons[] = structure.modules.map(mod => ({
        ...mod,
        summary: `Módulo ${mod.order_index + 1}`,
        lessons: mod.lessons.map((lesson, idx) => {
          const progress = progressData.find(p => p.lesson_id === lesson.id);
          let status: LessonStatus = 'todo';

          if (progress?.completed) {
            status = 'done';
          } else if (progress?.percentage_watched > 0) {
            status = 'current';
          } else if (idx > 0 && !progressData.find(p => p.lesson_id === mod.lessons[idx - 1].id)?.completed) {
            status = 'locked';
          }

          return {
            ...lesson,
            status,
            moduleTitle: mod.title,
            duration: `${Math.floor(Math.random() * 20 + 5)} min`,
            type: lesson.blocks.some(b => b.type === 'video') ? 'video' :
                  lesson.blocks.some(b => b.type === 'text') ? 'leitura' : 'audio',
            percentageWatched: progress?.percentage_watched,
          };
        }),
      }));

      setModules(modulesWithStatus);

      // Check which modules are cached
      const cachedMods = await contentCacheService.listCachedModules(courseId);
      const cachedMap: Record<string, boolean> = {};
      cachedMods.forEach(mod => {
        cachedMap[mod.moduleId] = true;
      });
      setCachedModules(cachedMap);

      const initialOpenState: Record<string, boolean> = {};
      modulesWithStatus.forEach(mod => {
        const hasCurrentLesson = mod.lessons.some(l => l.status === 'current');
        initialOpenState[mod.id] = hasCurrentLesson;
      });
      setOpenModules(initialOpenState);

      // Auto-scroll to top after data loads
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }, 300);

    } catch (err: any) {
      console.error('Failed to load course data from server, trying offline cache:', err);

      // OFFLINE FALLBACK: try loading from cached modules
      try {
        const cachedModules = await contentCacheService.listCachedModules(courseId);
        if (cachedModules.length > 0) {
          const modulesWithStatus: ModuleWithLessons[] = [];

          for (const mod of cachedModules) {
            const cached = await contentCacheService.getCachedModule(mod.moduleId);
            if (cached?.lessons) {
              modulesWithStatus.push({
                id: mod.moduleId,
                courseId,
                title: mod.title || cached.title,
                order_index: 0,
                lessons: cached.lessons.map((l: any) => ({
                  ...l,
                  status: 'todo' as LessonStatus,
                  moduleTitle: mod.title || cached.title,
                  duration: `${Math.floor(Math.random() * 20 + 5)} min`,
                  type: l.blocks?.some((b: any) => b.type === 'video') ? 'video' :
                        l.blocks?.some((b: any) => b.type === 'text') ? 'leitura' : 'audio',
                })),
                summary: mod.title,
              });
            }
          }

          if (modulesWithStatus.length > 0) {
            setModules(modulesWithStatus);
            setCourse({ id: courseId, title: 'Curso (offline)', description: '' } as any);

            const initialOpenState: Record<string, boolean> = {};
            modulesWithStatus.forEach(mod => {
              initialOpenState[mod.id] = true;
            });
            setOpenModules(initialOpenState);

            setLoading(false);
            return;
          }
        }
      } catch (cacheErr) {
        console.error('Offline cache also failed:', cacheErr);
      }

      setError(err.message || 'Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [courseId]);

  const toggleModule = (moduleId: string) => {
    setOpenModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const filteredModules = modules.map(mod => ({
    ...mod,
    lessons: mod.lessons.filter(lesson =>
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(mod => mod.lessons.length > 0 || searchQuery === '');

  const handleDownloadModule = async (moduleId: string) => {
    if (!courseId) return;
    try {
      setDownloadingModules(prev => ({ ...prev, [moduleId]: true }));
      await contentCacheService.downloadModule(courseId, moduleId);
      // Update cached state after successful download
      setCachedModules(prev => ({ ...prev, [moduleId]: true }));
    } catch (err) {
      console.error('Failed to download module:', err);
    } finally {
      setDownloadingModules(prev => ({ ...prev, [moduleId]: false }));
    }
  };

  const totalLessons = modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
  const completedLessons = modules.reduce(
    (acc, mod) => acc + mod.lessons.filter(l => l.status === 'done').length,
    0
  );
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const currentLesson = modules
    .flatMap(mod => mod.lessons)
    .find(l => l.status === 'current');

  const allLessons = modules.flatMap(mod => mod.lessons);
  const nextLesson = allLessons.find(l => l.status === 'todo' && l.status !== 'locked');
  const allCompleted = completedLessons === totalLessons && totalLessons > 0;

  // Hero contextual data
  const heroLabel = currentLesson
    ? 'Continue de onde parou'
    : allCompleted
      ? 'Curso concluído!'
      : 'Próxima aula';

  const heroTitle = currentLesson
    ? currentLesson.title
    : allCompleted
      ? 'Parabéns, você concluiu!'
      : nextLesson?.title || 'Todas as aulas concluídas';

  const heroSubtitle = currentLesson
    ? currentLesson.moduleTitle
    : allCompleted
      ? `${completedLessons} aulas concluídas`
      : nextLesson?.moduleTitle || '';

  const heroButtonLabel = currentLesson
    ? 'Retomar aula'
    : allCompleted
      ? 'Ver certificado'
      : 'Próxima aula';

  const heroButtonAction = currentLesson
    ? () => onSelectLesson(currentLesson.id)
    : allCompleted
      ? () => onViewCertificate?.()
      : () => nextLesson && onSelectLesson(nextLesson.id);

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
          <Icon name="AlertCircle" size={48} color="$danger" />
          <Text color="$danger" fontSize={16} fontWeight="700" mt="$4" textAlign="center">
            Erro ao carregar aulas
          </Text>
          <Text color="$gray4" fontSize={12} mt="$2" textAlign="center" lineHeight={18}>
            {error}
          </Text>
          <Button variant="secondary" mt="$6" onPress={loadData}>
            Tentar Novamente
          </Button>
        </YStack>
      ) : loading ? (
        <YStack flex={1} jc="center" ai="center">
          <Spinner size="large" color="$primary" />
          <Text color="$gray4" mt="$4" fontSize={13} fontWeight="600">
            Carregando aulas do curso...
          </Text>
        </YStack>
      ) : (
        <>
      {/* Header */}
      <YStack
        bg="$background"
        borderBottomWidth={1}
        borderBottomColor="$border"
        px="$6"
        py="$4"
      >
        <XStack ai="center" jc="space-between" maxWidth={1400} w="100%" als="center">
          <XStack ai="center" gap="$4">
            <Button
              variant="ghost"
              px="$3"
              py="$2"
              br="$3"
              hoverStyle={Platform.OS === 'web' ? { bg: '$secondary' } : undefined}
              onPress={onBack}
            >
              <Icon name="ArrowLeft" size={18} color="$text" />
            </Button>
            <YStack>
              <Text fontSize={11} fontWeight="600" color="$primary" textTransform="uppercase" letterSpacing={1.5}>
                Curso em andamento
              </Text>
              <Text fontSize={18} fontWeight="bold" numberOfLines={1} mt="$1">
                {course?.title || 'Carregando...'}
              </Text>
            </YStack>
          </XStack>

          <XStack ai="center" gap="$4">
            <YStack ai="flex-end" display={completedLessons > 0 ? 'flex' : 'none'}>
              <Text fontSize={12} fontWeight="600" color="$text" mb="$1">
                {progressPercent}% concluído
              </Text>
              <YStack w={120} h={6} bg="$secondary" borderRadius={999} overflow="hidden">
                <YStack
                  h={6}
                  bg="$primary"
                  borderRadius={999}
                  w={`${progressPercent}%`}
                />
              </YStack>
            </YStack>
          </XStack>
        </XStack>
      </YStack>

      <ScrollView ref={scrollViewRef} flex={1} contentContainerStyle={{ padding: 24, gap: 24, paddingBottom: 32 }}>
        <YStack maxWidth={1400} w="100%" als="center" gap="$6">

          {/* Hero Section */}
          <Card
            p={0}
            overflow="hidden"
            br="$6"
            elevated
            mt="$4"
          >
            <YStack
              p="$8"
              gap="$5"
              bg={allCompleted ? '$success' : '$primary'}
            >
              <XStack ai="center" gap="$3">
                <YStack w={40} h={40} br="$3" bg="rgba(255,255,255,0.2)" ai="center" jc="center">
                  <Icon name={allCompleted ? 'Award' : 'Zap'} size={20} color="$white" />
                </YStack>
                <YStack>
                  <Text fontSize={11} fontWeight="700" color="rgba(255,255,255,0.8)" textTransform="uppercase" letterSpacing={1.5}>
                    {heroLabel}
                  </Text>
                </YStack>
              </XStack>

              <Text fontSize={24} fontWeight="bold" color="$white">
                {heroTitle}
              </Text>

              <Text fontSize={14} color="rgba(255,255,255,0.8)">
                {heroSubtitle}
              </Text>

              <XStack ai="center" gap="$4" mt="$2">
                {currentLesson?.duration && (
                  <>
                    <XStack ai="center" gap="$2">
                      <YStack w={24} h={24} br="$2" bg="rgba(255,255,255,0.2)" ai="center" jc="center">
                        <Icon name="Clock" size={12} color="$white" />
                      </YStack>
                      <Text fontSize={13} fontWeight="600" color="rgba(255,255,255,0.9)">
                        {currentLesson.duration}
                      </Text>
                    </XStack>
                    <YStack w={1} h={16} bg="rgba(255,255,255,0.3)" />
                  </>
                )}
                <XStack ai="center" gap="$2">
                  <YStack w={24} h={24} br="$2" bg="rgba(255,255,255,0.2)" ai="center" jc="center">
                    <Icon name="BookOpen" size={12} color="$white" />
                  </YStack>
                  <Text fontSize={13} fontWeight="600" color="rgba(255,255,255,0.9)">
                    {completedLessons}/{totalLessons} aulas
                  </Text>
                </XStack>
              </XStack>

              <XStack mt="$4" gap="$3" flexWrap="wrap">
                <Button
                  bg="$white"
                  hoverStyle={Platform.OS === 'web' ? { bg: '$secondary' } : undefined}
                  onPress={heroButtonAction}
                >
                  <Icon
                    name={allCompleted ? 'Award' : 'Play'}
                    size={18}
                    color={allCompleted ? '$success' : '$primary'}
                  />
                  <Text
                    color={allCompleted ? '$success' : '$primary'}
                    fontWeight="700"
                    ml="$2"
                  >
                    {heroButtonLabel}
                  </Text>
                </Button>
              </XStack>
            </YStack>

            {/* Progress bar at bottom */}
            <YStack h={4} bg="rgba(255,255,255,0.2)">
              <YStack h={4} bg="$white" w={`${progressPercent}%`} />
            </YStack>
          </Card>

          {/* Search */}
          <XStack gap="$3" display={modules.length > 3 ? 'flex' : 'none'}>
            <XStack
              flex={1}
              ai="center"
              bg="$surface"
              borderWidth={1}
              borderColor="$border"
              br="$4"
              px="$4"
              py="$3"
              hoverStyle={Platform.OS === 'web' ? { borderColor: '$primary' } : undefined}
            >
              <Icon name="Search" size={16} color="$textMuted" />
              <Input
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Buscar aula..."
                placeholderTextColor="$textMuted"
                bg="transparent"
                borderWidth={0}
                h="$2.5"
                fontSize={14}
                color="$text"
                flex={1}
              />
            </XStack>
          </XStack>

          {/* Atividades extras (Workbook PDF, Quiz relâmpago, Comunidade, Mentoria ao vivo) */}
          <YStack gap="$3">
            <XStack ai="center" jc="space-between">
              <YStack>
                <Text fontSize={15} fontWeight="700" color="$text">
                  Atividades extras
                </Text>
                <Text fontSize={12} color="$textMuted">
                  Materiais de apoio para aprofundar o conteúdo deste curso.
                </Text>
              </YStack>
            </XStack>

            <XStack
              flexWrap="wrap"
              gap="$3"
              $md={{ fd: 'row' }}
            >
              <ExtraCard
                icon="FileDown"
                iconBg="$successSurface"
                iconColor="$success"
                title="Workbook PDF"
                subtitle="Apostila completa com exercícios"
                badge="12 páginas"
              />
              <ExtraCard
                icon="Zap"
                iconBg="$accent"
                iconColor="$primary"
                title="Quiz relâmpago"
                subtitle="5 perguntas para fixar o conteúdo"
                badge="3 min"
              />
              <ExtraCard
                icon="Users"
                iconBg="$successSurface"
                iconColor="$success"
                title="Comunidade"
                subtitle="Tire dúvidas com outros alunos"
                badge="47 ativos"
              />
              <ExtraCard
                icon="Video"
                iconBg="$accent"
                iconColor="$primary"
                title="Mentoria ao vivo"
                subtitle="Sessões semanais com o professor"
                badge="Quintas 20h"
              />
            </XStack>
          </YStack>

          {/* Modules List */}
          <YStack gap="$4">
            {filteredModules.map((mod, idx) => {
              const done = mod.lessons.filter(l => l.status === 'done').length;
              const isOpen = openModules[mod.id];
              const moduleProgress = mod.lessons.length > 0 ? Math.round((done / mod.lessons.length) * 100) : 0;
              const hasCurrent = mod.lessons.some(l => l.status === 'current');

              return (
                <Card
                  key={mod.id}
                  p={0}
                  overflow="hidden"
                  br="$5"
                  borderWidth={hasCurrent ? 2 : 0}
                  borderColor={hasCurrent ? '$primary' : 'transparent'}
                >
                  <Button
                    variant="ghost"
                    w="100%"
                    jc="space-between"
                    ai="center"
                    px="$5"
                    py="$4"
                    hoverStyle={Platform.OS === 'web' ? { bg: '$secondary' } : undefined}
                    onPress={() => toggleModule(mod.id)}
                  >
                    <XStack ai="center" gap="$4" flex={1}>
                      <YStack
                        w={44}
                        h={44}
                        br="$4"
                        bg={hasCurrent ? '$primary' : '$secondary'}
                        ai="center"
                        jc="center"
                      >
                        <Text fontSize={16} fontWeight="bold" color={hasCurrent ? '$white' : '$text'}>
                          {String(idx + 1).padStart(2, '0')}
                        </Text>
                      </YStack>
                      <YStack flex={1} gap="$1">
                        <Text fontSize={15} fontWeight="bold" numberOfLines={1}>
                          {mod.title}
                        </Text>
                        <XStack ai="center" gap="$2">
                          <Text fontSize={12} color="$textMuted">
                            {mod.lessons.length} aulas
                          </Text>
                          <YStack w={1} h={12} bg="$border" />
                          <Text fontSize={12} color={moduleProgress === 100 ? '$success' : '$textMuted'}>
                            {done}/{mod.lessons.length} concluídas
                          </Text>
                        </XStack>
                      </YStack>
                    </XStack>

                    <XStack ai="center" gap="$3">
                      {/* Download/cache indicator */}
                      {cachedModules[mod.id] ? (
                        <YStack
                          w={32}
                          h={32}
                          ai="center"
                          jc="center"
                          borderRadius="$3"
                          bg="$success"
                          opacity={0.9}
                        >
                          <Icon name="Check" size={16} color="$white" />
                        </YStack>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onPress={() => handleDownloadModule(mod.id)}
                          disabled={downloadingModules[mod.id]}
                          hoverStyle={Platform.OS === 'web' ? { bg: '$secondary' } : undefined}
                        >
                          {downloadingModules[mod.id] ? (
                            <Spinner size="sm" color="$textMuted" />
                          ) : (
                            <Icon name="Download" size={16} color="$textMuted" />
                          )}
                        </Button>
                      )}

                      {/* Module progress indicator */}
                      <YStack w={48} h={48} ai="center" jc="center">
                        <Text fontSize={14} fontWeight="bold" color={moduleProgress === 100 ? '$success' : '$primary'}>
                          {moduleProgress}%
                        </Text>
                      </YStack>
                      <Icon
                        name={isOpen ? 'ChevronUp' : 'ChevronDown'}
                        size={18}
                        color="$textMuted"
                      />
                    </XStack>
                  </Button>

                  {/* Lessons list */}
                  {isOpen && (
                    <YStack borderTopWidth={1} borderTopColor="$border">
                      {mod.lessons.map((lesson, lessonIdx) => {
                        const config = statusConfig[lesson.status];
                        const type = typeConfig[lesson.type || 'video'];
                        const isCurrent = lesson.status === 'current';
                        const isLocked = lesson.status === 'locked';
                        const isDone = lesson.status === 'done';

                        return (
                          <Button
                            key={lesson.id}
                            variant="ghost"
                            w="100%"
                            jc="space-between"
                            ai="center"
                            px="$5"
                            py="$3.5"
                            opacity={isLocked ? 0.5 : 1}
                            bg={isCurrent ? config.bg : 'transparent'}
                            hoverStyle={Platform.OS === 'web'
                              ? { bg: isCurrent ? config.bg : '$secondary' }
                              : undefined}
                            onPress={() => !isLocked && onSelectLesson(lesson.id)}
                            disabled={isLocked}
                            borderBottomWidth={lessonIdx < mod.lessons.length - 1 ? 1 : 0}
                            borderBottomColor="$border"
                          >
                            <XStack ai="center" gap="$4" flex={1}>
                              {/* Status indicator */}
                              <YStack
                                w={32}
                                h={32}
                                br="$3"
                                bg={config.bg}
                                ai="center"
                                jc="center"
                              >
                                <Icon
                                  name={config.icon}
                                  size={16}
                                  color={config.color}
                                />
                              </YStack>

                              <YStack flex={1} gap="$1">
                                <Text
                                  fontSize={14}
                                  fontWeight={isCurrent ? 'bold' : '500'}
                                  numberOfLines={1}
                                  color="$text"
                                >
                                  {lesson.title}
                                </Text>
                                {isCurrent && (
                                  <YStack>
                                    <Text
                                      fontSize={10}
                                      fontWeight="700"
                                      color="$primary"
                                      bg="$primary"
                                      px="$1.5"
                                      py="$0.5"
                                      br="$2"
                                      overflow="hidden"
                                      textTransform="uppercase"
                                      letterSpacing={0.5}
                                    >
                                      Em andamento
                                    </Text>
                                  </YStack>
                                )}
                                {isCurrent && lesson.percentageWatched != null && lesson.percentageWatched > 0 && (
                                  <YStack>
                                    <Text
                                      fontSize={10}
                                      fontWeight="600"
                                      color="$textMuted"
                                      bg="$secondary"
                                      px="$1.5"
                                      py="$0.5"
                                      br="$2"
                                      overflow="hidden"
                                    >
                                      {Math.round(lesson.percentageWatched)}% concluído
                                    </Text>
                                  </YStack>
                                )}
                              </YStack>
                            </XStack>

                            <XStack ai="center" gap="$3">
                              {/* Type badge */}
                              <XStack
                                ai="center"
                                gap="$1.5"
                                px="$2"
                                py="$1"
                                br="$3"
                                bg="$secondary"
                              >
                                <Icon name={type.icon} size={12} color={type.color} />
                                <Text fontSize={11} fontWeight="500" color="$textMuted">
                                  {type.label}
                                </Text>
                              </XStack>
                              <Text fontSize={12} fontWeight="500" color="$textMuted" w={50} textAlign="right">
                                {lesson.duration}
                              </Text>
                            </XStack>
                          </Button>
                        );
                      })}
                    </YStack>
                  )}
                </Card>
              );
            })}
          </YStack>
        </YStack>
      </ScrollView>
        </>
      )}
    </YStack>
  );
}

interface ExtraCardProps {
  icon: 'FileDown' | 'Zap' | 'Users' | 'Video';
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  badge: string;
}

/**
 * Card reutilizável para a secção "Atividades extras" da tela de aulas.
 * Apresenta um recurso complementar do curso (workbook, quiz, comunidade, mentoria)
 * com ícone, título, descrição curta e badge de metadados.
 */
function ExtraCard({ icon, iconBg, iconColor, title, subtitle, badge }: ExtraCardProps) {
  return (
    <Card
      flex={1}
      minWidth={220}
      p="$4"
      gap="$3"
      interactive
      bg="$card"
      borderWidth={1}
      borderColor="$border"
    >
      <XStack ai="center" jc="space-between">
        <YStack
          w={36}
          h={36}
          br="$3"
          bg={iconBg}
          ai="center"
          jc="center"
        >
          <Icon name={icon} size={18} color={iconColor} />
        </YStack>
        <XStack
          px="$2"
          py="$0.5"
          br="$2"
          bg="$secondary"
        >
          <Text fontSize={10} fontWeight="600" color="$textMuted">
            {badge}
          </Text>
        </XStack>
      </XStack>
      <YStack gap="$0.5">
        <Text fontSize={13} fontWeight="700" color="$text" numberOfLines={1}>
          {title}
        </Text>
        <Text fontSize={11} color="$textMuted" numberOfLines={2}>
          {subtitle}
        </Text>
      </YStack>
    </Card>
  );
}
