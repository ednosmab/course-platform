import React from 'react';
import { YStack, XStack, Text } from 'tamagui';
import { QuoteBlockRenderer } from './QuoteBlock';

const baseBlock = {
  id: '00000000-0000-0000-0000-000000000002',
  type: 'quote' as const,
  layout: { x: 0, y: 0, w: 600, h: 100, zIndex: 0 },
};

export const Default = () => (
  <YStack gap="$4" p="$4">
    <Text variant="meta">QuoteBlock — Default</Text>
    <QuoteBlockRenderer
      block={{
        ...baseBlock,
        content: 'This is a default quote without an author.',
      }}
    />
  </YStack>
);

export const WithAuthor = () => (
  <YStack gap="$4" p="$4">
    <Text variant="meta">QuoteBlock — With Author</Text>
    <QuoteBlockRenderer
      block={{
        ...baseBlock,
        content: 'The best way to predict the future is to invent it.',
        author: 'Alan Kay',
      }}
    />
  </YStack>
);

export const Styled = () => (
  <YStack gap="$4" p="$4">
    <Text variant="meta">QuoteBlock — Custom Styles</Text>
    <QuoteBlockRenderer
      block={{
        ...baseBlock,
        content: 'Large, centered quote with custom colors.',
        author: 'Unknown',
        styles: {
          fontSize: 'xlarge',
          align: 'center',
          color: '#6366f1',
          backgroundColor: '#eef2ff',
        },
      }}
    />
  </YStack>
);
