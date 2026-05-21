import React, { useState, useEffect } from 'react';
import { ScrollView, XStack, YStack, Text, Button, Card, Icon, BrandMark, Avatar, Spinner } from '@projeto/ui';
import { supabase } from '@projeto/core';
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

export function StudentDashboard({ onPlay }: StudentDashboardProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error: err } = await supabase
          .from('courses')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        if (err) throw err;
        setCourses(data || []);
      } catch (err: any) {
        console.error('Erro ao carregar cursos:', err);
        setError(err.message || 'Erro ao carregar cursos');
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  return (
    <YStack flex={1} bg="$background">
      <TopBar />
      <ScrollView flex={1} contentContainerStyle={{ paddingBottom: 40 }}>
        <YStack px="$4" pt="$4" gap="$6" maxWidth={1200} als="center" w="100%">
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

          {!loading && !error && courses.length === 0 && (
            <Card ai="center" jc="center" p="$8" gap="$3">
              <Text variant="h2" fontFamily="$display" textAlign="center">
                Bem-vindo ao Mosaico
              </Text>
              <Text variant="body" color="$textMuted" textAlign="center">
                Nenhum curso publicado disponível no momento.
              </Text>
            </Card>
          )}

          {courses.length > 0 && (
            <YStack gap="$4">
              <Text variant="h3" fontFamily="$display">
                Meus cursos
              </Text>
              <YStack gap="$3">
                {courses.map((course) => (
                  <Card
                    key={course.id}
                    p="$4"
                    gap="$2"
                    pressStyle={{ scale: 0.98, opacity: 0.9 }}
                    cursor="pointer"
                    onPress={() => onPlay(course.id)}
                  >
                    <XStack gap="$4" ai="center">
                      {course.thumbnail_url ? (
                        <YStack
                          w={80}
                          h={60}
                          br="$3"
                          bg="$surface"
                          style={{ backgroundImage: `url(${course.thumbnail_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                        />
                      ) : (
                        <YStack w={80} h={60} br="$3" bg="$primary" ai="center" jc="center">
                          <Icon name="Play" size={24} color="$white" />
                        </YStack>
                      )}
                      <YStack flex={1} gap="$1">
                        <Text fontWeight="600" fontSize={15}>{course.title}</Text>
                        {course.description && (
                          <Text fontSize={12} color="$textMuted" numberOfLines={2}>
                            {course.description}
                          </Text>
                        )}
                      </YStack>
                      <Icon name="ChevronRight" size={20} color="$textMuted" />
                    </XStack>
                  </Card>
                ))}
              </YStack>
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </YStack>
  );
}

function TopBar() {
  return (
    <YStack
      bg="$background"
      borderBottomWidth={1}
      borderBottomColor="$border"
      px="$4"
      py="$3"
    >
      <XStack ai="center" jc="space-between">
        <BrandMark />
        <XStack ai="center" gap="$3">
          <Button variant="ghost" px="$2" py="$2" borderRadius="$3">
            <Icon name="Bell" size={20} color="$textMuted" />
            <XStack
              position="absolute"
              top={6}
              right={6}
              w={8}
              h={8}
              br={4}
              bg="$primary"
            />
          </Button>
          <Avatar initials="LV" size={36} />
        </XStack>
      </XStack>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} mt="$3">
        <XStack gap="$1">
          {navTabs.map((tab) => (
            <YStack
              key={tab.label}
              px="$3"
              py="$1.5"
              br="$2"
              bg={tab.active ? '$secondary' : 'transparent'}
            >
              <Text
                fontSize={13}
                fontWeight="600"
                color={tab.active ? '$text' : '$textMuted'}
              >
                {tab.label}
              </Text>
            </YStack>
          ))}
        </XStack>
      </ScrollView>
    </YStack>
  );
}
