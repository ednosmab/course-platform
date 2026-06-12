import React from 'react';
import { YStack, Text } from 'tamagui';
import { VideoBlockRenderer } from './VideoBlock';

const baseBlock = {
  id: 'vid-0001',
  type: 'video' as const,
  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  provider: 'youtube' as const,
  styles: {},
};

export const YouTube = () => (
  <YStack gap="$4" p="$4" maxWidth={600}>
    <Text variant="meta">VideoBlock — YouTube</Text>
    <VideoBlockRenderer block={baseBlock} />
  </YStack>
);

export const DirectVideo = () => (
  <YStack gap="$4" p="$4" maxWidth={600}>
    <Text variant="meta">VideoBlock — Direct URL</Text>
    <VideoBlockRenderer block={{ ...baseBlock, url: 'https://example.com/video.mp4', provider: 'direct' as const }} />
  </YStack>
);
