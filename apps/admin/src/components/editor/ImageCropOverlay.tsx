'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { YStack, XStack, Text, Button, Icon, Spinner } from '@projeto/ui';
import { StorageService } from '@projeto/core';

type CropRect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

type Props = {
  imageUrl: string;
  blockId: string;
  courseId: string;
  onCrop: (newUrl: string) => void;
  onClose: () => void;
};

type HandleDir = 'nw' | 'n' | 'ne' | 'w' | 'e' | 'sw' | 's' | 'se';

const HANDLES: { id: HandleDir; cursor: string; style: React.CSSProperties }[] = [
  { id: 'nw', cursor: 'nw-resize', style: { top: -6, left: -6 } },
  { id: 'n',  cursor: 'n-resize',  style: { top: -6, left: '50%', transform: 'translateX(-50%)' } },
  { id: 'ne', cursor: 'ne-resize', style: { top: -6, right: -6 } },
  { id: 'w',  cursor: 'w-resize',  style: { top: '50%', left: -6, transform: 'translateY(-50%)' } },
  { id: 'e',  cursor: 'e-resize',  style: { top: '50%', right: -6, transform: 'translateY(-50%)' } },
  { id: 'sw', cursor: 'sw-resize', style: { bottom: -6, left: -6 } },
  { id: 's',  cursor: 's-resize',  style: { bottom: -6, left: '50%', transform: 'translateX(-50%)' } },
  { id: 'se', cursor: 'se-resize', style: { bottom: -6, right: -6 } },
];

