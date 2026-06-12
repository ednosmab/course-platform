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
  const color = (block.styles as any)?.color || '$gray9';
  const backgroundColor = (block.styles as any)?.backgroundColor;
  const fontFamily = (block.styles as any)?.fontFamily;
  const bold = (block.styles as any)?.bold;
  const italic = (block.styles as any)?.italic;

  return (
    <YStack
      px="$2"
      backgroundColor={backgroundColor || 'transparent'}
      borderRadius="$2"
    >
      {renderSimpleMarkdown(block.content, {
        color,
        lineHeight: 22,
        fontSize,
        textAlign,
        fontFamily: fontFamily || '$body',
        fontWeight: bold ? 'bold' : '400',
        fontStyle: italic ? 'italic' : 'normal',
      })}
    </YStack>
  );
};
