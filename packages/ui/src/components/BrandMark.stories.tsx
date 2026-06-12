import React from 'react';
import { YStack, XStack, Text } from 'tamagui';
import { BrandMark } from './BrandMark';

export const Default = () => (
  <YStack gap="$4" p="$4">
    <Text variant="meta">BrandMark — Default</Text>
    <BrandMark />
  </YStack>
);

export const Small = () => (
  <YStack gap="$4" p="$4">
    <Text variant="meta">BrandMark — Small (icon only)</Text>
    <BrandMark small />
  </YStack>
);

export const Clickable = () => (
  <YStack gap="$4" p="$4">
    <Text variant="meta">BrandMark — Clickable</Text>
    <BrandMark onPress={() => alert('Brand clicked!')} />
  </YStack>
);
