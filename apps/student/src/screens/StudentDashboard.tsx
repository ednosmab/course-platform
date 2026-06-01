import React, { useState, useEffect, useRef } from 'react';
import { View } from 'react-native';
import { ScrollView, XStack, YStack, Text, Button, Card, Icon, BrandMark, Avatar, Spinner, ProgressBar, GridBackground, Input, Theme, useMedia, shadowPresets } from '@projeto/ui';
import { AuthService, CourseService, ProgressService } from '@projeto/core';
import { Course } from '@projeto/types';

const navTabs = [
  { label: 'Meu painel', active: true, action: 'dashboard' },
  { label: 'Meus cursos', active: false, action: 'courses' },
  { label: 'Explorar', active: false, action: 'explore' },
  { label: 'Conquistas', active: false, action: 'certificates' },
];

type StudentDashboardProps = {
  onPlay: (courseId: string) => void;
  onNavigateToCourseLessons: (courseId: string) => void;
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

export function StudentDashboard({ onPlay, onNavigateToCourseLessons, onNavigateToCertificates, onLogout }: StudentDashboardProps) {
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

  const handleTabAction = (action: string) => {
    switch (action) {
      case 'certificates':
        onNavigateToCertificates();
        break;
      case 'courses':
        // Poderia navegar para uma tela de cursos, por enquanto não faz nada
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
        setUserProfile(profile);

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
            courseTitle: firstCourse.title,
            courseId: firstCourse.id,
            lessonTitle: currentLesson.title,
            moduleTitle: currentModule?.title || '',
            progress: progressPercent,
            remaining: `${allLessons.length - completedCount} aulas restantes`,
            currentLessonId: currentLesson.id,
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

  return (
    <YStack flex={1} bg="$background">
      <TopBar userProfile={userProfile} onLogout={onLogout} />
      <ScrollView flex={1} contentContainerStyle={{ paddingBottom: 60 }}>
        <YStack px="$6" pt="$10" gap="$6" maxWidth={1400} als="center" w="100%">
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
                        {...shadowPresets.cwPop}
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
                        <Button variant="ghost" border={1} borderColor="$border" onPress={() => onNavigateToCourseLessons(activeProgress.courseId)}>
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
                      <YStack p="$2" br="$3" bg="$primary">
                        <Icon name="Sparkles" size={18} color="$white" />
                      </YStack>
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
                      <Button variant="ghost" p={0} size="$2">
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

              {/* Section 2: Courses flex grid */}
              <YStack gap="$4" w="100%">
                <YStack gap="$1">
                  <Text variant="h2" fontFamily="$heading" fontWeight="bold">Meus cursos</Text>
                  <Text variant="caption">Tudo que você está estudando agora.</Text>
                </YStack>

                {courses.length === 0 ? (
                  <Card ai="center" jc="center" p="$6" gap="$2">
                    <Text variant="body">Nenhum curso em andamento.</Text>
                  </Card>
                ) : (
                  <XStack flexWrap="wrap" gap="$4" jc="flex-start" w="100%">
                    {courses.map((course, idx) => {
                      const isActive = course.id === activeProgress.courseId;
                      const progressPercent = isActive ? activeProgress.progress : idx === 0 && courses.length > 0 ? activeProgress.progress : 0;
                      const courseStatus = progressPercent === 0 ? 'not_started' : progressPercent >= 100 ? 'completed' : 'in_progress';

                      const statusConfig = {
                        not_started: { color: '$primary', label: 'Não iniciado', bg: '$primary' + '15' },
                        in_progress: { color: '$warning', label: 'Em andamento', bg: '$warning' + '15' },
                        completed: { color: '$success', label: 'Concluído', bg: '$success' + '15' },
                      };

                      const status = statusConfig[courseStatus];

                      return (
                        <Card
                          key={course.id}
                          w="31.5%"
                          $md={{ w: '48%' }}
                          $sm={{ w: '100%' }}
                          p={0}
                          overflow="hidden"
                        >
                          <YStack h={110} bg="$primary" position="relative" jc="center" ai="center">
                            <GridBackground position="absolute" top={0} left={0} right={0} bottom={0} opacity={0.15} />
                            {course.thumbnail_url ? (
                              <YStack
                                position="absolute"
                                top={0}
                                left={0}
                                right={0}
                                bottom={0}
                                style={{
                                  backgroundImage: `url(${course.thumbnail_url})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                }}
                              />
                            ) : (
                              <Icon name="Play" size={28} color="$white" />
                            )}
                          </YStack>

                          <YStack p="$4" gap="$3" bg="$surface">
                            <YStack gap="$1">
                              <Text fontSize={14} fontWeight="bold" numberOfLines={2}>
                                {course.title}
                              </Text>
                              <Text fontSize={11} color="$textMuted">
                                por Rafa Lima
                              </Text>
                            </YStack>

                            <XStack ai="center" gap="$2">
                              <YStack flex={1} h={6} bg="$secondary" borderRadius={999} overflow="hidden">
                                <YStack h={6} bg="$primary" borderRadius={999} w={`${progressPercent}%`} />
                              </YStack>
                              <Text fontSize={11} fontWeight="700" color="$text" w={36} textAlign="right">
                                {progressPercent}%
                              </Text>
                            </XStack>

                            {/* Status badge */}
                            <XStack ai="center" gap="$2">
                              <YStack w={8} h={8} br={4} bg={status.color} />
                              <Text fontSize={11} fontWeight="600" color={status.color}>
                                {status.label}
                              </Text>
                            </XStack>

                            {/* Action buttons */}
                            <XStack gap="$2" mt="$1">
                              {courseStatus === 'not_started' && (
                                <Button
                                  flex={1}
                                  size="sm"
                                  onPress={() => onPlay(course.id)}
                                >
                                  <Icon name="Play" size={14} color="$white" />
                                  <Text ml="$1" fontSize={12} fontWeight="600" color="$white">Iniciar aula</Text>
                                </Button>
                              )}
                              {courseStatus === 'in_progress' && (
                                <Button
                                  flex={1}
                                  size="sm"
                                  onPress={() => onPlay(course.id)}
                                >
                                  <Icon name="Play" size={14} color="$white" />
                                  <Text ml="$1" fontSize={12} fontWeight="600" color="$white">Continuar aula</Text>
                                </Button>
                              )}
                              {courseStatus === 'completed' && (
                                <Button
                                  flex={1}
                                  size="sm"
                                  bg="$success"
                                  onPress={() => onNavigateToCertificates()}
                                >
                                  <Icon name="Award" size={14} color="$white" />
                                  <Text ml="$1" fontSize={12} fontWeight="600" color="$white">Ver certificado</Text>
                                </Button>
                              )}
                              <Button
                                flex={1}
                                size="sm"
                                variant="ghost"
                                borderWidth={1}
                                borderColor="$primary"
                                bg="transparent"
                                hoverStyle={{ bg: '$primary' + '10' }}
                                onPress={() => onNavigateToCourseLessons(course.id)}
                              >
                                <Icon name="List" size={14} color="$primary" />
                                <Text ml="$1" fontSize={12} fontWeight="600" color="$primary">Ver aulas</Text>
                              </Button>
                            </XStack>
                          </YStack>
                        </Card>
                      );
                    })}
                  </XStack>
                )}
              </YStack>

              {/* Section 3: Recommendations & Community */}
              <XStack gap="$6" $sm={{ fd: 'column' }} w="100%">
                {/* Left side: Recommendations */}
                <YStack flex={2} gap="$4">
                  <YStack gap="$1">
                    <Text variant="h2" fontFamily="$heading" fontWeight="bold">Recomendado para você</Text>
                    <Text variant="caption">Selecionado com base no que você anda estudando.</Text>
                  </YStack>

                  <XStack gap="$3" flexWrap="wrap" w="100%">
                    {[
                      { title: 'IA aplicada ao dia a dia', tag: 'Novo', lessons: 10, bg: '$primary' },
                      { title: 'Fundamentos de UX para times de produto', tag: 'Popular', lessons: 8, bg: '$secondary' },
                      { title: 'Liderança para novos gestores', tag: 'Indicado', lessons: 14, bg: '$surface' },
                    ].map((item, index) => (
                      <Card
                        key={index}
                        w="31.5%"
                        $md={{ w: '48%' }}
                        $sm={{ w: '100%' }}
                        p={0}
                        overflow="hidden"
                        interactive
                        pressStyle={{ scale: 0.98 }}
                      >
                        <YStack h={90} bg={item.bg} position="relative" jc="center" ai="center">
                          <GridBackground position="absolute" top={0} left={0} right={0} bottom={0} opacity={0.1} />
                          <XStack position="absolute" top="$3" left="$3" bg="$white" px="$2" py="$0.5" br="$3">
                            <Text fontSize={9} fontWeight="bold" color="$text">
                              {item.tag}
                            </Text>
                          </XStack>
                        </YStack>
                        <YStack p="$3" gap="$1" bg="$surface">
                          <Text fontWeight="bold" fontSize={12} numberOfLines={2}>{item.title}</Text>
                          <Text variant="caption" fontSize={10}>{item.lessons} aulas</Text>
                        </YStack>
                      </Card>
                    ))}
                  </XStack>
                </YStack>

                {/* Right side: Community */}
                <YStack flex={1} gap="$4">
                  <Card p="$5" gap="$3">
                    <XStack ai="center" gap="$3">
                      <YStack p="$2" br="$3" bg="$background">
                        <Icon name="MessageSquare" size={16} color="$text" />
                      </YStack>
                      <YStack>
                        <Text variant="h3" fontWeight="bold">Comunidade</Text>
                        <Text variant="caption">Conversas rolando agora</Text>
                      </YStack>
                    </XStack>

                    <YStack gap="$3" mt="$1">
                      {[
                        { user: 'Ana', letter: 'A', msg: 'Alguém topa revisar o quiz comigo?', when: 'há 5 min' },
                        { user: 'Pedro', letter: 'P', msg: 'Resumo do módulo 2 ↓', when: 'há 1h' },
                        { user: 'Júlia', letter: 'J', msg: 'Dica boa pra rapport: ouvir mais 🙂', when: 'há 3h' },
                      ].map((item, idx) => (
                        <XStack key={idx} gap="$3" ai="center" p="$2" br="$3" hoverStyle={{ bg: '$background' }}>
                          <XStack w={32} h={32} br={16} bg="$background" ai="center" jc="center">
                            <Text fontWeight="bold" fontSize={11}>{item.letter}</Text>
                          </XStack>
                          <YStack flex={1}>
                            <XStack jc="space-between" ai="center">
                              <Text fontSize={11} fontWeight="bold">{item.user}</Text>
                              <Text fontSize={9} color="$textMuted">{item.when}</Text>
                            </XStack>
                            <Text fontSize={11} color="$textMuted" numberOfLines={1}>{item.msg}</Text>
                          </YStack>
                        </XStack>
                      ))}
                    </YStack>

                    <Button variant="ghost" border={1} borderColor="$border" mt="$2">
                      Abrir comunidade
                    </Button>
                  </Card>
                </YStack>
              </XStack>
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </YStack>
  );
}

interface TopBarProps {
  userProfile: { full_name: string; email: string } | null;
  onLogout: () => void;
}

function TopBar({ userProfile, onLogout }: TopBarProps) {
  const media = useMedia();
  const [searchVal, setSearchVal] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<View>(null);
  const initials = userProfile?.full_name
    ? userProfile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '--';
  const firstName = userProfile?.full_name ? userProfile.full_name.split(' ')[0] : '--';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await AuthService.logout();
    } catch {
      // proceed even if signOut fails
    }
    onLogout();
  };

  return (
    <YStack
      bg="$background"
      borderBottomWidth={1}
      borderBottomColor="$border"
      px="$6"
      py="$3"
      {...shadowPresets.cwSoft}
    >
      <XStack ai="center" jc="space-between" maxWidth={1400} w="100%" als="center">
        <XStack ai="center" gap="$6">
          <BrandMark />
          <XStack gap="$2" $sm={{ display: 'none' }}>
            {navTabs.map((tab) => (
              <Button
                key={tab.label}
                variant="ghost"
                px="$3"
                py="$1.5"
                br="$2"
                bg={tab.active ? '$secondary' : 'transparent'}
                onPress={() => handleTabAction(tab.action)}
              >
                <Text
                  fontSize={13}
                  fontWeight="700"
                  color={tab.active ? '$text' : '$textMuted'}
                >
                  {tab.label}
                </Text>
              </Button>
            ))}
          </XStack>
        </XStack>

        <XStack ai="center" gap="$3">
          <XStack
            ai="center"
            bg="$surface"
            borderWidth={1}
            borderColor="$border"
            br="$3"
            px="$3"
            py="$1"
            w={260}
            $sm={{ display: 'none' }}
          >
            <Icon name="Search" size={15} color="$textMuted" />
            <Input
              value={searchVal}
              onChangeText={setSearchVal}
              placeholder="O que você quer aprender hoje?"
              placeholderTextColor="$textMuted"
              bg="transparent"
              borderWidth={0}
              h="$2.5"
              fontSize={12}
              color="$text"
              flex={1}
            />
          </XStack>

          <Button variant="ghost" px="$2.5" py="$2.5" borderRadius="$3">
            <Icon name="Bell" size={16} color="$textMuted" />
            <XStack
              position="absolute"
              top={6}
              right={6}
              w={7}
              h={7}
              br={4}
              bg="$primary"
            />
          </Button>

          <YStack ref={menuRef} position="relative">
            <XStack
              ai="center"
              gap="$2"
              px="$2.5"
              py="$1.5"
              br="$3"
              bg="$surface"
              borderWidth={1}
              borderColor="$border"
              cursor="pointer"
              hoverStyle={{ opacity: 0.85 }}
              pressStyle={{ scale: 0.97 }}
              onPress={() => setShowUserMenu(!showUserMenu)}
            >
              <XStack w={24} h={24} br={12} bg="$secondary" ai="center" jc="center">
                <Text fontSize={10} fontWeight="bold" color="$text">{initials}</Text>
              </XStack>
              <Text fontSize={12} fontWeight="600" color="$text" $sm={{ display: 'none' }}>
                {firstName}
              </Text>
              <Icon name="ChevronDown" size={13} color="$textMuted" />
            </XStack>

            {showUserMenu && (
              <YStack
                position="absolute"
                top="$5"
                right={0}
                bg="$popover"
                borderWidth={1}
                borderColor="$border"
                br="$3"
                p="$2"
                minWidth={180}
                zIndex={999}
                {...shadowPresets.cwPop}
              >
                <XStack
                  ai="center"
                  gap="$2"
                  px="$3"
                  py="$2"
                  br="$2"
                  cursor="pointer"
                  hoverStyle={{ bg: '$surface' }}
                  pressStyle={{ bg: '$surface', opacity: 0.9 }}
                  onPress={handleLogout}
                >
                  <Icon name="LogOut" size={16} color="$textMuted" />
                  <Text fontSize={14} color="$danger">Sair</Text>
                </XStack>
              </YStack>
            )}
          </YStack>
        </XStack>
      </XStack>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} mt="$3" display={media.sm ? 'flex' : 'none'}>
        <XStack gap="$1">
          {navTabs.map((tab) => (
            <Button
              key={tab.label}
              px="$3.5"
              py="$1.5"
              br="$2"
              bg={tab.active ? '$secondary' : 'transparent'}
              variant="ghost"
              size="$2"
              onPress={() => handleTabAction(tab.action)}
            >
              <Text
                fontSize={12}
                fontWeight="700"
                color={tab.active ? '$text' : '$textMuted'}
              >
                {tab.label}
              </Text>
            </Button>
          ))}
        </XStack>
      </ScrollView>
    </YStack>
  );
}
