'use client';

import React, { useState, useCallback } from 'react';
import { Button, Icon } from '@projeto/ui';
import { useEditor } from '../../context/EditorContext';
import { AnyBlock } from '@projeto/types';

interface PositionPanelProps {
  onClose: () => void;
}

const PAGE_W = 1100;

/** Extrai o layout de qualquer bloco a partir do layouts.desktop (padrão) */
function getLayout(block: AnyBlock) {
  const l = (block as any).layouts?.desktop;
  return {
    x: typeof l?.x === 'number' ? l.x : 40,
    y: typeof l?.y === 'number' ? l.y : 40,
    w: typeof l?.w === 'number' ? l.w : 600,
    h: typeof l?.h === 'number' ? l.h : 120,
    zIndex: typeof l?.zIndex === 'number' ? l.zIndex : 0,
  };
}

/** Ícone representativo de cada tipo de bloco */
function BlockIcon({ type }: { type: string }) {
  const iconMap: Record<string, string> = {
    text: 'Type', image: 'Image', video: 'Video',
    quiz: 'FileQuestion', quote: 'Quote', html: 'Code',
  };
  const name = iconMap[type] || 'Layers';
  return <Icon name={name} size={14} />;
}

/** Título legível e curto de cada bloco */
function getBlockTitle(block: AnyBlock): string {
  switch (block.type) {
    case 'text': return (block.content || '').substring(0, 24) || 'Texto vazio';
    case 'image': return 'Imagem' + (block.alt ? ` – ${block.alt}` : '');
    case 'video': return `Vídeo (${block.provider})`;
    case 'quiz': return (block.question || '').substring(0, 24) || 'Quiz';
    case 'quote': return 'Citação' + ((block as any).author ? ` – ${(block as any).author}` : '');
    case 'html': return 'Código HTML';
    default: return 'Bloco';
  }
}

