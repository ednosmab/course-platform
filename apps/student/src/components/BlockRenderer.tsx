import React from 'react';
import { DimensionValue } from 'react-native';
import {
  YStack,
  XStack,
  TextBlockRenderer,
  QuoteBlockRenderer,
} from '@projeto/ui';
import {
  VideoBlockRenderer,
  QuizBlockRenderer,
  ImageBlockRenderer,
  HtmlBlockRenderer,
} from '@projeto/ui/native';
import { AnyBlock } from '@projeto/types';

interface Layout {
  x: number;
  y: number;
  w: number;
  h: number;
  zIndex: number;
}

const getLayout = (block: AnyBlock): Layout => {
  return (block as any).layouts?.desktop || { x: 0, y: 0, w: 700, h: 150, zIndex: 0 };
};

function groupBlocksByRow(blocks: AnyBlock[]): AnyBlock[][] {
  if (!blocks.length) return [];
  const sorted = [...blocks].sort((a, b) => getLayout(a).y - getLayout(b).y);
  const rows: AnyBlock[][] = [];
  let row = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const bl = getLayout(sorted[i]);
    const overlaps = row.some(rb => {
      const rl = getLayout(rb);
      return bl.y < rl.y + rl.h && bl.y + bl.h > rl.y;
    });
    if (overlaps) {
      row.push(sorted[i]);
    } else {
      rows.push([...row].sort((a, b) => getLayout(a).x - getLayout(b).x));
      row = [sorted[i]];
    }
  }
  rows.push([...row].sort((a, b) => getLayout(a).x - getLayout(b).x));
  return rows;
}

interface BlockRendererProps {
  blocks: AnyBlock[];
  onVideoProgress?: (progressSec: number, durationSec: number) => void;
  savedPosition?: number;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({ blocks, onVideoProgress, savedPosition = 0 }) => {
  const rows = groupBlocksByRow(blocks);

  return (
    <YStack width="100%" gap="$4">
      {rows.map((row, ri) => {
        const totalW = row.reduce((s, b) => s + getLayout(b).w, 0);
        return (
          <XStack key={`row-${ri}`} flexWrap="wrap" gap="$3" ai="flex-start" width="100%">
            {row.map((block) => {
              const l = getLayout(block);
              const flexBasis = `${Math.max(40, Math.round((l.w / totalW) * 100))}%`;

              return (
                <YStack
                  key={block.id}
                  flexGrow={1}
                  flexShrink={1}
                  flexBasis={flexBasis as DimensionValue}
                  minWidth={140}
                >
                  {block.type === 'text' && <TextBlockRenderer block={block} />}
                  {block.type === 'video' && (
                    <VideoBlockRenderer
                      block={block}
                      onVideoProgress={onVideoProgress}
                      savedPosition={savedPosition}
                    />
                  )}
                  {block.type === 'quiz' && <QuizBlockRenderer block={block} />}
                  {block.type === 'quote' && <QuoteBlockRenderer block={block} />}
                  {block.type === 'image' && <ImageBlockRenderer block={block} />}
                  {block.type === 'html' && <HtmlBlockRenderer block={block} />}
                </YStack>
              );
            })}
          </XStack>
        );
      })}
    </YStack>
  );
};
