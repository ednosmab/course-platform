'use client';

import type { AnyBlock } from '@projeto/types';

export type HandleDir = 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se';
export type SnapType = 'center' | 'edge' | 'page' | null;

export interface Layout { x: number; y: number; w: number; h: number; zIndex: number; }
export interface GuideLine { pos: number; color: string; type: SnapType; }
export interface MeasureGuide { pos: number; start: number; end: number; value: number; orientation: 'h' | 'v'; }

export const CANVAS_W = 1100;
export const PAGE_W = 1100;
export const MOBILE_W = 390;
export const TABLET_W = 650;
export const MIN_W = 80;
export const MIN_H = 40;
export const ALIGN_THRESHOLD = 8;
export const GRID_SIZE = 8;

export const GUIDE_COLORS = {
  center: '#8B5CF6',
  edge: '#8B5CF6',
  page: '#8B5CF6',
  measure: '#F59E0B',
};

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

export function computeBlockGuidesWithSnap(
  draggedLayout: Layout, draggedBlockId: string,
  blocks: AnyBlock[], viewportMode: 'desktop' | 'tablet' | 'mobile',
): { vGuides: GuideLine[]; hGuides: GuideLine[]; mGuides: MeasureGuide[]; snappedX: number; snappedY: number; snapType: SnapType } {
  const pageH = Math.max(800, ...blocks.map(b => {
    const l = getLayout(b, viewportMode);
    return l.y + l.h + 120;
  }));
  const dcx = draggedLayout.x + draggedLayout.w / 2;
  const dcy = draggedLayout.y + draggedLayout.h / 2;
  const dr = draggedLayout.x + draggedLayout.w;
  const db = draggedLayout.y + draggedLayout.h;

  let snappedX = draggedLayout.x;
  let snappedY = draggedLayout.y;
  let snapType: SnapType = null;

  const vGuides: GuideLine[] = [];
  const hGuides: GuideLine[] = [];
  const mGuides: MeasureGuide[] = [];

  const vCandidates: { pos: number; snapTo: number; type: SnapType }[] = [];
  const hCandidates: { pos: number; snapTo: number; type: SnapType }[] = [];

  vCandidates.push({ pos: dcx, snapTo: CANVAS_W / 2, type: 'center' });
  hCandidates.push({ pos: dcy, snapTo: pageH / 2, type: 'center' });

  vCandidates.push({ pos: draggedLayout.x, snapTo: 0, type: 'page' });
  vCandidates.push({ pos: dr, snapTo: PAGE_W, type: 'page' });

  for (const block of blocks) {
    if (block.id === draggedBlockId) continue;
    const l = getLayout(block, viewportMode);
    const br = l.x + l.w;
    const bb = l.y + l.h;

    vCandidates.push({ pos: dcx, snapTo: l.x + l.w / 2, type: 'center' });
    vCandidates.push({ pos: draggedLayout.x, snapTo: l.x, type: 'edge' });
    vCandidates.push({ pos: dr, snapTo: br, type: 'edge' });

    hCandidates.push({ pos: dcy, snapTo: l.y + l.h / 2, type: 'center' });
    hCandidates.push({ pos: draggedLayout.y, snapTo: l.y, type: 'edge' });
    hCandidates.push({ pos: db, snapTo: bb, type: 'edge' });

    const vyOverlap = Math.min(db, bb) - Math.max(draggedLayout.y, l.y);
    const vxOverlap = Math.min(dr, br) - Math.max(draggedLayout.x, l.x);

    if (vyOverlap > 0 && br <= draggedLayout.x) {
      mGuides.push({ orientation: 'h', pos: (Math.max(draggedLayout.y, l.y) + Math.min(db, bb)) / 2, start: br, end: draggedLayout.x, value: Math.round(draggedLayout.x - br) });
    }
    if (vyOverlap > 0 && l.x >= dr) {
      mGuides.push({ orientation: 'h', pos: (Math.max(draggedLayout.y, l.y) + Math.min(db, bb)) / 2, start: dr, end: l.x, value: Math.round(l.x - dr) });
    }
    if (vxOverlap > 0 && bb <= draggedLayout.y) {
      mGuides.push({ orientation: 'v', pos: (Math.max(draggedLayout.x, l.x) + Math.min(dr, br)) / 2, start: bb, end: draggedLayout.y, value: Math.round(draggedLayout.y - bb) });
    }
    if (vxOverlap > 0 && l.y >= db) {
      mGuides.push({ orientation: 'v', pos: (Math.max(draggedLayout.x, l.x) + Math.min(dr, br)) / 2, start: db, end: l.y, value: Math.round(l.y - db) });
    }
  }

  let bestVDist = Infinity;
  let bestVGuide: GuideLine | null = null;
  for (const c of vCandidates) {
    const dist = Math.abs(c.pos - c.snapTo);
    if (dist < ALIGN_THRESHOLD && dist < bestVDist) {
      bestVDist = dist;
      bestVGuide = { pos: c.snapTo, color: c.type === 'center' ? GUIDE_COLORS.center : c.type === 'page' ? GUIDE_COLORS.page : GUIDE_COLORS.edge, type: c.type };
      snapType = c.type;
    }
  }

  let bestHDist = Infinity;
  let bestHGuide: GuideLine | null = null;
  for (const c of hCandidates) {
    const dist = Math.abs(c.pos - c.snapTo);
    if (dist < ALIGN_THRESHOLD && dist < bestHDist) {
      bestHDist = dist;
      bestHGuide = { pos: c.snapTo, color: c.type === 'center' ? GUIDE_COLORS.center : c.type === 'page' ? GUIDE_COLORS.page : GUIDE_COLORS.edge, type: c.type };
      snapType = c.type;
    }
  }

  if (bestVGuide) {
    vGuides.push(bestVGuide);
    snappedX = bestVGuide.pos - draggedLayout.w / 2;
  }
  if (bestHGuide) {
    hGuides.push(bestHGuide);
    snappedY = bestHGuide.pos - draggedLayout.h / 2;
  }

  return { vGuides, hGuides, mGuides, snappedX, snappedY, snapType };
}
