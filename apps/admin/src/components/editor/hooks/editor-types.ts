'use client';

import type { AnyBlock } from '@projeto/types';

export type HandleDir = 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se';

export interface Layout { x: number; y: number; w: number; h: number; zIndex: number; }
export interface MeasureGuide { pos: number; start: number; end: number; value: number; orientation: 'h' | 'v'; }

export const CANVAS_W = 1100;
export const PAGE_W = 1100;
export const MOBILE_W = 390;
export const TABLET_W = 650;
export const MIN_W = 80;
export const MIN_H = 40;
export const ALIGN_THRESHOLD = 5;

export function getLayout(block: AnyBlock, viewport?: 'desktop' | 'tablet' | 'mobile'): Layout {
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

export function computeBlockGuides(
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
