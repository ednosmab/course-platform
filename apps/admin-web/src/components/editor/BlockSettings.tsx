'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@projeto/ui';
import { useEditor } from '../../context/EditorContext';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Trash2, Plus, AlertCircle, Code } from 'lucide-react';
import { AnyBlock } from '@projeto/types';

/** Gera HTML representativo de qualquer bloco (fora do componente para evitar re-renders) */
function parseMarkdownToHtml(text: string): string {
  if (!text) return '';
  const lines = text.split('\n');
  const renderedLines = lines.map((line) => {
    const trimmedLine = line.trim();
    const isQuote = trimmedLine.startsWith('>') || trimmedLine.startsWith('&gt;');
    let cleanContent = isQuote 
      ? (trimmedLine.startsWith('&gt;') ? trimmedLine.slice(4).trim() : trimmedLine.slice(1).trim()) 
      : line;

    cleanContent = cleanContent.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    cleanContent = cleanContent.replace(/___(.*?)/g, '<strong><em>$1</em></strong>');
    cleanContent = cleanContent.replace(/\*\*_(.*?)\_\*\*/g, '<strong><em>$1</em></strong>');
    cleanContent = cleanContent.replace(/_\*\*(.*?)\*\*_/g, '<strong><em>$1</em></strong>');
    cleanContent = cleanContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    cleanContent = cleanContent.replace(/__(.*?)__/g, '<strong>$1</strong>');
    cleanContent = cleanContent.replace(/\*(.*?)\*/g, '<em>$1</em>');
    cleanContent = cleanContent.replace(/_(.*?)_/g, '<em>$1</em>');

    if (isQuote) {
      return `<blockquote style="border-left: 4px solid #3b82f6; padding-left: 12px; margin: 8px 0; font-style: italic; color: #4b5563; background-color: #f3f4f6; padding-top: 6px; padding-bottom: 6px; padding-right: 12px; border-radius: 0 6px 6px 0;">${cleanContent}</blockquote>`;
    }
    return `<div>${cleanContent}</div>`;
  });
  return renderedLines.join('');
}

