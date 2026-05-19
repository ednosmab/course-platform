'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useEditor } from '../../context/EditorContext';
import { Icon } from '@projeto/ui';
import { StudentPreview } from '../preview/StudentPreview';
import { AnyBlock } from '@projeto/types';

// ─── Viewport sizes (real-world viewport boundaries) ────────────────────────
// LAW: O que é apresentado no Preview é o resultado final da tela do usuário.
//      MobileCanvas e PreviewCanvas DEVEM usar o mesmo renderer. Não há exceções.
const CANVAS_W = 1100; // Largura do canvas livre de edição
const CANVAS_H = 3000; // Altura total do canvas (scrollable)
const PAGE_W   = 1100; // Largura do delimitador de página (desktop viewport)
const MOBILE_W = 390;  // iPhone 14 / Android padrão
const MOBILE_H = 720;   // Altura visível do frame mobile (viewport sem barra)
const MIN_W = 80;
const MIN_H = 40;

// Detecta se um bloco está fora dos limites da página
function isOutOfBounds(block: AnyBlock, pageW: number): boolean {
  const l = getLayout(block);
  return l.x < 0 || l.x + l.w > pageW || l.y < 0;
}

// Parser simples de Markdown para ênfase, negrito, combinados (strong + em) e blockquotes (>) inline
function parseSimpleMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];

  // Divide o texto por quebras de linha para detectar blockquotes
  const lines = text.split('\n');
  const renderedLines: React.ReactNode[] = [];

  // Helper para analisar formatação negrito/itálico inline em uma linha
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
            paddingLeft: '12px',
            marginLeft: '0',
            marginRight: '0',
            marginTop: '8px',
            marginBottom: '8px',
            fontStyle: 'italic',
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--bg-canvas)',
            paddingTop: '6px',
            paddingBottom: '6px',
            paddingRight: '12px',
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

// ─── Resize handle directions ─────────────────────────────────────────────────
type HandleDir = 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se';

interface Layout { x: number; y: number; w: number; h: number; zIndex: number; }

function getLayout(block: AnyBlock): Layout {
  const l = (block as any).layout;
  return {
    x: typeof l?.x === 'number' ? l.x : 40,
    y: typeof l?.y === 'number' ? l.y : 40,
    w: typeof l?.w === 'number' ? l.w : 600,
    h: typeof l?.h === 'number' ? l.h : 120,
    zIndex: typeof l?.zIndex === 'number' ? l.zIndex : 0,
  };
}

const HANDLES: { id: HandleDir; cursor: string; style: React.CSSProperties }[] = [
  { id: 'nw', cursor: 'nw-resize', style: { top: -5, left: -5 } },
  { id: 'n',  cursor: 'n-resize',  style: { top: -5, left: '50%', transform: 'translateX(-50%)' } },
  { id: 'ne', cursor: 'ne-resize', style: { top: -5, right: -5 } },
  { id: 'w',  cursor: 'w-resize',  style: { top: '50%', left: -5, transform: 'translateY(-50%)' } },
  { id: 'e',  cursor: 'e-resize',  style: { top: '50%', right: -5, transform: 'translateY(-50%)' } },
  { id: 'sw', cursor: 'sw-resize', style: { bottom: -5, left: -5 } },
  { id: 's',  cursor: 's-resize',  style: { bottom: -5, left: '50%', transform: 'translateX(-50%)' } },
  { id: 'se', cursor: 'se-resize', style: { bottom: -5, right: -5 } },
];

// Tipografia responsiva padrão comercial
const FONT_DESKTOP: Record<string, string> = { small: '13px', medium: '16px', large: '24px', xlarge: '32px' };
const FONT_MOBILE:  Record<string, string> = { small: '12px', medium: '15px', large: '19px', xlarge: '24px' };
const FONT_WEIGHT:  Record<string, number> = { small: 400, medium: 400, large: 600, xlarge: 700 };

