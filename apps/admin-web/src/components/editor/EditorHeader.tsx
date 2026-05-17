'use client';

import React, { useState, useEffect } from 'react';
import { useEditor } from '../../context/EditorContext';
import { Undo2, Redo2, CloudLightning, Check } from 'lucide-react';

export const EditorHeader: React.FC = () => {
  const { canUndo, canRedo, undo, redo, blocks } = useEditor();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Simulador de salvamento automático debounced no banco
  useEffect(() => {
    if (blocks.length === 0) return;

    setSaveStatus('saving');
    const timer = setTimeout(() => {
      setSaveStatus('saved');
      const innerTimer = setTimeout(() => setSaveStatus('idle'), 2000);
      return () => clearTimeout(innerTimer);
    }, 1200);

    return () => clearTimeout(timer);
  }, [blocks]);

  return (
    <header className="h-16 bg-slate-900-60 backdrop-blur-xl border-b border-slate-800 px-8 flex items-center justify-between w-full">
      {/* Title info */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-55-10 rounded-lg text-indigo-400">
          <CloudLightning size={18} />
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Estúdio CMS</span>
          <span className="text-sm font-semibold text-slate-200">Editor de Aula: Módulo 1 / Introdução Básica</span>
        </div>
      </div>

      {/* Undo/Redo & Save controls */}
      <div className="flex items-center gap-4">
        {/* Save Status indicator */}
        <div className="flex items-center gap-15 text-xs">
          {saveStatus === 'saving' && (
            <>
              <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-slate-400">Salvando alterações...</span>
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <Check size={12} className="text-indigo-400 font-bold" />
              <span className="text-indigo-400 font-medium">Salvo com sucesso!</span>
            </>
          )}
          {saveStatus === 'idle' && (
            <>
              <div className="h-2 w-2 rounded-full bg-slate-600" />
              <span className="text-slate-500">Alterações salvas localmente</span>
            </>
          )}
        </div>

        <div className="h-4 w-1px bg-slate-800" />

        {/* Undo/Redo Buttons */}
        <div className="flex items-center gap-1 bg-slate-950-40 p-1 border border-slate-800 rounded-lg">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`p-15 rounded transition-all duration-300 cursor-pointer ${
              canUndo ? 'text-slate-300 hover-border-slate-700' : 'text-slate-605 cursor-not-allowed'
            }`}
            title="Desfazer (Ctrl+Z)"
          >
            <Undo2 size={15} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`p-15 rounded transition-all duration-300 cursor-pointer ${
              canRedo ? 'text-slate-300 hover-border-slate-700' : 'text-slate-605 cursor-not-allowed'
            }`}
            title="Refazer (Ctrl+Shift+Z)"
          >
            <Redo2 size={15} />
          </button>
        </div>

        {/* Status indicator */}
        <select className="bg-slate-950-60 border border-slate-800 rounded-lg px-3 py-15 text-xs text-slate-300 focus-outline-none focus-border-indigo-60 cursor-pointer">
          <option value="draft">Rascunho</option>
          <option value="published">Publicado</option>
        </select>
      </div>
    </header>
  );
};
