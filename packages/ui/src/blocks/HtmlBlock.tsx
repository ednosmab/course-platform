import React from 'react';
import { Platform } from 'react-native';
import { YStack, Text } from 'tamagui';
import { HtmlBlock } from '@projeto/types';

type Props = {
  block: HtmlBlock;
};

export const HtmlBlockRenderer: React.FC<Props> = ({ block }) => {
  const htmlContent = block.htmlContent || '';

  if (Platform.OS === 'web') {
    return (
      <YStack my="$3" width="100%">
        <div
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          style={{ width: '100%', color: '#cbd5e1' }}
        />
      </YStack>
    );
  }

  const cleanText = htmlContent.replace(/<[^>]*>?/gm, '');
  return (
    <YStack
      p="$3"
      bg="$surface"
      borderRadius="$4"
      my="$3"
      borderLeftColor="$primary"
      borderLeftWidth={3}
    >
      <Text color="$gray3" fontSize={13} lineHeight={18}>
        {cleanText}
      </Text>
    </YStack>
  );
};
