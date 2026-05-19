'use client';

import React, { useState } from 'react';
import { Button, Text } from '@projeto/ui';
import { useEditor } from '../../context/EditorContext';
import { Undo2, Redo2, CloudLightning, Eye, EyeOff, CheckCircle2, Layers } from 'lucide-react';
import { PositionPanel } from './PositionPanel';

export const EditorHeader: React.FC = () => {
  const { canUndo, canRedo, undo, redo, saveStatus, previewMode, setPreviewMode, viewportMode, setViewportMode, publishLesson } = useEditor();
  const [published, setPublished] = useState(false);
  const [isPositionPanelOpen, setIsPositionPanelOpen] = useState(false);

  const handlePublish = async () => {
    try {
      await publishLesson();
      setPublished(true);
      setTimeout(() => setPublished(false), 3000);
    } catch (err) {
      console.error('Falha ao publicar aula:', err);
    }
  };

  return (
    <header className="topbar">
      {/* Left Area */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="btn-icon" title="Voltar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '24px', height: '24px', backgroundColor: 'var(--accent-blue)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CloudLightning size={14} color="white" />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
              Onboarding 2026 / <span style={{ fontWeight: 600 }}>Aula 03 — Feedback</span>
            </span>
          </div>

          {/* Save Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '12px', fontSize: '11px', color: 'var(--text-tertiary)' }}>
            {saveStatus === 'saving' && (
              <>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                <span>Salvando...</span>
              </>
            )}
            {(saveStatus === 'saved' || saveStatus === 'idle') && (
              <>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                <span>Salvo</span>
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                <span style={{ color: '#ef4444' }}>Erro ao salvar</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Center: View Toggle — controla tamanho do viewport do canvas */}
      <div className="toggle-group" style={{ width: '120px' }}>
        <button
          className={`toggle-btn ${viewportMode === 'desktop' ? 'active' : ''}`}
          onClick={() => { setViewportMode('desktop'); setPreviewMode(false); }}
          title="Viewport Desktop"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
        </button>
        <button
          className={`toggle-btn ${viewportMode === 'mobile' ? 'active' : ''}`}
          onClick={() => { setViewportMode('mobile'); setPreviewMode(false); }}
          title="Viewport Mobile"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
        </button>
      </div>

      {/* Right Area: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '4px', marginRight: '8px' }}>
          <button className="btn-icon" onClick={undo} disabled={!canUndo} style={{ opacity: canUndo ? 1 : 0.4 }} title="Desfazer">
            <Undo2 size={16} />
          </button>
          <button className="btn-icon" onClick={redo} disabled={!canRedo} style={{ opacity: canRedo ? 1 : 0.4 }} title="Refazer">
            <Redo2 size={16} />
          </button>
        </div>

        <Button
          variant="ghost"
          onClick={() => setPreviewMode(!previewMode)}
        >
          {previewMode ? <EyeOff size={15} /> : <Eye size={15} />}<Text>{previewMode ? 'Sair do Preview' : 'Visualizar como aluno'}</Text>
        </Button>

        <Button
          variant="ghost"
          onClick={() => setIsPositionPanelOpen(!isPositionPanelOpen)}
        >
          <Layers size={15} /><Text>Posição</Text>
        </Button>

        <Button
          variant="primary"
          onClick={handlePublish}
        >
          {published ? (
            <><CheckCircle2 size={15} /><Text>Publicado!</Text></>
          ) : (
            'Publicar'
          )}
        </Button>
      </div>

      {/* Popover/Modal do Painel de Posição */}
      {isPositionPanelOpen && (
        <PositionPanel onClose={() => setIsPositionPanelOpen(false)} />
      )}
    </header>
  );
};