export default function ImageCropOverlay({ imageUrl, blockId, courseId, onCrop, onClose }: Props) {
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const [viewSize, setViewSize] = useState({ w: 0, h: 0 });
  const [rect, setRect] = useState<CropRect | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizing, setResizing] = useState<HandleDir | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, rect: { x: 0, y: 0, w: 0, h: 0 } });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scaleX = imgSize.w > 0 && viewSize.w > 0 ? imgSize.w / viewSize.w : 1;
  const scaleY = imgSize.h > 0 && viewSize.h > 0 ? imgSize.h / viewSize.h : 1;

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setViewSize({ w: width, h: height });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const getPos = useCallback((e: React.MouseEvent | MouseEvent) => {
    const el = containerRef.current;
    if (!el) return { x: 0, y: 0 };
    const b = el.getBoundingClientRect();
    return { x: e.clientX - b.left, y: e.clientY - b.top };
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (resizing || e.button !== 0) return;
    const pos = getPos(e);
    setIsDragging(true);
    setDragStart(pos);
    setRect({ x: pos.x, y: pos.y, w: 0, h: 0 });
  }, [getPos, resizing]);

  const onHandleMouseDown = useCallback((handle: HandleDir, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!rect) return;
    setResizing(handle);
    setResizeStart({ x: e.clientX, y: e.clientY, rect: { ...rect } });
  }, [rect]);

  useEffect(() => {
    if (!isDragging && !resizing) return;

    const onMove = (e: MouseEvent) => {
      if (isDragging) {
        const pos = getPos(e);
        const x = Math.min(dragStart.x, pos.x);
        const y = Math.min(dragStart.y, pos.y);
        const w = Math.abs(pos.x - dragStart.x);
        const h = Math.abs(pos.y - dragStart.y);
        setRect({
          x: Math.max(0, x),
          y: Math.max(0, y),
          w: Math.min(w, viewSize.w - x),
          h: Math.min(h, viewSize.h - y),
        });
      }

      if (resizing && rect) {
        const dx = e.clientX - resizeStart.x;
        const dy = e.clientY - resizeStart.y;
        let r = { ...resizeStart.rect };

        const isCorner = resizing === 'nw' || resizing === 'ne' || resizing === 'sw' || resizing === 'se';
        const isHorizontal = resizing === 'e' || resizing === 'w';

        if (resizing.includes('e') || resizing === 'e') r.w = Math.max(20, resizeStart.rect.w + dx);
        if (resizing.includes('w') || resizing === 'w') {
          r.x = Math.min(resizeStart.rect.x + dx, resizeStart.rect.x + resizeStart.rect.w - 20);
          r.w = resizeStart.rect.w - (resizeStart.rect.x + dx - resizeStart.rect.x);
          r.x = Math.max(0, r.x);
        }
        if (resizing.includes('s') || resizing === 's') r.h = Math.max(20, resizeStart.rect.h + dy);
        if (resizing.includes('n') || resizing === 'n') {
          r.y = Math.min(resizeStart.rect.y + dy, resizeStart.rect.y + resizeStart.rect.h - 20);
          r.h = resizeStart.rect.h - (resizeStart.rect.y + dy - resizeStart.rect.y);
          r.y = Math.max(0, r.y);
        }
        if (isCorner) {
          const aspect = resizeStart.rect.w / resizeStart.rect.h;
          if (resizing === 'se') { r.h = r.w / aspect; }
          else if (resizing === 'sw') { r.h = r.w / aspect; r.y = resizeStart.rect.y; }
          else if (resizing === 'ne') { r.w = r.h * aspect; }
          else if (resizing === 'nw') { r.w = r.h * aspect; r.x = resizeStart.rect.x; }
        } else if (isHorizontal) {
          r.h = r.w / (resizeStart.rect.w / resizeStart.rect.h);
        } else {
          r.w = r.h * (resizeStart.rect.w / resizeStart.rect.h);
        }

        if (r.x >= 0 && r.y >= 0 && r.w >= 20 && r.h >= 20) setRect(r);
      }
    };

    const onUp = () => {
      setIsDragging(false);
      setResizing(null);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDragging, resizing, dragStart, resizeStart, rect, getPos, viewSize]);

  const handleCrop = async () => {
    if (!rect || rect.w < 10 || rect.h < 10) {
      setError('Selecione uma área maior para cortar.');
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Falha ao carregar imagem'));
        img.src = imageUrl;
      });

      const cropX = Math.round(rect.x * scaleX);
      const cropY = Math.round(rect.y * scaleY);
      const cropW = Math.round(rect.w * scaleX);
      const cropH = Math.round(rect.h * scaleY);

      const canvas = document.createElement('canvas');
      canvas.width = cropW;
      canvas.height = cropH;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D não disponível');
      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => b ? resolve(b) : reject(new Error('Falha ao gerar blob')), 'image/png');
      });
      const file = new File([blob], `cropped-${blockId}.png`, { type: 'image/png' });
      const url = await StorageService.uploadCertificateImage(file, courseId, blockId);
      if (url) {
        onCrop(url);
      } else {
        throw new Error('Falha ao enviar imagem cortada');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cortar imagem');
    } finally {
      setProcessing(false);
    }
  };

  const overlayRect = rect ? {
    left: Math.max(0, rect.x),
    top: Math.max(0, rect.y),
    width: Math.min(rect.w, viewSize.w - rect.x),
    height: Math.min(rect.h, viewSize.h - rect.y),
  } : null;

  return (
    <YStack
      position="fixed"
      inset={0}
      zIndex={99999}
      bg="rgba(0,0,0,0.8)"
      ai="center"
      jc="center"
    >
      <YStack
        bg="white"
        borderRadius={12}
        overflow="hidden"
        width="90vw"
        height="85vh"
        style={{ maxWidth: 'min(90vw, 1300px)', maxHeight: 'min(85vh, 960px)' }}
      >
        <XStack ai="center" jc="space-between" p={12} borderBottomWidth={1} borderBottomColor="$border">
          <Text fontSize={14} fontWeight="600">Cortar Imagem</Text>
          <XStack ai="center" gap={8}>
            {rect && rect.w >= 10 && rect.h >= 10 && (
              <Text fontSize={11} color="$textMuted">
                {Math.round(rect.w * scaleX)}×{Math.round(rect.h * scaleY)}px
              </Text>
            )}
            <Button variant="ghost" onPress={onClose} px="$2">
              <Icon name="X" size={18} />
            </Button>
          </XStack>
        </XStack>

        <YStack f={1} ai="center" jc="center" p={16} bg="#f5f5f5" overflow="hidden">
          <div
            ref={containerRef}
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              cursor: rect ? 'default' : 'crosshair',
              userSelect: 'none',
            }}
            onMouseDown={onMouseDown}
          >
            <img
              src={imageUrl}
              alt="Crop preview"
              draggable={false}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                display: 'block',
                pointerEvents: 'none',
              }}
            />

            {overlayRect && (
              <>
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                  }}
                >
                  <svg width="100%" height="100%" style={{ position: 'absolute', left: 0, top: 0 }}>
                    <defs>
                      <mask id="cropMask">
                        <rect width="100%" height="100%" fill="white" />
                        <rect
                          x={overlayRect.left}
                          y={overlayRect.top}
                          width={overlayRect.width}
                          height={overlayRect.height}
                          fill="black"
                        />
                      </mask>
                    </defs>
                    <rect
                      width="100%"
                      height="100%"
                      fill="rgba(0,0,0,0.5)"
                      mask="url(#cropMask)"
                    />
                  </svg>
                </div>

                <div
                  style={{
                    position: 'absolute',
                    left: overlayRect.left,
                    top: overlayRect.top,
                    width: overlayRect.width,
                    height: overlayRect.height,
                    border: '2px solid #3b82f6',
                    boxSizing: 'border-box',
                    pointerEvents: 'none',
                  }}
                >
                  {HANDLES.map(h => (
                    <div
                      key={h.id}
                      onMouseDown={(e) => onHandleMouseDown(h.id, e)}
                      style={{
                        position: 'absolute',
                        width: 12,
                        height: 12,
                        backgroundColor: 'white',
                        border: '2px solid #3b82f6',
                        borderRadius: 2,
                        cursor: h.cursor,
                        pointerEvents: 'auto',
                        zIndex: 10,
                        ...h.style,
                      }}
                    />
                  ))}
                </div>
              </>
            )}

            {!rect && (
              <Text
                position="absolute"
                color="rgba(255,255,255,0.7)"
                fontSize={14}
                style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)', pointerEvents: 'none' }}
              >
                Clique e arraste para selecionar a área de corte
              </Text>
            )}
          </div>
        </YStack>

        <XStack ai="center" jc="space-between" p={12} borderTopWidth={1} borderTopColor="$border">
          {error ? (
            <Text fontSize={11} color="$error">{error}</Text>
          ) : (
            <div />
          )}
          <XStack gap={8}>
            <Button variant="ghost" borderWidth={1} borderColor="$border" onPress={onClose}>
              <Text fontSize={12}>Cancelar</Text>
            </Button>
            <Button
              onPress={handleCrop}
              disabled={!rect || rect.w < 10 || rect.h < 10 || processing}
              bg="$primary"
            >
              {processing ? <Spinner size="small" /> : <XStack ai="center" gap={6}><Icon name="Scissors" size={14} color="white" /><Text color="white" fontSize={12} fontWeight="600">Aplicar Corte</Text></XStack>}
            </Button>
          </XStack>
        </XStack>
      </YStack>
    </YStack>
  );
}
