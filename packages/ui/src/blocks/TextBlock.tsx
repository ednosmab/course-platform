import React from 'react';
import { YStack, Text } from 'tamagui';
import { TextBlock } from '@projeto/types';
import { renderSimpleMarkdown } from '../utils/markdown';

type Props = {
  block: TextBlock;
};

export const TextBlockRenderer: React.FC<Props> = ({ block }) => {
  const fontSize =
    block.styles?.fontSize === 'small' ? 12
    : block.styles?.fontSize === 'large' ? 18
    : block.styles?.fontSize === 'xlarge' ? 24
    : 14;

  const textAlign = block.styles?.align || 'left';

  return (
    <YStack px="$2">
      {renderSimpleMarkdown(block.content, {
        color: '$gray9',
        lineHeight: 22,
        fontSize,
        textAlign,
      })}
    </YStack>
  );
};
