import React from 'react';
import { YStack, Text } from 'tamagui';
import { ImageBlockRenderer } from './ImageBlock';

const baseBlock = {
  id: 'img-0001',
  type: 'image' as const,
  url: 'https://picsum.photos/seed/course/800/450',
  alt: 'Sample course image',
  styles: {},
};

export const Default = () => (
  <YStack gap="$4" p="$4" maxWidth={600}>
    <Text variant="meta">ImageBlock — Default</Text>
    <ImageBlockRenderer block={baseBlock} />
  </YStack>
);

export const LeftAligned = () => (
  <YStack gap="$4" p="$4" maxWidth={600}>
    <Text variant="meta">ImageBlock — Left Aligned</Text>
    <ImageBlockRenderer block={{ ...baseBlock, styles: { align: 'left' } }} />
  </YStack>
);
