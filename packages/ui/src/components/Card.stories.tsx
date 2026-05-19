import React from 'react';
import { YStack, XStack, Text } from 'tamagui';
import { Card } from './Card';

export const Default = () => (
  <YStack gap="$4" p="$4">
    <Text variant="meta">Card — Variants</Text>
    <XStack gap="$4" flexWrap="wrap">
      <Card width={200} height={120}>
        <Text variant="body">Default card with content</Text>
      </Card>
      <Card width={200} height={120} variant="outlined">
        <Text variant="body">Outlined variant</Text>
      </Card>
    </XStack>
  </YStack>
);

export const Interactive = () => (
  <YStack gap="$4" p="$4">
    <Text variant="meta">Card — Interactive</Text>
    <XStack gap="$4" flexWrap="wrap">
      <Card width={200} height={120} interactive>
        <Text variant="body">Hover or press me</Text>
      </Card>
      <Card width={200} height={120} variant="glass">
        <Text variant="body" color="$white">Glass variant</Text>
      </Card>
    </XStack>
  </YStack>
);
