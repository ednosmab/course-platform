'use client';

import React from 'react';
import { Icon } from '@projeto/ui';
import { useEditor } from '../../context/EditorContext';

export const BlockPalette: React.FC = () => {
  const { addBlock } = useEditor();

  return (
    <div className="sidebar-left">
      <div style={{ padding: '24px 24px 0 24px' }}>
        <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Conteúdo
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
          Arraste ou clique para adicionar
        </p>
      </div>

      <div className="palette-grid">
        {/* Bloco de Texto */}
        <button onClick={() => addBlock('text')} className="palette-item">
          <div className="palette-item-icon">
            <Icon name="Type" size={18} />
          </div>
          <span className="palette-item-label">Texto</span>
        </button>

        {/* Bloco de Imagem */}
        <button onClick={() => addBlock('image')} className="palette-item">
          <div className="palette-item-icon">
            <Icon name="Image" size={18} />
          </div>
          <span className="palette-item-label">Imagem</span>
        </button>

        {/* Bloco de Vídeo */}
        <button onClick={() => addBlock('video')} className="palette-item">
          <div className="palette-item-icon">
            <Icon name="Video" size={18} />
          </div>
          <span className="palette-item-label">Vídeo</span>
        </button>

        {/* Bloco de Quiz */}
        <button onClick={() => addBlock('quiz')} className="palette-item">
          <div className="palette-item-icon">
            <Icon name="HelpCircle" size={18} />
          </div>
          <span className="palette-item-label">Quiz</span>
        </button>

        {/* Bloco de Citação */}
        <button onClick={() => addBlock('quote')} className="palette-item">
          <div className="palette-item-icon">
            <Icon name="Quote" size={18} />
          </div>
          <span className="palette-item-label">Citação</span>
        </button>

        {/* Bloco de HTML Raw */}
        <button onClick={() => addBlock('html')} className="palette-item">
          <div className="palette-item-icon">
            <Icon name="Code" size={18} />
          </div>
          <span className="palette-item-label">HTML</span>
        </button>
      </div>
    </div>
  );
};
