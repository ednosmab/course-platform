import React, { useMemo, useRef, useEffect, useState } from 'react';
import { YStack } from '@projeto/ui';
import { AnyBlock } from '@projeto/types';
import { blockToHtml, getBlockLayout, calcPageHeight, PAGE_W } from '@projeto/core';

interface BlockRendererProps {
  blocks: AnyBlock[];
  onVideoProgress?: (progressSec: number, durationSec: number) => void;
  savedPosition?: number;
}

function HtmlBlockFrame({ html }: { html: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(200);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
    const checkHeight = () => {
      const body = doc.body;
      if (body) {
        const h = Math.max(body.scrollHeight, 200);
        setHeight(h);
      }
    };
    checkHeight();
    const timer = setTimeout(checkHeight, 500);
    return () => clearTimeout(timer);
  }, [html]);

  return (
    <iframe
      ref={iframeRef}
      style={{
        width: '100%',
        height,
        border: 'none',
        borderRadius: 8,
        overflow: 'auto',
      }}
      sandbox="allow-scripts allow-same-origin"
      title="html-block"
    />
  );
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({ blocks, onVideoProgress, savedPosition = 0 }) => {
  const pageH = useMemo(() => calcPageHeight(blocks), [blocks]);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!blocks.length) return null;

  return (
    <YStack width="100%" ai="center" overflow="hidden">
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: PAGE_W,
          maxWidth: '100%',
          height: pageH,
          overflow: 'visible',
          margin: '0 auto',
        }}
      >
        {blocks.map(block => {
          const l = getBlockLayout(block);

          if (block.type === 'html') {
            return (
              <div
                key={block.id}
                style={{
                  position: 'absolute',
                  left: l.x,
                  top: l.y,
                  width: l.w,
                  height: l.h,
                  zIndex: l.zIndex + 1,
                }}
              >
                <HtmlBlockFrame html={(block as any).htmlContent || ''} />
              </div>
            );
          }

          return (
            <div
              key={block.id}
              style={{
                position: 'absolute',
                left: l.x,
                top: l.y,
                width: l.w,
                height: l.h,
                zIndex: l.zIndex + 1,
                overflow: 'hidden',
              }}
              dangerouslySetInnerHTML={{ __html: blockToHtml(block) }}
            />
          );
        })}
      </div>
    </YStack>
  );
};