// ─── Block content ────────────────────────────────────────────────────────────
function BlockContent({ block, onImageDrop, isMobile = false, isInteracting = false }: {
  block: AnyBlock;
  onImageDrop?: (blockId: string, file: File) => void;
  isMobile?: boolean;
  isInteracting?: boolean;
}) {
  if (block.type === 'text') {
    const styles = (block.styles || {}) as any;
    const fs = styles.fontSize || 'medium';
    const fontSize = isMobile ? FONT_MOBILE[fs] : FONT_DESKTOP[fs];
    
    // Configura o estilo visual do texto com tipografia e background
    const style: React.CSSProperties = {
      fontSize,
      fontFamily: styles.fontFamily || 'inherit',
      color: styles.color || 'var(--text-primary)',
      backgroundColor: styles.backgroundColor || 'transparent',
      backgroundImage: styles.backgroundImage ? `url(${styles.backgroundImage})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      textAlign: styles.align || 'left',
      lineHeight: 1.6,
      width: '100%',
      height: '100%',
      padding: styles.backgroundColor || styles.backgroundImage ? '16px' : '0',
      borderRadius: styles.backgroundColor || styles.backgroundImage ? '8px' : '0',
      overflow: isMobile ? 'visible' : 'hidden',
    };

    let textElement: React.ReactNode = <>{parseSimpleMarkdown(block.content)}</>;
    if (styles.bold) {
      textElement = <strong>{textElement}</strong>;
    }
    if (styles.italic) {
      textElement = <em>{textElement}</em>;
    }

    return (
      <div style={style}>
        {textElement}
      </div>
    );
  }
  if (block.type === 'video') {
    return (
      <div style={{ width: '100%', height: '100%', backgroundColor: '#1e293b', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#1e293b" style={{ marginLeft: '3px' }}><path d="M5 3l14 9-14 9V3z"/></svg>
        </div>
        <div style={{ position: 'absolute', bottom: '8px', left: '12px', color: 'white', fontSize: '11px', opacity: 0.6 }}>{block.provider}</div>
      </div>
    );
  }
  if (block.type === 'image') {
    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/') && onImageDrop) {
        onImageDrop(block.id, file);
      }
    };
    return (
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{ width: '100%', height: '100%' }}
      >
        {block.url ? (
          <img src={block.url} alt={block.alt || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px', display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', border: '2px dashed #93c5fd', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', gap: '8px', backgroundColor: '#eff6ff' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
            <span style={{ fontSize: '12px', color: '#60a5fa', fontWeight: 500 }}>Arraste uma imagem aqui</span>
            <span style={{ fontSize: '11px' }}>ou cole a URL no painel →</span>
          </div>
        )}
      </div>
    );
  }
  if (block.type === 'quote') {
    const styles = (block.styles || {}) as any;
    const fs = styles.fontSize || 'medium';
    const fontSize = isMobile ? FONT_MOBILE[fs] : FONT_DESKTOP[fs];

    const cardStyle: React.CSSProperties = {
      backgroundColor: styles.backgroundColor || 'transparent',
      backgroundImage: styles.backgroundImage ? `url(${styles.backgroundImage})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      borderRadius: styles.backgroundColor || styles.backgroundImage ? '8px' : '0',
      padding: styles.backgroundColor || styles.backgroundImage ? '16px' : '0',
      borderLeft: styles.backgroundColor || styles.backgroundImage ? 'none' : '4px solid var(--accent-blue)',
      paddingLeft: styles.backgroundColor || styles.backgroundImage ? '16px' : '16px',
      height: '100%',
      overflow: 'auto',
      color: styles.color || 'var(--text-secondary)',
      fontFamily: styles.fontFamily || 'inherit',
      textAlign: styles.align || 'left',
    };

    let textElement: React.ReactNode = <>{parseSimpleMarkdown(block.content)}</>;
    if (styles.bold) {
      textElement = <strong>{textElement}</strong>;
    }
    if (styles.italic) {
      textElement = <em>{textElement}</em>;
    }

    return (
      <div style={cardStyle}>
        {/* Ícone sutil de aspas se houver espaço e fundo */}
        {(styles.backgroundColor || styles.backgroundImage) && (
          <div style={{ opacity: 0.15, fontSize: '32px', lineHeight: 0.5, marginBottom: '4px', fontFamily: 'serif' }}>“</div>
        )}
        <div style={{ fontSize, fontStyle: 'italic', lineHeight: 1.6 }}>
          {textElement}
        </div>
        {block.author && (
          <div style={{ fontSize: '11px', marginTop: '8px', opacity: 0.7, fontWeight: 500 }}>
            — {block.author}
          </div>
        )}
      </div>
    );
  }
  if (block.type === 'html') {
    // iframe srcdoc: garante 100% de largura e altura no html/body para objetos 3D escalarem perfeitamente
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
    const styles = (block.styles || {}) as any;
    const fs = styles.fontSize || 'medium';
    const fontSize = isMobile ? FONT_MOBILE[fs] : FONT_DESKTOP[fs];

    const cardStyle: React.CSSProperties = {
      backgroundColor: styles.backgroundColor || 'var(--bg-canvas)',
      backgroundImage: styles.backgroundImage ? `url(${styles.backgroundImage})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      borderRadius: '8px',
      padding: '12px',
      border: styles.backgroundColor || styles.backgroundImage ? 'none' : '1px solid var(--border-light)',
      height: '100%',
      overflow: 'auto',
      color: styles.color || 'var(--text-primary)',
      fontFamily: styles.fontFamily || 'inherit',
    };

    let questionElement: React.ReactNode = <>{parseSimpleMarkdown(block.question)}</>;
    if (styles.bold) {
      questionElement = <strong>{questionElement}</strong>;
    }
    if (styles.italic) {
      questionElement = <em>{questionElement}</em>;
    }

    return (
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <span style={{ backgroundColor: 'var(--accent-blue-light)', color: 'var(--accent-blue)', fontSize: '9px', fontWeight: 700, padding: '2px 5px', borderRadius: '3px', flexShrink: 0 }}>QUIZ</span>
          <span style={{ fontSize, lineHeight: 1.4 }}>
            {questionElement}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {block.options.map((opt, i) => (
            <div key={opt.id} style={{ display: 'flex', alignItems: 'center', padding: '6px 10px', borderRadius: '5px', border: opt.isCorrect ? '1px solid #10b981' : '1px solid var(--border-light)', backgroundColor: opt.isCorrect ? '#ecfdf5' : 'white', fontSize: '11px' }}>
              <span style={{ marginRight: '6px', fontWeight: 600, color: 'var(--text-tertiary)', flexShrink: 0 }}>{String.fromCharCode(65 + i)}</span>
              <span style={{ color: opt.isCorrect ? '#065f46' : 'var(--text-secondary)' }}>{opt.text}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

// ─── Group blocks by visual row (for responsive reflow) ────────────────────────
function groupBlocksByRow(blocks: AnyBlock[]): AnyBlock[][] {
  if (!blocks.length) return [];
  const sorted = [...blocks].sort((a, b) => getLayout(a).y - getLayout(b).y);
  const rows: AnyBlock[][] = [];
  let row = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const bl = getLayout(sorted[i]);
    const overlaps = row.some(rb => {
      const rl = getLayout(rb);
      return bl.y < rl.y + rl.h && bl.y + bl.h > rl.y;
    });
    if (overlaps) {
      row.push(sorted[i]);
    } else {
      rows.push([...row].sort((a, b) => getLayout(a).x - getLayout(b).x));
      row = [sorted[i]];
    }
  }
  rows.push([...row].sort((a, b) => getLayout(a).x - getLayout(b).x));
  return rows;
}

// ─── Mobile canvas — suporta editMode interativo ──────────────────────────
function MobileCanvas({ blocks, onImageDrop, editMode = false }: {
  blocks: AnyBlock[];
  onImageDrop?: (id: string, file: File) => void;
  editMode?: boolean;
}) {
  const { activeBlockId, setActiveBlockId, removeBlock, updateBlock } = useEditor();
  const rows = groupBlocksByRow(blocks);

  const widthPresets = [25, 50, 75, 100];

  return (
    <div
      style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}
      onClick={editMode ? () => setActiveBlockId(null) : undefined}
    >
      {rows.map((row, ri) => {
        const totalW = row.reduce((s, b) => s + getLayout(b).w, 0);
        return (
          <div key={ri} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'flex-start' }}>
            {row.map(block => {
              const l = getLayout(block);
              const flexBasis = `${Math.max(40, Math.round((l.w / totalW) * 100))}%`;
              const isSelected = editMode && block.id === activeBlockId;
              const currentPct = Math.round((l.w / CANVAS_W) * 100);

              return (
                <div
                  key={block.id}
                  onClick={editMode ? (e) => { e.stopPropagation(); setActiveBlockId(block.id); } : undefined}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: `1 1 ${flexBasis}`, minWidth: '140px',
                    minHeight: l.h * (MOBILE_W / CANVAS_W),
                    position: 'relative', borderRadius: '6px',
                    outline: isSelected ? '2px solid #3b82f6' : 'none',
                    outlineOffset: '2px',
                    cursor: editMode ? 'pointer' : 'default',
                    paddingTop: isSelected ? '8px' : '0',
                    paddingBottom: isSelected ? '36px' : '0',
                  }}
                >
                  <BlockContent block={block} onImageDrop={onImageDrop} isMobile />

                  {/* ── Mobile edit controls ── */}
                  {isSelected && (
                    <>
                      {/* Delete */}
                      <button
                        onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                        style={{ position: 'absolute', top: -28, right: 0, zIndex: 20, backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '3px 8px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                      >
                        🗑 Excluir
                      </button>

                      {/* Width presets */}
                      <div style={{ position: 'absolute', bottom: 4, left: 0, right: 0, display: 'flex', gap: '3px', justifyContent: 'center' }}>
                        <span style={{ fontSize: '9px', color: 'var(--text-tertiary)', alignSelf: 'center', marginRight: '2px' }}>Largura:</span>
                        {widthPresets.map(pct => (
                          <button
                            key={pct}
                            onClick={(e) => {
                              e.stopPropagation();
                              updateBlock(block.id, { layout: { ...l, w: Math.round(CANVAS_W * pct / 100) } } as any);
                            }}
                            style={{
                              backgroundColor: currentPct === pct ? '#3b82f6' : '#e2e8f0',
                              color: currentPct === pct ? 'white' : '#475569',
                              border: 'none', borderRadius: '3px', padding: '2px 6px',
                              fontSize: '9px', fontWeight: 600, cursor: 'pointer',
                            }}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ─── Preview Mode ────────────────────────────────────────────────────────
function PreviewCanvas({ blocks, isMobile }: { blocks: AnyBlock[]; isMobile?: boolean }) {
  const pageH = Math.max(800, ...blocks.map(b => { const l = getLayout(b); return l.y + l.h + 120; }));
  const sortedBlocks = [...blocks].sort((a, b) => getLayout(a).zIndex - getLayout(b).zIndex);
  return (
    <div className="canvas-area" style={{
      backgroundColor: '#F1F2F8',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '24px',
      overflowY: 'auto',
      flex: 1,
    }}>
      {isMobile ? (
        <div style={{
          width: MOBILE_W + 24,
          maxWidth: MOBILE_W + 24,
          backgroundColor: '#FFFFFF',
          borderRadius: 28,
          boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          border: '6px solid #1e293b',
        }}>
          <div style={{ backgroundColor: '#1e293b', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#ef4444' }} />
            <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
            <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#10b981' }} />
            <span style={{ marginLeft: 'auto', fontSize: 10, color: '#94a3b8' }}>Preview Mobile</span>
          </div>
          <StudentPreview blocks={blocks} />
        </div>
      ) : (
        <div style={{
          position: 'relative',
          width: PAGE_W,
          minHeight: pageH,
          backgroundColor: '#FFFFFF',
          borderRadius: 8,
          boxShadow: '0 2px 24px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.06)',
        }}>
          {sortedBlocks.map((block) => {
            const layout = getLayout(block);
            return (
              <div key={block.id} style={{ position: 'absolute', left: layout.x, top: layout.y, width: layout.w, height: layout.h, zIndex: layout.zIndex + 1 }}>
                <BlockContent block={block} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Mobile Viewport (edit mode interativo) ─────────────────────────────
function MobileViewport({ blocks, onImageDrop }: { blocks: AnyBlock[]; onImageDrop: (id: string, file: File) => void }) {
  return (
    <div className="canvas-area canvas-bg" style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start', padding: '24px', overflowY: 'auto' }}>
      <div style={{ border: '6px solid #1e293b', borderRadius: '36px', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.25)', backgroundColor: 'white', width: MOBILE_W + 12, flexShrink: 0 }}>
        {/* Notch */}
        <div style={{ backgroundColor: '#1e293b', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{ width: '60px', height: '6px', borderRadius: '3px', backgroundColor: '#475569' }} />
        </div>
        {/* Scrollable + editMode ativo */}
        <div style={{ overflowY: 'auto', overflowX: 'hidden', backgroundColor: '#f8fafc',
          backgroundImage: 'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)',
          backgroundSize: '32px 32px' }}>
          <MobileCanvas blocks={blocks} onImageDrop={onImageDrop} editMode />
        </div>
        {/* Home bar */}
        <div style={{ backgroundColor: 'white', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{ width: '40px', height: '4px', borderRadius: '2px', backgroundColor: '#e2e8f0' }} />
        </div>
      </div>
    </div>
  );
}

// ─── Main EditorCanvas ────────────────────────────────────────────────────────
export const EditorCanvas: React.FC = () => {
  const { blocks, activeBlockId, setActiveBlockId, removeBlock, updateBlock, updateBlockSilent, previewMode, viewportMode } = useEditor();
  const [mounted, setMounted] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  const interactionRef = useRef<{
    mode: 'move' | 'resize';
    blockId: string;
    handle?: HandleDir;
    startMouseX: number;
    startMouseY: number;
    startLayout: Layout;
  } | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const handleImageDrop = useCallback((blockId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) updateBlock(blockId, { url: e.target.result as string } as any);
    };
    reader.readAsDataURL(file);
  }, [updateBlock]);

  const onBlockMouseDown = useCallback((e: React.MouseEvent, block: AnyBlock) => {
    if ((e.target as HTMLElement).dataset.handle) return;
    e.preventDefault();
    e.stopPropagation();
    setActiveBlockId(block.id);
    setIsInteracting(true);
    interactionRef.current = {
      mode: 'move', blockId: block.id,
      startMouseX: e.clientX, startMouseY: e.clientY,
      startLayout: getLayout(block),
    };
  }, [setActiveBlockId]);

  const onHandleMouseDown = useCallback((e: React.MouseEvent, block: AnyBlock, handle: HandleDir) => {
    e.preventDefault();
    e.stopPropagation();
    setIsInteracting(true);
    interactionRef.current = {
      mode: 'resize', blockId: block.id, handle,
      startMouseX: e.clientX, startMouseY: e.clientY,
      startLayout: getLayout(block),
    };
  }, []);

  useEffect(() => {
    const applyLayout = (e: MouseEvent): Layout | null => {
      if (!interactionRef.current) return null;
      const { mode, handle, startMouseX, startMouseY, startLayout } = interactionRef.current;
      const dx = e.clientX - startMouseX;
      const dy = e.clientY - startMouseY;
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

    const onMouseMove = (e: MouseEvent) => {
      if (!interactionRef.current) return;
      const layout = applyLayout(e);
      if (layout) updateBlockSilent(interactionRef.current.blockId, { layout } as any);
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!interactionRef.current) return;
      const layout = applyLayout(e);
      if (layout) updateBlock(interactionRef.current.blockId, { layout } as any);
      interactionRef.current = null;
      setIsInteracting(false);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [updateBlock, updateBlockSilent]);

  if (!mounted) return <div className="canvas-area canvas-bg" style={{ flex: 1 }}><div style={{ color: 'var(--text-tertiary)' }}>Carregando...</div></div>;

  if (previewMode) return <PreviewCanvas blocks={blocks} isMobile={viewportMode === 'mobile'} />;

  if (viewportMode === 'mobile') return <MobileViewport blocks={blocks} onImageDrop={handleImageDrop} />;

  // ── Desktop Edit Mode ────────────────────────────────────────────────────────
  const sortedBlocks = [...blocks].sort((a, b) => getLayout(a).zIndex - getLayout(b).zIndex);

  // Altura dinâmica da página baseada no bloco mais baixo
  const pageH = Math.max(800, ...blocks.map(b => { const l = getLayout(b); return l.y + l.h + 120; }));

  return (
    <div
      className="canvas-area canvas-bg"
      style={{ flex: 1, padding: '40px 24px', overflow: 'auto' }}
      onClick={() => setActiveBlockId(null)}
    >
      {/* ── White page card: delimitador de página desktop com margin auto para centralizar ── */}
      <div
        style={{
          position: 'relative',
          width: PAGE_W,
          minHeight: pageH,
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 24px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.06)',
        }}
      >
        {/* Indicador de largura da página */}
        <div style={{ position: 'absolute', top: -22, left: 0, fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'monospace', userSelect: 'none', pointerEvents: 'none' }}>
          {PAGE_W}px — Desktop
        </div>

        {blocks.length === 0 && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'var(--text-tertiary)', fontSize: '14px', textAlign: 'center', pointerEvents: 'none' }}>
            + Clique nos blocos à esquerda para adicionar conteúdo
          </div>
        )}

        {sortedBlocks.map((block) => {
          const isActive = block.id === activeBlockId;
          const layout = getLayout(block);
          const outOfBounds = isOutOfBounds(block, PAGE_W);

          return (
            <div
              key={block.id}
              onMouseDown={(e) => onBlockMouseDown(e, block)}
              onClick={(e) => { e.stopPropagation(); setActiveBlockId(block.id); }}
              style={{ position: 'absolute', left: layout.x, top: layout.y, width: layout.w, height: layout.h, zIndex: layout.zIndex + 1, cursor: 'move', boxSizing: 'border-box', userSelect: 'none', isolation: 'isolate' }}
            >
              {/* Selection / out-of-bounds border */}
              <div style={{
                position: 'absolute', inset: 0,
                border: isActive ? '2px solid #3b82f6' : outOfBounds ? '2px solid #f97316' : '2px solid transparent',
                borderRadius: '6px', pointerEvents: 'none', zIndex: 2,
                boxShadow: isActive ? '0 0 0 1px rgba(59,130,246,0.25)' : outOfBounds ? '0 0 0 1px rgba(249,115,22,0.15)' : 'none',
              }} />

              {/* Out-of-bounds warning badge */}
              {outOfBounds && !isActive && (
                <div style={{ position: 'absolute', top: -22, left: 0, zIndex: 25, backgroundColor: '#f97316', color: 'white', fontSize: '10px', fontWeight: 600, padding: '2px 7px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '3px', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
                  ⚠️ Fora da página
                </div>
              )}

              {/* Content */}
              <div style={{ position: 'absolute', inset: 2, borderRadius: '4px', overflow: 'hidden', zIndex: 1 }}>
                <BlockContent block={block} onImageDrop={handleImageDrop} isInteracting={isInteracting} />
                
                {/* Overlay transparente sobre iframe/video para capturar cliques no editor pai */}
                {(block.type === 'html' || block.type === 'video') && (
                  <div style={{ position: 'absolute', inset: 0, zIndex: 10, cursor: 'move', backgroundColor: 'transparent' }} />
                )}
              </div>

              {/* Delete button */}
              {isActive && (
                <button onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }} style={{ position: 'absolute', top: -34, right: 0, zIndex: 20, backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 500 }}>
                  <Icon name="Trash2" size={12} /> Excluir
                </button>
              )}

              {/* Resize handles */}
              {isActive && HANDLES.map(({ id, cursor, style }) => (
                <div
                  key={id}
                  data-handle={id}
                  onMouseDown={(e) => onHandleMouseDown(e, block, id)}
                  style={{ position: 'absolute', width: 10, height: 10, backgroundColor: 'white', border: '2px solid #3b82f6', borderRadius: '2px', cursor, zIndex: 30, ...style }}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};
