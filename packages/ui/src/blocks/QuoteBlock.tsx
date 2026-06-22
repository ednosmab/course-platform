import React from 'react';
import { YStack, XStack, Text } from 'tamagui';
import type { QuoteBlock } from '@projeto/types';

type Props = {
  block: QuoteBlock;
};

export const QuoteBlockRenderer: React.FC<Props> = ({ block }) => {
  const fontSize =
    block.styles?.fontSize === 'small' ? 12
    : block.styles?.fontSize === 'large' ? 18
    : block.styles?.fontSize === 'xlarge' ? 24
    : 14;

  const textAlign = block.styles?.align || 'left';
  const color = block.styles?.color || '$gray6';
  const backgroundColor = block.styles?.backgroundColor || '$gray1';

  return (
    <YStack
      backgroundColor={backgroundColor}
      borderLeftColor="$info"
      borderLeftWidth={4}
      pl="$3"
      py="$3"
      pr="$3"
      my="$3"
      borderRadius="$2"
    >
      <Text fontSize={fontSize} textAlign={textAlign} color={color} fontStyle="italic" lineHeight={20}>
        {block.content}
      </Text>
      {block.author ? (
        <Text fontSize={11} textAlign={textAlign} color="$gray4" mt="$1.5" fontWeight="500">
          — {block.author}
        </Text>
      ) : null}
    </YStack>
  );
};
