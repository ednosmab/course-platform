'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { AnyBlock } from '@projeto/types';
import { useEditor } from '../../../context/EditorContext';
import type { Layout, HandleDir, MeasureGuide, GuideLine, SnapType } from './editor-types';
import { MIN_W, MIN_H, getLayout, computeBlockGuidesWithSnap } from './editor-types';

const SCROLL_THRESHOLD = 50;
const SCROLL_MIN_SPEED = 2;
const SCROLL_MAX_SPEED = 12;

export function useViewportInteraction(scale: number, scrollContainerRef?: React.RefObject<HTMLDivElement | null>) {
  const { blocks, activeBlockId, setActiveBlockId, removeBlock, updateBlock, viewportMode } = useEditor();
  const [isInteracting, setIsInteracting] = useState(false);
  const [guides, setGuides] = useState<{ v: GuideLine[]; h: GuideLine[]; m: MeasureGuide[] }>({ v: [], h: [], m: [] });
  const [snapType, setSnapType] = useState<SnapType>(null);
  const autoScrollRef = useRef<{ rafId: number | null; direction: 'up' | 'down' | null; speed: number }>({ rafId: null, direction: null, speed: 0 });
  const scrollOffsetRef = useRef(0);
  const lastMouseRef = useRef<{ clientX: number; clientY: number } | null>(null);
  const interactionRef = useRef<{
    mode: 'move' | 'resize';
    blockId: string;
    handle?: HandleDir;
    startMouseX: number;
    startMouseY: number;
    startLayout: Layout;
    currentLayouts: Record<string, any>;
  } | null>(null);
  const blocksRef = useRef(blocks);
  blocksRef.current = blocks;
  const pendingLayoutRef = useRef<{ blockId: string; layout: Layout } | null>(null);

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
    const container = scrollContainerRef?.current;

    const startAutoScroll = (direction: 'up' | 'down') => {
      if (!container || autoScrollRef.current.rafId) return;

      const tick = () => {
        if (!interactionRef.current || !container) {
          autoScrollRef.current = { rafId: null, direction: null, speed: 0 };
          return;
        }
        const { direction: dir } = autoScrollRef.current;
        if (!dir) { autoScrollRef.current.rafId = null; return; }
        const prevScrollTop = container.scrollTop;
        container.scrollBy(0, dir === 'up' ? -autoScrollRef.current.speed : autoScrollRef.current.speed);
        scrollOffsetRef.current += container.scrollTop - prevScrollTop;
        if (lastMouseRef.current) {
          const mockEvent = { clientX: lastMouseRef.current.clientX, clientY: lastMouseRef.current.clientY } as MouseEvent;
          const newLayout = applyLayout(mockEvent);
          if (newLayout) {
            pendingLayoutRef.current = { blockId: interactionRef.current.blockId, layout: newLayout };
            const el = document.querySelector(`[data-block-id="${interactionRef.current.blockId}"]`) as HTMLElement;
            if (el) { el.style.left = `${newLayout.x}px`; el.style.top = `${newLayout.y}px`; }
          }
        }
        autoScrollRef.current.rafId = requestAnimationFrame(tick);
      };
      autoScrollRef.current.rafId = requestAnimationFrame(tick);
    };

    const updateAutoScroll = (e: MouseEvent) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const mouseY = e.clientY;
      const distToTop = mouseY - rect.top;
      const distToBottom = rect.bottom - mouseY;

      let newDir: 'up' | 'down' | null = null;
      let newSpeed = 0;

      if (distToTop > 0 && distToTop < SCROLL_THRESHOLD) {
        newDir = 'up';
        newSpeed = Math.round(SCROLL_MIN_SPEED + (SCROLL_MAX_SPEED - SCROLL_MIN_SPEED) * (1 - distToTop / SCROLL_THRESHOLD));
      } else if (distToBottom > 0 && distToBottom < SCROLL_THRESHOLD) {
        newDir = 'down';
        newSpeed = Math.round(SCROLL_MIN_SPEED + (SCROLL_MAX_SPEED - SCROLL_MIN_SPEED) * (1 - distToBottom / SCROLL_THRESHOLD));
      }

      const prev = autoScrollRef.current.direction;
      autoScrollRef.current.direction = newDir;
      autoScrollRef.current.speed = newSpeed;

      if (newDir && !prev) startAutoScroll(newDir);
      else if (!newDir && prev) {
        if (autoScrollRef.current.rafId) cancelAnimationFrame(autoScrollRef.current.rafId);
        autoScrollRef.current.rafId = null;
      }
    };

    const applyLayout = (e: MouseEvent): Layout | null => {
      if (!interactionRef.current) return null;
      const { mode, handle, startMouseX, startMouseY, startLayout } = interactionRef.current;
      const dx = (e.clientX - startMouseX) / scale;
      const dy = (e.clientY - startMouseY + scrollOffsetRef.current) / scale;
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
      lastMouseRef.current = { clientX: e.clientX, clientY: e.clientY };
      if (!interactionRef.current) return;
      updateAutoScroll(e);
      const newLayout = applyLayout(e);
      if (newLayout) {
        pendingLayoutRef.current = { blockId: interactionRef.current.blockId, layout: newLayout };
        const el = document.querySelector(`[data-block-id="${interactionRef.current.blockId}"]`) as HTMLElement;
        if (el) { el.style.left = `${newLayout.x}px`; el.style.top = `${newLayout.y}px`; }
        const result = computeBlockGuidesWithSnap(newLayout, interactionRef.current.blockId, blocksRef.current, viewportMode);
        setGuides({ v: result.vGuides, h: result.hGuides, m: result.mGuides });
        setSnapType(result.snapType);
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!interactionRef.current) return;
      if (autoScrollRef.current.rafId) cancelAnimationFrame(autoScrollRef.current.rafId);
      autoScrollRef.current = { rafId: null, direction: null, speed: 0 };
      scrollOffsetRef.current = 0;
      lastMouseRef.current = null;
      if (interactionRef.current.mode === 'move') {
        const pending = pendingLayoutRef.current;
        if (pending && pending.blockId === interactionRef.current.blockId) {
          updateBlock(interactionRef.current.blockId, buildUpdate(pending.layout));
        } else {
          const newLayout = applyLayout(e);
          if (newLayout) updateBlock(interactionRef.current.blockId, buildUpdate(newLayout));
        }
        pendingLayoutRef.current = null;
      } else {
        const newLayout = applyLayout(e);
        if (newLayout) updateBlock(interactionRef.current.blockId, buildUpdate(newLayout));
      }
      interactionRef.current = null;
      setIsInteracting(false);
      setGuides({ v: [], h: [], m: [] });
      setSnapType(null);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      if (autoScrollRef.current.rafId) cancelAnimationFrame(autoScrollRef.current.rafId);
      autoScrollRef.current = { rafId: null, direction: null, speed: 0 };
      scrollOffsetRef.current = 0;
      lastMouseRef.current = null;
      pendingLayoutRef.current = null;
    };
  }, [updateBlock, scale, viewportMode, scrollContainerRef]);

  return { activeBlockId, setActiveBlockId, removeBlock, updateBlock, isInteracting, onBlockMouseDown, onHandleMouseDown, guides, snapType };
}
