import React, { useState, useEffect } from 'react';
import { ScrollView, XStack, YStack, Text, Card, Icon, Spinner, FilterBar, GridBackground } from '@projeto/ui';
import { CourseService, AuthService } from '@projeto/core';
import { Course } from '@projeto/types';
import { StudentHeader } from '../components/StudentHeader';

type StudentCoursesProps = {
  onSelectCourse: (courseId: string) => void;
  onBack: () => void;
  onLogout: () => void;
  onNavigateToDashboard: () => void;
  onNavigateToCertificates: () => void;
};

export function StudentCourses({ onSelectCourse, onBack, onLogout, onNavigateToDashboard, onNavigateToCertificates }: StudentCoursesProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState(0);
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'name-az' | 'name-za'>('recent');
  const [userProfile, setUserProfile] = useState<{ full_name: string; email: string } | null>(null);

  useEffect(() => {
    (async () => {
      const profile = await AuthService.getCurrentProfile();
      if (profile) setUserProfile({ full_name: profile.full_name || '', email: profile.email || '' });
    })();
  }, []);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const coursesData = await CourseService.getStudentPublishedCourses();
        setCourses(coursesData || []);
      } catch (err: any) {
        console.error('Failed to load courses:', err);
        setError(err.message || 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const handleTabAction = (action: string) => {
    switch (action) {
      case 'dashboard':
        onNavigateToDashboard();
        break;
      case 'certificates':
        onNavigateToCertificates();
        break;
      case 'courses':
        break;
    }
  };

  const filteredCourses = courses.filter((course) => {
    if (filter === 0) return true;
    if (filter === 1) return course.status === 'published';
    if (filter === 2) return course.status === 'draft';
    return true;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
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

  const filterLabel = filter === 0 ? null : filter === 1 ? 'Em andamento' : 'Não iniciados';

  const formatDate = (value?: string | Date | null) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(date);
  };

  return (
    <YStack flex={1} bg="$background">
      <StudentHeader userProfile={userProfile} onLogout={onLogout} onTabAction={handleTabAction} activeTab="courses" />

      <ScrollView flex={1} contentContainerStyle={{ paddingBottom: 60 }}>
        <YStack px={24} pt={24} pb={16} gap={24} maxWidth={1400} alignSelf="center" w="100%">

          {/* Page Header */}
          <YStack gap={4}>
            <Text fontFamily="$display" fontSize={32} fontWeight="$6" letterSpacing={-0.5}>
              Meus Cursos
            </Text>
            <Text fontSize={14} color="$textMuted">
              {courses.length} {courses.length === 1 ? 'curso matriculado' : 'cursos matriculados'}
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
                  { value: '1', label: 'Em andamento' },
                  { value: '2', label: 'Não iniciados' },
                ]}
                filterValue={String(filter)}
                onFilterChange={(value) => setFilter(Number(value))}
                sortOptions={[
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
                <YStack ai="center" jc="center" py={64} gap={8} borderWidth={1} borderColor="$border" borderRadius={12} borderStyle="dashed" bg="$card">
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
                      $md={{ maxWidth: 'calc(50% - 8px)' }}
                      $sm={{ maxWidth: '100%' }}
                    >
                      <Card
                        p={0}
                        overflow="hidden"
                        br="$4"
                        cursor="pointer"
                        borderWidth={1}
                        borderColor="$border"
                        hoverStyle={{ borderColor: '$primary' }}
                        onPress={() => onSelectCourse(course.id)}
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
                            <XStack
                              borderRadius={9999}
                              px={10}
                              py={4}
                              ai="center"
                              gap={6}
                              style={{
                                backdropFilter: 'blur(8px)',
                                backgroundColor: 'rgba(16, 185, 129, 0.9)',
                              }}
                            >
                              <XStack
                                w={6}
                                h={6}
                                borderRadius={3}
                                bg="$white"
                                style={{ borderRadius: '50%' }}
                              />
                              <Text fontSize={11} fontWeight="700" color="$white">
                                Em andamento
                              </Text>
                            </XStack>
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
