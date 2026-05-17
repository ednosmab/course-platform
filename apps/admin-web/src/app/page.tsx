'use client';

import React from 'react';
import { EditorProvider } from '../context/EditorContext';
import { EditorHeader } from '../components/editor/EditorHeader';
import { BlockPalette } from '../components/editor/BlockPalette';
import { EditorCanvas } from '../components/editor/EditorCanvas';
import { BlockSettings } from '../components/editor/BlockSettings';

export default function Home() {
  return (
    <EditorProvider>
      <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
        {/* Barra de topo do estúdio CMS */}
        <EditorHeader />

        {/* Viewport Principal do Editor */}
        <div className="flex flex-1 overflow-hidden w-full">
          {/* Paleta de Blocos (Esquerda) */}
          <BlockPalette />

          {/* Canvas do Editor Reordenável (Centro) */}
          <EditorCanvas />

          {/* Ajustes Específicos do Bloco (Direita) */}
          <BlockSettings />
        </div>
      </div>
    </EditorProvider>
  );
}
