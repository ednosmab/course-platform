import React, { useState, useEffect } from 'react';
import { ScrollView, XStack, YStack, Text, Card, Icon, Spinner, Theme, FilterBar } from '@projeto/ui';
import { CourseService, AuthService } from '@projeto/core';
import { Course } from '@projeto/types';

type StudentCoursesProps = {
  onSelectCourse: (courseId: string) => void;
  onBack: () => void;
};

export function StudentCourses({ onSelectCourse, onBack }: StudentCoursesProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState(0);
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'name-az' | 'name-za'>('recent');

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

  const filterLabel = filter === 0 ? null : filter === 1 ? 'Publicados' : 'Rascunhos';

  return (
    <YStack flex={1} bg="$background">
      <ScrollView flex={1} contentContainerStyle={{ paddingBottom: 60 }}>
        <YStack px="$6" pt="$12" pb="$4" gap="$6" maxWidth={1400} als="center" w="100%">
          {/* Header */}
          <XStack ai="center" gap="$4" mb="$4">
            <XStack
              p="$2"
              borderRadius="$2"
              cursor="pointer"
              hoverStyle={{ backgroundColor: '$secondary' }}
              onPress={onBack}
            >
              <Icon name="ArrowLeft" size={20} color="$text" />
            </XStack>
            <YStack gap="$1">
              <Text variant="h1" fontFamily="$heading" fontWeight="bold">
                Meus Cursos
              </Text>
              <Text variant="caption" color="$textMuted">
                {courses.length} {courses.length === 1 ? 'curso matriculado' : 'cursos matriculados'}
              </Text>
            </YStack>
          </XStack>

          {loading && (
            <Card ai="center" jc="center" p="$8" gap="$3">
              <Spinner size="large" color="$primary" />
              <Text color="$textMuted">Carregando cursos...</Text>
            </Card>
          )}

          {error && (
            <Card ai="center" jc="center" p="$8" gap="$3">
              <Icon name="AlertCircle" size={32} color="$danger" />
              <Text color="$danger" fontWeight="600">{error}</Text>
            </Card>
          )}

          {!loading && !error && (
            <>
              {/* Filters */}
              <FilterBar
                filterOptions={[
                  { value: '0', label: 'Todos' },
                  { value: '1', label: 'Publicados' },
                  { value: '2', label: 'Rascunhos' },
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

              {/* Course List */}
              {sortedCourses.length === 0 ? (
                <Card ai="center" jc="center" p="$8" gap="$3">
                  <Icon name="BookOpen" size={48} color="$textMuted" />
                  <Text color="$textMuted" fontSize={16} fontWeight="600">Nenhum curso encontrado</Text>
                  <Text color="$textMuted" fontSize={14}>Ajuste os filtros ou volte mais tarde.</Text>
                </Card>
              ) : (
                <YStack gap="$4">
                  {sortedCourses.map((course) => (
                    <Card
                      key={course.id}
                      p="$4"
                      gap="$3"
                      cursor="pointer"
                      hoverStyle={{ backgroundColor: '$secondary' }}
                      onPress={() => onSelectCourse(course.id)}
                    >
                      <XStack gap="$4" ai="center">
                        <YStack flex={1} gap="$2">
                          <Text fontWeight="600" fontSize={16}>{course.title}</Text>
                          <Text color="$textMuted" fontSize={13} numberOfLines={2}>
                            {course.description || 'Sem descrição'}
                          </Text>
                          <XStack gap="$2" ai="center" mt="$1">
                            <XStack
                              px="$2"
                              py="$1"
                              borderRadius="$2"
                              backgroundColor={course.status === 'published' ? '$primary' : '$secondary'}
                            >
                              <Text
                                fontSize={11}
                                fontWeight="600"
                                color={course.status === 'published' ? '$white' : '$text'}
                              >
                                {course.status === 'published' ? 'Publicado' : 'Rascunho'}
                              </Text>
                            </XStack>
                          </XStack>
                        </YStack>
                        <Icon name="ChevronRight" size={20} color="$textMuted" />
                      </XStack>
                    </Card>
                  ))}
                </YStack>
              )}
            </>
          )}
        </YStack>
      </ScrollView>
    </YStack>
  );
}