'use client';

import React from 'react';
import { useEditor } from '../../context/EditorContext';
import { Type, Video, HelpCircle, Plus } from 'lucide-react';

export const BlockPalette: React.FC = () => {
  const { addBlock } = useEditor();

  return (
    <div className="w-80 bg-slate-900-40 backdrop-blur-xl border-r border-slate-800 p-6 flex flex-col gap-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Paleta de Blocos</h3>
        <p className="text-xs text-slate-400 mt-1">Clique para inserir um novo bloco na sua aula.</p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Bloco de Texto */}
        <button
          onClick={() => addBlock('text')}
          className="flex items-start gap-4 p-4 rounded-xl border border-indigo-50-20 bg-indigo-5-10 text-indigo-400 text-left transition-all duration-300 hover-scale cursor-pointer"
        >
          <div className="p-2 rounded-lg bg-slate-950-60 mt-05">
            <Type size={18} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-100">Bloco de Texto</span>
              <Plus size={14} className="opacity-60" />
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Adicione parágrafos, cabeçalhos ou links formatados.</p>
          </div>
        </button>

        {/* Bloco de Vídeo */}
        <button
          onClick={() => addBlock('video')}
          className="flex items-start gap-4 p-4 rounded-xl border border-violet-50-20 bg-violet-50-10 text-violet-400 text-left transition-all duration-300 hover-scale cursor-pointer"
        >
          <div className="p-2 rounded-lg bg-slate-950-60 mt-05">
            <Video size={18} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-100">Bloco de Vídeo</span>
              <Plus size={14} className="opacity-60" />
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Insira links do YouTube, Vimeo ou Supabase Storage.</p>
          </div>
        </button>

        {/* Bloco de Quiz */}
        <button
          onClick={() => addBlock('quiz')}
          className="flex items-start gap-4 p-4 rounded-xl border border-pink-50-20 bg-pink-50-10 text-pink-400 text-left transition-all duration-300 hover-scale cursor-pointer"
        >
          <div className="p-2 rounded-lg bg-slate-950-60 mt-05">
            <HelpCircle size={18} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-100">Bloco de Quiz</span>
              <Plus size={14} className="opacity-60" />
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Crie atividades com feedbacks e múltiplas escolhas.</p>
          </div>
        </button>
      </div>
    </div>
  );
};
