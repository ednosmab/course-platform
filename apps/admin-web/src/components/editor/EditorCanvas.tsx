'use client';

import React, { useEffect, useState } from 'react';
import { useEditor } from '../../context/EditorContext';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GripVertical, Trash2, Eye, HelpCircle } from 'lucide-react';

export const EditorCanvas: React.FC = () => {
  const { blocks, activeBlockId, moveBlock, setActiveBlockId, removeBlock } = useEditor();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    moveBlock(result.source.index, result.destination.index);
  };

  if (!mounted) {
    return (
      <div className="flex-1 bg-slate-950 p-8 flex items-center justify-center h-screen">
        <div className="text-slate-500 animate-pulse text-sm">Carregando Canvas do Editor...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-950 p-8 overflow-y-auto flex flex-col gap-6 items-center w-full h-screen">
      {blocks.length === 0 ? (
        <div className="flex-1 border-2 border-dashed border-slate-800 rounded-2xl w-full max-w-3xl flex flex-col items-center justify-center text-center p-12 gap-3 opacity-60">
          <div className="p-4 bg-slate-900 rounded-full border border-slate-800 text-slate-400">
            <Eye size={32} />
          </div>
          <span className="text-sm font-semibold text-slate-300">Seu Canvas está vazio</span>
          <p className="text-xs text-slate-500 max-w-sm">Use a paleta de blocos lateral esquerda para adicionar conteúdos em texto, vídeo ou quizzes interativos na sua aula.</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="editor-canvas-list">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="w-full max-w-3xl flex flex-col gap-4 min-h-500px pb-20"
              >
                {blocks.map((block, index) => {
                  const isActive = block.id === activeBlockId;
                  return (
                    <Draggable key={block.id} draggableId={block.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveBlockId(block.id);
                          }}
                          className={`bg-slate-900-60 border rounded-2xl transition-all duration-300 relative group flex items-stretch overflow-hidden cursor-pointer ${
                            isActive 
                              ? 'border-indigo-500 shadow-indigo-glow bg-slate-900-90' 
                              : snapshot.isDragging 
                                ? 'border-indigo-5-50 bg-slate-900-80 scale-101' 
                                : 'border-slate-800 hover-border-slate-700 bg-slate-900-40'
                          }`}
                        >
                          {/* Drag Handle */}
                          <div
                            {...provided.dragHandleProps}
                            className="w-10 flex items-center justify-center border-r border-slate-800-40 text-slate-500 transition-all cursor-grab active:cursor-grabbing"
                          >
                            <GripVertical size={16} />
                          </div>

                          {/* Block Contents */}
                          <div className="flex-1 p-6 flex flex-col gap-2">
                            {/* Header metadata tag */}
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-bold uppercase tracking-wider px-2 py-05 rounded ${
                                block.type === 'text' 
                                  ? 'bg-indigo-50-10 text-indigo-400' 
                                  : block.type === 'video'
                                    ? 'bg-violet-50-10 text-violet-400'
                                    : 'bg-pink-50-10 text-pink-400'
                              }`}>
                                {block.type}
                              </span>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeBlock(block.id);
                                }}
                                className="opacity-0 group-hover-opacity-100 text-slate-500 hover:text-pink-500 p-15 rounded-lg transition-all duration-300 cursor-pointer"
                                title="Excluir Bloco"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>

                            {/* TEXT COMPONENT LAYOUT */}
                            {block.type === 'text' && (
                              <div 
                                className={`text-slate-200 leading-relaxed font-normal whitespace-pre-wrap mt-2 ${
                                  block.styles?.fontSize === 'small' 
                                    ? 'text-xs' 
                                    : block.styles?.fontSize === 'large'
                                      ? 'text-lg'
                                      : block.styles?.fontSize === 'xlarge'
                                        ? 'text-2xl font-semibold'
                                        : 'text-sm'
                                }`}
                                style={{
                                  textAlign: block.styles?.align || 'left',
                                }}
                              >
                                {block.content}
                              </div>
                            )}

                            {/* VIDEO COMPONENT LAYOUT */}
                            {block.type === 'video' && (
                              <div className="mt-3 bg-slate-950-80 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
                                <div className="p-3 bg-violet-50-10 rounded-lg text-violet-400">
                                  <Eye size={20} />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                  <span className="text-xs font-semibold text-slate-200 block truncate">
                                    {block.url}
                                  </span>
                                  <span className="text-xs text-slate-500 uppercase font-medium tracking-wider">
                                    Provedor: {block.provider}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* QUIZ COMPONENT LAYOUT */}
                            {block.type === 'quiz' && (
                              <div className="mt-3 flex flex-col gap-3">
                                <span className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                                  <HelpCircle size={14} className="text-pink-400" />
                                  {block.question}
                                </span>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                  {block.options.map((opt) => (
                                    <div
                                      key={opt.id}
                                      className={`p-25 rounded-lg border text-xs font-medium flex items-center justify-between ${
                                        opt.isCorrect
                                          ? 'border-indigo-50-30 bg-indigo-5-5 text-indigo-300'
                                          : 'border-slate-800 bg-slate-950-20 text-slate-400'
                                      }`}
                                    >
                                      <span>{opt.text}</span>
                                      {opt.isCorrect && (
                                        <span className="text-xs font-bold uppercase bg-indigo-50-20 text-indigo-400 px-1.5 py-05 rounded">
                                          Correta
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
};
