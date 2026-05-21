import React from 'react';
import { YStack, Text } from 'tamagui';
import { HtmlBlockRenderer } from './HtmlBlock';

const baseBlock = {
  id: 'html-0001',
  type: 'html' as const,
  htmlContent: '<p style="color: #cbd5e1;">This is <strong>HTML content</strong> rendered inside the block.</p>',
  styles: {},
};

export const Default = () => (
  <YStack gap="$4" p="$4" maxWidth={600}>
    <Text variant="meta">HtmlBlock — Default</Text>
    <HtmlBlockRenderer block={baseBlock} />
  </YStack>
);

export const WithIframe = () => (
  <YStack gap="$4" p="$4" maxWidth={600}>
    <Text variant="meta">HtmlBlock — With Embed</Text>
    <HtmlBlockRenderer
      block={{
        ...baseBlock,
        htmlContent:
          '<div><p>Embedded tweet or codepen:</p><blockquote class="twitter-tweet"><p>Hello world</p></blockquote></div>',
      }}
    />
  </YStack>
);
