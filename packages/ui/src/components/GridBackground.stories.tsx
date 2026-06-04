import React from 'react';
import { YStack, Text } from 'tamagui';
import { GridBackground } from './GridBackground';

export const Default = () => (
  <YStack gap="$4" p="$4">
    <Text variant="meta">GridBackground — Default</Text>
    <GridBackground height={200} borderRadius="$3" p="$4">
      <Text>Content on top of grid background</Text>
    </GridBackground>
  </YStack>
);
