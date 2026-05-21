import React, { useMemo } from 'react';
import { YStack, Text, TextBlockRenderer, QuoteBlockRenderer } from '@projeto/ui';
import { VideoBlockRenderer, QuizBlockRenderer, ImageBlockRenderer, HtmlBlockRenderer } from '@projeto/ui/native';
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

const PAGE_H_PADDING = 80;

interface BlockRendererProps {
  blocks: AnyBlock[];
  onVideoProgress?: (progressSec: number, durationSec: number) => void;
  savedPosition?: number;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({ blocks, onVideoProgress, savedPosition = 0 }) => {
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
              {block.type === 'heading' && (() => {
                const h = block as any;
                const size = h.level === 1 ? 28 : h.level === 2 ? 22 : 18;
                return (
                  <Text fontSize={size} fontWeight="700" lineHeight={size * 1.3} my="$3" color={h.styles?.color || '$text'} fontFamily={h.styles?.fontFamily || '$display'} textAlign={h.styles?.align || 'left'}>
                    {h.content}
                  </Text>
                );
              })()}
              {block.type === 'divider' && (
                <YStack
                  my="$4"
                  borderBottomWidth={(block as any).styles?.thickness || 1}
                  borderColor={(block as any).styles?.color || '$border'}
                  borderStyle={(block as any).styles?.style || 'solid'}
                />
              )}
            </YStack>
          );
        })}
      </YStack>
    </YStack>
  );
};
