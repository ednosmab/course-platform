'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { YStack, XStack, Text, Icon, CertificateBlockRenderer } from '@projeto/ui';
import type { AnyBlock } from '@projeto/types';
import { useEditor } from '../../context/EditorContext';
import { uploadCertificateImageToBlock, alertForUploadResult } from './uploadCertificateImageToBlock';

type HandleDir = 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se';

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

interface Layout { x: number; y: number; w: number; h: number; zIndex: number; }

interface MultiLayoutEntry {
  id: string;
  entry: { layout: Layout; layouts: Record<string, any> };
}

type Interaction =
  | { mode: 'move'; blockId: string; startX: number; startY: number; startLayout: Layout; multiLayouts?: MultiLayoutEntry[] }
  | { mode: 'resize'; blockId: string; handle: HandleDir; startX: number; startY: number; startLayout: Layout };

const DEFAULT_DESIGN_W = 1100;
const A4_RATIO = 1.414;
const MIN_W = 50;
const MIN_H = 30;

function getLayout(block: AnyBlock): Layout {
  const l = block.layouts?.desktop;
  return {
    x: typeof l?.x === 'number' ? l.x : 40,
    y: typeof l?.y === 'number' ? l.y : 40,
    w: typeof l?.w === 'number' ? l.w : 200,
    h: typeof l?.h === 'number' ? l.h : 100,
    zIndex: typeof l?.zIndex === 'number' ? l.zIndex : 0,
  };
}

