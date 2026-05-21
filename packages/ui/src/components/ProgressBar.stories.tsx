import React from 'react';
import { YStack, Text } from 'tamagui';
import { ProgressBar } from './ProgressBar';

export const Empty = () => (
  <YStack gap="$4" p="$4" maxWidth={400}>
    <Text variant="meta">ProgressBar — 0%</Text>
    <ProgressBar progress={0} />
  </YStack>
);

export const Halfway = () => (
  <YStack gap="$4" p="$4" maxWidth={400}>
    <Text variant="meta">ProgressBar — 50%</Text>
    <ProgressBar progress={50} />
  </YStack>
);

export const Complete = () => (
  <YStack gap="$4" p="$4" maxWidth={400}>
    <Text variant="meta">ProgressBar — 100%</Text>
    <ProgressBar progress={100} />
  </YStack>
);

export const Thick = () => (
  <YStack gap="$4" p="$4" maxWidth={400}>
    <Text variant="meta">ProgressBar — Thick (12px)</Text>
    <ProgressBar progress={75} height={12} />
  </YStack>
);
