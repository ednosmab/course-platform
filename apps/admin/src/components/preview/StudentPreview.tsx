import React, { useMemo, useState, useEffect, useRef } from 'react';
import { YStack, Text } from '@projeto/ui';
import { AnyBlock } from '@projeto/types';
import { blockToHtml, getBlockLayout, calcPageHeight, getDesignWidth } from '@projeto/core';

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
        setHeight(Math.max(body.scrollHeight, 200));
      }
    };
    checkHeight();
    const timer = setTimeout(checkHeight, 500);
    return () => clearTimeout(timer);
  }, [html]);

  return (
    <iframe
      ref={iframeRef}
      style={{ width: '100%', height, border: 'none', borderRadius: 8, overflow: 'auto' }}
      sandbox="allow-scripts allow-same-origin"
      title="html-block"
    />
  );
}

interface StudentPreviewProps {
  blocks: AnyBlock[];
}

export const StudentPreview: React.FC<StudentPreviewProps> = ({ blocks }) => {
  const [containerWidth, setContainerWidth] = useState(860);

  const designWidth = useMemo(() => getDesignWidth(containerWidth), [containerWidth]);
  const pageH = useMemo(() => calcPageHeight(blocks, containerWidth), [blocks, containerWidth]);

  const scale = useMemo(() => {
    return Math.min(1, containerWidth / designWidth);
  }, [containerWidth, designWidth]);

  const onLayout = (e: any) => {
    const w = e.nativeEvent?.layout?.width;
    if (w) {
      setContainerWidth(w);
    }
  };

  if (!blocks.length) return null;

  return (
    <YStack
      width="100%"
      onLayout={onLayout}
      overflow="hidden"
      height={pageH * scale}
      position="relative"
    >
      {/* Left-aligned to match student app BlockRenderer behavior */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: designWidth,
          height: pageH,
          backgroundColor: 'white',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          overflow: 'visible',
        }}
      >
        {blocks.map(block => {
          const l = getBlockLayout(block, containerWidth);

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