function getHtmlFromBlock(block: AnyBlock): string {
  switch (block.type) {
    case 'text': {
      const fsMap: Record<string, string> = { small: '13px', medium: '16px', large: '24px', xlarge: '32px' };
      const fs = block.styles?.fontSize || 'medium';
      const styles = (block.styles || {}) as any;
      
      let inlineStyle = `font-size: ${fsMap[fs]}; text-align: ${styles.align || 'left'}; line-height: 1.6;`;
      if (styles.fontFamily) inlineStyle += ` font-family: ${styles.fontFamily};`;
      if (styles.color) inlineStyle += ` color: ${styles.color};`;
      if (styles.backgroundColor) inlineStyle += ` background-color: ${styles.backgroundColor};`;
      if (styles.backgroundImage) inlineStyle += ` background-image: url(${styles.backgroundImage}); background-size: cover; background-position: center;`;
      if (styles.backgroundColor || styles.backgroundImage) inlineStyle += ` padding: 16px; border-radius: 8px;`;

      let content = parseMarkdownToHtml(block.content);
      if (styles.bold) content = `<strong>${content}</strong>`;
      if (styles.italic) content = `<em>${content}</em>`;

      return `<p style="${inlineStyle}">${content}</p>`;
    }
    case 'video':
      return `<iframe\n  src="https://www.youtube.com/embed/${block.url}"\n  width="100%"\n  style="aspect-ratio:16/9;border:none;border-radius:8px"\n  allowfullscreen\n></iframe>`;
    case 'image':
      return `<img\n  src="${block.url}"\n  alt="${block.alt || ''}"\n  style="width:100%;border-radius:8px"\n/>`;
    case 'html':
      return block.htmlContent;
    case 'quote': {
      const fsMap: Record<string, string> = { small: '13px', medium: '16px', large: '24px', xlarge: '32px' };
      const fs = block.styles?.fontSize || 'medium';
      const styles = (block.styles || {}) as any;

      let inlineStyle = `font-size: ${fsMap[fs]}; text-align: ${styles.align || 'left'}; line-height: 1.6; font-style: italic;`;
      if (styles.fontFamily) inlineStyle += ` font-family: ${styles.fontFamily};`;
      if (styles.color) inlineStyle += ` color: ${styles.color};`;
      if (styles.backgroundColor) inlineStyle += ` background-color: ${styles.backgroundColor};`;
      if (styles.backgroundImage) inlineStyle += ` background-image: url(${styles.backgroundImage}); background-size: cover; background-position: center;`;
      
      if (styles.backgroundColor || styles.backgroundImage) {
        inlineStyle += ` padding: 16px; border-radius: 8px;`;
      } else {
        inlineStyle += ` border-left: 4px solid #3b82f6; padding-left: 16px;`;
      }

      let content = block.content;
      content = content.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
      content = content.replace(/___(.*?)/g, '<strong><em>$1</em></strong>');
      content = content.replace(/\*\*_(.*?)\_\*\*/g, '<strong><em>$1</em></strong>');
      content = content.replace(/_\*\*(.*?)\*\*_/g, '<strong><em>$1</em></strong>');
      content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      content = content.replace(/__(.*?)__/g, '<strong>$1</strong>');
      content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
      content = content.replace(/_(.*?)_/g, '<em>$1</em>');

      if (styles.bold) content = `<strong>${content}</strong>`;
      if (styles.italic) content = `<em>${content}</em>`;

      const authorHtml = block.author ? `<div style="font-size: 11px; margin-top: 8px; opacity: 0.7; font-weight: 500;">— ${block.author}</div>` : '';

      return `<blockquote style="${inlineStyle}">
  <div>${content}</div>
  ${authorHtml}
</blockquote>`;
    }
    case 'quiz': {
      const fsMap: Record<string, string> = { small: '13px', medium: '16px', large: '24px', xlarge: '32px' };
      const fs = block.styles?.fontSize || 'medium';
      const styles = (block.styles || {}) as any;

      let inlineStyle = `font-family: ${styles.fontFamily || 'inherit'};`;
      if (styles.color) inlineStyle += ` color: ${styles.color};`;
      if (styles.backgroundColor) inlineStyle += ` background-color: ${styles.backgroundColor};`;
      if (styles.backgroundImage) inlineStyle += ` background-image: url(${styles.backgroundImage}); background-size: cover; background-position: center;`;
      inlineStyle += styles.backgroundColor || styles.backgroundImage ? ` padding: 16px; border-radius: 8px;` : ` border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px;`;

      let question = parseMarkdownToHtml(block.question);
      if (styles.bold) question = `<strong>${question}</strong>`;
      if (styles.italic) question = `<em>${question}</em>`;

      return `<div class="quiz" style="${inlineStyle}">
  <div style="font-size: ${fsMap[fs]}; margin-bottom: 8px; line-height: 1.4;">
    <span style="background-color: #dbeafe; color: #1d4ed8; font-size: 9px; font-weight: 700; padding: 2px 5px; border-radius: 3px; margin-right: 6px;">QUIZ</span>
    ${question}
  </div>
  <div style="display: flex; flex-direction: column; gap: 5px;">
${block.options.map((o, i) => `    <div style="display: flex; align-items: center; padding: 6px 10px; border-radius: 5px; border: ${o.isCorrect ? '1px solid #10b981' : '1px solid #e2e8f0'}; background-color: ${o.isCorrect ? '#ecfdf5' : '#ffffff'}; font-size: 11px;">
      <span style="margin-right: 6px; font-weight: 600; color: #64748b;">${String.fromCharCode(65+i)}</span>
      <span style="color: ${o.isCorrect ? '#065f46' : '#475569'};">${o.text}</span>
    </div>`).join('\n')}
  </div>
</div>`;
    }
    default:
      return '';
  }
}

