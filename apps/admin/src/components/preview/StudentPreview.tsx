import React from 'react';
import { YStack, XStack, TextBlockRenderer, QuoteBlockRenderer, Icon, Text } from '@projeto/ui';
import { AnyBlock } from '@projeto/types';

interface Layout {
  x: number;
  y: number;
  w: number;
  h: number;
  zIndex: number;
}

const getLayout = (block: AnyBlock): Layout => {
  return block.layouts?.desktop || { x: 0, y: 0, w: 700, h: 150, zIndex: 0 };
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

function VideoPreview({ block }: { block: AnyBlock }) {
  const b = block as AnyBlock & { provider?: string };
  return (
    <YStack bg="$surface" br="$2" overflow="hidden" ai="center" jc="center" height={200} position="relative">
      <Icon name="PlayCircle" size={48} color="$textMuted" />
      <Text position="absolute" bottom={8} left={12} fontSize={11} color="$textMuted" opacity={0.6}>
        {b.provider || 'video'}
      </Text>
    </YStack>
  );
}

function ImagePreview({ block }: { block: AnyBlock }) {
  const b = block as AnyBlock & { url?: string; alt?: string };
  if (!b.url) return null;
  const align = ((block as unknown as { styles?: Record<string, unknown> }).styles?.align as string) || 'center';
  return (
    <YStack ai={align as 'flex-start' | 'flex-end' | 'center'} my="$2">
      <img
        src={b.url}
        alt={b.alt || ''}
        style={{ maxWidth: '100%', borderRadius: 8, display: 'block' }}
      />
    </YStack>
  );
}

function HtmlPreview({ block }: { block: AnyBlock }) {
  const htmlContent = (block as AnyBlock & { htmlContent?: string }).htmlContent || '';
  return (
    <YStack my="$2" width="100%">
      <div
        style={{ width: '100%' }}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </YStack>
  );
}

function QuizPreview({ block }: { block: AnyBlock }) {
  const b = block as AnyBlock & { question?: string; options?: Array<{ id: string; text: string; isCorrect: boolean }> };
  return (
    <YStack
      bg="$surface"
      br="$2"
      p="$3"
      borderWidth={1}
      borderColor="$border"
      my="$2"
    >
      <XStack ai="center" gap={6} mb="$2">
        <Text fontSize={10} fontWeight="$7" color="$primary" textTransform="uppercase" letterSpacing={1}>
          QUIZ
        </Text>
        <Text fontSize={14}>{b.question}</Text>
      </XStack>
      <YStack gap={4}>
        {(b.options || []).map((opt, i) => (
          <XStack
            key={opt.id}
            ai="center"
            p={6}
            br="$1"
            borderWidth={1}
            borderColor={opt.isCorrect ? '$success' : '$border'}
            bg={opt.isCorrect ? '#ECFDF5' : '$card'}
            gap={6}
          >
            <Text fontSize={12} fontWeight="$6" color="$textMuted" width={16}>
              {String.fromCharCode(65 + i)}
            </Text>
            <Text fontSize={13} color={opt.isCorrect ? '$success' : '$text'}>
              {opt.text}
            </Text>
          </XStack>
        ))}
      </YStack>
    </YStack>
  );
}

interface StudentPreviewProps {
  blocks: AnyBlock[];
}

export const StudentPreview: React.FC<StudentPreviewProps> = ({ blocks }) => {
  const rows = groupBlocksByRow(blocks);

  return (
    <YStack width="100%" gap="$4" p={24}>
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
                  flexBasis={flexBasis as unknown as number | string}
                  minWidth={140}
                >
                  {block.type === 'text' && <TextBlockRenderer block={block} />}
                  {block.type === 'video' && <VideoPreview block={block} />}
                  {block.type === 'quiz' && <QuizPreview block={block} />}
                  {block.type === 'quote' && <QuoteBlockRenderer block={block} />}
                  {block.type === 'image' && <ImagePreview block={block} />}
                  {block.type === 'html' && <HtmlPreview block={block} />}
                </YStack>
              );
            })}
          </XStack>
        );
      })}
    </YStack>
  );
};
