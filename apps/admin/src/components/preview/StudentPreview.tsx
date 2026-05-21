import React, { useMemo } from 'react';
import { YStack, XStack, TextBlockRenderer, QuoteBlockRenderer, Icon, Text } from '@projeto/ui';
import { AnyBlock } from '@projeto/types';

const PAGE_W = 860;

interface Layout {
  x: number;
  y: number;
  w: number;
  h: number;
  zIndex: number;
}

const getLayout = (block: AnyBlock): Layout => {
  return block.layouts?.desktop || { x: 40, y: 40, w: 700, h: 150, zIndex: 0 };
};

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

const PAGE_H_PADDING = 80;

interface StudentPreviewProps {
  blocks: AnyBlock[];
}

export const StudentPreview: React.FC<StudentPreviewProps> = ({ blocks }) => {
  const pageH = useMemo(() => {
    if (!blocks.length) return 600;
    const maxBottom = Math.max(...blocks.map(b => {
      const l = getLayout(b);
      return l.y + l.h;
    }));
    return maxBottom + PAGE_H_PADDING;
  }, [blocks]);

  if (!blocks.length) return null;

  return (
    <YStack width="100%" ai="center" overflow="hidden">
      <YStack
        position="relative"
        width={PAGE_W}
        style={{ maxWidth: '100%' }}
        height={pageH}
      >
        {blocks.map(block => {
          const l = getLayout(block);
          return (
            <YStack
              key={block.id}
              position="absolute"
              style={{
                left: l.x,
                top: l.y,
                width: l.w,
                height: l.h,
                zIndex: l.zIndex + 1,
              }}
            >
              {block.type === 'text' && <TextBlockRenderer block={block} />}
              {block.type === 'heading' && (() => {
                const h = block as any;
                const tag = h.level === 1 ? 'h1' : h.level === 2 ? 'h2' : 'h3';
                return React.createElement(tag, {
                  style: {
                    margin: '12px 0',
                    fontWeight: 700,
                    lineHeight: 1.3,
                    color: h.styles?.color || undefined,
                    fontFamily: h.styles?.fontFamily || undefined,
                    textAlign: h.styles?.align || undefined,
                  },
                }, h.content);
              })()}
              {block.type === 'divider' && <div style={{ width: '100%', height: 1, borderTop: `${(block as any).styles?.thickness || 1}px ${(block as any).styles?.style || 'solid'} ${(block as any).styles?.color || '#e2e8f0'}`, margin: '16px 0' }} />}
              {block.type === 'video' && <VideoPreview block={block} />}
              {block.type === 'quiz' && <QuizPreview block={block} />}
              {block.type === 'quote' && <QuoteBlockRenderer block={block} />}
              {block.type === 'image' && <ImagePreview block={block} />}
              {block.type === 'html' && <HtmlPreview block={block} />}
            </YStack>
          );
        })}
      </YStack>
    </YStack>
  );
};
