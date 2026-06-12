import React from 'react';
import { YStack, Text } from 'tamagui';
import { TextBlockRenderer } from './TextBlock';

const baseBlock = {
  id: '00000000-0000-0000-0000-000000000001',
  type: 'text' as const,
  content: 'Hello, this is a **text block** with *markdown* support!',
  layout: { x: 0, y: 0, w: 600, h: 100, zIndex: 0 },
};

export const Default = () => (
  <YStack gap="$4" p="$4">
    <Text variant="meta">TextBlock — Default</Text>
    <TextBlockRenderer block={{ ...baseBlock, content: 'Simple paragraph without markdown.' }} />
  </YStack>
);

export const WithMarkdown = () => (
  <YStack gap="$4" p="$4">
    <Text variant="meta">TextBlock — With Markdown</Text>
    <TextBlockRenderer
      block={{
        ...baseBlock,
        content: 'This supports **bold**, *italic*, ***bold+italic***, and blockquotes:\n\n> This is a blockquote',
      }}
    />
  </YStack>
);

export const LargeText = () => (
  <YStack gap="$4" p="$4">
    <Text variant="meta">TextBlock — Large Font</Text>
    <TextBlockRenderer
      block={{
        ...baseBlock,
        content: 'Large text block with right alignment.',
        styles: { fontSize: 'xlarge', align: 'right' },
      }}
    />
  </YStack>
);
