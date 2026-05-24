import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, XStack, YStack, Text, Button, Card, Icon, BrandMark, Avatar, Spinner, ProgressBar, GridBackground, Input, Theme, useMedia } from '@projeto/ui';
import { AuthService, CourseService } from '@projeto/core';
import { Course } from '@projeto/types';

const navTabs = [
  { label: 'Meu painel', active: true },
  { label: 'Meus cursos', active: false },
  { label: 'Explorar', active: false },
  { label: 'Conquistas', active: false },
];

type StudentDashboardProps = {
  onPlay: (courseId: string) => void;
};

interface ActiveProgressState {
  courseTitle: string;
  courseId: string;
  lessonTitle: string;
  moduleTitle: string;
  progress: number;
  remaining: string;
}

export function StudentDashboard({ onPlay }: StudentDashboardProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{ full_name: string; email: string } | null>(null);
  const [activeProgress, setActiveProgress] = useState<ActiveProgressState>({
    courseTitle: 'Onboarding de Vendas 2026',
    courseId: '',
    lessonTitle: 'Como conduzir a primeira call',
    moduleTitle: 'Módulo 3 · Aula 2 de 5',
    progress: 64,
    remaining: '8 min restantes',
  });

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
          setActiveProgress({
            courseTitle: loadedCourses[0].title,
            courseId: loadedCourses[0].id,
            lessonTitle: 'Introdução e Boas-Vindas',
            moduleTitle: 'Módulo 1 · Aula 1 de 4',
            progress: 0,
            remaining: '5 min restantes',
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
      <TopBar userProfile={userProfile} />
      <ScrollView flex={1} contentContainerStyle={{ paddingBottom: 60 }}>
        <YStack px="$4" pt="$6" gap="$6" maxWidth={1400} als="center" w="100%">
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
                  <Card p={0} overflow="hidden" br="$4" border={1} borderColor="$border" elevation={3}>
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
                        shadowColor="$black"
                        shadowOffset={{ width: 0, height: 4 }}
                        shadowOpacity={0.2}
                        shadowRadius={8}
                        elevation={5}
                        pressStyle={{ scale: 0.95 }}
                        cursor="pointer"
                        onPress={() => onPlay(activeProgress.courseId)}
                      >
                        <Icon name="Play" size={24} color="$primary" />
                      </XStack>
                      <XStack
                        position="absolute"
                        top="$4"
                        left="$4"
                        bg="$white"
                        px="$2.5"
                        py="$1"
                        br="$4"
                        ai="center"
                        gap="$1.5"
                      >
                        <YStack w={6} h={6} br={3} bg="$primary" />
                        <Text fontSize={11} fontWeight="700" color="$text">
                          Continue de onde parou
                        </Text>
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
                        <ProgressBar progress={activeProgress.progress} />
                        <XStack jc="space-between">
                          <Text variant="caption">{activeProgress.progress}% concluído</Text>
                        </XStack>
                      </YStack>

                      <XStack mt="$3" gap="$2" flexWrap="wrap">
                        <Button onPress={() => onPlay(activeProgress.courseId)}>
                          <Icon name="Play" size={16} color="$white" />
                          <Text color="$white" fontWeight="700" ml="$2">Continuar aula</Text>
                        </Button>
                        <Button variant="ghost" border={1} borderColor="$border" onPress={() => onPlay(activeProgress.courseId)}>
                          Ver curso
                        </Button>
                      </XStack>
                    </YStack>
                  </Card>
                </YStack>

                {/* Stats Panel */}
                <YStack flex={1} gap="$4">
                  <Card p="$5" gap="$3" border={1} borderColor="$border">
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
                      <Card flex={1} p="$3" ai="center" jc="center" bg="$background" border={1} borderColor="$border">
                        <Icon name="Flame" size={18} color="$warning" />
                        <Text variant="h3" fontWeight="bold" mt="$1">7</Text>
                        <Text fontSize={10} color="$textMuted" textAlign="center">dias seguidos</Text>
                      </Card>
                      <Card flex={1} p="$3" ai="center" jc="center" bg="$background" border={1} borderColor="$border">
                        <Icon name="Clock" size={18} color="$primary" />
                        <Text variant="h3" fontWeight="bold" mt="$1">3h42</Text>
                        <Text fontSize={10} color="$textMuted" textAlign="center">esta semana</Text>
                      </Card>
                      <Card flex={1} p="$3" ai="center" jc="center" bg="$background" border={1} borderColor="$border">
                        <Icon name="Trophy" size={18} color="$warning" />
                        <Text variant="h3" fontWeight="bold" mt="$1">12</Text>
                        <Text fontSize={10} color="$textMuted" textAlign="center">conquistas</Text>
                      </Card>
                    </XStack>
                  </Card>

                  {/* Next Steps List */}
                  <Card p="$5" gap="$3" border={1} borderColor="$border">
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
                          <YStack p="$2" br="$3" bg="$background" border={1} borderColor="$border">
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
                    {courses.map((course) => {
                      const progressPercent = course.id === activeProgress.courseId ? activeProgress.progress : 28;
                      const nextLessonTitle = course.id === activeProgress.courseId ? activeProgress.lessonTitle : 'Escuta ativa na prática';

                      return (
                        <Card
                          key={course.id}
                          w="31.5%"
                          $md={{ w: '48%' }}
                          $sm={{ w: '100%' }}
                          p={0}
                          overflow="hidden"
                          interactive
                          pressStyle={{ scale: 0.98 }}
                          onPress={() => onPlay(course.id)}
                          border={1}
                          borderColor="$border"
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
                            <XStack position="absolute" top="$3" left="$3" bg="$white" px="$2" py="$0.5" br="$3">
                              <Text fontSize={10} fontWeight="bold" color="$primary">
                                {progressPercent}% concluído
                              </Text>
                            </XStack>
                          </YStack>

                          <YStack p="$4" gap="$2" bg="$surface">
                            <Text fontSize={14} fontWeight="bold" numberOfLines={2}>
                              {course.title}
                            </Text>
                            <Text fontSize={11} color="$textMuted">
                              por Rafa Lima
                            </Text>

                            <YStack mt="$2" gap="$2">
                              <ProgressBar progress={progressPercent} />
                            </YStack>

                            <XStack jc="space-between" ai="center" mt="$3" pt="$3" borderTopWidth={1} borderTopColor="$border">
                              <YStack flex={1} pr="$2">
                                <Text fontSize={9} color="$textMuted" textTransform="uppercase" fontWeight="700">
                                  Próxima aula
                                </Text>
                                <Text fontSize={11} fontWeight="600" color="$text" numberOfLines={1}>
                                  {nextLessonTitle}
                                </Text>
                              </YStack>
                              <XStack p="$1.5" br="$3" bg="$primary" ai="center" jc="center">
                                <Icon name="Play" size={12} color="$white" />
                              </XStack>
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
                        border={1}
                        borderColor="$border"
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
                  <Card p="$5" gap="$3" border={1} borderColor="$border">
                    <XStack ai="center" gap="$3">
                      <YStack p="$2" br="$3" bg="$background" border={1} borderColor="$border">
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
                          <XStack w={32} h={32} br={16} bg="$background" border={1} borderColor="$border" ai="center" jc="center">
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
}

function TopBar({ userProfile }: TopBarProps) {
  const media = useMedia();
  const [searchVal, setSearchVal] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
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
    const adminUrl = process.env.EXPO_PUBLIC_ADMIN_APP_URL || 'http://localhost:3000';
    window.location.href = `${adminUrl}/login`;
  };

  return (
    <YStack
      bg="$background"
      borderBottomWidth={1}
      borderBottomColor="$border"
      px="$4"
      py="$3"
      elevation={2}
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

          <ul ref={menuRef} style={{ listStyle: 'none', margin: 0, padding: 0, position: 'relative' }}>
            <li>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setShowUserMenu(!showUserMenu); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 10px', borderRadius: 8,
                  border: '1px solid #DEE1EB', background: '#F1F2F8',
                  cursor: 'pointer', textDecoration: 'none', color: 'inherit',
                  fontFamily: 'inherit', fontSize: 'inherit',
                }}
              >
                <XStack w={24} h={24} br={12} bg="$secondary" ai="center" jc="center">
                  <Text fontSize={10} fontWeight="bold" color="$text">{initials}</Text>
                </XStack>
                <Text fontSize={12} fontWeight="600" color="$text" $sm={{ display: 'none' }}>
                  {firstName}
                </Text>
                <Icon name="ChevronDown" size={13} color="$textMuted" />
              </a>

              {showUserMenu && (
                <ul
                  style={{
                    position: 'absolute', top: '100%', right: 0, marginTop: 4,
                    listStyle: 'none', margin: 0, padding: 8, minWidth: 180,
                    borderRadius: 8, zIndex: 999,
                    background: '#F1F2F8', border: '1px solid #DEE1EB',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  }}
                >
                  <li>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); handleLogout(); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '8px 12px', borderRadius: 6, cursor: 'pointer',
                        textDecoration: 'none', color: 'inherit',
                        fontFamily: 'inherit', fontSize: 'inherit',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F7F8FC'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <Icon name="LogOut" size={16} color="$textMuted" />
                      <Text fontSize={14} color="$danger">Sair</Text>
                    </a>
                  </li>
                </ul>
              )}
            </li>
          </ul>
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
