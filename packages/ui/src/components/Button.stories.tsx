import React from 'react';
import { YStack, XStack, Text } from 'tamagui';
import { Button } from './Button';
import { Icon } from './Icon';

export const Primary = () => (
  <YStack gap="$3" p="$4">
    <Text variant="meta">Button — Primary</Text>
    <XStack gap="$3" flexWrap="wrap">
      <Button variant="primary">Primary</Button>
      <Button variant="primary" disabled>Disabled</Button>
      <Button variant="primary"><Icon name="Plus" size={14} /> With Icon</Button>
    </XStack>
  </YStack>
);

export const Secondary = () => (
  <YStack gap="$3" p="$4">
    <Text variant="meta">Button — Secondary</Text>
    <XStack gap="$3" flexWrap="wrap">
      <Button variant="secondary">Secondary</Button>
      <Button variant="secondary" disabled>Disabled</Button>
    </XStack>
  </YStack>
);

export const Ghost = () => (
  <YStack gap="$3" p="$4">
    <Text variant="meta">Button — Ghost</Text>
    <XStack gap="$3" flexWrap="wrap">
      <Button variant="ghost">Ghost</Button>
      <Button variant="ghost" disabled>Disabled</Button>
    </XStack>
  </YStack>
);
