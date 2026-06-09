import React, { useState, useEffect } from 'react';
import { Image } from 'react-native';
import { ScrollView, XStack, YStack, Text, Button, Card, Icon, Spinner, GridBackground } from '@projeto/ui';
import flexedLogo from '../../assets/flexed-logo.png';
import { AuthService, CourseService, ProgressService } from '@projeto/core';
import { Course } from '@projeto/types';
import { StudentHeader } from '../components/StudentHeader';

type StudentDashboardProps = {
  onPlay: (courseId: string) => void;
  onNavigateToCourseLessons: (courseId: string) => void;
  onNavigateToCourses: () => void;
  onNavigateToCertificates: () => void;
  onLogout: () => void;
};

interface ActiveProgressState {
  courseTitle: string;
  courseId: string;
  lessonTitle: string;
  moduleTitle: string;
  progress: number;
  remaining: string;
  currentLessonId: string;
  isCurrentLessonCompleted: boolean;
}

export function StudentDashboard({ onPlay, onNavigateToCourseLessons, onNavigateToCourses, onNavigateToCertificates, onLogout }: StudentDashboardProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{ full_name: string; email: string } | null>(null);
  const [activeProgress, setActiveProgress] = useState<ActiveProgressState>({
    courseTitle: 'Onboarding de Vendas 2026',
    courseId: '',
    lessonTitle: 'Como conduzir a primeira call',
    moduleTitle: 'Módulo 3 · Aula 2 de 5',
    progress: 0,
    remaining: '8 min restantes',
    currentLessonId: '',
    isCurrentLessonCompleted: false,
  });

  const onTabAction = (action: string) => {
    switch (action) {
      case 'certificates':
        onNavigateToCertificates();
        break;
      case 'courses':
        onNavigateToCourses();
        break;
      case 'explore':
        // Poderia navegar para uma tela de exploração
        break;
      default:
        // Dashboard - já está na tela
        break;
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const profile = await AuthService.getCurrentProfile();
        setUserProfile(profile ? { full_name: profile.full_name || '', email: profile.email } : null);

        const coursesData = await CourseService.getStudentPublishedCourses();
        const loadedCourses = coursesData || [];
        setCourses(loadedCourses);

        if (loadedCourses.length > 0) {
          const firstCourse = loadedCourses[0];

          // Buscar estrutura do curso para obter aulas
          const structure = await CourseService.getCourseStructure(firstCourse.id);
          const allLessons = structure.modules.flatMap(mod => mod.lessons);

          // Buscar progresso de todas as aulas
          const lessonIds = allLessons.map(l => l.id);
          const progressData = await ProgressService.getProgressByLessons(profile?.id || '', lessonIds);

          // Encontrar a aula atual (primeira não concluída)
          let currentLesson = allLessons[0];
          let isCurrentLessonCompleted = false;

          for (const lesson of allLessons) {
            const progress = progressData.find(p => p.lesson_id === lesson.id);
            if (!progress?.completed) {
              currentLesson = lesson;
              isCurrentLessonCompleted = false;
              break;
            }
            // Se chegou aqui, esta aula está concluída
            if (lesson.id === allLessons[allLessons.length - 1].id) {
              // Todas as aulas foram concluídas
              currentLesson = lesson;
              isCurrentLessonCompleted = true;
            }
          }

          // Calcular progresso geral
          const completedCount = progressData.filter(p => p.completed).length;
          const progressPercent = allLessons.length > 0
            ? Math.round((completedCount / allLessons.length) * 100)
            : 0;

          // Encontrar módulo da aula atual
          const currentModule = structure.modules.find(mod =>
            mod.lessons.some(l => l.id === currentLesson.id)
          );

          setActiveProgress({
            courseTitle: firstCourse?.title || '',
            courseId: firstCourse?.id || '',
            lessonTitle: currentLesson?.title || '',
            moduleTitle: currentModule?.title || '',
            progress: progressPercent,
            remaining: `${allLessons.length - completedCount} aulas restantes`,
            currentLessonId: currentLesson?.id || '',
            isCurrentLessonCompleted,
          });
        }
      } catch (err: any) {
        console.error('Failed to load dashboard data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const formatDate = (value?: string | Date | null) => {
    if (!value) return 'Sem data';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Sem data';
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(date);
  };

  return (
    <YStack flex={1} bg="$background">
      <StudentHeader userProfile={userProfile} onLogout={onLogout} onTabAction={onTabAction} activeTab="dashboard" />
      <ScrollView flex={1} contentContainerStyle={{ paddingBottom: 60 }}>
        <YStack px="$6" pt="$12" pb="$4" gap="$6" maxWidth={1400} alignSelf="center" w="100%">
          {loading && (
            <Card ai="center" jc="center" p="$8" gap="$3">
              <Spinner size="large" color="$primary" />
              <Text color="$textMuted">Carregando painel de controle...</Text>
            </Card>
          )}

          {error && (
            <Card ai="center" jc="center" p="$8" gap="$3">
              <Icon name="AlertCircle" size={32} color="$danger" />
              <Text color="$danger" fontWeight="600">{error}</Text>
            </Card>
          )}

          {!loading && !error && (
            <YStack gap="$6" w="100%">
              {/* Section 1: Hero + Stats */}
              <XStack gap="$6" $sm={{ fd: 'column' }} w="100%">
                {/* Hero Box */}
                <YStack flex={2} gap="$4">
                  <Card p={0} overflow="hidden" br="$4" elevated>
                    {/* Cover Gradient/Visual Area */}
                    <YStack h={200} bg="$primary" position="relative" jc="center" ai="center">
                      <GridBackground position="absolute" top={0} left={0} right={0} bottom={0} opacity={0.2} />
                      <XStack
                        w={64}
                        h={64}
                        br={32}
                        bg="$white"
                        ai="center"
                        jc="center"
                        pressStyle={{ scale: 0.95 }}
                        cursor="pointer"
                        onPress={() => onPlay(activeProgress.courseId)}
                      >
                        <Icon name="Play" size={24} color="$primary" />
                      </XStack>
                    </YStack>

                    {/* Meta info & content details */}
                    <YStack p="$5" gap="$3" bg="$surface">
                      <Text variant="caption" textTransform="uppercase" letterSpacing={1} fontWeight="700">
                        {activeProgress.courseTitle}
                      </Text>
                      <Text variant="h2" fontFamily="$heading" fontWeight="bold">
                        {activeProgress.lessonTitle}
                      </Text>
                      <Text variant="caption" color="$textMuted">
                        {activeProgress.moduleTitle} · {activeProgress.remaining}
                      </Text>

                      <YStack mt="$2" gap="$2">
                        <XStack ai="center" gap="$3">
                          <YStack flex={1} h={8} bg="$secondary" borderRadius={999} overflow="hidden">
                            <YStack h={8} bg="$primary" borderRadius={999} w={`${activeProgress.progress}%`} />
                          </YStack>
                          <Text fontSize={14} fontWeight="700" color="$primary" w={40} textAlign="right">
                            {activeProgress.progress}%
                          </Text>
                        </XStack>
                        <Text variant="caption" color="$textMuted">
                          {activeProgress.progress}% concluído
                        </Text>
                      </YStack>

                      <XStack mt="$3" gap="$2" flexWrap="wrap">
                        {activeProgress.progress === 0 ? (
                          <Button onPress={() => onPlay(activeProgress.courseId)}>
                            <Icon name="Play" size={16} color="$white" />
                            <Text color="$white" fontWeight="700" ml="$2">Iniciar aula</Text>
                          </Button>
                        ) : activeProgress.isCurrentLessonCompleted ? (
                          <Button onPress={() => onPlay(activeProgress.courseId)}>
                            <Icon name="ChevronRight" size={16} color="$white" />
                            <Text color="$white" fontWeight="700" ml="$2">Próxima aula</Text>
                          </Button>
                        ) : (
                          <Button onPress={() => onPlay(activeProgress.courseId)}>
                            <Icon name="Play" size={16} color="$white" />
                            <Text color="$white" fontWeight="700" ml="$2">Continuar aula</Text>
                          </Button>
                        )}
                        <Button variant="ghost" borderWidth={1} borderColor="$border" onPress={() => onNavigateToCourseLessons(activeProgress.courseId)}>
                          Ver curso
                        </Button>
                      </XStack>
                    </YStack>
                  </Card>
                </YStack>

                {/* Stats Panel */}
                <YStack flex={1} gap="$4">
                  <Card p="$5" gap="$3">
                    <XStack ai="center" gap="$3">
                      <Image
                        source={flexedLogo}
                        style={{ width: 36, height: 36 }}
                        resizeMode="contain"
                        accessibilityLabel="FLEXED"
                      />
                      <YStack>
                        <Text variant="caption">Oi, {userProfile?.full_name || 'estudante'} 👋</Text>
                        <Text variant="h3" fontWeight="bold">Bora manter o ritmo?</Text>
                      </YStack>
                    </XStack>

                    <XStack gap="$2" mt="$2">
                      <Card flex={1} p="$3" ai="center" jc="center" bg="$background">
                        <Icon name="Flame" size={18} color="$warning" />
                        <Text variant="h3" fontWeight="bold" mt="$1">7</Text>
                        <Text fontSize={10} color="$textMuted" textAlign="center">dias seguidos</Text>
                      </Card>
                      <Card flex={1} p="$3" ai="center" jc="center" bg="$background">
                        <Icon name="Clock" size={18} color="$primary" />
                        <Text variant="h3" fontWeight="bold" mt="$1">3h42</Text>
                        <Text fontSize={10} color="$textMuted" textAlign="center">esta semana</Text>
                      </Card>
                      <Card flex={1} p="$3" ai="center" jc="center" bg="$background">
                        <Icon name="Trophy" size={18} color="$warning" />
                        <Text variant="h3" fontWeight="bold" mt="$1">12</Text>
                        <Text fontSize={10} color="$textMuted" textAlign="center">conquistas</Text>
                      </Card>
                    </XStack>
                  </Card>

                  {/* Next Steps List */}
                  <Card p="$5" gap="$3">
                    <XStack jc="space-between" ai="center">
                      <Text variant="h3" fontWeight="bold">Próximos passos</Text>
                      <Button variant="ghost" p={0}>
                        <Text color="$primary" fontSize={11} fontWeight="700">Ver tudo</Text>
                      </Button>
                    </XStack>

                    <YStack gap="$3">
                      {[
                        { title: 'Quiz rápido: técnicas de rapport', type: 'Quiz', time: '5 min', icon: 'CheckCircle' },
                        { title: 'Estudo de caso: lead frio virou cliente', type: 'Leitura', time: '12 min', icon: 'BookOpen' },
                        { title: 'Aula ao vivo com a Rafa', type: 'Ao vivo', time: 'Quinta, 19h', icon: 'Calendar' },
                      ].map((item, idx) => (
                        <XStack key={idx} ai="center" gap="$3">
                          <YStack p="$2" br="$3" bg="$background">
                            <Icon name={item.icon} size={15} color="$text" />
                          </YStack>
                          <YStack flex={1}>
                            <Text fontWeight="600" fontSize={12} numberOfLines={1}>{item.title}</Text>
                            <Text variant="caption" fontSize={10}>{item.type} · {item.time}</Text>
                          </YStack>
                        </XStack>
                      ))}
                    </YStack>
                  </Card>
                </YStack>
              </XStack>

              {/* Section 2: Últimos cursos (padrão admin) */}
              <YStack gap="$4" w="100%">
                <XStack ai="flex-end" jc="space-between">
                  <YStack>
                    <Text fontFamily="$display" fontSize={20} fontWeight="$6">Últimos cursos</Text>
                    <Text fontSize={14} color="$textMuted">Seus cursos mais recentes.</Text>
                  </YStack>
                  <XStack ai="center" gap={6} px={12} py={6} borderRadius={6} borderWidth={1} borderColor="$border" cursor="pointer" hoverStyle={{ backgroundColor: '$secondary' }} onPress={onNavigateToCourses}>
                    <Text fontSize={13} fontWeight="500">Ver todos</Text>
                    <Icon name="ArrowRight" size={14} color="$textMuted" />
                  </XStack>
                </XStack>

                {courses.length === 0 ? (
                  <YStack ai="center" jc="center" py={64} gap={8} borderWidth={1} borderColor="$border" borderRadius={12} borderStyle="dashed" bg="$card">
                    <Icon name="BookOpen" size={40} color="$textMuted" />
                    <Text color="$textMuted" fontSize={16} fontWeight="600">Nenhum curso encontrado</Text>
                    <Text color="$textMuted" fontSize={14}>Explore o catálogo para começar.</Text>
                  </YStack>
                ) : (
                  <XStack flexWrap="wrap" gap={16}>
                    {[...courses]
                      .sort((a, b) => {
                        const dateA = new Date(a.updated_at || a.created_at).getTime();
                        const dateB = new Date(b.updated_at || b.created_at).getTime();
                        return dateB - dateA;
                      })
                      .slice(0, 3)
                      .map((course) => {
                        if (!course) return null;
                        const isActive = course.id === activeProgress.courseId;
                        const progressPercent = isActive ? activeProgress.progress : 0;
                        const courseStatus = progressPercent === 0 ? 'not_started' : progressPercent >= 100 ? 'completed' : 'in_progress';

                        return (
                          <YStack key={course.id} flex={1} minWidth={320} maxWidth="calc(33.33% - 12px)">
                            <Card
                              p={0}
                              overflow="hidden"
                              br="$4"
                              cursor="pointer"
                              borderWidth={1}
                              borderColor={isActive ? 'rgba(16, 185, 129, 0.35)' : '$border'}
                              hoverStyle={{ borderColor: '$primary' }}
                              onPress={() => onNavigateToCourseLessons(course.id)}
                            >
                              <YStack
                                height={128}
                                position="relative"
                                bg="$primary"
                              >
                                {course.thumbnail_url ? (
                                  <YStack
                                    position="absolute"
                                    inset={0}
                                    style={{
                                      backgroundImage: `url(${course.thumbnail_url})`,
                                      backgroundSize: 'cover',
                                      backgroundPosition: 'center',
                                    }}
                                  />
                                ) : (
                                  <>
                                    <GridBackground position="absolute" inset={0} opacity={0.15} />
                                    <YStack position="absolute" inset={0} ai="center" jc="center">
                                      <Icon name="Play" size={32} color="$white" />
                                    </YStack>
                                  </>
                                )}

                                <XStack position="absolute" left={12} top={12}>
                                  <XStack
                                    borderRadius={9999}
                                    px={10}
                                    py={4}
                                    ai="center"
                                    gap={6}
                                    style={{
                                      backdropFilter: 'blur(8px)',
                                      backgroundColor: isActive
                                        ? 'rgba(16, 185, 129, 0.9)'
                                        : 'rgba(55, 65, 81, 0.8)',
                                    }}
                                  >
                                    {isActive && (
                                      <XStack w={6} h={6} borderRadius={3} bg="$white" style={{ borderRadius: '50%' }} />
                                    )}
                                    <Text fontSize={11} fontWeight="700" color="$white">
                                      {isActive ? 'Em andamento' : 'Não iniciado'}
                                    </Text>
                                  </XStack>
                                </XStack>
                              </YStack>

                              <YStack p={20} gap={6}>
                                <Text fontFamily="$display" fontSize={16} fontWeight="$6" numberOfLines={1}>
                                  {course.title}
                                </Text>
                                {course.description && (
                                  <Text fontSize={13} color="$textMuted" numberOfLines={2}>
                                    {course.description}
                                  </Text>
                                )}
                                <XStack mt={4} ai="center" gap={10}>
                                  <Text fontSize={12} color="$textMuted">
                                    Atualizado {formatDate(course.updated_at || course.created_at)}
                                  </Text>
                                </XStack>
                                {isActive && (
                                  <YStack mt={4} gap={4}>
                                    <XStack ai="center" jc="space-between">
                                      <Text fontSize={11} color="$textMuted">Progresso</Text>
                                      <Text fontSize={11} color="$textMuted">{progressPercent}%</Text>
                                    </XStack>
                                    <YStack h={6} bg="$secondary" borderRadius={999} overflow="hidden">
                                      <YStack h={6} bg="$primary" borderRadius={999} w={`${progressPercent}%`} />
                                    </YStack>
                                  </YStack>
                                )}
                              </YStack>
                            </Card>
                          </YStack>
                        );
                      })}
                  </XStack>
                )}
              </YStack>
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </YStack>
  );
}
