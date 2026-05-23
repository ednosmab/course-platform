import { useEffect, useRef, useState } from 'react';

export const A4_RATIO_W = 29.7;
export const A4_RATIO_H = 21;
export const DESIGN_W = 1050;

interface A4ScaleResult {
  containerRef: React.RefObject<HTMLDivElement>;
  pageWidth: number;
  pageHeight: number;
  scale: number;
  ready: boolean;
}

export function useA4Scale(padding = 48): A4ScaleResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(([entry]) => {
      const cw = entry.contentRect.width - padding;
      const ch = entry.contentRect.height - padding;
      if (cw <= 0 || ch <= 0) return;

      const ratio = A4_RATIO_W / A4_RATIO_H;
      const maxW = Math.min(cw, DESIGN_W);
      let w = maxW;
      let h = w / ratio;

      if (h > ch) {
        h = ch;
        w = h * ratio;
      }

      setDims({ w, h });
      setReady(true);
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [padding]);

  return {
    containerRef: containerRef as React.RefObject<HTMLDivElement>,
    pageWidth: dims.w,
    pageHeight: dims.h,
    scale: dims.w / DESIGN_W,
    ready,
  };
}
