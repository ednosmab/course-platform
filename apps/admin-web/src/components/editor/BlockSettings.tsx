'use client';

import React from 'react';
import { useEditor } from '../../context/EditorContext';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Trash2, Plus, AlertCircle } from 'lucide-react';

export const BlockSettings: React.FC = () => {
  const { blocks, activeBlockId, updateBlock, removeBlock } = useEditor();

  const activeBlock = blocks.find((b) => b.id === activeBlockId);

  if (!activeBlock) {
    return (
      <div className="w-80 bg-slate-900-40 backdrop-blur-xl border-l border-slate-800 p-6 flex flex-col items-center justify-center text-center h-screen">
        <AlertCircle size={28} className="text-slate-500 mb-2 opacity-50" />
        <span className="text-sm font-medium text-slate-400">Nenhum bloco selecionado</span>
        <p className="text-xs text-slate-500 mt-1">Selecione um bloco no canvas central para ajustar suas configurações específicas.</p>
      </div>
    );
  }

  return (
    <div className="w-80 bg-slate-900-40 backdrop-blur-xl border-l border-slate-800 p-6 flex flex-col gap-6 overflow-y-auto h-screen">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Ajustes do Bloco</h3>
        <button
          onClick={() => removeBlock(activeBlock.id)}
          className="text-pink-500 bg-pink-55-10 p-2 rounded-lg transition-all duration-300 cursor-pointer border border-pink-50-20"
          title="Excluir Bloco"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="border-b border-slate-800" />

      {/* --- SETTINGS FOR TEXT BLOCK --- */}
      {activeBlock.type === 'text' && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Conteúdo do Texto</label>
            <textarea
              value={activeBlock.content}
              onChange={(e) => updateBlock(activeBlock.id, { content: e.target.value })}
              rows={5}
              className="bg-slate-950-60 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus-outline-none focus-border-indigo-60 resize-y"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Tamanho da Fonte</label>
            <select
              value={activeBlock.styles?.fontSize || 'medium'}
              onChange={(e) =>
                updateBlock(activeBlock.id, {
                  styles: {
                    ...activeBlock.styles,
                    fontSize: e.target.value as any,
                  },
                })
              }
              className="bg-slate-950-60 border border-slate-800 rounded-lg p-2 text-sm text-slate-200 focus-outline-none focus-border-indigo-60"
            >
              <option value="small">Pequena</option>
              <option value="medium">Média</option>
              <option value="large">Grande</option>
              <option value="xlarge">Muito Grande</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Alinhamento</label>
            <div className="grid grid-cols-4 gap-1 bg-slate-950-40 p-1 rounded-lg border border-slate-800">
              {(['left', 'center', 'right', 'justify'] as const).map((align) => {
                const isSelected = activeBlock.styles?.align === align;
                const Icons = {
                  left: AlignLeft,
                  center: AlignCenter,
                  right: AlignRight,
                  justify: AlignJustify,
                };
                const Icon = Icons[align];
                return (
                  <button
                    key={align}
                    onClick={() =>
                      updateBlock(activeBlock.id, {
                        styles: {
                          ...activeBlock.styles,
                          align,
                        },
                      })
                    }
                    className={`flex items-center justify-center p-2 rounded transition-all duration-300 cursor-pointer ${
                      isSelected ? 'bg-indigo-55-20 text-indigo-400' : 'text-slate-400'
                    }`}
                  >
                    <Icon size={16} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- SETTINGS FOR VIDEO BLOCK --- */}
      {activeBlock.type === 'video' && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Provedor de Vídeo</label>
            <select
              value={activeBlock.provider}
              onChange={(e) => updateBlock(activeBlock.id, { provider: e.target.value as any })}
              className="bg-slate-950-60 border border-slate-800 rounded-lg p-2 text-sm text-slate-200 focus-outline-none focus-border-indigo-60"
            >
              <option value="youtube">YouTube</option>
              <option value="vimeo">Vimeo</option>
              <option value="storage_supabase">Supabase Storage</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">URL do Vídeo</label>
            <input
              type="text"
              value={activeBlock.url}
              onChange={(e) => updateBlock(activeBlock.id, { url: e.target.value })}
              className="bg-slate-950-60 border border-slate-800 rounded-lg p-25 text-sm text-slate-200 focus-outline-none focus-border-indigo-60"
            />
          </div>
        </div>
      )}

      {/* --- SETTINGS FOR QUIZ BLOCK --- */}
      {activeBlock.type === 'quiz' && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Pergunta</label>
            <input
              type="text"
              value={activeBlock.question}
              onChange={(e) => updateBlock(activeBlock.id, { question: e.target.value })}
              className="bg-slate-950-60 border border-slate-800 rounded-lg p-25 text-sm text-slate-200 focus-outline-none focus-border-indigo-60"
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Opções de Resposta</label>
              <button
                onClick={() => {
                  const newOption = {
                    id: crypto.randomUUID(),
                    text: 'Nova Opção',
                    isCorrect: false,
                    feedback: 'Dica do professor.',
                  };
                  updateBlock(activeBlock.id, {
                    options: [...activeBlock.options, newOption],
                  });
                }}
                className="text-indigo-400 flex items-center gap-1 text-xs transition-all duration-300 cursor-pointer"
              >
                <Plus size={12} /> Add Opção
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {activeBlock.options.map((opt) => (
                <div key={opt.id} className="bg-slate-950-40 border border-slate-800 rounded-xl p-3 flex flex-col gap-2 relative">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-option-${activeBlock.id}`}
                      checked={opt.isCorrect}
                      onChange={() => {
                        const updatedOptions = activeBlock.options.map((o) => ({
                          ...o,
                          isCorrect: o.id === opt.id,
                        }));
                        updateBlock(activeBlock.id, { options: updatedOptions });
                      }}
                      className="cursor-pointer accent-indigo-500"
                    />
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => {
                        const updatedOptions = activeBlock.options.map((o) => {
                          if (o.id !== opt.id) return o;
                          return { ...o, text: e.target.value };
                        });
                        updateBlock(activeBlock.id, { options: updatedOptions });
                      }}
                      className="bg-transparent border-b border-b-transparent focus-border-indigo text-xs text-slate-200 flex-1 focus-outline-none py-05"
                    />
                    {activeBlock.options.length > 2 && (
                      <button
                        onClick={() => {
                          const updatedOptions = activeBlock.options.filter((o) => o.id !== opt.id);
                          if (opt.isCorrect && updatedOptions.length > 0) {
                            updatedOptions[0].isCorrect = true;
                          }
                          updateBlock(activeBlock.id, { options: updatedOptions });
                        }}
                        className="text-pink-500-60 hover:text-pink-500 transition-all duration-300 cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Feedback para esta opção..."
                    value={opt.feedback || ''}
                    onChange={(e) => {
                      const updatedOptions = activeBlock.options.map((o) => {
                        if (o.id !== opt.id) return o;
                        return { ...o, feedback: e.target.value };
                      });
                      updateBlock(activeBlock.id, { options: updatedOptions });
                    }}
                    className="bg-slate-950-60 border border-slate-900 rounded p-15 text-xs text-slate-400 focus-outline-none focus-border-indigo-40"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