/** Controles universais de dimensão aplicáveis a qualquer bloco */
const DimensionControls: React.FC<{ block: any; updateBlock: any }> = ({ block, updateBlock }) => (
  <div style={{ borderTop: '1px solid var(--border-light)', marginTop: '16px', paddingTop: '16px' }}>
    <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Dimensões</label>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label" style={{ fontSize: '10px' }}>Largura</label>
        <input
          type="text"
          className="form-input"
          placeholder="ex: 100%, 400px"
          value={block.styles?.width || ''}
          onChange={(e) => updateBlock(block.id, { styles: { ...block.styles, width: e.target.value } })}
        />
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label" style={{ fontSize: '10px' }}>Altura</label>
        <input
          type="text"
          className="form-input"
          placeholder="ex: auto, 200px"
          value={block.styles?.height || ''}
          onChange={(e) => updateBlock(block.id, { styles: { ...block.styles, height: e.target.value } })}
        />
      </div>
    </div>
  </div>
);

/** Controles de tipografia, cores e background para Texto e Quiz */
const TypographyAndBackgroundControls: React.FC<{ block: any; updateBlock: any }> = ({ block, updateBlock }) => {
  const styles = block.styles || {};
  
  const setStyle = (key: string, value: any) => {
    updateBlock(block.id, {
      styles: {
        ...styles,
        [key]: value
      }
    });
  };

  const fontOptions = [
    { label: 'Padrão (Inter)', value: 'var(--font-sans, system-ui, sans-serif)' },
    { label: 'Elegante (Georgia)', value: 'Georgia, serif' },
    { label: 'Código (Monospace)', value: 'monospace' },
    { label: 'Premium (Outfit)', value: 'Outfit, sans-serif' },
    { label: 'Luxo (Playfair)', value: 'Playfair Display, serif' }
  ];

  const presetColors = [
    '#000000', '#334155', '#64748b', '#ef4444', '#f97316', '#eab308', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#ffffff'
  ];

  return (
    <div style={{ borderTop: '1px solid var(--border-light)', marginTop: '16px', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <label className="form-label" style={{ fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Tipografia e Visual</label>
      
      {/* Fonte e Formatação Semântica */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', alignItems: 'end' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '10px' }}>Família da Fonte</label>
          <select
            className="form-input"
            value={styles.fontFamily || ''}
            onChange={(e) => setStyle('fontFamily', e.target.value)}
            style={{ fontSize: '12px' }}
          >
            {fontOptions.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        {/* Toggles Negrito e Itálico */}
        <div style={{ display: 'flex', gap: '4px', height: '34px' }}>
          <button
            onClick={() => setStyle('bold', !styles.bold)}
            style={{
              width: '34px', height: '34px', borderRadius: '6px', border: '1px solid var(--border-light)',
              backgroundColor: styles.bold ? 'var(--accent-blue-light)' : 'var(--bg-canvas)',
              color: styles.bold ? 'var(--accent-blue)' : 'var(--text-primary)',
              fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            title="Negrito semântico (<strong>)"
          >
            B
          </button>
          <button
            onClick={() => setStyle('italic', !styles.italic)}
            style={{
              width: '34px', height: '34px', borderRadius: '6px', border: '1px solid var(--border-light)',
              backgroundColor: styles.italic ? 'var(--accent-blue-light)' : 'var(--bg-canvas)',
              color: styles.italic ? 'var(--accent-blue)' : 'var(--text-primary)',
              fontStyle: 'italic', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            title="Itálico semântico (<em>)"
          >
            I
          </button>
        </div>
      </div>

      {/* Cor da Fonte */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label" style={{ fontSize: '10px', display: 'flex', justifyContent: 'space-between' }}>
          <span>Cor do Texto</span>
          <span style={{ fontSize: '9px', color: 'var(--text-tertiary)' }}>{styles.color || 'Padrão'}</span>
        </label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="color"
            value={styles.color || '#1e293b'}
            onChange={(e) => setStyle('color', e.target.value)}
            style={{ width: '32px', height: '32px', padding: 0, border: '1px solid var(--border-light)', borderRadius: '4px', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', flex: 1 }}>
            {presetColors.slice(0, 8).map(c => (
              <button
                key={c}
                onClick={() => setStyle('color', c)}
                style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: c, border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer', padding: 0 }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Cor do Background */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label" style={{ fontSize: '10px', display: 'flex', justifyContent: 'space-between' }}>
          <span>Cor de Fundo</span>
          <span style={{ fontSize: '9px', color: 'var(--text-tertiary)' }}>{styles.backgroundColor || 'Transparente'}</span>
        </label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="color"
            value={styles.backgroundColor || '#ffffff'}
            onChange={(e) => setStyle('backgroundColor', e.target.value)}
            style={{ width: '32px', height: '32px', padding: 0, border: '1px solid var(--border-light)', borderRadius: '4px', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', flex: 1 }}>
            {presetColors.map(c => (
              <button
                key={c}
                onClick={() => setStyle('backgroundColor', c)}
                style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: c, border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer', padding: 0 }}
              />
            ))}
            <button
              onClick={() => setStyle('backgroundColor', '')}
              style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '3px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-canvas)', cursor: 'pointer' }}
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      {/* Background Image URL */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label" style={{ fontSize: '10px' }}>URL da Imagem de Fundo</label>
        <input
          type="text"
          className="form-input"
          value={styles.backgroundImage || ''}
          onChange={(e) => setStyle('backgroundImage', e.target.value)}
          placeholder="https://exemplo.com/background.jpg"
          style={{ fontSize: '12px' }}
        />
      </div>
    </div>
  );
};

export const BlockSettings: React.FC = () => {
  const { blocks, activeBlockId, updateBlock, removeBlock } = useEditor();
  const [activeTab, setActiveTab] = useState<'props' | 'html'>('props');
  // Local draft evita cursor jumping ao editar HTML
  const [htmlDraft, setHtmlDraft] = useState('');

  const activeBlock = blocks.find((b) => b.id === activeBlockId);

  // Sincroniza o draft quando o bloco muda
  useEffect(() => {
    if (!activeBlock) return;
    const html = getHtmlFromBlock(activeBlock);
    setHtmlDraft(html);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBlockId]);

  if (!activeBlock) {
    return (
      <div className="sidebar-right" style={{ justifyContent: 'center', alignItems: 'center', padding: '24px', textAlign: 'center' }}>
        <AlertCircle size={32} color="var(--text-tertiary)" style={{ marginBottom: '16px' }} />
        <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>Nenhum bloco selecionado</span>
        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '8px' }}>
          Clique num bloco no canvas para editar suas propriedades.
        </p>
      </div>
    );
  }

  const handleHtmlEdit = (value: string) => {
    setHtmlDraft(value); // atualiza draft local imediatamente (sem cursor jump)
    if (activeBlock.type === 'html') {
      updateBlock(activeBlock.id, { htmlContent: value });
    } else if (activeBlock.type === 'text') {
      const div = document.createElement('div');
      div.innerHTML = value;
      updateBlock(activeBlock.id, { content: div.textContent || div.innerText || value });
    }
  };

  return (
    <div className="sidebar-right">
      {/* Header com tabs */}
      <div style={{ padding: '16px 20px 0', borderBottom: '1px solid var(--border-light)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Editar Bloco</h3>
          <button onClick={() => removeBlock(activeBlock.id)} style={{ color: '#ef4444', padding: '4px', display: 'flex', alignItems: 'center', cursor: 'pointer' }} title="Excluir bloco">
            <Trash2 size={14} />
          </button>
        </div>
        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '2px', backgroundColor: 'var(--bg-canvas)', borderRadius: '7px', padding: '3px' }}>
          {(['props', 'html'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '5px 8px', borderRadius: '5px', fontSize: '11px', fontWeight: 600,
                backgroundColor: activeTab === tab ? 'var(--bg-surface)' : 'transparent',
                color: activeTab === tab ? 'var(--accent-blue)' : 'var(--text-secondary)',
                boxShadow: activeTab === tab ? 'var(--shadow-sm)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
              }}
            >
              {tab === 'props' ? 'Propriedades' : <><Code size={11} /> HTML Fonte</>}
            </button>
          ))}
        </div>
      </div>

      {/* ── HTML FONTE TAB ──── */}
      {activeTab === 'html' && (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflow: 'hidden' }}>
          <label className="form-label">Código — HTML / CSS / JavaScript</label>
          <textarea
            className="form-textarea"
            value={htmlDraft}
            onChange={(e) => handleHtmlEdit(e.target.value)}
            rows={20}
            spellCheck={false}
            style={{ fontFamily: 'monospace', fontSize: '11px', lineHeight: 1.6, flex: 1, resize: 'vertical' }}
            placeholder={activeBlock.type === 'html'
              ? '<div style="color:red">HTML direto</div>\n<style>p{color:blue}</style>\n<script>console.log("JS")</script>'
              : 'Visualização do HTML gerado pelo bloco'}
          />
          {activeBlock.type === 'html' && (
            <div className="tip-box" style={{ marginTop: 0 }}>
              <div className="tip-title">✅ SUPORTE COMPLETO</div>
              <div className="tip-text">Aceita HTML, CSS (<code>&lt;style&gt;</code>) e JavaScript (<code>&lt;script&gt;</code>) — executados em iframe isolado.</div>
            </div>
          )}
          {activeBlock.type !== 'html' && activeBlock.type !== 'text' && (
            <div className="tip-box" style={{ marginTop: 0 }}>
              <div className="tip-title">SOMENTE LEITURA</div>
              <div className="tip-text">Edite pelo painel "Propriedades". Para código livre, use o bloco HTML.</div>
            </div>
          )}
        </div>
      )}

      {/* ── PROPERTIES TAB ─────────────────────────────────────────── */}
      {activeTab === 'props' && (
      <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>

      {/* --- SETTINGS FOR TEXT BLOCK --- */}
      {activeBlock.type === 'text' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="form-group">
            <label className="form-label">Conteúdo do Texto</label>
            <textarea
              className="form-textarea"
              value={activeBlock.content}
              onChange={(e) => updateBlock(activeBlock.id, { content: e.target.value })}
              rows={4}
            />
            <Button
              variant="ghost"
              onClick={() => {
                const currentContent = activeBlock.content || '';
                const divider = currentContent ? '\n' : '';
                updateBlock(activeBlock.id, { content: currentContent + divider + '> "Insira sua citação aqui"\n— Autor' });
              }}
            >
              💬 Inserir Citação Formatada
            </Button>
          </div>

          <div className="form-group">
            <label className="form-label">Tamanho da Fonte</label>
            <select
              className="form-input"
              value={activeBlock.styles?.fontSize || 'medium'}
              onChange={(e) =>
                updateBlock(activeBlock.id, {
                  styles: {
                    ...activeBlock.styles,
                    fontSize: e.target.value as any,
                  },
                })
              }
            >
              <option value="small">Pequena</option>
              <option value="medium">Média</option>
              <option value="large">Grande</option>
              <option value="xlarge">Muito Grande</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Alinhamento</label>
            <div style={{ display: 'flex', backgroundColor: 'var(--bg-canvas)', borderRadius: '6px', padding: '4px', border: '1px solid var(--border-light)' }}>
              {(['left', 'center', 'right', 'justify'] as const).map((align) => {
                const isSelected = activeBlock.styles?.align === align;
                const Icons = { left: AlignLeft, center: AlignCenter, right: AlignRight, justify: AlignJustify };
                const Icon = Icons[align];
                return (
                  <button
                    key={align}
                    onClick={() => updateBlock(activeBlock.id, { styles: { ...activeBlock.styles, align } })}
                    style={{
                      flex: 1, display: 'flex', justifyContent: 'center', padding: '6px', borderRadius: '4px',
                      backgroundColor: isSelected ? 'var(--bg-surface)' : 'transparent',
                      color: isSelected ? 'var(--accent-blue)' : 'var(--text-secondary)',
                      boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                    }}
                  >
                    <Icon size={16} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="tip-box">
            <div className="tip-title">✨ ÊNFASE INLINE (MARKDOWN)</div>
            <div className="tip-text">
              Para destacar palavras específicas, digite <code>**negrito**</code> ou <code>*itálico*</code> no texto. O editor gera as tags semânticas <code>&lt;strong&gt;</code> e <code>&lt;em&gt;</code> automaticamente!
            </div>
          </div>

          <TypographyAndBackgroundControls block={activeBlock} updateBlock={updateBlock} />

          <DimensionControls block={activeBlock} updateBlock={updateBlock} />
        </div>
      )}

      {/* --- SETTINGS FOR VIDEO BLOCK --- */}
      {activeBlock.type === 'video' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="form-group">
            <label className="form-label">Provedor de Vídeo</label>
            <select
              className="form-input"
              value={activeBlock.provider}
              onChange={(e) => updateBlock(activeBlock.id, { provider: e.target.value as any })}
            >
              <option value="youtube">YouTube</option>
              <option value="vimeo">Vimeo</option>
              <option value="storage_supabase">Supabase Storage</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">URL do Vídeo</label>
            <input
              type="text"
              className="form-input"
              value={activeBlock.url}
              onChange={(e) => updateBlock(activeBlock.id, { url: e.target.value })}
              placeholder="Ex: https://youtube.com/watch?v=..."
            />
          </div>

          <div className="tip-box">
            <div className="tip-title">DICA DE EMBED</div>
            <div className="tip-text">
              Certifique-se de colar a URL completa do vídeo. O sistema converterá automaticamente para o formato de incorporação sem barras pretas laterais (16:9).
            </div>
          </div>

          <DimensionControls block={activeBlock} updateBlock={updateBlock} />
        </div>
      )}

      {/* --- SETTINGS FOR QUIZ BLOCK --- */}
      {activeBlock.type === 'quiz' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="form-group">
            <label className="form-label">Pergunta</label>
            <textarea
              className="form-textarea"
              value={activeBlock.question}
              onChange={(e) => updateBlock(activeBlock.id, { question: e.target.value })}
              rows={3}
              placeholder="Digite a pergunta do quiz aqui..."
            />
            <Button
              variant="ghost"
              onClick={() => {
                const currentQuestion = activeBlock.question || '';
                const divider = currentQuestion ? '\n' : '';
                updateBlock(activeBlock.id, { question: currentQuestion + divider + '> "Insira sua citação aqui"\n— Autor' });
              }}
            >
              💬 Inserir Citação Formatada
            </Button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', marginBottom: '8px' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Opções de Resposta</label>
            <Button
              variant="ghost"
              onClick={() => {
                const newOption = { id: crypto.randomUUID(), text: 'Nova Opção', isCorrect: false, feedback: 'Dica do professor.' };
                updateBlock(activeBlock.id, { options: [...activeBlock.options, newOption] });
              }}
            >
              <Plus size={14} /> Add Opção
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeBlock.options.map((opt) => (
              <div key={opt.id} style={{
                backgroundColor: 'var(--bg-canvas)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="radio"
                    name={`correct-option-${activeBlock.id}`}
                    checked={opt.isCorrect}
                    onChange={() => {
                      const updatedOptions = activeBlock.options.map((o) => ({ ...o, isCorrect: o.id === opt.id }));
                      updateBlock(activeBlock.id, { options: updatedOptions });
                    }}
                    style={{ cursor: 'pointer', accentColor: 'var(--accent-blue)' }}
                  />
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => {
                      const updatedOptions = activeBlock.options.map((o) => o.id === opt.id ? { ...o, text: e.target.value } : o);
                      updateBlock(activeBlock.id, { options: updatedOptions });
                    }}
                    style={{
                      border: 'none', background: 'transparent', fontSize: '13px', flex: 1, color: 'var(--text-primary)', outline: 'none', padding: '4px 0'
                    }}
                  />
                  {activeBlock.options.length > 2 && (
                    <button
                      onClick={() => {
                        const updatedOptions = activeBlock.options.filter((o) => o.id !== opt.id);
                        if (opt.isCorrect && updatedOptions.length > 0) updatedOptions[0].isCorrect = true;
                        updateBlock(activeBlock.id, { options: updatedOptions });
                      }}
                      className="btn-icon"
                      style={{ color: '#ef4444', width: '24px', height: '24px' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Feedback para o aluno ao marcar esta opção..."
                  value={opt.feedback || ''}
                  onChange={(e) => {
                    const updatedOptions = activeBlock.options.map((o) => o.id === opt.id ? { ...o, feedback: e.target.value } : o);
                    updateBlock(activeBlock.id, { options: updatedOptions });
                  }}
                  style={{
                    backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: '4px', padding: '6px 8px', fontSize: '11px', color: 'var(--text-secondary)', outline: 'none'
                  }}
                />
              </div>
            ))}
          </div>

          <div className="tip-box">
            <div className="tip-title">FEEDBACK ESTRUTURADO</div>
            <div className="tip-text">
              O texto preenchido no "Feedback" só aparecerá para o aluno após ele responder a questão. Use isso para explicar a lógica por trás da alternativa correta ou incorreta.
            </div>
          </div>

          <TypographyAndBackgroundControls block={activeBlock} updateBlock={updateBlock} />

          <DimensionControls block={activeBlock} updateBlock={updateBlock} />
        </div>
      )}

      {/* --- SETTINGS FOR IMAGE BLOCK --- */}
      {activeBlock.type === 'image' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="form-group">
            <label className="form-label">URL da Imagem</label>
            <input
              type="text"
              className="form-input"
              value={activeBlock.url}
              onChange={(e) => updateBlock(activeBlock.id, { url: e.target.value })}
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Texto Alternativo (Alt)</label>
            <input
              type="text"
              className="form-input"
              value={activeBlock.alt || ''}
              onChange={(e) => updateBlock(activeBlock.id, { alt: e.target.value })}
              placeholder="Descrição da imagem para acessibilidade"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Alinhamento</label>
            <div style={{ display: 'flex', backgroundColor: 'var(--bg-canvas)', borderRadius: '6px', padding: '4px', border: '1px solid var(--border-light)' }}>
              {(['left', 'center', 'right'] as const).map((align) => {
                const isSelected = activeBlock.styles?.align === align;
                const Icons = { left: AlignLeft, center: AlignCenter, right: AlignRight };
                const Icon = Icons[align];
                return (
                  <button
                    key={align}
                    onClick={() => updateBlock(activeBlock.id, { styles: { ...activeBlock.styles, align } })}
                    style={{
                      flex: 1, display: 'flex', justifyContent: 'center', padding: '6px', borderRadius: '4px',
                      backgroundColor: isSelected ? 'var(--bg-surface)' : 'transparent',
                      color: isSelected ? 'var(--accent-blue)' : 'var(--text-secondary)',
                      boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                    }}
                  >
                    <Icon size={16} />
                  </button>
                );
              })}
            </div>
          </div>

          {activeBlock.url && (
            <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
              <img src={activeBlock.url} alt={activeBlock.alt} style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
          )}

          <div className="tip-box">
            <div className="tip-title">UPLOAD DE IMAGENS</div>
            <div className="tip-text">
              Cole a URL de uma imagem existente ou hospedada. Suporte a upload direto para o Supabase Storage será habilitado em breve.
            </div>
          </div>

          <DimensionControls block={activeBlock} updateBlock={updateBlock} />
        </div>
      )}

      {/* --- SETTINGS FOR HTML BLOCK --- */}
      {activeBlock.type === 'html' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="form-group">
            <label className="form-label">Código HTML</label>
            <textarea
              className="form-textarea"
              value={activeBlock.htmlContent}
              onChange={(e) => updateBlock(activeBlock.id, { htmlContent: e.target.value })}
              rows={12}
              spellCheck={false}
              style={{ fontFamily: 'monospace', fontSize: '12px', lineHeight: 1.5 }}
              placeholder={'<div>\n  Seu HTML aqui...\n</div>'}
            />
          </div>

          <div className="tip-box">
            <div className="tip-title">⚠️ AVISO DE SEGURANÇA</div>
            <div className="tip-text">
              Este bloco executa HTML bruto na tela do aluno. Certifique-se de usar apenas código confiável. Scripts externos e iframes de origens desconhecidas podem comprometer a segurança.
            </div>
          </div>

          <DimensionControls block={activeBlock} updateBlock={updateBlock} />
        </div>
      )}

      {/* --- SETTINGS FOR QUOTE BLOCK --- */}
      {activeBlock.type === 'quote' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="form-group">
            <label className="form-label">Conteúdo da Citação</label>
            <textarea
              className="form-textarea"
              value={activeBlock.content}
              onChange={(e) => updateBlock(activeBlock.id, { content: e.target.value })}
              rows={4}
              placeholder="Digite a citação aqui..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Autor / Fonte</label>
            <input
              type="text"
              className="form-input"
              value={(activeBlock as any).author || ''}
              onChange={(e) => updateBlock(activeBlock.id, { author: e.target.value })}
              placeholder="— Nome do Autor, Livro, etc."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tamanho da Fonte</label>
            <select
              className="form-input"
              value={activeBlock.styles?.fontSize || 'medium'}
              onChange={(e) =>
                updateBlock(activeBlock.id, {
                  styles: {
                    ...activeBlock.styles,
                    fontSize: e.target.value as any,
                  },
                })
              }
            >
              <option value="small">Pequeno (13px)</option>
              <option value="medium">Médio (16px)</option>
              <option value="large">Grande (24px)</option>
              <option value="xlarge">Gigante (32px)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Alinhamento</label>
            <div style={{ display: 'flex', backgroundColor: 'var(--bg-canvas)', borderRadius: '6px', padding: '4px', border: '1px solid var(--border-light)' }}>
              {([
                { id: 'left', Icon: AlignLeft },
                { id: 'center', Icon: AlignCenter },
                { id: 'right', Icon: AlignRight },
                { id: 'justify', Icon: AlignJustify },
              ] as const).map(({ id: align, Icon }) => {
                const isSelected = activeBlock.styles?.align === align;
                return (
                  <button
                    key={align}
                    onClick={() => updateBlock(activeBlock.id, { styles: { ...activeBlock.styles, align } })}
                    style={{
                      flex: 1, display: 'flex', justifyContent: 'center', padding: '6px', borderRadius: '4px',
                      backgroundColor: isSelected ? 'var(--bg-surface)' : 'transparent',
                      color: isSelected ? 'var(--accent-blue)' : 'var(--text-secondary)',
                      boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                    }}
                  >
                    <Icon size={16} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="tip-box">
            <div className="tip-title">✨ ÊNFASE INLINE (MARKDOWN)</div>
            <div className="tip-text">
              Assim como no texto, você pode usar <code>**negrito**</code> ou <code>*itálico*</code> no conteúdo da citação para destacar palavras específicas.
            </div>
          </div>

          <TypographyAndBackgroundControls block={activeBlock} updateBlock={updateBlock} />

          <DimensionControls block={activeBlock} updateBlock={updateBlock} />
        </div>
      )}
      </div>
      )}
    </div>
  );
};
