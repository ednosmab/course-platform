'use client';

import React, { useState, useCallback } from 'react';
import { XStack, YStack, Text, Button, Icon } from '@projeto/ui';
import { useEditor } from '../../context/EditorContext';
import { AnyBlock, BlockLayouts, ViewportLayout } from '@projeto/types';

interface PositionPanelProps {
  onClose: () => void;
}

const PAGE_W = 1100;

function getLayout(block: AnyBlock) {
  const l = block.layouts?.desktop;
  return {
    x: typeof l?.x === 'number' ? l.x : 40,
    y: typeof l?.y === 'number' ? l.y : 40,
    w: typeof l?.w === 'number' ? l.w : 600,
    h: typeof l?.h === 'number' ? l.h : 120,
    zIndex: typeof l?.zIndex === 'number' ? l.zIndex : 0,
  };
}

function BlockIcon({ type }: { type: string }) {
  const iconMap: Record<string, string> = {
    text: 'Type', image: 'Image', video: 'Video',
    quiz: 'FileQuestion', quote: 'Quote', html: 'Code',
  };
  const name = iconMap[type] || 'Layers';
  return <Icon name={name} size={14} />;
}

function getBlockTitle(block: AnyBlock): string {
  switch (block.type) {
    case 'text': return (block.content || '').substring(0, 24) || 'Texto vazio';
    case 'image': return 'Imagem' + (block.alt ? ` – ${block.alt}` : '');
    case 'video': return `Vídeo (${block.provider})`;
    case 'quiz': return (block.question || '').substring(0, 24) || 'Quiz';
    case 'quote': return 'Citação' + (block.author ? ` – ${block.author}` : '');
    case 'html': return 'Código HTML';
    default: return 'Bloco';
  }
}

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

  const normalizeAndApply = useCallback((orderedBlockIds: string[]) => {
    const newBlocks = blocks.map(b => {
      const currentLayouts = (b.layouts || {}) as NonNullable<BlockLayouts>;
      const desktopL = currentLayouts.desktop || {} as ViewportLayout;
      const pos = orderedBlockIds.indexOf(b.id);
      return { ...b, layouts: {
        ...currentLayouts,
        desktop: { ...desktopL, zIndex: pos >= 0 ? pos : (desktopL.zIndex ?? 0) },
      } };
    });
    reorderBlocks([...newBlocks] as AnyBlock[]);
  }, [blocks, reorderBlocks]);

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

    const currentLayouts = (activeBlock.layouts || {}) as NonNullable<BlockLayouts>;
    updateBlock(activeBlock.id, { layouts: { ...currentLayouts, desktop: { ...l, x: newX, y: newY } } } as Partial<AnyBlock>);
  };

  const displayLayers = [...blocks].sort((a, b) => getLayout(b).zIndex - getLayout(a).zIndex);

  const filteredLayers = layersFilter === 'sobreposicao' && activeBlock
    ? displayLayers.filter(b => b.id === activeBlock.id || rectsOverlap(getLayout(b), getLayout(activeBlock)))
    : displayLayers;

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
    const idx = filteredLayers.findIndex(b => b.id === targetId);
    setDropIndex(y < midPoint ? idx : idx + 1);
  };

  const onDragLeaveItem = () => {
    setDropIndex(null);
  };

  const onDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) { setDraggedId(null); setDropIndex(null); return; }

    const currentOrderedIds = getOrderedIds();
    const dragIdx = currentOrderedIds.indexOf(draggedId);

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const midPoint = rect.height / 2;
    const targetVisualIdx = filteredLayers.findIndex(b => b.id === targetId);
    const dropVisualIdx = y < midPoint ? targetVisualIdx : targetVisualIdx + 1;

    const displayIds = displayLayers.map(b => b.id);
    let globalDropPos: number;
    if (dropVisualIdx >= filteredLayers.length) {
      globalDropPos = displayIds.length;
    } else {
      const dropBlockId = filteredLayers[dropVisualIdx].id;
      globalDropPos = displayIds.indexOf(dropBlockId);
    }

    const insertAt = currentOrderedIds.length - globalDropPos;

    const newOrdered = [...currentOrderedIds];
    newOrdered.splice(dragIdx, 1);
    const adjustedInsert = dragIdx < insertAt ? insertAt - 1 : insertAt;
    newOrdered.splice(adjustedInsert, 0, draggedId);

    normalizeAndApply(newOrdered);
    setDraggedId(null);
    setDropIndex(null);
  };

  return (
    <YStack
      position="fixed"
      top={60}
      right={0}
      w={280}
      h="calc(100vh - 60px)"
      bg="$background"
      borderLeftWidth={1}
      borderLeftColor="$border"
      style={{ boxShadow: '-4px 0 24px rgba(0,0,0,0.08)', zIndex: 99999 }}
      onPress={(e: any) => e.stopPropagation()}
      onMouseDown={(e: any) => e.stopPropagation()}
    >
      <XStack ai="center" jc="space-between" px="$4" py="$3" borderBottomWidth={1} borderBottomColor="$border" flexShrink={0}>
        <Text fontSize={14} fontWeight="600">Posição</Text>
        <Button variant="ghost" aria-label="Fechar painel de posição" onPress={onClose} px="$1">
          <Icon name="X" size={16} />
        </Button>
      </XStack>

      <XStack borderBottomWidth={1} borderBottomColor="$border" flexShrink={0}>
        {(['organizar', 'camadas'] as const).map(tab => (
          <Button
            key={tab}
            variant="ghost"
            onPress={() => setActiveTab(tab)}
            flex={1}
            borderRadius={0}
            borderBottomWidth={2}
            borderBottomColor={activeTab === tab ? '$primary' : 'transparent'}
            py="$2"
          >
            <Text fontSize={12} fontWeight="600" color={activeTab === tab ? '$primary' : '$textSecondary'}>
              {tab === 'organizar' ? 'Organizar' : 'Camadas'}
            </Text>
          </Button>
        ))}
      </XStack>

      <YStack p="$4" overflowY="auto" f={1}>
        {activeTab === 'organizar' && (
          <YStack gap="$5">
            {!activeBlock && (
              <Text textAlign="center" p="$4" color="$textMuted" fontSize={12}>
                Selecione um bloco no canvas para posicioná-lo.
              </Text>
            )}

            {activeBlock && (
              <>
                <YStack gap="$2">
                  <XStack gap="$2">
                    <Button variant="ghost" onPress={handleBringForward} flex={1} borderWidth={1} borderColor="$border" gap="$2.5" px="$2.5">
                      <Icon name="MoveUp" size={16} />
                      <Text fontSize={12} fontWeight="600" whiteSpace="nowrap">Para frente</Text>
                    </Button>
                    <Button variant="ghost" onPress={handleSendBackward} flex={1} borderWidth={1} borderColor="$border" gap="$2.5" px="$2.5">
                      <Icon name="MoveDown" size={16} />
                      <Text fontSize={12} fontWeight="600" whiteSpace="nowrap">Para trás</Text>
                    </Button>
                  </XStack>
                  <XStack gap="$2">
                    <Button variant="ghost" onPress={handleBringToFront} flex={1} borderWidth={1} borderColor="$border" gap="$2.5" px="$2.5">
                      <Icon name="ArrowUpToLine" size={16} />
                      <Text fontSize={12} fontWeight="600" whiteSpace="nowrap">Para o topo</Text>
                    </Button>
                    <Button variant="ghost" onPress={handleSendToBack} flex={1} borderWidth={1} borderColor="$border" gap="$2.5" px="$2.5">
                      <Icon name="ArrowDownToLine" size={16} />
                      <Text fontSize={12} fontWeight="600" whiteSpace="nowrap">Para o fundo</Text>
                    </Button>
                  </XStack>
                </YStack>

                <YStack>
                  <Text fontSize={11} fontWeight="700" textTransform="uppercase" color="$textSecondary" mb="$3">
                    Alinhar à página
                  </Text>
                  <XStack flexWrap="wrap" gap="$2">
                    <Button variant="ghost" onPress={() => handleAlign('top')} flex={1} minWidth="40%" borderWidth={1} borderColor="$border" gap="$2.5" px="$2.5">
                      <Icon name="AlignVerticalJustifyStart" size={16} />
                      <Text fontSize={12} fontWeight="500" whiteSpace="nowrap">Em cima</Text>
                    </Button>
                    <Button variant="ghost" onPress={() => handleAlign('left')} flex={1} minWidth="40%" borderWidth={1} borderColor="$border" gap="$2.5" px="$2.5">
                      <Icon name="AlignHorizontalJustifyStart" size={16} />
                      <Text fontSize={12} fontWeight="500" whiteSpace="nowrap">À esquerda</Text>
                    </Button>
                    <Button variant="ghost" onPress={() => handleAlign('middle')} flex={1} minWidth="40%" borderWidth={1} borderColor="$border" gap="$2.5" px="$2.5">
                      <Icon name="AlignVerticalJustifyCenter" size={16} />
                      <Text fontSize={12} fontWeight="500" whiteSpace="nowrap">No meio</Text>
                    </Button>
                    <Button variant="ghost" onPress={() => handleAlign('center')} flex={1} minWidth="40%" borderWidth={1} borderColor="$border" gap="$2.5" px="$2.5">
                      <Icon name="AlignHorizontalJustifyCenter" size={16} />
                      <Text fontSize={12} fontWeight="500" whiteSpace="nowrap">Ao centro</Text>
                    </Button>
                    <Button variant="ghost" onPress={() => handleAlign('bottom')} flex={1} minWidth="40%" borderWidth={1} borderColor="$border" gap="$2.5" px="$2.5">
                      <Icon name="AlignVerticalJustifyEnd" size={16} />
                      <Text fontSize={12} fontWeight="500" whiteSpace="nowrap">Embaixo</Text>
                    </Button>
                    <Button variant="ghost" onPress={() => handleAlign('right')} flex={1} minWidth="40%" borderWidth={1} borderColor="$border" gap="$2.5" px="$2.5">
                      <Icon name="AlignHorizontalJustifyEnd" size={16} />
                      <Text fontSize={12} fontWeight="500" whiteSpace="nowrap">À direita</Text>
                    </Button>
                  </XStack>
                </YStack>
              </>
            )}
          </YStack>
        )}

        {activeTab === 'camadas' && (
          <YStack gap="$3">
            <XStack bg="$background" borderRadius="$3" p={3} gap={0}>
              {(['todas', 'sobreposicao'] as const).map(f => (
                <Button
                  key={f}
                  variant="ghost"
                  onPress={() => setLayersFilter(f)}
                  flex={1}
                  py="$1"
                  borderRadius="$2"
                  borderWidth={1}
                  borderColor={layersFilter === f ? '$primary' : '$border'}
                  gap="$1"
                >
                  <Text fontSize={11} fontWeight="600" color={layersFilter === f ? '$primary' : '$text'}>
                    {f === 'todas' ? 'Todas' : 'Sobreposição'}
                  </Text>
                </Button>
              ))}
            </XStack>

            <YStack gap={1}>
              {filteredLayers.length === 0 && (
                <Text textAlign="center" p="$5" color="$textMuted" fontSize={12}>
                  Nenhuma camada encontrada.
                </Text>
              )}
              {filteredLayers.map(block => {
                const isActive = block.id === activeBlockId;
                const isDragging = block.id === draggedId;
                const showDropLine = dropIndex === filteredLayers.indexOf(block);

                return (
                  <YStack key={block.id} position="relative">
                    {showDropLine && (
                      <YStack position="absolute" top={-2} left={0} right={0} height={3} bg="$primary" borderRadius={1} zIndex={10} style={{ pointerEvents: 'none' }} />
                    )}
                    <div
                      draggable
                      onDragStart={(e) => onDragStart(e, block.id)}
                      onDragOver={(e) => onDragOverItem(e, block.id)}
                      onDragLeave={onDragLeaveItem}
                      onDrop={(e) => onDrop(e, block.id)}
                      onDragEnd={onDragEnd}
                      style={{ cursor: 'pointer' }}
                    >
                    <XStack
                      onPress={() => setActiveBlockId(block.id)}
                      ai="center"
                      p="$2"
                      bg={isActive ? '$secondary' : '$background'}
                      borderWidth={isActive ? 1.5 : 1}
                      borderColor={isActive ? '$primary' : '$border'}
                      borderRadius="$3"
                      opacity={isDragging ? 0.35 : 1}
                      gap="$2"
                    >
                      <XStack cursor="grab" flexShrink={0}>
                        <Icon name="GripVertical" size={14} />
                      </XStack>

                      <XStack ai="center" gap={1} flex={1} minWidth={0}>
                        <XStack flexShrink={0}>
                          <BlockIcon type={block.type} />
                        </XStack>
                        <Text fontSize={11} numberOfLines={1} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {getBlockTitle(block)}
                        </Text>
                      </XStack>
                    </XStack>
                    </div>
                  </YStack>
                );
              })}
              {dropIndex === filteredLayers.length && (
                <YStack position="relative" height={4}>
                  <YStack position="absolute" top={0} left={0} right={0} height={3} bg="$primary" borderRadius={1} zIndex={10} style={{ pointerEvents: 'none' }} />
                </YStack>
              )}
            </YStack>
          </YStack>
        )}
      </YStack>
    </YStack>
  );
};