export const CertificateCanvas: React.FC<{
  blocks: AnyBlock[];
  designWidth?: number;
  designHeight?: number;
  activeSide?: 'front' | 'back';
  isDoubleSided?: boolean;
}> = ({
  blocks,
  designWidth = DEFAULT_DESIGN_W,
  designHeight = Math.round(DEFAULT_DESIGN_W / A4_RATIO),
  activeSide = 'front',
  isDoubleSided = false,
}) => {
  const { setActiveBlockId, activeBlockId, selectedBlockIds, toggleSelectBlock, setSelectedBlocks, clearSelection, updateBlock, updateBlockSilent, duplicateBlock, removeBlock, removeBlocks, setActiveSide, courseId } = useEditor();
  const [zoom, setZoom] = useState(1);
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const [clipboardBlockId, setClipboardBlockId] = useState<string | null>(null);
  const [marqueeRect, setMarqueeRect] = useState<{ startX: number; startY: number; currentX: number; currentY: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const interactionRef = useRef<Interaction | null>(null);
  const isMarqueeSelecting = useRef(false);
  const pageRootRef = useRef<HTMLDivElement>(null);

  const filteredBlocks = isDoubleSided
    ? blocks.filter((b) => activeSide === 'front'
      ? (b as any).styles?.side !== 'back'
      : (b as any).styles?.side === 'back')
    : blocks;

  const sortedBlocks = [...filteredBlocks].sort(
    (a, b) => (a.layouts?.desktop?.zIndex ?? 0) - (b.layouts?.desktop?.zIndex ?? 0),
  );

  const blocksRef = useRef(blocks);
  const filteredBlocksRef = useRef(filteredBlocks);
  const marqueeRectRef = useRef(marqueeRect);

  useEffect(() => {
    blocksRef.current = blocks;
    filteredBlocksRef.current = filteredBlocks;
    marqueeRectRef.current = marqueeRect;
  });

  const handleImageDrop = useCallback(async (file: File) => {
    if (!courseId || !activeBlockId) return;
    const result = await uploadCertificateImageToBlock(file, courseId, activeBlockId, updateBlock);
    alertForUploadResult(result);
  }, [courseId, activeBlockId, updateBlock]);

  const zoomLabel = `${Math.round(zoom * 100)}%`;
  const zoomIn = () => setZoom((z) => Math.min(3, z + 0.1));
  const zoomOut = () => setZoom((z) => Math.max(0.25, z - 0.1));

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setZoom((z) => Math.max(0.25, Math.min(3, z + (e.deltaY > 0 ? -0.1 : 0.1))));
    }
  }, []);

  const onBlockMouseDown = useCallback((e: React.MouseEvent, block: AnyBlock) => {
    if ((e.target as HTMLElement).dataset.handle) return;
    if ((block as any).styles?.isBackground) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    if (selectedBlockIds.includes(block.id) && selectedBlockIds.length > 1) {
    } else {
      setActiveBlockId(block.id);
    }
    const layout = getLayout(block);

    const moveIds = selectedBlockIds.includes(block.id) && selectedBlockIds.length > 1
      ? selectedBlockIds.filter((id) => id !== block.id)
      : [];

    const multiLayouts = moveIds.map((id) => {
      const b = blocks.find((b2) => b2.id === id);
      return b ? { id, entry: { layout: getLayout(b), layouts: b.layouts || {} } } : null;
    }).filter(Boolean) as MultiLayoutEntry[];

    interactionRef.current = {
      mode: 'move', blockId: block.id,
      startX: e.clientX, startY: e.clientY,
      startLayout: { ...layout },
      multiLayouts: multiLayouts.length > 0 ? multiLayouts : undefined,
    };
  }, [setActiveBlockId, selectedBlockIds, blocks]);

  const onHandleMouseDown = useCallback((e: React.MouseEvent, block: AnyBlock, handle: HandleDir) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedBlockIds.includes(block.id) && selectedBlockIds.length > 1) {
    } else {
      setActiveBlockId(block.id);
    }
    const layout = getLayout(block);
    interactionRef.current = {
      mode: 'resize', blockId: block.id, handle,
      startX: e.clientX, startY: e.clientY,
      startLayout: { ...layout },
    };
  }, [setActiveBlockId, selectedBlockIds]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isMarqueeSelecting.current && marqueeRectRef.current) {
        const pageDiv = pageRootRef.current;
        if (!pageDiv) return;
        const rect = pageDiv.getBoundingClientRect();
        const currentX = (e.clientX - rect.left) / zoom;
        const currentY = (e.clientY - rect.top) / zoom;
        setMarqueeRect((prev) => prev ? { ...prev, currentX, currentY } : null);
        return;
      }

      const ia = interactionRef.current;
      if (!ia) return;
      const dx = (e.clientX - ia.startX) / zoom;
      const dy = (e.clientY - ia.startY) / zoom;

      if (ia.mode === 'move') {
        const nx = ia.startLayout.x + dx;
        const ny = ia.startLayout.y + dy;
        const nz = ia.startLayout.zIndex;
        updateBlockSilent(ia.blockId, {
          layouts: { desktop: { x: nx, y: ny, w: ia.startLayout.w, h: ia.startLayout.h, zIndex: nz } },
        });
        if (ia.multiLayouts) {
          ia.multiLayouts.forEach(({ id, entry }) => {
            updateBlockSilent(id, {
              layouts: {
                ...entry.layouts,
                desktop: { ...entry.layout, x: entry.layout.x + dx, y: entry.layout.y + dy },
              },
            });
          });
        }
      } else {
        let { x, y, w, h } = ia.startLayout;
        if (ia.handle.includes('e')) w = Math.max(MIN_W, ia.startLayout.w + dx);
        if (ia.handle.includes('w')) {
          const nw = Math.max(MIN_W, ia.startLayout.w - dx);
          x = ia.startLayout.x + (ia.startLayout.w - nw);
          w = nw;
        }
        if (ia.handle.includes('s')) h = Math.max(MIN_H, ia.startLayout.h + dy);
        if (ia.handle.includes('n')) {
          const nh = Math.max(MIN_H, ia.startLayout.h - dy);
          y = ia.startLayout.y + (ia.startLayout.h - nh);
          h = nh;
        }
        updateBlockSilent(ia.blockId, {
          layouts: { desktop: { x, y, w, h, zIndex: ia.startLayout.zIndex } },
        });
      }
    };

    const onMouseUp = () => {
      if (isMarqueeSelecting.current && marqueeRectRef.current) {
        isMarqueeSelecting.current = false;
        const rect = marqueeRectRef.current;
        const rx = Math.min(rect.startX, rect.currentX);
        const ry = Math.min(rect.startY, rect.currentY);
        const rw = Math.abs(rect.currentX - rect.startX);
        const rh = Math.abs(rect.currentY - rect.startY);

        if (rw > 5 || rh > 5) {
          const selected = filteredBlocksRef.current.filter((block) => {
            const l = getLayout(block);
            const overlapX = l.x < rx + rw && l.x + l.w > rx;
            const overlapY = l.y < ry + rh && l.y + l.h > ry;
            return overlapX && overlapY;
          }).map((b) => b.id);
          if (selected.length > 0) {
            setActiveBlockId(selected[0]);
            setSelectedBlocks(selected);
          }
        }
        setMarqueeRect(null);
        return;
      }

      const ia = interactionRef.current;
      if (!ia) return;
      interactionRef.current = null;
      const block = blocksRef.current.find((b) => b.id === ia.blockId);
      if (!block) return;
      const currentLayout = block.layouts?.desktop;
      if (currentLayout) {
        updateBlock(ia.blockId, {
          layouts: { desktop: { ...currentLayout } },
        });
      }
      if (ia.mode === 'move' && ia.multiLayouts) {
        ia.multiLayouts.forEach(({ id }) => {
          const b = blocksRef.current.find((bx) => bx.id === id);
          if (!b) return;
          const cl = b.layouts?.desktop;
          if (cl) {
            updateBlock(id, { layouts: { desktop: { ...cl } } });
          }
        });
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [zoom, updateBlock, updateBlockSilent]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      const ids = selectedBlockIds.length > 0 ? selectedBlockIds : (activeBlockId ? [activeBlockId] : []);
      if (ids.length === 0) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (ids.length > 1) {
          removeBlocks(ids);
        } else {
          removeBlock(ids[0]);
        }
        clearSelection();
        setActiveBlockId(null);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        setClipboardBlockId(ids[0]);
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
  }, [activeBlockId, selectedBlockIds, removeBlock, removeBlocks, duplicateBlock, clearSelection, setActiveBlockId, clipboardBlockId]);

  return (
    <YStack flex={1} bg="$background" onWheel={handleWheel}>
      <XStack
        ai="center" jc="center" gap="$2" p="$2"
        borderBottomWidth={1} borderBottomColor="$border"
        bg="$background" flexShrink={0}
      >
        {isDoubleSided && (
          <XStack
            borderWidth={1} borderColor="$border" borderRadius="$2"
            overflow="hidden" mr="$2"
            role="tablist" aria-label="Lado do certificado"
            data-testid="side-toggle"
          >
            {(['front', 'back'] as const).map((side) => {
              const isActive = activeSide === side;
              return (
                <XStack
                  key={side}
                  role="tab"
                  aria-selected={isActive}
                  aria-label={side === 'front' ? 'Frente' : 'Verso'}
                  onPress={() => setActiveSide(side)}
                  px="$3" py="$1"
                  bg={isActive ? '$primary' : 'transparent'}
                  cursor="pointer"
                  hoverStyle={{ bg: isActive ? '$primary' : '$secondary' }}
                  ai="center" jc="center"
                >
                  <Text
                    fontSize={11}
                    fontWeight={isActive ? '700' : '500'}
                    color={isActive ? 'white' : '$text'}
                  >
                    {side === 'front' ? 'Frente' : 'Verso'}
                  </Text>
                </XStack>
              );
            })}
          </XStack>
        )}
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

      <YStack flex={1} ai="center" bg="$background" style={{ overflow: 'auto', position: 'relative' }}>
        <div
          data-testid="canvas-overlay"
          onMouseDown={(e) => {
            if (!pageRootRef.current) return;
            if (pageRootRef.current.contains(e.target as Node)) return;
            e.preventDefault();
            setActiveBlockId(null);
            clearSelection();
            isMarqueeSelecting.current = true;
            const rect = pageRootRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left) / zoom;
            const y = (e.clientY - rect.top) / zoom;
            setMarqueeRect({ startX: x, startY: y, currentX: x, currentY: y });
          }}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            cursor: 'default',
          }}
        />
        <div
          ref={canvasRef}
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            flexShrink: 0,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            ref={pageRootRef}
            onMouseDown={(e) => {
              setActiveBlockId(null);
              clearSelection();
              if ((e.target as HTMLElement).closest('[role="button"]')) return;
              isMarqueeSelecting.current = true;
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              const x = (e.clientX - rect.left) / zoom;
              const y = (e.clientY - rect.top) / zoom;
              setMarqueeRect({ startX: x, startY: y, currentX: x, currentY: y });
            }}
            style={{
              position: 'relative',
              width: designWidth,
              height: designHeight,
              background: 'white',
              borderRadius: 8,
              overflow: 'hidden',
              boxShadow: '0 10px 35px rgba(0,0,0,0.12)',
            }}
          >
            {sortedBlocks.map((block) => {
              const isBg = !!(block as any).styles?.isBackground;
              const layout = getLayout(block);
              const isActive = block.id === activeBlockId;
              const isHovered = block.id === hoveredBlockId;
              const isSelected = selectedBlockIds.includes(block.id);
              const showToolbar = (isActive || isHovered) && !isBg;
              const showHandles = (isActive || isSelected) && !isBg;
              return (
                <div
                  key={block.id}
                  role={isBg ? undefined : 'button'}
                  tabIndex={isBg ? undefined : 0}
                  onMouseDown={(e: React.MouseEvent) => {
                    if (e.shiftKey || e.metaKey || e.ctrlKey) {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleSelectBlock(block.id);
                      setActiveBlockId(null);
                      return;
                    }
                    onBlockMouseDown(e, block);
                  }}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    if (isBg) return;
                    if (e.shiftKey || e.metaKey || e.ctrlKey) {
                      e.preventDefault();
                    } else {
                      setActiveBlockId(block.id);
                      if (selectedBlockIds.length > 0) clearSelection();
                    }
                  }}
                  onMouseEnter={() => setHoveredBlockId(block.id)}
                  onMouseLeave={() => setHoveredBlockId(null)}
                  style={{
                    position: isBg ? 'relative' : 'absolute',
                    left: isBg ? undefined : layout.x,
                    top: isBg ? undefined : layout.y,
                    width: isBg ? '100%' : layout.w,
                    height: isBg ? '100%' : layout.h,
                    zIndex: (layout.zIndex ?? 0) + 1,
                    cursor: 'move',
                    userSelect: 'none',
                    boxSizing: 'border-box',
                    isolation: 'isolate',
                    outline: 'none',
                  }}
                >
                  <div style={{
                    position: 'absolute', inset: 0,
                    border: isActive ? '2px solid #3B82F6' : isSelected ? '2px solid #3B82F6' : '2px solid transparent',
                    borderRadius: '6px', pointerEvents: 'none', zIndex: 2,
                    boxShadow: isActive ? '0 0 0 1px rgba(59,130,246,0.25)' : isSelected ? '0 0 0 1px rgba(96,165,250,0.2)' : 'none',
                  }} />
                  <CertificateBlockRenderer block={block as any} scale={1} fillContainer isEditor onImageDrop={handleImageDrop} />
                  {showToolbar && (
                    <XStack
                      position="absolute" top={-34} right={0} zIndex={20}
                      bg="white" borderWidth={1} borderColor="$border"
                      borderRadius={1}
                      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
                      ai="center" gap={0}
                    >
                      <XStack
                        onPress={(e: any) => { e.stopPropagation(); duplicateBlock(block.id); }}
                        role="button" aria-label="Duplicar bloco" tabIndex={0}
                        onKeyDown={(e: any) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); duplicateBlock(block.id); } }}
                        px={1} py={1} cursor="pointer" hoverStyle={{ bg: '$secondary' }}
                      >
                        <Icon name="Copy" size={14} color="$textMuted" />
                      </XStack>
                      <XStack
                        onPress={(e: any) => { e.stopPropagation(); removeBlock(block.id); }}
                        role="button" aria-label="Excluir bloco" tabIndex={0}
                        onKeyDown={(e: any) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); removeBlock(block.id); } }}
                        px={1} py={1} cursor="pointer" hoverStyle={{ bg: '$secondary' }}
                      >
                        <Icon name="Trash2" size={14} color="$danger" />
                      </XStack>
                    </XStack>
                  )}
                  {showHandles && HANDLES.map(({ id, cursor, style }) => (
                    <div
                      key={id}
                      data-handle={id}
                      onMouseDown={(e) => onHandleMouseDown(e, block, id)}
                      style={{
                        position: 'absolute',
                        width: 10,
                        height: 10,
                        backgroundColor: 'white',
                        border: '2px solid #3B82F6',
                        borderRadius: '2px',
                        cursor,
                        zIndex: 30,
                        ...style,
                      }}
                    />
                  ))}
                </div>
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
        </div>
      </YStack>
    </YStack>
  );
};
