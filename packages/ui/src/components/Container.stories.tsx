import React from 'react';
import { YStack, Text } from 'tamagui';
import { Container } from './Container';

export const Large = () => (
  <YStack gap="$4" p="$4">
    <Text variant="meta">Container — Large (default, 1200px)</Text>
    <Container size="large" bg="$gray2" p="$4" borderRadius="$3">
      <Text>Content inside large container</Text>
    </Container>
  </YStack>
);

export const Small = () => (
  <YStack gap="$4" p="$4">
    <Text variant="meta">Container — Small (800px)</Text>
    <Container size="small" bg="$gray2" p="$4" borderRadius="$3">
      <Text>Content inside small container</Text>
    </Container>
  </YStack>
);

export const Fluid = () => (
  <YStack gap="$4" p="$4">
    <Text variant="meta">Container — Fluid (full width)</Text>
    <Container fluid bg="$gray2" p="$4" borderRadius="$3">
      <Text>Content inside fluid container</Text>
    </Container>
  </YStack>
);
