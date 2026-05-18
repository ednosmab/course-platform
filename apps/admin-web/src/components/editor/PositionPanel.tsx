'use client';

import React, { useState, useCallback } from 'react';
import { useEditor } from '../../context/EditorContext';
import { X, MoveUp, MoveDown, ArrowUpToLine, ArrowDownToLine, AlignHorizontalJustifyStart, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd, AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd, Type, Image, Video, FileQuestion, Quote, Code, Layers, GripVertical } from 'lucide-react';
import { AnyBlock } from '@projeto/types';

interface PositionPanelProps {
  onClose: () => void;
}

const PAGE_W = 1100;

/** Extrai o layout de qualquer bloco (com defaults seguros) */
function getLayout(block: AnyBlock) {
  const l = (block as any).layout;
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
  switch (type) {
    case 'text': return <Type size={14} />;
    case 'image': return <Image size={14} />;
    case 'video': return <Video size={14} />;
    case 'quiz': return <FileQuestion size={14} />;
    case 'quote': return <Quote size={14} />;
    case 'html': return <Code size={14} />;
    default: return <Layers size={14} />;
  }
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
      const l = getLayout(b);
      return { ...b, layout: { ...l, zIndex: idx >= 0 ? idx : (l.zIndex ?? 0) } };
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

    updateBlock(activeBlock.id, { layout: { ...l, x: newX, y: newY } } as any);
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
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) { setDraggedId(null); return; }

    const currentOrderedIds = getOrderedIds();
    const dragIdx = currentOrderedIds.indexOf(draggedId);
    const targetIdx = currentOrderedIds.indexOf(targetId);
    
    if (dragIdx < 0 || targetIdx < 0) { setDraggedId(null); return; }

    const newOrdered = [...currentOrderedIds];
    newOrdered.splice(dragIdx, 1);
    // Insere na posição original do target.
    // Se dragIdx < targetIdx, o target deslocou 1 para esquerda após remoção,
    // então inserir em targetIdx coloca o item arrastado DEPOIS do target (zIndex maior).
    // Se dragIdx > targetIdx, inserir em targetIdx coloca o item arrastado
    // ANTES do target (zIndex menor).
    newOrdered.splice(targetIdx, 0, draggedId);

    normalizeAndApply(newOrdered);
    setDraggedId(null);
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
        top: '72px',
        right: '310px',
        width: '280px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 12px 48px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(100vh - 100px)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border-light)' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Posição</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex', padding: '2px' }}>
          <X size={16} />
        </button>
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
                    <button className="btn-outline" onClick={handleBringForward} style={{ fontSize: '11px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <MoveUp size={14} /> Para frente
                    </button>
                    <button className="btn-outline" onClick={handleSendBackward} style={{ fontSize: '11px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <MoveDown size={14} /> Para trás
                    </button>
                    <button className="btn-outline" onClick={handleBringToFront} style={{ fontSize: '11px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <ArrowUpToLine size={14} /> Para o topo
                    </button>
                    <button className="btn-outline" onClick={handleSendToBack} style={{ fontSize: '11px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <ArrowDownToLine size={14} /> Para o fundo
                    </button>
                  </div>
                </div>

                {/* Alinhamento */}
                <div>
                  <h4 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '12px' }}>Alinhar à página</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button className="btn-outline" onClick={() => handleAlign('top')} style={{ fontSize: '11px', padding: '8px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-start' }}>
                      <AlignVerticalJustifyStart size={14} /> Em cima
                    </button>
                    <button className="btn-outline" onClick={() => handleAlign('left')} style={{ fontSize: '11px', padding: '8px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-start' }}>
                      <AlignHorizontalJustifyStart size={14} /> À esquerda
                    </button>
                    <button className="btn-outline" onClick={() => handleAlign('middle')} style={{ fontSize: '11px', padding: '8px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-start' }}>
                      <AlignVerticalJustifyCenter size={14} /> No meio
                    </button>
                    <button className="btn-outline" onClick={() => handleAlign('center')} style={{ fontSize: '11px', padding: '8px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-start' }}>
                      <AlignHorizontalJustifyCenter size={14} /> Ao centro
                    </button>
                    <button className="btn-outline" onClick={() => handleAlign('bottom')} style={{ fontSize: '11px', padding: '8px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-start' }}>
                      <AlignVerticalJustifyEnd size={14} /> Embaixo
                    </button>
                    <button className="btn-outline" onClick={() => handleAlign('right')} style={{ fontSize: '11px', padding: '8px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-start' }}>
                      <AlignHorizontalJustifyEnd size={14} /> À direita
                    </button>
                  </div>
                </div>

                {/* Debug: mostra zIndex atual */}
                <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'monospace', padding: '8px', backgroundColor: 'var(--bg-canvas)', borderRadius: '6px' }}>
                  zIndex: {getLayout(activeBlock).zIndex} · Blocos: {blocks.length}
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
                const z = getLayout(block).zIndex;

                return (
                  <div
                    key={block.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, block.id)}
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(e, block.id)}
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
                      <GripVertical size={14} />
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

                    {/* Z badge */}
                    <span style={{ fontSize: '9px', color: 'var(--text-tertiary)', fontFamily: 'monospace', flexShrink: 0 }}>
                      z{z}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
