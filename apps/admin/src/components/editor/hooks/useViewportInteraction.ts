'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { AnyBlock } from '@projeto/types';
import { useEditor } from '../../../context/EditorContext';
import type { Layout, HandleDir, MeasureGuide} from './editor-types';
import { MIN_W, MIN_H, getLayout, computeBlockGuides } from './editor-types';

export function useViewportInteraction(scale: number) {
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
