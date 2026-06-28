import React, { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { ScrollView, XStack, YStack, Text, Card, Icon, Spinner, FilterBar, GridBackground } from '@projeto/ui';
import { CourseService, ProgressService, AuthService } from '@projeto/core';
import type { Course, CourseAccess } from '@projeto/types';
import { StudentHeader } from '../components/StudentHeader';

type CourseWithAccessAndStatus = Course & {
  accessData?: CourseAccess | null;
  hasAccess?: boolean;
  accessReason?: string;
  status: 'completed' | 'in_progress' | 'not_started';
  progressPercent: number;
};

type StudentExploreProps = {
  onSelectCourse: (courseId: string) => void;
  onBack: () => void;
  onLogout: () => void;
  onNavigateToDashboard: () => void;
  onNavigateToCourses: () => void;
  onNavigateToCertificates: () => void;
};

export function StudentExplore({ onSelectCourse, onBack, onLogout, onNavigateToDashboard, onNavigateToCourses, onNavigateToCertificates }: StudentExploreProps) {
  const [courses, setCourses] = useState<CourseWithAccessAndStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState(0);
  const [sortBy, setSortBy] = useState<'custom' | 'recent' | 'oldest' | 'name-az' | 'name-za'>('custom');
  const [userProfile, setUserProfile] = useState<{ full_name: string; email: string } | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const profile = await AuthService.getCurrentProfile();
      if (profile) {
        setUserProfile({ full_name: profile.full_name || '', email: profile.email || '' });
        setStudentId(profile.id);
      }
    })();
  }, []);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const coursesData = await CourseService.getStudentPublishedCourses();
        
        const profile = await AuthService.getCurrentProfile();
        const profileId = profile?.id;

        const coursesWithData = await Promise.all(
          (coursesData || []).map(async (course) => {
            let hasAccess = true;
            let accessReason: string | undefined = 'unknown';
            let status: 'completed' | 'in_progress' | 'not_started' = 'not_started';
            let progressPercent = 0;

            if (profileId) {
              const accessResult = await CourseService.getStudentCourseAccess(profileId, course.id);
              hasAccess = accessResult.hasAccess;
              accessReason = accessResult.reason;

              if (hasAccess) {
                const { completed, total } = await ProgressService.getCompletedLessonCount(profileId, course.id);
                progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
                if (completed >= total && total > 0) {
                  status = 'completed';
                } else if (completed > 0) {
                  status = 'in_progress';
                }
              }
            }

            return { ...course, hasAccess, accessReason, status, progressPercent };
          })
        );
        
        setCourses(coursesWithData);
      } catch (err: any) {
        console.error('Failed to load courses:', err);
        setError(err.message || 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [studentId]);

  const handleTabAction = (action: string) => {
    switch (action) {
      case 'dashboard':
        onNavigateToDashboard();
        break;
      case 'courses':
        onNavigateToCourses();
        break;
      case 'certificates':
        onNavigateToCertificates();
        break;
    }
  };

  const filteredCourses = courses.filter((course) => {
    if (filter === 0) return true;
    if (filter === 1) return course.is_published;
    if (filter === 2) return course.hasAccess;
    if (filter === 3) return !course.hasAccess;
    if (filter === 4) return course.status === 'in_progress';
    if (filter === 5) return course.status === 'not_started';
    if (filter === 6) return course.status === 'completed';
    return true;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'custom':
        return (a.student_order_index ?? 0) - (b.student_order_index ?? 0);
      case 'recent':
        return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
      case 'oldest':
        return new Date(a.updated_at || a.created_at).getTime() - new Date(b.updated_at || b.created_at).getTime();
      case 'name-az':
        return (a.title || '').localeCompare(b.title || '');
      case 'name-za':
        return (b.title || '').localeCompare(a.title || '');
      default:
        return 0;
    }
  });

  const filterLabel = filter === 0 ? null
    : filter === 1 ? 'Publicados'
    : filter === 2 ? 'Disponíveis'
    : filter === 3 ? 'Bloqueados'
    : filter === 4 ? 'Em andamento'
    : filter === 5 ? 'Não iniciados'
    : 'Concluídos';

  const formatDate = (value?: string | Date | null) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(date);
  };

  return (
    <YStack flex={1} bg="$background">
      <StudentHeader userProfile={userProfile} onLogout={onLogout} onTabAction={handleTabAction} activeTab="explore" />

      <ScrollView flex={1} contentContainerStyle={{ paddingBottom: 60 }}>
        <YStack px={24} pt={24} pb={16} gap={24} maxWidth={1400} alignSelf="center" w="100%">

          {/* Page Header */}
          <YStack gap={4}>
            <Text fontFamily="$display" fontSize={32} fontWeight="$6" letterSpacing={-0.5}>
              Explorar Cursos
            </Text>
            <Text fontSize={14} color="$textMuted">
              {courses.length} {courses.length === 1 ? 'curso disponível' : 'cursos disponíveis'}
            </Text>
          </YStack>

          {loading && (
            <YStack py={64} ai="center" jc="center" gap={12} opacity={0.7}>
              <Spinner size="large" color="$primary" />
              <Text color="$textMuted" fontSize={14}>Carregando cursos...</Text>
            </YStack>
          )}

          {error && (
            <Card ai="center" jc="center" p={32} gap={12}>
              <Icon name="AlertCircle" size={32} color="$danger" />
              <Text color="$danger" fontWeight="600">{error}</Text>
            </Card>
          )}

          {!loading && !error && (
            <>
              <FilterBar
                filterOptions={[
                  { value: '0', label: 'Todos' },
                  { value: '1', label: 'Publicados' },
                  { value: '2', label: 'Disponíveis' },
                  { value: '3', label: 'Bloqueados' },
                  { value: '4', label: 'Em andamento' },
                  { value: '5', label: 'Não iniciados' },
                  { value: '6', label: 'Concluídos' },
                ]}
                filterValue={String(filter)}
                onFilterChange={(value) => setFilter(Number(value))}
                sortOptions={[
                  { value: 'custom', label: 'Ordem do professor' },
                  { value: 'recent', label: 'Mais recentes' },
                  { value: 'oldest', label: 'Mais antigos' },
                  { value: 'name-az', label: 'Nome A-Z' },
                  { value: 'name-za', label: 'Nome Z-A' },
                ]}
                sortValue={sortBy}
                onSortChange={(value) => setSortBy(value as typeof sortBy)}
                resultCount={sortedCourses.length}
                resultLabel="cursos"
                filterLabel={filterLabel || undefined}
                onClearFilter={() => setFilter(0)}
              />

              {sortedCourses.length === 0 ? (
                <YStack ai="center" jc="center" py={64} gap={8} borderWidth={1} borderColor="$border" borderRadius={12} bg="$card">
                  <Icon name="BookOpen" size={48} color="$textMuted" />
                  <Text color="$textMuted" fontSize={16} fontWeight="600">Nenhum curso encontrado</Text>
                  <Text color="$textMuted" fontSize={14}>Ajuste os filtros ou volte mais tarde.</Text>
                </YStack>
              ) : (
                <XStack flexWrap="wrap" gap={16}>
                  {sortedCourses.map((course) => (
                    <YStack
                      key={course.id}
                      flex={1}
                      minWidth={320}
                      maxWidth="calc(33.33% - 12px)"
                      $md={{ maxWidth: 'calc(50% - 8px)' }}
                      $sm={{ maxWidth: '100%' }}
                    >
                      <Card
                        p={0}
                        overflow="hidden"
                        br="$4"

                        borderWidth={1}
                        borderColor="$border"
                        hoverStyle={Platform.OS === 'web' ? { borderColor: '$primary' } : undefined}
                        opacity={course.hasAccess ? 1 : 0.6}
                        onPress={() => course.hasAccess && onSelectCourse(course.id)}
                      >
                        {/* Thumbnail */}
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

                          {/* Status Badge */}
                          <XStack position="absolute" left={12} top={12}>
                            {course.hasAccess ? (
                              <XStack
                                borderRadius={9999}
                                px={10}
                                py={4}
                                ai="center"
                                gap={6}
                                style={{
                                  ...(Platform.OS === 'web' ? { backdropFilter: 'blur(8px)' } : {}),
                                  backgroundColor: course.status === 'completed'
                                    ? 'rgba(34, 197, 94, 0.9)'
                                    : course.status === 'in_progress'
                                      ? 'rgba(59, 130, 246, 0.9)'
                                      : 'rgba(107, 114, 118, 0.9)',
                                }}
                              >
                                <XStack w={6} h={6} borderRadius={9999} bg="$white" />
                                <Text fontSize={11} fontWeight="700" color="$white">
                                  {course.status === 'completed'
                                    ? 'Concluído'
                                    : course.status === 'in_progress'
                                      ? 'Em andamento'
                                      : 'Não iniciado'}
                                </Text>
                              </XStack>
                            ) : (
                              <XStack
                                borderRadius={9999}
                                px={10}
                                py={4}
                                ai="center"
                                gap={6}
                                style={{
                                  ...(Platform.OS === 'web' ? { backdropFilter: 'blur(8px)' } : {}),
                                  backgroundColor: 'rgba(156, 163, 175, 0.9)',
                                }}
                              >
                                <Icon name="Lock" size={10} color="$white" />
                                <Text fontSize={11} fontWeight="700" color="$white">Bloqueado</Text>
                              </XStack>
                            )}
                          </XStack>
                        </YStack>

                        {/* Content */}
                        <YStack p={20} gap={8}>
                          <Text
                            fontFamily="$display"
                            fontSize={16}
                            fontWeight="$6"
                            numberOfLines={1}
                          >
                            {course.title}
                          </Text>

                          <Text fontSize={13} color="$textMuted" numberOfLines={2}>
                            {course.description || 'Sem descrição'}
                          </Text>

                          <XStack ai="center" gap={8} mt={4}>
                            <Icon name="Clock" size={12} color="$textMuted" />
                            <Text fontSize={12} color="$textMuted">
                              Atualizado {formatDate(course.updated_at || course.created_at)}
                            </Text>
                          </XStack>

                          {!course.hasAccess && course.accessReason === 'prerequisite_not_completed' && (
                            <Text fontSize={11} color="$warning" mt={4}>
                              Complete o pré-requisito primeiro
                            </Text>
                          )}
                          {!course.hasAccess && course.accessReason === 'not_assigned_to_plan' && (
                            <Text fontSize={11} color="$warning" mt={4}>
                              Acesso restrito — requer atribuição de plano
                            </Text>
                          )}
                        </YStack>
                      </Card>
                    </YStack>
                  ))}
                </XStack>
              )}
            </>
          )}
        </YStack>
      </ScrollView>
    </YStack>
  );
}
