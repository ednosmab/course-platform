import { useEffect, useRef, useState } from 'react';

export const A4_RATIO_W = 29.7;
export const A4_RATIO_H = 21;
export const DESIGN_W = 1050;

interface A4ScaleResult {
  containerRef: React.RefObject<HTMLDivElement>;
  a4Width: number;
  scale: number;
  ready: boolean;
}

export function useA4Scale(): A4ScaleResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(([entry]) => {
      const cw = entry.contentRect.width;
      if (cw <= 0) return;
      setWidth(cw);
      setReady(true);
    });

    requestAnimationFrame(() => {
      if (containerRef.current) ro.observe(containerRef.current);
    });

    return () => ro.disconnect();
  }, []);

  return {
    containerRef: containerRef as React.RefObject<HTMLDivElement>,
    a4Width: width,
    scale: width ? width / DESIGN_W : 1,
    ready,
  };
}
