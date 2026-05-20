'use client';

import React, { useState } from 'react';
import { Button, Text, Icon } from '@projeto/ui';
import Link from 'next/link';
import { useEditor } from '../../context/EditorContext';
import { PositionPanel } from './PositionPanel';

export const EditorHeader: React.FC = () => {
  const { canUndo, canRedo, undo, redo, saveStatus, previewMode, setPreviewMode, viewportMode, setViewportMode, publishLesson, courseTitle, moduleTitle, lessonTitle } = useEditor();
  const [published, setPublished] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [isPositionPanelOpen, setIsPositionPanelOpen] = useState(false);

  const handlePublish = async () => {
    try {
      setPublishError(null);
      await publishLesson();
      setPublished(true);
      setTimeout(() => setPublished(false), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao publicar aula';
      setPublishError(message);
      setTimeout(() => setPublishError(null), 5000);
    }
  };

  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', height: '56px', borderBottom: '1px solid #DEE1EB', backgroundColor: '#FFFFFF', gap: '16px' }}>
      {/* Left Area */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
          <Icon name="ArrowLeft" size={20} color="#808498" />
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '24px', height: '24px', backgroundColor: 'var(--accent-blue)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="CloudLightning" size={14} color="white" />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
              {courseTitle || 'Curso'} / {moduleTitle || 'Módulo'} / <span style={{ fontWeight: 600 }}>{lessonTitle}</span>
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

      {/* View Toggle — alterna entre Desktop e Mobile no editor e preview */}
      <div className="toggle-group" style={{ width: '180px' }}>
        <button
          className={`toggle-btn ${viewportMode === 'desktop' ? 'active' : ''}`}
          onClick={() => setViewportMode('desktop')}
          title="Viewport Desktop"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
        </button>
        <button
          className={`toggle-btn ${viewportMode === 'tablet' ? 'active' : ''}`}
          onClick={() => setViewportMode('tablet')}
          title="Viewport Tablet"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="22" x="4" y="1" rx="3"/><line x1="12" x2="12.01" y1="18" y2="18"/></svg>
        </button>
        <button
          className={`toggle-btn ${viewportMode === 'mobile' ? 'active' : ''}`}
          onClick={() => setViewportMode('mobile')}
          title="Viewport Mobile"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
        </button>
      </div>

      {/* Right Area: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '4px', marginRight: '8px' }}>
          <button className="btn-icon" onClick={undo} disabled={!canUndo} style={{ opacity: canUndo ? 1 : 0.4 }} title="Desfazer">
            <Icon name="Undo2" size={16} />
          </button>
          <button className="btn-icon" onClick={redo} disabled={!canRedo} style={{ opacity: canRedo ? 1 : 0.4 }} title="Refazer">
            <Icon name="Redo2" size={16} />
          </button>
        </div>

        <Button
          variant="ghost"
          onClick={() => setPreviewMode(!previewMode)}
        >
          {previewMode ? <Icon name="EyeOff" size={15} /> : <Icon name="Eye" size={15} />}<Text>{previewMode ? 'Sair do Preview' : 'Visualizar como aluno'}</Text>
        </Button>

        <Button
          variant="ghost"
          onClick={() => setIsPositionPanelOpen(!isPositionPanelOpen)}
        >
          <Icon name="Layers" size={15} /><Text>Posição</Text>
        </Button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            variant="primary"
            onClick={handlePublish}
          >
            {published ? (
              <><Icon name="CheckCircle2" size={15} /><Text>Publicado!</Text></>
            ) : (
              'Publicar'
            )}
          </Button>
          {publishError && (
            <div style={{ fontSize: '12px', color: '#ef4444', maxWidth: '220px', lineHeight: '1.3' }}>
              {publishError}
            </div>
          )}
        </div>
      </div>

      {/* Popover/Modal do Painel de Posição */}
      {isPositionPanelOpen && (
        <PositionPanel onClose={() => setIsPositionPanelOpen(false)} />
      )}
    </header>
  );
};
