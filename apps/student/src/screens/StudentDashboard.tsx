import React from 'react';
import { ScrollView, XStack, YStack, Text, Button, Card, Icon, BrandMark, Avatar } from '@projeto/ui';

const navTabs = [
  { label: 'Meu painel', active: true },
  { label: 'Meus cursos', active: false },
  { label: 'Explorar', active: false },
  { label: 'Conquistas', active: false },
];

export function StudentDashboard() {
  return (
    <YStack flex={1} bg="$background">
      <TopBar />
      <ScrollView flex={1} contentContainerStyle={{ paddingBottom: 40 }}>
        <YStack px="$4" pt="$4" gap="$6" maxWidth={1200} als="center" w="100%">
          <Card ai="center" jc="center" p="$8" gap="$3">
            <Text variant="h2" fontFamily="$display" textAlign="center">
              Bem-vindo ao Mosaico
            </Text>
            <Text variant="body" color="$textMuted" textAlign="center">
              Seus cursos aparecerão aqui.
            </Text>
          </Card>
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
