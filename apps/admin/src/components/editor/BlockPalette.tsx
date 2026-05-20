'use client';

import React, { useState } from 'react';
import { Icon } from '@projeto/ui';
import { useEditor } from '../../context/EditorContext';

export const BlockPalette: React.FC = () => {
  const { addBlock } = useEditor();
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="sidebar-left" style={{
      width: collapsed ? 72 : 240,
      minWidth: collapsed ? 72 : 240,
      overflowY: 'auto',
      borderRight: '1px solid #DEE1EB',
      backgroundColor: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.2s ease, min-width 0.2s ease',
    }}>
      {/* Toggle button */}
      <div style={{
        display: 'flex',
        justifyContent: collapsed ? 'center' : 'flex-end',
        padding: collapsed ? '12px 0' : '8px 8px 0 8px',
      }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expandir' : 'Recolher'}
          style={{
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            backgroundColor: '#f8fafc',
            color: '#64748b',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Icon name={collapsed ? 'ChevronRight' : 'ChevronLeft'} size={16} />
        </button>
      </div>

      {!collapsed && (
        <div style={{ padding: '16px 24px 0 24px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Conteúdo
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
            Arraste ou clique para adicionar
          </p>
        </div>
      )}

      <div className="palette-grid" style={{
        gridTemplateColumns: collapsed ? '1fr' : '1fr 1fr',
        padding: collapsed ? '8px' : '24px',
        gap: collapsed ? '8px' : '12px',
      }}>
        <BlockBtn icon="Type" label="Texto" collapsed={collapsed} onClick={() => addBlock('text')} />
        <BlockBtn icon="Image" label="Imagem" collapsed={collapsed} onClick={() => addBlock('image')} />
        <BlockBtn icon="Video" label="Vídeo" collapsed={collapsed} onClick={() => addBlock('video')} />
        <BlockBtn icon="HelpCircle" label="Quiz" collapsed={collapsed} onClick={() => addBlock('quiz')} />
        <BlockBtn icon="Quote" label="Citação" collapsed={collapsed} onClick={() => addBlock('quote')} />
        <BlockBtn icon="Code" label="HTML" collapsed={collapsed} onClick={() => addBlock('html')} />
      </div>
    </div>
  );
};

function BlockBtn({ icon, label, collapsed, onClick }: {
  icon: string;
  label: string;
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="palette-item" style={{
      padding: collapsed ? '10px 4px' : '16px 8px',
    }}>
      <div className="palette-item-icon">
        <Icon name={icon} size={18} />
      </div>
      {!collapsed && <span className="palette-item-label">{label}</span>}
    </button>
  );
}
