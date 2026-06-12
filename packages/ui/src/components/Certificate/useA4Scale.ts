import { useEffect, useRef, useState } from 'react';

export const A4_RATIO_W = 29.7;
export const A4_RATIO_H = 21;
export const DESIGN_W = 1050;
export const DESIGN_H = 794;

interface A4ScaleResult {
  containerRef: React.RefObject<HTMLDivElement>;
  a4Width: number;
  scale: number;
  ready: boolean;
}

export interface A4ScaleOptions {
  /**
   * Number of A4 canvases stacked vertically (1 for single-side, 2 for duplex).
   * When > 1, the scale is reduced so the canvases also fit the container height.
   */
  pages?: number;
  /** Inner padding of the parent container, in design pixels (default 24). */
  innerPadding?: number;
  /** Vertical gap between pages in design pixels (default 48). */
  pageGap?: number;
}

export function useA4Scale(options: A4ScaleOptions = {}): A4ScaleResult {
  const { pages = 1, innerPadding = 24, pageGap = 48 } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(([entry]) => {
      const cw = entry.contentRect.width;
      const ch = entry.contentRect.height;
      if (cw <= 0) return;
      setWidth(cw);
      setHeight(ch);
      setReady(true);
    });

    requestAnimationFrame(() => {
      if (containerRef.current) ro.observe(containerRef.current);
    });

    return () => ro.disconnect();
  }, []);

  // Width-limited scale: how big each A4 can be to fit the parent width
  // (minus padding), expressed in design pixels.
  const availableW = Math.max(0, width - innerPadding * 2);
  const widthScale = availableW / DESIGN_W;

  // Height-limited scale: how big each A4 can be to fit the parent height
  // (minus padding and gaps between pages).
  const availableH = Math.max(0, height - innerPadding * 2 - Math.max(0, pages - 1) * pageGap);
  const heightScale = pages > 0 ? availableH / (DESIGN_H * pages) : Infinity;

  const scale = Math.max(0, Math.min(widthScale, heightScale));
  const a4Width = scale * DESIGN_W;

  return {
    containerRef: containerRef as React.RefObject<HTMLDivElement>,
    a4Width,
    scale,
    ready,
  };
}
