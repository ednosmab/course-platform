'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { YStack, XStack, Text, Icon, Spinner, Button, CertificateBlockRenderer } from '@projeto/ui';
import { useEditor } from '../../context/EditorContext';
import { AnyBlock } from '@projeto/types';

const CANVAS_W = 1100;
const PAGE_W = 1100;
const A4_RATIO = 1.414;
const MOBILE_W = 390;
const TABLET_W = 650;
const MOBILE_H = 720;
const MIN_W = 80;
const MIN_H = 40;
const ALIGN_THRESHOLD = 5;

function isOutOfBounds(block: AnyBlock, pageW: number): boolean {
  const l = getLayout(block);
  return l.x < 0 || l.x + l.w > pageW || l.y < 0;
}

function parseSimpleMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];

  const lines = text.split('\n');
  const renderedLines: React.ReactNode[] = [];

  const parseInline = (inlineText: string, keyPrefix: string): React.ReactNode[] => {
    const regex = /(\*\*\*.*?\*\*\*|___.*?___|\*\*\_.*?\_\*\*|\_\*\*.*?\*\*\_|\*\*.*?\*\*|__.*?__|\*.*?\*|_.*?_)/g;
    const parts = inlineText.split(regex);
    return parts.map((part, index) => {
      const k = `${keyPrefix}-${index}`;
      if (part.startsWith('***') && part.endsWith('***')) {
        return <strong key={k}><em>{part.slice(3, -3)}</em></strong>;
      }
      if (part.startsWith('___') && part.endsWith('___')) {
        return <strong key={k}><em>{part.slice(3, -3)}</em></strong>;
      }
      if (part.startsWith('**_') && part.endsWith('_**')) {
        return <strong key={k}><em>{part.slice(3, -3)}</em></strong>;
      }
      if (part.startsWith('_**') && part.endsWith('**_')) {
        return <strong key={k}><em>{part.slice(3, -3)}</em></strong>;
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={k}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('__') && part.endsWith('__')) {
        return <strong key={k}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={k}>{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('_') && part.endsWith('_')) {
        return <em key={k}>{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  lines.forEach((line, lineIdx) => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('>') || trimmedLine.startsWith('&gt;')) {
      const cleanContent = trimmedLine.startsWith('&gt;') ? trimmedLine.slice(4).trim() : trimmedLine.slice(1).trim();
      renderedLines.push(
        <blockquote
          key={lineIdx}
          style={{
            borderLeft: '4px solid var(--accent-blue)',
            paddingLeft: '12px', margin: '8px 0',
            fontStyle: 'italic', color: 'var(--text-secondary)',
            backgroundColor: 'var(--bg-canvas)',
            padding: '6px 12px',
            borderRadius: '0 6px 6px 0',
          }}
        >
          {parseInline(cleanContent, `quote-inline-${lineIdx}`)}
        </blockquote>
      );
    } else {
      renderedLines.push(
        <div key={lineIdx} style={{ minHeight: '1.2em' }}>
          {parseInline(line, `inline-${lineIdx}`)}
        </div>
      );
    }
  });

  return renderedLines;
}

type HandleDir = 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se';

interface Layout { x: number; y: number; w: number; h: number; zIndex: number; }
interface MeasureGuide { pos: number; start: number; end: number; value: number; orientation: 'h' | 'v'; }

function getLayout(block: AnyBlock, viewport?: 'desktop' | 'tablet' | 'mobile'): Layout {
  const vp = viewport || 'desktop';
  const layouts = block.layouts;
  const l = layouts?.[vp];
  return {
    x: typeof l?.x === 'number' ? l.x : 40,
    y: typeof l?.y === 'number' ? l.y : 40,
    w: typeof l?.w === 'number' ? l.w : 600,
    h: typeof l?.h === 'number' ? l.h : 120,
    zIndex: typeof l?.zIndex === 'number' ? l.zIndex : 0,
  };
}

function computeBlockGuides(
  draggedLayout: Layout, draggedBlockId: string,
  blocks: AnyBlock[], viewportMode: 'desktop' | 'tablet' | 'mobile',
): { v: number[]; h: number[]; m: MeasureGuide[] } {
  const pageH = Math.max(800, ...blocks.map(b => {
    const l = getLayout(b, viewportMode);
    return l.y + l.h + 120;
  }));
  const dcx = draggedLayout.x + draggedLayout.w / 2;
  const dcy = draggedLayout.y + draggedLayout.h / 2;
  const dr = draggedLayout.x + draggedLayout.w;
  const db = draggedLayout.y + draggedLayout.h;

  const vSet = new Set<number>();
  const hSet = new Set<number>();
  const measurements: MeasureGuide[] = [];

  if (Math.abs(dcx - CANVAS_W / 2) < ALIGN_THRESHOLD) vSet.add(CANVAS_W / 2);
  if (Math.abs(dcy - pageH / 2) < ALIGN_THRESHOLD) hSet.add(pageH / 2);

  interface Nearest { edge: number; oStart: number; oEnd: number; }
  let left: Nearest | null = null;
  let right: Nearest | null = null;
  let above: Nearest | null = null;
  let below: Nearest | null = null;

  for (const block of blocks) {
    if (block.id === draggedBlockId) continue;
    const l = getLayout(block, viewportMode);
    const br = l.x + l.w;
    const bb = l.y + l.h;

    if (Math.abs(dcx - (l.x + l.w / 2)) < ALIGN_THRESHOLD) vSet.add(l.x + l.w / 2);
    if (Math.abs(draggedLayout.x - l.x) < ALIGN_THRESHOLD) vSet.add(l.x);
    if (Math.abs(dr - br) < ALIGN_THRESHOLD) vSet.add(br);
    if (Math.abs(dcy - (l.y + l.h / 2)) < ALIGN_THRESHOLD) hSet.add(l.y + l.h / 2);
    if (Math.abs(draggedLayout.y - l.y) < ALIGN_THRESHOLD) hSet.add(l.y);
    if (Math.abs(db - bb) < ALIGN_THRESHOLD) hSet.add(bb);

    const vyOverlap = Math.min(db, bb) - Math.max(draggedLayout.y, l.y);
    const vxOverlap = Math.min(dr, br) - Math.max(draggedLayout.x, l.x);

    if (vyOverlap > 0 && br <= draggedLayout.x && (!left || br > left.edge))
      left = { edge: br, oStart: Math.max(draggedLayout.y, l.y), oEnd: Math.min(db, bb) };
    if (vyOverlap > 0 && l.x >= dr && (!right || l.x < right.edge))
      right = { edge: l.x, oStart: Math.max(draggedLayout.y, l.y), oEnd: Math.min(db, bb) };
    if (vxOverlap > 0 && bb <= draggedLayout.y && (!above || bb > above.edge))
      above = { edge: bb, oStart: Math.max(draggedLayout.x, l.x), oEnd: Math.min(dr, br) };
    if (vxOverlap > 0 && l.y >= db && (!below || l.y < below.edge))
      below = { edge: l.y, oStart: Math.max(draggedLayout.x, l.x), oEnd: Math.min(dr, br) };
  }

  if (left) measurements.push({ orientation: 'h', pos: (left.oStart + left.oEnd) / 2, start: left.edge, end: draggedLayout.x, value: Math.round(draggedLayout.x - left.edge) });
  if (right) measurements.push({ orientation: 'h', pos: (right.oStart + right.oEnd) / 2, start: dr, end: right.edge, value: Math.round(right.edge - dr) });
  if (above) measurements.push({ orientation: 'v', pos: (above.oStart + above.oEnd) / 2, start: above.edge, end: draggedLayout.y, value: Math.round(draggedLayout.y - above.edge) });
  if (below) measurements.push({ orientation: 'v', pos: (below.oStart + below.oEnd) / 2, start: db, end: below.edge, value: Math.round(below.edge - db) });

  return { v: Array.from(vSet), h: Array.from(hSet), m: measurements };
}

const HANDLES: { id: HandleDir; cursor: string; style: React.CSSProperties }[] = [
  { id: 'nw', cursor: 'nw-resize', style: { top: -5, left: -5 } },
  { id: 'n', cursor: 'n-resize', style: { top: -5, left: '50%', transform: 'translateX(-50%)' } },
  { id: 'ne', cursor: 'ne-resize', style: { top: -5, right: -5 } },
  { id: 'w', cursor: 'w-resize', style: { top: '50%', left: -5, transform: 'translateY(-50%)' } },
  { id: 'e', cursor: 'e-resize', style: { top: '50%', right: -5, transform: 'translateY(-50%)' } },
  { id: 'sw', cursor: 'sw-resize', style: { bottom: -5, left: -5 } },
  { id: 's', cursor: 's-resize', style: { bottom: -5, left: '50%', transform: 'translateX(-50%)' } },
  { id: 'se', cursor: 'se-resize', style: { bottom: -5, right: -5 } },
];

const FONT_DESKTOP: Record<string, string> = { small: '13px', medium: '16px', large: '24px', xlarge: '32px' };
const FONT_MOBILE: Record<string, string> = { small: '12px', medium: '15px', large: '19px', xlarge: '24px' };

function BlockContent({ block, onImageDrop, isMobile = false, isInteracting = false, isEditing = false, onEditComplete }: {
  block: AnyBlock;
  onImageDrop?: (blockId: string, file: File) => void;
  isMobile?: boolean;
  isInteracting?: boolean;
  isEditing?: boolean;
  onEditComplete?: (content: string) => void;
}) {
  if (block.type === 'text') {
    const styles = (block.styles || {}) as Record<string, string>;
    const fs = styles.fontSize as string || 'medium';
    const fontSize = isMobile ? FONT_MOBILE[fs] : FONT_DESKTOP[fs];

    const style: React.CSSProperties = {
      fontSize, fontFamily: styles.fontFamily as string || 'inherit',
      color: styles.color as string || 'var(--text-primary)',
      backgroundColor: styles.backgroundColor as string || 'transparent',
      backgroundImage: styles.backgroundImage ? `url(${styles.backgroundImage})` : 'none',
      backgroundSize: 'cover', backgroundPosition: 'center',
      textAlign: (styles.align as React.CSSProperties['textAlign']) || 'left', lineHeight: 1.6,
      width: '100%', height: '100%',
      padding: styles.backgroundColor || styles.backgroundImage ? '16px' : '0',
      borderRadius: styles.backgroundColor || styles.backgroundImage ? '8px' : '0',
      overflow: isMobile ? 'visible' : 'hidden',
    };

    if (isEditing) {
      return (
        <div
          contentEditable
          suppressContentEditableWarning
          style={{
            ...style,
            cursor: 'text',
            outline: 'none',
            userSelect: 'text',
            backgroundColor: 'white',
            border: '1px solid #3B82F6',
            borderRadius: '4px',
            padding: '8px',
          }}
          onBlur={(e) => {
            const html = e.currentTarget.innerHTML.replace(/&nbsp;/g, ' ');
            onEditComplete?.(html);
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {block.content}
        </div>
      );
    }

    let textElement: React.ReactNode;
    if (/<[a-z][\s>]/i.test(block.content)) {
      textElement = <div dangerouslySetInnerHTML={{ __html: block.content }} />;
    } else {
      textElement = <>{parseSimpleMarkdown(block.content)}</>;
    }
    if (styles.bold) textElement = <strong>{textElement}</strong>;
    if (styles.italic) textElement = <em>{textElement}</em>;

    return <div style={style}>{textElement}</div>;
  }
  if (block.type === 'video') {
    return (
      <YStack w="100%" h="100%" bg="$surface" borderRadius="$3" ai="center" jc="center" position="relative" overflow="hidden">
        <XStack w={44} h={44} borderRadius={22} bg="white" ai="center" jc="center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#1e293b" style={{ marginLeft: 3 }}><path d="M5 3l14 9-14 9V3z" /></svg>
        </XStack>
        <Text position="absolute" bottom="$2" left="$3" color="white" fontSize={11} opacity={0.6}>{block.provider}</Text>
      </YStack>
    );
  }
  if (block.type === 'image') {
    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/') && onImageDrop) onImageDrop(block.id, file);
    };
    return (
      <YStack w="100%" h="100%" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
        {block.url ? (
          <img src={block.url} alt={block.alt || ''} style={{ width: '100%', height: '100%', objectFit: (block.styles?.objectFit || (block.styles?.isBackground ? 'cover' : 'fill')) as any, borderRadius: block.styles?.isBackground ? '0px' : '6px', display: 'block' }} />
        ) : (
          <YStack w="100%" h="100%" borderWidth={2} borderColor="$info" borderRadius="$3" borderStyle="dashed" ai="center" jc="center" gap="$2" bg="#eff6ff">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
            <Text fontSize={12} color="$info" fontWeight="500">Arraste uma imagem aqui</Text>
            <Text fontSize={11}>ou cole a URL no painel →</Text>
          </YStack>
        )}
      </YStack>
    );
  }
  if (block.type === 'heading') {
    const level = ((block as any).level as 1 | 2 | 3) || 2;
    const styles = (block as any).styles || {};
    const tag = level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3';
    const fontSize = { 1: '32px', 2: '24px', 3: '20px' }[level];
    const headingStyle: React.CSSProperties = {
      fontSize, fontWeight: 700, lineHeight: 1.3, margin: 0, padding: 0,
      textAlign: styles.align || 'left', color: styles.color || 'inherit',
      fontFamily: styles.fontFamily || 'inherit', width: '100%', height: '100%',
    };
    if (isEditing) {
      return React.createElement(tag, {
        style: {
          ...headingStyle,
          cursor: 'text',
          outline: 'none',
          backgroundColor: 'white',
          border: '1px solid #3B82F6',
          borderRadius: '4px',
          padding: '8px',
        },
        contentEditable: true,
        suppressContentEditableWarning: true,
        onBlur: (e: React.FocusEvent<HTMLHeadingElement>) => onEditComplete?.(e.currentTarget.textContent || ''),
        onMouseDown: (e: React.MouseEvent) => e.stopPropagation(),
      }, block.content);
    }
    return React.createElement(tag, { style: headingStyle }, block.content);
  }
  if (block.type === 'divider') {
    const s = (block as any).styles || {};
    const thickness = s.thickness ?? 1;
    const borderStyle = s.style || 'solid';
    const color = s.color || '#e2e8f0';
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <hr style={{ width: '100%', border: 'none', borderTop: `${thickness}px ${borderStyle} ${color}`, margin: 0 }} />
      </div>
    );
  }
  if (block.type === 'quote') {
    const styles = ((block as any).styles || {}) as Record<string, string>;
    const fs = styles.fontSize || 'medium';
    const fontSize = isMobile ? FONT_MOBILE[fs] : FONT_DESKTOP[fs];

    const cardStyle = {
      backgroundColor: styles.backgroundColor || 'transparent',
      backgroundImage: styles.backgroundImage ? `url(${styles.backgroundImage})` : 'none',
      backgroundSize: 'cover' as const, backgroundPosition: 'center' as const,
      borderRadius: styles.backgroundColor || styles.backgroundImage ? '8px' : '0',
      padding: styles.backgroundColor || styles.backgroundImage ? '16px' : '0',
      borderLeft: styles.backgroundColor || styles.backgroundImage ? 'none' : '4px solid var(--accent-blue)',
      paddingLeft: styles.backgroundColor || styles.backgroundImage ? '16px' : '16px',
      height: '100%', overflow: 'auto' as const,
      color: styles.color || 'var(--text-secondary)',
      fontFamily: styles.fontFamily || 'inherit',
      textAlign: (styles.align || 'left') as React.CSSProperties['textAlign'],
    } satisfies React.CSSProperties;

    let textElement: React.ReactNode = <>{parseSimpleMarkdown(block.content)}</>;
    if (styles.bold) textElement = <strong>{textElement}</strong>;
    if (styles.italic) textElement = <em>{textElement}</em>;

    return (
      <div style={cardStyle}>
        {(styles.backgroundColor || styles.backgroundImage) && (
          <div style={{ opacity: 0.15, fontSize: '32px', lineHeight: 0.5, marginBottom: '4px', fontFamily: 'serif' }}>“</div>
        )}
        <div style={{ fontSize, fontStyle: 'italic', lineHeight: 1.6 }}>{textElement}</div>
        {block.author && (
          <Text fontSize={11} mt="$2" opacity={0.7} fontWeight="500">— {block.author}</Text>
        )}
      </div>
    );
  }
  if (block.type === 'html') {
    const srcDoc = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}html,body{margin:0;padding:0;width:100%;height:100%;font-family:system-ui,sans-serif;overflow:auto}</style></head><body>${block.htmlContent}</body></html>`;
    return (
      <iframe
        srcDoc={srcDoc}
        title={`html-${block.id}`}
        style={{ width: '100%', height: '100%', border: 'none', display: 'block', pointerEvents: isInteracting ? 'none' : 'auto' }}
        sandbox="allow-scripts allow-same-origin"
      />
    );
  }
  if (block.type === 'quiz') {
    const styles = ((block as any).styles || {}) as Record<string, string>;
    const fs = styles.fontSize || 'medium';
    const fontSize = isMobile ? FONT_MOBILE[fs] : FONT_DESKTOP[fs];

    const cardStyle: React.CSSProperties = {
      backgroundColor: styles.backgroundColor || 'var(--bg-canvas)',
      backgroundImage: styles.backgroundImage ? `url(${styles.backgroundImage})` : 'none',
      backgroundSize: 'cover', backgroundPosition: 'center',
      borderRadius: '8px', padding: '12px',
      border: styles.backgroundColor || styles.backgroundImage ? 'none' : '1px solid var(--border-light)',
      height: '100%', overflow: 'auto',
      color: styles.color || 'var(--text-primary)',
      fontFamily: styles.fontFamily || 'inherit',
    };

    let questionElement: React.ReactNode = <>{parseSimpleMarkdown(block.question)}</>;
    if (styles.bold) questionElement = <strong>{questionElement}</strong>;
    if (styles.italic) questionElement = <em>{questionElement}</em>;

    return (
      <div style={cardStyle}>
        <XStack ai="center" gap={1} mb="$2">
          <XStack borderWidth={1} borderColor="$primary" px={2} py={0} borderRadius={1} bg="white">
            <Text fontSize={9} fontWeight="700" color="$primary">QUIZ</Text>
          </XStack>
          <Text style={{ fontSize, lineHeight: 1.4 }}>{questionElement}</Text>
        </XStack>
        <YStack gap={1}>
          {block.options.map((opt, i) => (
            <XStack key={opt.id} ai="center" p={1} borderRadius={1} borderWidth={1} borderColor={opt.isCorrect ? '$success' : '$border'} bg={opt.isCorrect ? '#ecfdf5' : 'white'}>
              <Text mr={1} fontWeight="600" color="$textMuted" flexShrink={0}>{String.fromCharCode(65 + i)}</Text>
              <Text color={opt.isCorrect ? '#065f46' : '$textSecondary'}>{opt.text}</Text>
            </XStack>
          ))}
        </YStack>
      </div>
    );
  }
  return null;
}

function useViewportInteraction(scale: number) {
  const { blocks, activeBlockId, setActiveBlockId, removeBlock, updateBlock, updateBlockSilent, viewportMode } = useEditor();
  const [isInteracting, setIsInteracting] = useState(false);
  const [guides, setGuides] = useState<{ v: number[]; h: number[]; m: MeasureGuide[] }>({ v: [], h: [], m: [] });
  const interactionRef = useRef<{
    mode: 'move' | 'resize';
    blockId: string;
    handle?: HandleDir;
    startMouseX: number;
    startMouseY: number;
    startLayout: Layout;
    currentLayouts: Record<string, any>;
  } | null>(null);

  const onBlockMouseDown = useCallback((e: React.MouseEvent, block: AnyBlock) => {
    if ((e.target as HTMLElement).dataset.handle) return;
    e.preventDefault();
    e.stopPropagation();
    setActiveBlockId(block.id);
    setIsInteracting(true);
    interactionRef.current = {
      mode: 'move', blockId: block.id,
      startMouseX: e.clientX, startMouseY: e.clientY,
      startLayout: getLayout(block, viewportMode),
      currentLayouts: block.layouts || {},
    };
  }, [setActiveBlockId, viewportMode]);

  const onHandleMouseDown = useCallback((e: React.MouseEvent, block: AnyBlock, handle: HandleDir) => {
    e.preventDefault();
    e.stopPropagation();
    setIsInteracting(true);
    interactionRef.current = {
      mode: 'resize', blockId: block.id, handle,
      startMouseX: e.clientX, startMouseY: e.clientY,
      startLayout: getLayout(block, viewportMode),
      currentLayouts: block.layouts || {},
    };
  }, [viewportMode]);

  useEffect(() => {
    const applyLayout = (e: MouseEvent): Layout | null => {
      if (!interactionRef.current) return null;
      const { mode, handle, startMouseX, startMouseY, startLayout } = interactionRef.current;
      const dx = (e.clientX - startMouseX) / scale;
      const dy = (e.clientY - startMouseY) / scale;
      if (mode === 'move') {
        return { ...startLayout, x: Math.max(0, startLayout.x + dx), y: Math.max(0, startLayout.y + dy) };
      }
      if (mode === 'resize' && handle) {
        let { x, y, w, h, zIndex } = startLayout;
        if (handle.includes('e')) w = Math.max(MIN_W, startLayout.w + dx);
        if (handle.includes('s')) h = Math.max(MIN_H, startLayout.h + dy);
        if (handle.includes('w')) { w = Math.max(MIN_W, startLayout.w - dx); x = startLayout.x + startLayout.w - w; }
        if (handle.includes('n')) { h = Math.max(MIN_H, startLayout.h - dy); y = startLayout.y + startLayout.h - h; }
        return { x, y, w, h, zIndex };
      }
      return null;
    };

    const buildUpdate = (layout: Layout) => {
      const { currentLayouts } = interactionRef.current!;
      return { layouts: { ...currentLayouts, [viewportMode]: layout } } as Partial<AnyBlock>;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!interactionRef.current) return;
      const newLayout = applyLayout(e);
      if (newLayout) {
        updateBlockSilent(interactionRef.current.blockId, buildUpdate(newLayout));
        setGuides(computeBlockGuides(newLayout, interactionRef.current.blockId, blocks, viewportMode));
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!interactionRef.current) return;
      const newLayout = applyLayout(e);
      if (newLayout) updateBlock(interactionRef.current.blockId, buildUpdate(newLayout));
      interactionRef.current = null;
      setIsInteracting(false);
      setGuides({ v: [], h: [], m: [] });
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [updateBlock, updateBlockSilent, scale, viewportMode]);

  return { activeBlockId, setActiveBlockId, removeBlock, updateBlock, isInteracting, onBlockMouseDown, onHandleMouseDown, guides };
}

function renderViewportBlocks(args: {
  blocks: AnyBlock[];
  viewportW: number;
  viewportMode: 'desktop' | 'tablet' | 'mobile';
  onImageDrop?: (id: string, file: File) => void;
  activeBlockId: string | null;
  setActiveBlockId: (id: string | null) => void;
  removeBlock: (id: string) => void;
  duplicateBlock: (id: string) => void;
  isInteracting: boolean;
  onBlockMouseDown: (e: React.MouseEvent, block: AnyBlock) => void;
  onHandleMouseDown: (e: React.MouseEvent, block: AnyBlock, handle: HandleDir) => void;
  guides?: { v: number[]; h: number[]; m: MeasureGuide[] };
}) {
  const scale = args.viewportW / CANVAS_W;
  const pageH = Math.max(800, ...args.blocks.map(b => { const l = getLayout(b, args.viewportMode); return l.y + l.h + 120; }));
  const sortedBlocks = [...args.blocks].sort((a, b) => getLayout(a, args.viewportMode).zIndex - getLayout(b, args.viewportMode).zIndex);

  return (
    <div style={{ position: 'relative', width: args.viewportW, minHeight: pageH * scale }}>
      {sortedBlocks.map((block) => {
        const isActive = block.id === args.activeBlockId;
        const layout = getLayout(block, args.viewportMode);

        return (
          <div
            key={block.id}
            onMouseDown={(e) => args.onBlockMouseDown(e, block)}
            onClick={(e) => { e.stopPropagation(); args.setActiveBlockId(block.id); }}
            style={{ position: 'absolute', left: layout.x * scale, top: layout.y * scale, width: layout.w * scale, height: layout.h * scale, zIndex: layout.zIndex + 1, cursor: 'move', boxSizing: 'border-box', userSelect: 'none', isolation: 'isolate' }}
          >
            <div style={{ position: 'absolute', inset: 0, border: isActive ? '2px solid #3B82F6' : '2px solid transparent', borderRadius: '6px', pointerEvents: 'none', zIndex: 2 }} />
            <div style={{ position: 'absolute', inset: 2, borderRadius: '4px', overflow: 'hidden', zIndex: 1 }}>
              <BlockContent block={block} onImageDrop={args.onImageDrop} isMobile isInteracting={args.isInteracting} />
              {(block.type === 'html' || block.type === 'video') && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 10, cursor: 'move', backgroundColor: 'transparent' }} />
              )}
            </div>
            {isActive && (
              <XStack
                position="absolute" top={-34} right={0} zIndex={20}
                bg="white" borderWidth={1} borderColor="$border" borderRadius={1}
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
                ai="center" gap={0}
              >
                <XStack
                  onPress={(e: any) => { e.stopPropagation(); args.duplicateBlock(block.id); }}
                  role="button"
                  aria-label="Duplicar bloco"
                  tabIndex={0}
                  onKeyDown={(e: any) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); args.duplicateBlock(block.id); } }}
                  px={1} py={1} cursor="pointer"
                >
                  <Icon name="Copy" size={14} color="$textMuted" />
                </XStack>
                <XStack
                  onPress={(e: any) => { e.stopPropagation(); args.removeBlock(block.id); }}
                  role="button"
                  aria-label="Excluir bloco"
                  tabIndex={0}
                  onKeyDown={(e: any) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); args.removeBlock(block.id); } }}
                  px={1} py={1} cursor="pointer"
                >
                  <Icon name="Trash2" size={14} color="$danger" />
                </XStack>
              </XStack>
            )}
            {isActive && HANDLES.map(({ id, cursor, style }) => (
              <div
                key={id}
                data-handle={id}
                onMouseDown={(e) => args.onHandleMouseDown(e, block, id)}
                style={{ position: 'absolute', width: 10, height: 10, backgroundColor: 'white', border: '2px solid #3B82F6', borderRadius: '2px', cursor, zIndex: 30, ...style }}
              />
            ))}
          </div>
        );
      })}
      {args.guides?.v.map((x, i) => (
        <div key={`gv-${i}`} style={{ position: 'absolute', left: x * scale, top: 0, width: 0, height: pageH * scale, borderLeft: '1.5px dashed #3B82F6', opacity: 0.7, pointerEvents: 'none', zIndex: 999 }} />
      ))}
      {args.guides?.h.map((y, i) => (
        <div key={`gh-${i}`} style={{ position: 'absolute', left: 0, top: y * scale, width: args.viewportW, height: 0, borderTop: '1.5px dashed #3B82F6', opacity: 0.7, pointerEvents: 'none', zIndex: 999 }} />
      ))}
      {args.guides?.m.map((m, i) => {
        const s = scale;
        if (m.orientation === 'h') {
          return (
            <React.Fragment key={`gm-${i}`}>
              <div style={{ position: 'absolute', left: m.start * s, top: m.pos * s, width: (m.end - m.start) * s, height: 0, borderTop: '1px dashed #7C3AED', pointerEvents: 'none', zIndex: 998 }} />
              <div style={{ position: 'absolute', left: m.start * s, top: (m.pos * s) - 3, width: 0, height: 6, borderLeft: '1px solid #7C3AED', pointerEvents: 'none', zIndex: 998 }} />
              <div style={{ position: 'absolute', left: m.end * s, top: (m.pos * s) - 3, width: 0, height: 6, borderLeft: '1px solid #7C3AED', pointerEvents: 'none', zIndex: 998 }} />
              <div style={{ position: 'absolute', left: (m.start + m.end) / 2 * s, top: m.pos * s, transform: 'translate(-50%, -50%)', fontSize: 10, color: '#7C3AED', backgroundColor: 'white', padding: '1px 5px', borderRadius: 3, border: '1px solid #7C3AED', fontWeight: 600, zIndex: 1001, whiteSpace: 'nowrap', lineHeight: '14px', pointerEvents: 'none' }}>{m.value}px</div>
            </React.Fragment>
          );
        }
        return (
          <React.Fragment key={`gm-${i}`}>
            <div style={{ position: 'absolute', left: m.pos * s, top: m.start * s, width: 0, height: (m.end - m.start) * s, borderLeft: '1px dashed #7C3AED', pointerEvents: 'none', zIndex: 998 }} />
            <div style={{ position: 'absolute', left: (m.pos * s) - 3, top: m.start * s, width: 6, height: 0, borderTop: '1px solid #7C3AED', pointerEvents: 'none', zIndex: 998 }} />
            <div style={{ position: 'absolute', left: (m.pos * s) - 3, top: m.end * s, width: 6, height: 0, borderTop: '1px solid #7C3AED', pointerEvents: 'none', zIndex: 998 }} />
            <div style={{ position: 'absolute', left: m.pos * s, top: (m.start + m.end) / 2 * s, transform: 'translate(-50%, -50%)', fontSize: 10, color: '#7C3AED', backgroundColor: 'white', padding: '1px 5px', borderRadius: 3, border: '1px solid #7C3AED', fontWeight: 600, zIndex: 1001, whiteSpace: 'nowrap', lineHeight: '14px', pointerEvents: 'none' }}>{m.value}px</div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

function PreviewCanvas({ blocks, viewportMode, mode, certDesignWidth, certDesignHeight }: {
  blocks: AnyBlock[];
  viewportMode: 'desktop' | 'tablet' | 'mobile';
  mode?: 'lesson' | 'certificate';
  certDesignWidth?: number;
  certDesignHeight?: number;
}) {
  const [zoom, setZoom] = useState(1);
  const isCertMode = mode === 'certificate';
  const isMobile = viewportMode === 'mobile';
  const isTablet = viewportMode === 'tablet';
  const isDesktop = viewportMode === 'desktop';

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(z => Math.max(0.25, Math.min(3, z + delta)));
    }
  }, []);

  const zoomLabel = `${Math.round(zoom * 100)}%`;
  const zoomIn = () => setZoom(z => Math.min(3, z + 0.1));
  const zoomOut = () => setZoom(z => Math.max(0.25, z - 0.1));

  const content = (() => {
    if (isCertMode) {
      const pageW = certDesignWidth || 1100;
      const pageH = certDesignHeight || Math.round(1100 / 1.414);
      const sorted = [...blocks].sort((a, b) => getLayout(a).zIndex - getLayout(b).zIndex);
      return (
        <div style={{
          position: 'relative', width: pageW, minHeight: pageH,
          backgroundColor: 'white', borderRadius: 8,
          boxShadow: '0 2px 24px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>
          {sorted.map((block) => {
            const layout = getLayout(block);
            return (
              <div key={block.id} style={{
                position: 'absolute', left: layout.x, top: layout.y,
                width: layout.w, height: layout.h, zIndex: layout.zIndex + 1,
              }}>
                <CertificateBlockRenderer block={block as any} scale={1} fillContainer />
              </div>
            );
          })}
        </div>
      );
    }

    const pageH = Math.max(800, ...blocks.map(b => { const l = getLayout(b, viewportMode); return l.y + l.h + 120; }));
    const sortedBlocks = [...blocks].sort((a, b) => getLayout(a, viewportMode).zIndex - getLayout(b, viewportMode).zIndex);
    if (isDesktop) {
      return (
        <div style={{ position: 'relative', width: PAGE_W, minHeight: pageH, backgroundColor: 'white', borderRadius: 8, boxShadow: '0 2px 24px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.06)' }}>
          {sortedBlocks.map((block) => {
            const layout = getLayout(block, viewportMode);
            return (
              <div key={block.id} style={{ position: 'absolute', left: layout.x, top: layout.y, width: layout.w, height: layout.h, zIndex: layout.zIndex + 1 }}>
                <BlockContent block={block} isMobile={false} />
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <YStack w={isMobile ? MOBILE_W : TABLET_W} maxWidth={isMobile ? MOBILE_W : TABLET_W} bg="white" borderRadius={isMobile ? 36 : 12} style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }} overflow="hidden" borderWidth={6} borderColor="$surface" maxHeight="80vh">
        {isMobile ? (
          <XStack bg="$surface" height={28} ai="center" jc="center" flexShrink={0}>
            <XStack w={60} height={6} borderRadius={3} bg="$gray6" />
          </XStack>
        ) : (
          <XStack bg="$surface" px="$4" py={1} ai="center" jc="center" flexShrink={0}>
            <XStack w={8} h={8} borderRadius={4} bg="$background" borderWidth={1} borderColor="$gray7" />
            <Text ml="auto" fontSize={10} color="$gray4">Preview Tablet</Text>
          </XStack>
        )}
        <YStack overflowY="auto" overflowX="hidden" flex={1}>
          <div style={{ position: 'relative', width: (isMobile ? MOBILE_W : TABLET_W), minHeight: pageH * ((isMobile ? MOBILE_W : TABLET_W) / CANVAS_W) }}>
            {sortedBlocks.map((block) => {
              const layout = getLayout(block, viewportMode);
              const scale = (isMobile ? MOBILE_W : TABLET_W) / CANVAS_W;
              return (
                <div key={block.id} style={{ position: 'absolute', left: layout.x * scale, top: layout.y * scale, width: layout.w * scale, height: layout.h * scale, zIndex: layout.zIndex + 1 }}>
                  <BlockContent block={block} isMobile={!isDesktop} />
                </div>
              );
            })}
          </div>
        </YStack>
        <XStack bg="white" height={isMobile ? 20 : 16} ai="center" jc="center" flexShrink={0}>
          <XStack w={40} height={4} borderRadius={2} bg="$gray2" />
        </XStack>
      </YStack>
    );
  })();

  return (
    <YStack flex={1} bg="$background" onWheel={handleWheel}>
      <XStack ai="center" jc="center" gap="$2" p="$2" borderBottomWidth={1} borderBottomColor="$border" bg="$background" flexShrink={0}>
        <XStack
          w={28} h={26} ai="center" jc="center" cursor="pointer"
          borderWidth={1} borderColor="$border" borderRadius="$2"
          hoverStyle={{ bg: '$secondary' }}
          onPress={zoomOut}
        >
          <Icon name="ZoomOut" size={14} />
        </XStack>
        <Text fontSize={12} w={44} textAlign="center" userSelect="none">{zoomLabel}</Text>
        <XStack
          w={28} h={26} ai="center" jc="center" cursor="pointer"
          borderWidth={1} borderColor="$border" borderRadius="$2"
          hoverStyle={{ bg: '$secondary' }}
          onPress={zoomIn}
        >
          <Icon name="ZoomIn" size={14} />
        </XStack>
        {zoom !== 1 && (
          <XStack
            w={28} h={26} ai="center" jc="center" cursor="pointer" ml="$1"
            borderWidth={1} borderColor="$border" borderRadius="$2"
            hoverStyle={{ bg: '$secondary' }}
            onPress={() => setZoom(1)}
          >
            <Icon name="RotateCcw" size={14} />
          </XStack>
        )}
        <Text fontSize={10} color="$textMuted" ml="$2">Ctrl + scroll para zoom</Text>
      </XStack>
      <YStack flex={1} ai="center" p="$5" style={{ overflow: 'auto' }}>
        <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', flexShrink: 0 }}>
          {content}
        </div>
      </YStack>
    </YStack>
  );
}

function MobileViewport({ blocks, onImageDrop }: { blocks: AnyBlock[]; onImageDrop: (id: string, file: File) => void }) {
  const { duplicateBlock: dupBlock } = useEditor();
  const viewInteraction = useViewportInteraction(MOBILE_W / CANVAS_W);
  return (
    <YStack flex={1} ai="center" p="$5" overflowY="auto">
      <YStack borderWidth={6} borderColor="$surface" borderRadius={36} overflow="hidden" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }} bg="white" w={MOBILE_W} flexShrink={0}>
        <XStack bg="$surface" height={28} ai="center" jc="center" flexShrink={0}>
          <XStack w={60} height={6} borderRadius={3} bg="$gray6" />
        </XStack>
        <YStack overflowY="auto" overflowX="hidden" bg="$text" style={{ backgroundImage: 'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
          {renderViewportBlocks({
            blocks, viewportW: MOBILE_W, viewportMode: 'mobile', onImageDrop,
            activeBlockId: viewInteraction.activeBlockId,
            setActiveBlockId: viewInteraction.setActiveBlockId,
            removeBlock: viewInteraction.removeBlock,
            duplicateBlock: dupBlock,
            isInteracting: viewInteraction.isInteracting,
            onBlockMouseDown: viewInteraction.onBlockMouseDown,
            onHandleMouseDown: viewInteraction.onHandleMouseDown,
            guides: viewInteraction.guides,
          })}
        </YStack>
        <XStack bg="white" height={20} ai="center" jc="center" flexShrink={0}>
          <XStack w={40} height={4} borderRadius={2} bg="$gray2" />
        </XStack>
      </YStack>
    </YStack>
  );
}

function TableViewport({ blocks, onImageDrop }: { blocks: AnyBlock[]; onImageDrop: (id: string, file: File) => void }) {
  const { duplicateBlock: dupBlock } = useEditor();
  const viewInteraction = useViewportInteraction(TABLET_W / CANVAS_W);
  return (
    <YStack flex={1} ai="center" p="$5" overflowY="auto">
      <YStack borderWidth={6} borderColor="$surface" borderRadius={12} overflow="hidden" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }} bg="white" w={TABLET_W} flexShrink={0}>
        <XStack bg="$surface" height={8} ai="center" jc="center" flexShrink={0}>
          <XStack w={8} h={8} borderRadius={4} bg="$background" borderWidth={1} borderColor="$gray7" />
        </XStack>
        <YStack overflowY="auto" overflowX="hidden" bg="$text" style={{ backgroundImage: 'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
          {renderViewportBlocks({
            blocks, viewportW: TABLET_W, viewportMode: 'tablet', onImageDrop,
            activeBlockId: viewInteraction.activeBlockId,
            setActiveBlockId: viewInteraction.setActiveBlockId,
            removeBlock: viewInteraction.removeBlock,
            duplicateBlock: dupBlock,
            isInteracting: viewInteraction.isInteracting,
            onBlockMouseDown: viewInteraction.onBlockMouseDown,
            onHandleMouseDown: viewInteraction.onHandleMouseDown,
            guides: viewInteraction.guides,
          })}
        </YStack>
        <XStack bg="white" height={16} ai="center" jc="center" flexShrink={0}>
          <XStack w={40} height={4} borderRadius={2} bg="$gray2" />
        </XStack>
      </YStack>
    </YStack>
  );
}

export const EditorCanvas: React.FC = () => {
  const { blocks, activeBlockId, selectedBlockIds, setActiveBlockId, removeBlock, removeBlocks, duplicateBlock, toggleSelectBlock, clearSelection, updateBlock, updateBlockSilent, previewMode, viewportMode, mode, certDesignWidth, certDesignHeight, certDesignChosen, setCertDesignSize, activeSide, setActiveSide, certIsDoubleSided } = useEditor();
  const [mounted, setMounted] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [guides, setGuides] = useState<{ v: number[]; h: number[]; m: MeasureGuide[] }>({ v: [], h: [], m: [] });
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [floatToolbar, setFloatToolbar] = useState<{ x: number; y: number } | null>(null);
  const floatToolbarRef = useRef<HTMLDivElement>(null);

  const handleFloatFormat = (command: string, value?: string) => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    if (command === 'bold') {
      const el = document.createElement('strong');
      try { range.surroundContents(el); } catch { const f = range.extractContents(); el.appendChild(f); range.insertNode(el); }
    } else if (command === 'italic') {
      const el = document.createElement('em');
      try { range.surroundContents(el); } catch { const f = range.extractContents(); el.appendChild(f); range.insertNode(el); }
    } else if (command === 'foreColor' && value) {
      const el = document.createElement('span');
      el.style.color = value;
      try { range.surroundContents(el); } catch { const f = range.extractContents(); el.appendChild(f); range.insertNode(el); }
    }
    sel.removeAllRanges();
    sel.addRange(range);
    setFloatToolbar(null);
  };

  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const [clipboardBlockId, setClipboardBlockId] = useState<string | null>(null);
  const [marqueeRect, setMarqueeRect] = useState<{ startX: number; startY: number; currentX: number; currentY: number } | null>(null);
  const isMarqueeSelecting = useRef(false);

  const interactionRef = useRef<{
    mode: 'move' | 'resize';
    blockId: string;
    handle?: HandleDir;
    startMouseX: number;
    startMouseY: number;
    startLayout: Layout;
    currentLayouts: Record<string, any>;
    multiLayouts?: { id: string; entry: { layout: Layout; layouts: Record<string, any> } }[];
    aspectRatio?: number;
  } | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const handleImageDrop = useCallback((blockId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) updateBlock(blockId, { url: e.target.result as string } as Partial<AnyBlock>);
    };
    reader.readAsDataURL(file);
  }, [updateBlock]);

  const onBlockMouseDown = useCallback((e: React.MouseEvent, block: AnyBlock) => {
    if (block.id === inlineEditingId) return;
    if ((e.target as HTMLElement).dataset.handle) return;
    e.preventDefault();
    e.stopPropagation();
    setActiveBlockId(block.id);
    if ((block as any).styles?.isBackground) return;
    setIsInteracting(true);

    const moveIds = selectedBlockIds.includes(block.id) && selectedBlockIds.length > 1
      ? selectedBlockIds.filter((id) => id !== block.id)
      : [];

    const multiLayouts = moveIds.map((id) => {
      const b = blocks.find((b2) => b2.id === id);
      return b ? { id, entry: { layout: getLayout(b, viewportMode), layouts: b.layouts || {} } } : null;
    }).filter(Boolean) as { id: string; entry: { layout: Layout; layouts: Record<string, any> } }[];

    interactionRef.current = {
      mode: 'move', blockId: block.id,
      startMouseX: e.clientX, startMouseY: e.clientY,
      startLayout: getLayout(block, viewportMode),
      currentLayouts: block.layouts || {},
      multiLayouts: multiLayouts.length > 0 ? multiLayouts : undefined,
    };
  }, [setActiveBlockId, viewportMode, inlineEditingId, selectedBlockIds, blocks]);

  const onHandleMouseDown = useCallback((e: React.MouseEvent, block: AnyBlock, handle: HandleDir) => {
    e.preventDefault();
    e.stopPropagation();
    setIsInteracting(true);
    document.body.style.cursor = `${handle}-resize`;

    const resizeIds = selectedBlockIds.includes(block.id) && selectedBlockIds.length > 1
      ? selectedBlockIds.filter((id) => id !== block.id)
      : [];

    const layout = getLayout(block, viewportMode);

    const multiLayouts = resizeIds.map((id) => {
      const b = blocks.find((b2) => b2.id === id);
      return b ? { id, entry: { layout: getLayout(b, viewportMode), layouts: b.layouts || {} } } : null;
    }).filter(Boolean) as { id: string; entry: { layout: Layout; layouts: Record<string, any> } }[];

    interactionRef.current = {
      mode: 'resize', blockId: block.id, handle,
      startMouseX: e.clientX, startMouseY: e.clientY,
      startLayout: layout,
      currentLayouts: block.layouts || {},
      multiLayouts: multiLayouts.length > 0 ? multiLayouts : undefined,
      aspectRatio: block.type === 'image' && layout.w > 0 && layout.h > 0 ? layout.w / layout.h : undefined,
    };
  }, [viewportMode, selectedBlockIds, blocks]);

  useEffect(() => {
    const applyLayout = (e: MouseEvent): Layout | null => {
      if (!interactionRef.current) return null;
      const { mode, handle, startMouseX, startMouseY, startLayout, aspectRatio } = interactionRef.current;
      const dx = e.clientX - startMouseX;
      const dy = e.clientY - startMouseY;
      if (mode === 'move') {
        return { ...startLayout, x: startLayout.x + dx, y: startLayout.y + dy };
      }
      if (mode === 'resize' && handle) {
        if (aspectRatio) {
          const fixedX = handle.includes('w') ? startLayout.x + startLayout.w : startLayout.x;
          const fixedY = handle.includes('n') ? startLayout.y + startLayout.h : startLayout.y;
          const isCorner = handle.includes('e') && handle.includes('n') ||
            handle.includes('e') && handle.includes('s') ||
            handle.includes('w') && handle.includes('n') ||
            handle.includes('w') && handle.includes('s');
          const rawDW = handle.includes('e') || handle.includes('w');
          const rawDH = handle.includes('s') || handle.includes('n');
          let dw = 0, dh = 0;
          if (rawDW) dw = dx;
          if (rawDH) dh = dy;
          let nw = Math.abs(handle.includes('w') ? startLayout.w - dw : startLayout.w + dw);
          let nh = Math.abs(handle.includes('n') ? startLayout.h - dh : startLayout.h + dh);
          nw = Math.max(MIN_W, nw);
          nh = Math.max(MIN_H, nh);
          if (isCorner) {
            if (nw / nh > aspectRatio) nh = nw / aspectRatio;
            else nw = nh * aspectRatio;
          } else if (rawDW) {
            nh = nw / aspectRatio;
          } else {
            nw = nh * aspectRatio;
          }
          nw = Math.max(MIN_W, nw);
          nh = Math.max(MIN_H, nh);
          const x = handle.includes('w') ? fixedX - nw : fixedX;
          const y = handle.includes('n') ? fixedY - nh : fixedY;
          return { x, y, w: nw, h: nh, zIndex: startLayout.zIndex };
        }
        let { x, y, w, h, zIndex } = startLayout;
        if (handle.includes('e')) w = Math.max(MIN_W, startLayout.w + dx);
        if (handle.includes('s')) h = Math.max(MIN_H, startLayout.h + dy);
        if (handle.includes('w')) { w = Math.max(MIN_W, startLayout.w - dx); x = startLayout.x + startLayout.w - w; }
        if (handle.includes('n')) { h = Math.max(MIN_H, startLayout.h - dy); y = startLayout.y + startLayout.h - h; }
        return { x, y, w, h, zIndex };
      }
      return null;
    };

    const buildUpdate = (layout: Layout) => {
      const { currentLayouts } = interactionRef.current!;
      return { layouts: { ...currentLayouts, [viewportMode]: layout } } as Partial<AnyBlock>;
    };

    const applyResizeToEntry = (entry: { layout: Layout }, dx: number, dy: number, handle: string): Layout => {
      const sl = entry.layout;
      let { x, y, w, h } = sl;
      if (handle.includes('e')) w = Math.max(MIN_W, sl.w + dx);
      if (handle.includes('s')) h = Math.max(MIN_H, sl.h + dy);
      if (handle.includes('w')) { w = Math.max(MIN_W, sl.w - dx); x = sl.x + sl.w - w; }
      if (handle.includes('n')) { h = Math.max(MIN_H, sl.h - dy); y = sl.y + sl.h - h; }
      return { x, y, w, h, zIndex: sl.zIndex };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!interactionRef.current) return;
      const { mode, handle, multiLayouts, blockId: mainBlockId } = interactionRef.current;
      const layout = applyLayout(e);
      if (layout) {
        updateBlockSilent(mainBlockId, buildUpdate(layout));
        if (multiLayouts?.length) {
          const dx = e.clientX - interactionRef.current.startMouseX;
          const dy = e.clientY - interactionRef.current.startMouseY;
          for (const { id, entry } of multiLayouts) {
            const newL = mode === 'move'
              ? { ...entry.layout, x: Math.max(0, entry.layout.x + dx), y: Math.max(0, entry.layout.y + dy) }
              : applyResizeToEntry(entry, dx, dy, handle!);
            updateBlockSilent(id, {
              layouts: { ...entry.layouts, [viewportMode]: newL },
            } as Partial<AnyBlock>);
          }
        }
        setGuides(computeBlockGuides(layout, mainBlockId, blocks, viewportMode));
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!interactionRef.current) return;
      const { mode, handle, multiLayouts, blockId: mainBlockId } = interactionRef.current;
      const layout = applyLayout(e);
      if (layout) {
        updateBlock(mainBlockId, buildUpdate(layout));
        if (multiLayouts?.length) {
          const dx = e.clientX - interactionRef.current.startMouseX;
          const dy = e.clientY - interactionRef.current.startMouseY;
          for (const { id, entry } of multiLayouts) {
            const newL = mode === 'move'
              ? { ...entry.layout, x: Math.max(0, entry.layout.x + dx), y: Math.max(0, entry.layout.y + dy) }
              : applyResizeToEntry(entry, dx, dy, handle!);
            updateBlock(id, {
              layouts: { ...entry.layouts, [viewportMode]: newL },
            } as Partial<AnyBlock>);
          }
        }
      }
      interactionRef.current = null;
      document.body.style.cursor = '';
      setIsInteracting(false);
      setGuides({ v: [], h: [], m: [] });
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [updateBlock, updateBlockSilent, viewportMode]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      const ids = selectedBlockIds.length > 0 ? selectedBlockIds : (activeBlockId ? [activeBlockId] : []);

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (ids.length > 0 && !previewMode) {
          e.preventDefault();
          if (ids.length > 1) {
            removeBlocks(ids);
          } else {
            removeBlock(ids[0]);
          }
          clearSelection();
          setActiveBlockId(null);
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
        if (ids.length > 0) {
          e.preventDefault();
          setClipboardBlockId(ids[0]);
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) {
        if (clipboardBlockId) {
          e.preventDefault();
          duplicateBlock(clipboardBlockId);
        }
        return;
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [activeBlockId, selectedBlockIds, previewMode, removeBlock, removeBlocks, duplicateBlock, clearSelection, setActiveBlockId, clipboardBlockId]);

  const pageRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isMarqueeSelecting.current || !marqueeRect) return;
      const pageDiv = pageRootRef.current;
      if (!pageDiv) return;
      const rect = pageDiv.getBoundingClientRect();
      setMarqueeRect((prev) => prev ? { ...prev, currentX: e.clientX - rect.left, currentY: e.clientY - rect.top } : null);
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!isMarqueeSelecting.current || !marqueeRect) return;
      isMarqueeSelecting.current = false;
      const rx = Math.min(marqueeRect.startX, marqueeRect.currentX);
      const ry = Math.min(marqueeRect.startY, marqueeRect.currentY);
      const rw = Math.abs(marqueeRect.currentX - marqueeRect.startX);
      const rh = Math.abs(marqueeRect.currentY - marqueeRect.startY);

      if (rw > 5 || rh > 5) {
        const selected = blocks.filter((block) => {
          const l = getLayout(block);
          const overlapX = l.x < rx + rw && l.x + l.w > rx;
          const overlapY = l.y < ry + rh && l.y + l.h > ry;
          return overlapX && overlapY;
        }).map((b) => b.id);
        if (selected.length > 0) {
          clearSelection();
          selected.forEach((id, i) => {
            if (i === 0) setActiveBlockId(id);
            else toggleSelectBlock(id);
          });
        }
      }

      setMarqueeRect(null);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [marqueeRect, blocks, clearSelection, setActiveBlockId, toggleSelectBlock]);

  if (!mounted) return <YStack flex={1} bg="$background" ai="center" jc="center" gap={12} opacity={0.7}><Spinner size="large" color="$primary" /><Text color="$textMuted" fontSize={14}>Carregando canvas…</Text></YStack>;

  if (previewMode) return <PreviewCanvas blocks={blocks} viewportMode={viewportMode} mode={mode} certDesignWidth={certDesignWidth} certDesignHeight={certDesignHeight} />;

  if (viewportMode === 'mobile') return <MobileViewport blocks={blocks} onImageDrop={handleImageDrop} />;
  if (viewportMode === 'tablet') return <TableViewport blocks={blocks} onImageDrop={handleImageDrop} />;

  const sortedBlocks = [...blocks].sort((a, b) => getLayout(a).zIndex - getLayout(b).zIndex);
  const isCertMode = mode === 'certificate';
  const pageH = isCertMode ? Math.max(200, certDesignHeight) : Math.max(800, ...blocks.map(b => { const l = getLayout(b); return l.y + l.h + 120; }));

  if (isCertMode && !certDesignChosen) {
    return (
      <YStack flex={1} p="$5" bg="$background" ai="center" jc="center" gap="$3">
        <Text fontSize={16} fontWeight="600">Personalize seu Certificado</Text>
        <Text fontSize={13} color="$textMuted" textAlign="center">Selecione um tamanho de layout no painel à direita para começar</Text>
      </YStack>
    );
  }

  return (
    <YStack
      flex={1} p="$5" style={{ overflow: 'auto' }}
      bg="$background"
      onPress={() => setActiveBlockId(null)}
      data-editor-root
      ai="center"
    >
      {isCertMode && certIsDoubleSided && (
        <XStack ai="center" jc="center" gap="$2" mb="$4" bg="white" p="$1.5" borderRadius="$3" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)' }}>
          <Button
            backgroundColor={activeSide === 'front' ? '$primary' : 'transparent'}
            hoverStyle={{ backgroundColor: activeSide === 'front' ? '$primary' : 'rgba(0,0,0,0.03)' }}
            borderWidth={0}
            onPress={(e: any) => { e.stopPropagation(); setActiveSide('front'); }}
            px="$4"
            borderRadius="$2"
          >
            <Text color={activeSide === 'front' ? 'white' : '$text'} fontWeight="600" fontSize={12}>Frente do Certificado</Text>
          </Button>
          <Button
            backgroundColor={activeSide === 'back' ? '$primary' : 'transparent'}
            hoverStyle={{ backgroundColor: activeSide === 'back' ? '$primary' : 'rgba(0,0,0,0.03)' }}
            borderWidth={0}
            onPress={(e: any) => { e.stopPropagation(); setActiveSide('back'); }}
            px="$4"
            borderRadius="$2"
          >
            <Text color={activeSide === 'back' ? 'white' : '$text'} fontWeight="600" fontSize={12}>Verso do Certificado</Text>
          </Button>
        </XStack>
      )}
      <div
        ref={pageRootRef}
        data-page-root
        style={{ position: 'relative', width: isCertMode ? certDesignWidth : PAGE_W, minHeight: pageH, margin: '0 auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 24px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.06)', overflow: isCertMode ? 'hidden' : undefined }}
        onMouseDown={(e) => {
          if ((e.target as HTMLElement).closest('[role="button"]')) return;
          if (inlineEditingId) return;
          isMarqueeSelecting.current = true;
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          setMarqueeRect({ startX: x, startY: y, currentX: x, currentY: y });
        }}
      >
        <Text position="absolute" top={-22} left={0} fontSize={10} color="$textMuted" userSelect="none" style={{ fontFamily: 'monospace', pointerEvents: 'none' }}>
          {isCertMode ? `${certDesignWidth} × ${pageH}` : `${PAGE_W}px`} — Desktop
        </Text>

        {blocks.length === 0 && (
          <Text position="absolute" top="50%" left="50%" style={{ transform: 'translate(-50%, -50%)' }} color="$textMuted" fontSize={14} textAlign="center" pointerEvents="none">
            + Clique nos blocos à esquerda para adicionar conteúdo
          </Text>
        )}

        {(() => {
          const canvasBlocks = isCertMode && certIsDoubleSided
            ? blocks.filter((b) => ((b as any).styles?.side || 'front') === activeSide)
            : blocks;
          const sorted = [...canvasBlocks].sort((a, b) => {
            const aBg = (a as any).styles?.isBackground ? 1 : 0;
            const bBg = (b as any).styles?.isBackground ? 1 : 0;
            if (aBg !== bBg) return aBg - bBg; // Backgrounds first (rendered first = at the bottom in DOM stacking)
            return getLayout(a).zIndex - getLayout(b).zIndex;
          });
          return sorted.map((block) => {
            const isActive = block.id === activeBlockId;
            const isSelected = selectedBlockIds.includes(block.id);
            const isEditing = block.id === inlineEditingId;
            const isHovered = hoveredBlockId === block.id;
            const showToolbar = isActive || isHovered;
            const isBg = !!((block as any).styles?.isBackground && isCertMode);
            const layout = isBg ? { x: 0, y: 0, w: certDesignWidth, h: pageH, zIndex: -10 } : getLayout(block);
            const outOfBounds = isBg ? false : isOutOfBounds(block, isCertMode ? certDesignWidth : PAGE_W);


            return (
              <div
                key={block.id}
                onMouseDown={(e) => onBlockMouseDown(e, block)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (e.shiftKey || e.metaKey || e.ctrlKey) {
                    toggleSelectBlock(block.id);
                  } else {
                    setActiveBlockId(block.id);
                    if (selectedBlockIds.length > 0) clearSelection();
                  }
                }}
                onDoubleClick={(e) => {
                  if (block.type === 'text' || block.type === 'heading') {
                    e.stopPropagation();
                    setInlineEditingId(block.id);
                  }
                }}
                onMouseEnter={() => setHoveredBlockId(block.id)}
                onMouseLeave={() => setHoveredBlockId(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape' && isEditing) {
                    setInlineEditingId(null);
                  }
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveBlockId(block.id);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Bloco ${block.type}${(block as any).content ? `: ${(block as any).content.substring(0, 40)}` : ''}${isActive ? ' (selecionado)' : ''}`}
                style={{ position: 'absolute', left: layout.x, top: layout.y, width: layout.w, height: layout.h, zIndex: layout.zIndex + 1, cursor: isEditing ? 'text' : 'move', boxSizing: 'border-box', userSelect: isEditing ? 'text' : 'none', isolation: 'isolate', outline: isActive ? 'none' : undefined }}
              >
                <div style={{
                  position: 'absolute', inset: 0,
                  border: isActive ? '2px solid #3B82F6' : isSelected ? '2px solid #3B82F6' : outOfBounds ? '2px solid #F59E0B' : '2px solid transparent',
                  borderRadius: '6px', pointerEvents: 'none', zIndex: 2,
                  boxShadow: isActive ? '0 0 0 1px rgba(59,130,246,0.25)' : isSelected ? '0 0 0 1px rgba(96,165,250,0.2)' : outOfBounds ? '0 0 0 1px rgba(249,115,22,0.15)' : 'none',
                }} />

                {outOfBounds && !isActive && (
                  <XStack position="absolute" top={-22} left={0} zIndex={25} bg="$warning" py={0} px={1} borderRadius={1} ai="center" gap={1} style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}>
                    <Text fontSize={10} fontWeight="600" color="white">⚠️ Fora da página</Text>
                  </XStack>
                )}

                <div style={{ position: 'absolute', inset: isBg ? 0 : 2, borderRadius: isBg ? '0px' : '4px', overflow: 'hidden', zIndex: 1 }}>
                  {isBg && (
                    <XStack position="absolute" top={8} left={8} zIndex={25} bg="$primary" py={1} px={2} borderRadius={4} ai="center" gap={4} style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}>
                      <Text fontSize={9} fontWeight="600" color="white">✦ Plano de Fundo (Bloqueado)</Text>
                    </XStack>
                  )}
                  <BlockContent
                    block={block}
                    onImageDrop={handleImageDrop}
                    isInteracting={isInteracting}
                    isEditing={isEditing}
                    onEditComplete={(content) => {
                      updateBlock(block.id, { content } as Partial<AnyBlock>);
                      setInlineEditingId(null);
                    }}
                  />
                  {(block.type === 'html' || block.type === 'video') && (
                    <div style={{ position: 'absolute', inset: 0, zIndex: 10, cursor: 'move', backgroundColor: 'transparent' }} />
                  )}
                </div>

                {showToolbar && (
                  <XStack
                    position="absolute" top={-34} right={0} zIndex={20}
                    bg="white" borderWidth={1} borderColor="$border" borderRadius={1}
                    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
                    ai="center" gap={0}
                  >
                    <XStack
                      onPress={(e: any) => { e.stopPropagation(); duplicateBlock(block.id); }}
                      role="button"
                      aria-label="Duplicar bloco"
                      tabIndex={0}
                      onKeyDown={(e: any) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); duplicateBlock(block.id); } }}
                      px={1} py={1} cursor="pointer" hoverStyle={{ bg: '$secondary' }}
                    >
                      <Icon name="Copy" size={14} color="$textMuted" />
                    </XStack>
                    <XStack
                      onPress={(e: any) => { e.stopPropagation(); removeBlock(block.id); }}
                      role="button"
                      aria-label="Excluir bloco"
                      tabIndex={0}
                      onKeyDown={(e: any) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); removeBlock(block.id); } }}
                      px={1} py={1} cursor="pointer" hoverStyle={{ bg: '$secondary' }}
                    >
                      <Icon name="Trash2" size={14} color="$danger" />
                    </XStack>
                  </XStack>
                )}

                {showToolbar && (
                  <XStack
                    position="absolute" top={-34} left={0} zIndex={20}
                    bg="white" borderWidth={1} borderColor="$border" borderRadius={1}
                    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)', cursor: 'grab' }}
                    ai="center" gap={0}
                  >
                    <XStack px={1} py={1} aria-label="Reordenar bloco">
                      <Icon name="GripVertical" size={14} color="$textMuted" />
                    </XStack>
                  </XStack>
                )}

                {(isActive || isSelected) && !isBg && HANDLES.map(({ id, cursor, style }) => (
                  <div
                    key={id}
                    data-handle={id}
                    onMouseDown={(e) => onHandleMouseDown(e, block, id)}
                    style={{ position: 'absolute', width: 10, height: 10, backgroundColor: 'white', border: isActive ? '2px solid #3B82F6' : '2px solid #3B82F6', borderRadius: '2px', cursor, zIndex: 30, ...style }}
                  />
                ))}
              </div>
            );
          });
        })()}

        {guides.v.map((x, i) => (
          <div key={`gv-${i}`} style={{ position: 'absolute', left: x, top: 0, width: 0, height: pageH, borderLeft: '1.5px dashed #3B82F6', opacity: 0.7, pointerEvents: 'none', zIndex: 999 }} />
        ))}
        {guides.h.map((y, i) => (
          <div key={`gh-${i}`} style={{ position: 'absolute', left: 0, top: y, width: isCertMode ? certDesignWidth : PAGE_W, height: 0, borderTop: '1.5px dashed #3B82F6', opacity: 0.7, pointerEvents: 'none', zIndex: 999 }} />
        ))}
        {guides.m.map((m, i) => {
          if (m.orientation === 'h') {
            return (
              <React.Fragment key={`gm-${i}`}>
                <div style={{ position: 'absolute', left: m.start, top: m.pos, width: m.end - m.start, height: 0, borderTop: '1px dashed #7C3AED', pointerEvents: 'none', zIndex: 998 }} />
                <div style={{ position: 'absolute', left: m.start, top: m.pos - 3, width: 0, height: 6, borderLeft: '1px solid #7C3AED', pointerEvents: 'none', zIndex: 998 }} />
                <div style={{ position: 'absolute', left: m.end, top: m.pos - 3, width: 0, height: 6, borderLeft: '1px solid #7C3AED', pointerEvents: 'none', zIndex: 998 }} />
                <div style={{ position: 'absolute', left: (m.start + m.end) / 2, top: m.pos, transform: 'translate(-50%, -50%)', fontSize: 10, color: '#7C3AED', backgroundColor: 'white', padding: '1px 5px', borderRadius: 3, border: '1px solid #7C3AED', fontWeight: 600, zIndex: 1001, whiteSpace: 'nowrap', lineHeight: '14px', pointerEvents: 'none' }}>{m.value}px</div>
              </React.Fragment>
            );
          }
          return (
            <React.Fragment key={`gm-${i}`}>
              <div style={{ position: 'absolute', left: m.pos, top: m.start, width: 0, height: m.end - m.start, borderLeft: '1px dashed #7C3AED', pointerEvents: 'none', zIndex: 998 }} />
              <div style={{ position: 'absolute', left: m.pos - 3, top: m.start, width: 6, height: 0, borderTop: '1px solid #7C3AED', pointerEvents: 'none', zIndex: 998 }} />
              <div style={{ position: 'absolute', left: m.pos - 3, top: m.end, width: 6, height: 0, borderTop: '1px solid #7C3AED', pointerEvents: 'none', zIndex: 998 }} />
              <div style={{ position: 'absolute', left: m.pos, top: (m.start + m.end) / 2, transform: 'translate(-50%, -50%)', fontSize: 10, color: '#7C3AED', backgroundColor: 'white', padding: '1px 5px', borderRadius: 3, border: '1px solid #7C3AED', fontWeight: 600, zIndex: 1001, whiteSpace: 'nowrap', lineHeight: '14px', pointerEvents: 'none' }}>{m.value}px</div>
            </React.Fragment>
          );
        })}

        {marqueeRect && (
          <div style={{
            position: 'absolute',
            left: Math.min(marqueeRect.startX, marqueeRect.currentX),
            top: Math.min(marqueeRect.startY, marqueeRect.currentY),
            width: Math.abs(marqueeRect.currentX - marqueeRect.startX),
            height: Math.abs(marqueeRect.currentY - marqueeRect.startY),
            border: '1.5px solid #3B82F6',
            backgroundColor: 'rgba(59,130,246,0.08)',
            pointerEvents: 'none',
            zIndex: 1000,
            borderRadius: '4px',
          }} />
        )}

      </div>

      {floatToolbar && (
        <div
          ref={floatToolbarRef}
          style={{
            position: 'fixed',
            left: floatToolbar.x,
            top: floatToolbar.y,
            transform: 'translate(-50%, -100%)',
            zIndex: 10000,
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.08)',
            padding: '4px 6px',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            pointerEvents: 'auto',
          }}
        >
          <button
            onMouseDown={(e) => { e.preventDefault(); handleFloatFormat('bold'); }}
            style={{ width: 30, height: 30, border: '1px solid $gray2', borderRadius: 6, background: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Negrito"
          >B</button>
          <button
            onMouseDown={(e) => { e.preventDefault(); handleFloatFormat('italic'); }}
            style={{ width: 30, height: 30, border: '1px solid $gray2', borderRadius: 6, background: 'white', cursor: 'pointer', fontStyle: 'italic', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Itálico"
          >I</button>
          <div style={{ width: 1, height: 20, background: '$gray2', margin: '0 2px' }} />
          {['#ef4444', '#f97316', '#eab308', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#000000'].map(c => (
            <button
              key={c}
              onMouseDown={(e) => { e.preventDefault(); handleFloatFormat('foreColor', c); }}
              style={{ width: 20, height: 20, borderRadius: 10, border: c === '#000000' ? '2px solid #e2e8f0' : 'none', background: c, cursor: 'pointer' }}
              title={`Cor ${c}`}
            />
          ))}
          <input
            type="color"
            onMouseDown={(e) => e.preventDefault()}
            onChange={(e) => { handleFloatFormat('foreColor', e.target.value); }}
            value="#3b82f6"
            style={{ width: 24, height: 24, padding: 0, border: 'none', borderRadius: 4, cursor: 'pointer', background: 'none' }}
            title="Escolher cor..."
          />
        </div>
      )}
    </YStack>
  );
};
style = {{ width: 20, height: 20, borderRadius: 10, border: c === '#000000' ? '2px solid #e2e8f0' : 'none', background: c, cursor: 'pointer' }}
title = {`Cor ${c}`}
            />
          ))}
<input
  type="color"
  onMouseDown={(e) => e.preventDefault()}
  onChange={(e) => { handleFloatFormat('foreColor', e.target.value); }}
  value="#3b82f6"
  style={{ width: 24, height: 24, padding: 0, border: 'none', borderRadius: 4, cursor: 'pointer', background: 'none' }}
  title="Escolher cor..."
/>
        </div >
      )}
    </YStack >
  );
};