/** Verifica colisão AABB entre dois retângulos */
function rectsOverlap(a: ReturnType<typeof getLayout>, b: ReturnType<typeof getLayout>): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export const PositionPanel: React.FC<PositionPanelProps> = ({ onClose }) => {
  const { blocks, activeBlockId, setActiveBlockId, updateBlock, reorderBlocks } = useEditor();
  const [activeTab, setActiveTab] = useState<'organizar' | 'camadas'>('organizar');
  const [layersFilter, setLayersFilter] = useState<'todas' | 'sobreposicao'>('todas');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const activeBlock = blocks.find(b => b.id === activeBlockId);

  // ──────────────────────────────────────────────────────
  // Z-INDEX: Recalcula zIndex de TODOS os blocos para
  // garantir integridade sequencial (0, 1, 2, ..., n-1).
  // Isso é mais robusto que incrementar/decrementar unitariamente.
  // ──────────────────────────────────────────────────────

  /** Normaliza os zIndex de todos os blocos para valores sequenciais */
  const normalizeAndApply = useCallback((orderedBlockIds: string[]) => {
    // orderedBlockIds[0] = fundo (menor z), last = topo (maior z)
    const newBlocks = blocks.map(b => {
      const idx = orderedBlockIds.indexOf(b.id);
      const anyBlock = b as any;
      const currentLayouts = anyBlock.layouts || {};
      const desktopL = currentLayouts.desktop || {};
      return { ...b, layouts: {
        ...currentLayouts,
        desktop: { ...desktopL, zIndex: idx >= 0 ? idx : (desktopL.zIndex ?? 0) },
      } };
    });
    
    // LAW: Devemos garantir que o estado seja atualizado com uma nova referência
    reorderBlocks([...newBlocks] as AnyBlock[]);
  }, [blocks, reorderBlocks]);

  /** Retorna os IDs de blocos ordenados do fundo ao topo (ascendente por zIndex) */
  const getOrderedIds = useCallback((): string[] => {
    return [...blocks].sort((a, b) => getLayout(a).zIndex - getLayout(b).zIndex).map(b => b.id);
  }, [blocks]);

  const handleBringForward = () => {
    if (!activeBlock) return;
    const ordered = getOrderedIds();
    const idx = ordered.indexOf(activeBlock.id);
    if (idx < 0 || idx >= ordered.length - 1) return;
    
    const newOrdered = [...ordered];
    [newOrdered[idx], newOrdered[idx + 1]] = [newOrdered[idx + 1], newOrdered[idx]];
    normalizeAndApply(newOrdered);
  };

  const handleSendBackward = () => {
    if (!activeBlock) return;
    const ordered = getOrderedIds();
    const idx = ordered.indexOf(activeBlock.id);
    if (idx <= 0) return;
    
    const newOrdered = [...ordered];
    [newOrdered[idx], newOrdered[idx - 1]] = [newOrdered[idx - 1], newOrdered[idx]];
    normalizeAndApply(newOrdered);
  };

  const handleBringToFront = () => {
    if (!activeBlock) return;
    const ordered = getOrderedIds();
    const idx = ordered.indexOf(activeBlock.id);
    if (idx < 0) return;
    
    const newOrdered = [...ordered];
    newOrdered.splice(idx, 1);
    newOrdered.push(activeBlock.id);
    normalizeAndApply(newOrdered);
  };

  const handleSendToBack = () => {
    if (!activeBlock) return;
    const ordered = getOrderedIds();
    const idx = ordered.indexOf(activeBlock.id);
    if (idx < 0) return;
    
    const newOrdered = [...ordered];
    newOrdered.splice(idx, 1);
    newOrdered.unshift(activeBlock.id);
    normalizeAndApply(newOrdered);
  };

  // ──────────────────────────────────────────────────────
  // ALINHAMENTO à página
  // ──────────────────────────────────────────────────────

  const getPageHeight = (): number => {
    return Math.max(800, ...blocks.map(b => {
      const l = getLayout(b);
      return l.y + l.h + 120;
    }));
  };

  const handleAlign = (alignment: 'top' | 'middle' | 'bottom' | 'left' | 'center' | 'right') => {
    if (!activeBlock) return;
    const l = getLayout(activeBlock);
    const pageH = getPageHeight();

    let newX = l.x;
    let newY = l.y;

    switch (alignment) {
      case 'top': newY = 0; break;
      case 'middle': newY = Math.max(0, Math.round((pageH - l.h) / 2)); break;
      case 'bottom': newY = Math.max(0, pageH - l.h); break;
      case 'left': newX = 0; break;
      case 'center': newX = Math.max(0, Math.round((PAGE_W - l.w) / 2)); break;
      case 'right': newX = Math.max(0, PAGE_W - l.w); break;
    }

    const anyBlock = activeBlock as any;
    const currentLayouts = anyBlock.layouts || {};
    updateBlock(activeBlock.id, { layouts: { ...currentLayouts, desktop: { ...l, x: newX, y: newY } } } as any);
  };

  // ──────────────────────────────────────────────────────
  // CAMADAS — Lista visual e DnD
  // ──────────────────────────────────────────────────────

  // Camadas exibidas: do TOPO (maior z) ao FUNDO (menor z)
  const displayLayers = [...blocks].sort((a, b) => getLayout(b).zIndex - getLayout(a).zIndex);

  const filteredLayers = layersFilter === 'sobreposicao' && activeBlock
    ? displayLayers.filter(b => b.id === activeBlock.id || rectsOverlap(getLayout(b), getLayout(activeBlock)))
    : displayLayers;

  // DnD nativo
  const onDragStart = (e: React.DragEvent, blockId: string) => {
    setDraggedId(blockId);
    setDropIndex(null);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', blockId);
  };

  const onDragEnd = () => {
    setDraggedId(null);
    setDropIndex(null);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDragOverItem = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const midPoint = rect.height / 2;
    
    // filteredLayers é top-to-bottom. dropIndex = posição visual onde inserir.
    const idx = filteredLayers.findIndex(b => b.id === targetId);
    setDropIndex(y < midPoint ? idx : idx + 1);
  };

  const onDragLeaveItem = () => {
    setDropIndex(null);
  };

  const onDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) { setDraggedId(null); setDropIndex(null); return; }

    const currentOrderedIds = getOrderedIds(); // bottom-to-top
    const dragIdx = currentOrderedIds.indexOf(draggedId);
    
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const midPoint = rect.height / 2;
    const targetVisualIdx = filteredLayers.findIndex(b => b.id === targetId);
    const dropVisualIdx = y < midPoint ? targetVisualIdx : targetVisualIdx + 1;
    
    // filteredLayers é top-to-bottom. Converte para a ordem global displayLayers.
    const displayIds = displayLayers.map(b => b.id);
    let globalDropPos: number;
    if (dropVisualIdx >= filteredLayers.length) {
      globalDropPos = displayIds.length; // final da lista global
    } else {
      const dropBlockId = filteredLayers[dropVisualIdx].id;
      globalDropPos = displayIds.indexOf(dropBlockId);
    }
    
    // Converte posição global top-to-bottom para bottom-to-top (zIndex)
    // displayLayers[0] = topo = último em currentOrderedIds
    const insertAt = currentOrderedIds.length - globalDropPos;
    
    const newOrdered = [...currentOrderedIds];
    newOrdered.splice(dragIdx, 1);
    const adjustedInsert = dragIdx < insertAt ? insertAt - 1 : insertAt;
    newOrdered.splice(adjustedInsert, 0, draggedId);

    normalizeAndApply(newOrdered);
    setDraggedId(null);
    setDropIndex(null);
  };

  // ──────────────────────────────────────────────────────
  // PREVENT deselection: o painel é um popover acima do
  // canvas. Paramos a propagação do click para NÃO
  // acionar o canvas's onClick → setActiveBlockId(null).
  // ──────────────────────────────────────────────────────

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        top: '60px',
        right: '0',
        width: '280px',
        height: 'calc(100vh - 60px)',
        backgroundColor: '#ffffff',
        borderLeft: '1px solid #e2e8f0',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border-light)' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Posição</h3>
        <Button variant="ghost" onClick={onClose} style={{ padding: '2px' }}>
          <Icon name="X" size={16} />
        </Button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)' }}>
        {(['organizar', 'camadas'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '11px 0', fontSize: '12px', fontWeight: 600,
              background: 'none', border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--accent-blue)' : '2px solid transparent',
              color: activeTab === tab ? 'var(--accent-blue)' : 'var(--text-secondary)',
              cursor: 'pointer', textTransform: 'capitalize',
            }}
          >
            {tab === 'organizar' ? 'Organizar' : 'Camadas'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>

        {/* ── TAB ORGANIZAR ── */}
        {activeTab === 'organizar' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {!activeBlock && (
              <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                Selecione um bloco no canvas para posicioná-lo.
              </div>
            )}

            {activeBlock && (
              <>
                {/* Z-Index */}
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <Button variant="ghost" onClick={handleBringForward}>
                      <Icon name="MoveUp" size={14} /> Para frente
                    </Button>
                    <Button variant="ghost" onClick={handleSendBackward}>
                      <Icon name="MoveDown" size={14} /> Para trás
                    </Button>
                    <Button variant="ghost" onClick={handleBringToFront}>
                      <Icon name="ArrowUpToLine" size={14} /> Para o topo
                    </Button>
                    <Button variant="ghost" onClick={handleSendToBack}>
                      <Icon name="ArrowDownToLine" size={14} /> Para o fundo
                    </Button>
                  </div>
                </div>

                {/* Alinhamento */}
                <div>
                  <h4 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '12px' }}>Alinhar à página</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <Button variant="ghost" onClick={() => handleAlign('top')}>
                      <Icon name="AlignVerticalJustifyStart" size={14} /> Em cima
                    </Button>
                    <Button variant="ghost" onClick={() => handleAlign('left')}>
                      <Icon name="AlignHorizontalJustifyStart" size={14} /> À esquerda
                    </Button>
                    <Button variant="ghost" onClick={() => handleAlign('middle')}>
                      <Icon name="AlignVerticalJustifyCenter" size={14} /> No meio
                    </Button>
                    <Button variant="ghost" onClick={() => handleAlign('center')}>
                      <Icon name="AlignHorizontalJustifyCenter" size={14} /> Ao centro
                    </Button>
                    <Button variant="ghost" onClick={() => handleAlign('bottom')}>
                      <Icon name="AlignVerticalJustifyEnd" size={14} /> Embaixo
                    </Button>
                    <Button variant="ghost" onClick={() => handleAlign('right')}>
                      <Icon name="AlignHorizontalJustifyEnd" size={14} /> À direita
                    </Button>
                  </div>
                </div>

                
              </>
            )}
          </div>
        )}

        {/* ── TAB CAMADAS ── */}
        {activeTab === 'camadas' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Filter */}
            <div style={{ display: 'flex', backgroundColor: 'var(--bg-canvas)', borderRadius: '6px', padding: '3px' }}>
              {(['todas', 'sobreposicao'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setLayersFilter(f)}
                  style={{
                    flex: 1, padding: '6px', fontSize: '11px', fontWeight: 600, borderRadius: '4px',
                    background: layersFilter === f ? 'var(--bg-surface)' : 'transparent',
                    color: layersFilter === f ? 'var(--accent-blue)' : 'var(--text-secondary)',
                    boxShadow: layersFilter === f ? 'var(--shadow-sm)' : 'none',
                    border: 'none', cursor: 'pointer',
                  }}
                >
                  {f === 'todas' ? 'Todas' : 'Em sobreposição'}
                </button>
              ))}
            </div>

            {/* Layers List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {filteredLayers.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                  Nenhuma camada encontrada.
                </div>
              )}
              {filteredLayers.map(block => {
                const isActive = block.id === activeBlockId;
                const isDragging = block.id === draggedId;
                const showDropLine = dropIndex === filteredLayers.indexOf(block);

                return (
                  <div key={block.id} style={{ position: 'relative' }}>
                    {/* Drop indicator line */}
                    {showDropLine && (
                      <div style={{ position: 'absolute', top: -2, left: 0, right: 0, height: '3px', backgroundColor: '#3b82f6', borderRadius: '2px', zIndex: 10, pointerEvents: 'none' }} />
                    )}
                    <div
                      draggable
                      onDragStart={(e) => onDragStart(e, block.id)}
                      onDragOver={(e) => onDragOverItem(e, block.id)}
                      onDragLeave={onDragLeaveItem}
                      onDrop={(e) => onDrop(e, block.id)}
                      onDragEnd={onDragEnd}
                      onClick={() => setActiveBlockId(block.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px 10px',
                        backgroundColor: isActive ? '#eff6ff' : 'var(--bg-canvas)',
                        border: isActive ? '1.5px solid var(--accent-blue)' : '1px solid var(--border-light)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        opacity: isDragging ? 0.35 : 1,
                        gap: '8px',
                        transition: 'opacity 0.15s, border-color 0.15s',
                      }}
                    >
                      {/* Drag Handle */}
                      <div style={{ cursor: 'grab', color: 'var(--text-tertiary)', display: 'flex', flexShrink: 0 }}>
                        <Icon name="GripVertical" size={14} />
                      </div>

                      {/* Icon + Title */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                        <div style={{ color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)', flexShrink: 0 }}>
                          <BlockIcon type={block.type} />
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {getBlockTitle(block)}
                        </span>
                      </div>

                    </div>
                  </div>
                );
              })}
              {/* Drop indicator at the bottom when inserting at end */}
              {dropIndex === filteredLayers.length && (
                <div style={{ position: 'relative', height: '4px' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: '#3b82f6', borderRadius: '2px', zIndex: 10, pointerEvents: 'none' }} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
