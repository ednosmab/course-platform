import React from 'react';
import { YStack, XStack, Text, color } from '@projeto/ui';
import { AnyBlock } from '@projeto/types';

/**
 * Design tokens derived from the UI package's color palette.
 * Used for inline styles where Tamagui token props ($token) are not available.
 * The source of truth is `@projeto/ui` — do NOT duplicate hex values here.
 */
const COLORS = {
  textPrimary:   color.cwForeground,
  textSecondary: color.cwMutedForeground,
  textMuted:     color.cwMutedForeground,
  accentBlue:    color.cwPrimary,
  bgCanvas:      color.cwSurface,
  borderLight:   color.cwBorder,
};

/**
 * Font size tokens for desktop viewport
 */
export const FONT_DESKTOP: Record<string, string> = {
  small: '13px',
  medium: '16px',
  large: '24px',
  xlarge: '32px',
};

/**
 * Font size tokens for mobile viewport
 */
export const FONT_MOBILE: Record<string, string> = {
  small: '12px',
  medium: '15px',
  large: '19px',
  xlarge: '24px',
};

/**
 * Parse simple markdown to React nodes
 */
function parseSimpleMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];

  const lines = text.split('\n');
  const renderedLines: React.ReactNode[] = [];

  const parseInline = (inlineText: string, keyPrefix: string): React.ReactNode[] => {
    const regex = /(\*\*\*.*?\*\*\*|___.*?___|\*\*\_.*?\_\*\*|\_\*\*.*?\*\*\_|\*\*.*?\*\*|__.*?__|\*.*?\*|_.*?_)/g;
    const parts = inlineText.split(regex);
    return parts.map((part, index) => {
      const k = `${keyPrefix}-${index}`;
      if (part.startsWith('***') && part.endsWith('***')) {
        return <strong key={k}><em>{part.slice(3, -3)}</em></strong>;
      }
      if (part.startsWith('___') && part.endsWith('___')) {
        return <strong key={k}><em>{part.slice(3, -3)}</em></strong>;
      }
      if (part.startsWith('**_') && part.endsWith('_**')) {
        return <strong key={k}><em>{part.slice(3, -3)}</em></strong>;
      }
      if (part.startsWith('_**') && part.endsWith('**_')) {
        return <strong key={k}><em>{part.slice(3, -3)}</em></strong>;
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={k}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('__') && part.endsWith('__')) {
        return <strong key={k}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={k}>{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('_') && part.endsWith('_')) {
        return <em key={k}>{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  lines.forEach((line, lineIdx) => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('>') || trimmedLine.startsWith('&gt;')) {
      const cleanContent = trimmedLine.startsWith('&gt;') ? trimmedLine.slice(4).trim() : trimmedLine.slice(1).trim();
      renderedLines.push(
        <blockquote
          key={lineIdx}
          style={{
            borderLeft: `4px solid ${COLORS.accentBlue}`,
            paddingLeft: '12px', margin: '8px 0',
            fontStyle: 'italic', color: COLORS.textSecondary,
            backgroundColor: COLORS.bgCanvas,
            padding: '6px 12px',
            borderRadius: '0 6px 6px 0',
          }}
        >
          {parseInline(cleanContent, `quote-inline-${lineIdx}`)}
        </blockquote>
      );
    } else {
      renderedLines.push(
        <div key={lineIdx} style={{ minHeight: '1.2em' }}>
          {parseInline(line, `inline-${lineIdx}`)}
        </div>
      );
    }
  });

  return renderedLines;
}

/**
 * Props for BlockRenderer component
 */
export interface BlockRendererProps {
  block: AnyBlock;
  isMobile?: boolean;
  isEditing?: boolean;
  isInteracting?: boolean;
  onEditComplete?: (content: string) => void;
}

/**
 * Shared block renderer component used by both admin preview and student app.
 * Uses literal color values instead of CSS custom-properties so it renders
 * correctly in any host application.
 */
export function BlockRenderer({
  block,
  isMobile = false,
  isEditing = false,
  isInteracting = false,
  onEditComplete,
}: BlockRendererProps): React.ReactNode {
  if (block.type === 'text') {
    const styles = (block.styles || {}) as Record<string, string>;
    const fs = styles.fontSize as string || 'medium';
    const fontSize = isMobile ? FONT_MOBILE[fs] : FONT_DESKTOP[fs];

    const style: React.CSSProperties = {
      fontSize, fontFamily: styles.fontFamily as string || 'inherit',
      color: styles.color as string || COLORS.textPrimary,
      backgroundColor: styles.backgroundColor as string || 'transparent',
      backgroundImage: styles.backgroundImage ? `url(${styles.backgroundImage})` : 'none',
      backgroundSize: 'cover', backgroundPosition: 'center',
      textAlign: (styles.align as React.CSSProperties['textAlign']) || 'left', lineHeight: 1.6,
      width: '100%', height: '100%',
      padding: styles.backgroundColor || styles.backgroundImage ? '16px' : '0',
      borderRadius: styles.backgroundColor || styles.backgroundImage ? '8px' : '0',
      overflow: isMobile ? 'visible' : 'hidden',
    };

    if (isEditing) {
      return (
        <div
          contentEditable
          suppressContentEditableWarning
          style={{
            ...style,
            cursor: 'text',
            outline: 'none',
            userSelect: 'text',
            backgroundColor: 'white',
            border: '1px solid #3B82F6',
            borderRadius: '4px',
            padding: '8px',
          }}
          onBlur={(e) => {
            const html = e.currentTarget.innerHTML.replace(/&nbsp;/g, ' ');
            onEditComplete?.(html);
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {block.content}
        </div>
      );
    }

    let textElement: React.ReactNode;
    if (/<[a-z][\s>]/i.test(block.content)) {
      textElement = <div dangerouslySetInnerHTML={{ __html: block.content }} />;
    } else {
      textElement = <>{parseSimpleMarkdown(block.content)}</>;
    }
    if (styles.bold) textElement = <strong>{textElement}</strong>;
    if (styles.italic) textElement = <em>{textElement}</em>;

    return <div style={style}>{textElement}</div>;
  }

  if (block.type === 'video') {
    return (
      <YStack w="100%" h="100%" bg="$surface" borderRadius="$3" ai="center" jc="center" position="relative" overflow="hidden">
        <XStack w={44} h={44} borderRadius={22} bg="white" ai="center" jc="center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#1e293b" style={{ marginLeft: 3 }}><path d="M5 3l14 9-14 9V3z" /></svg>
        </XStack>
        <Text position="absolute" bottom="$2" left="$3" color="white" fontSize={11} opacity={0.6}>{block.provider}</Text>
      </YStack>
    );
  }

  if (block.type === 'image') {
    return (
      <YStack w="100%" h="100%">
        {block.url ? (
          <img src={block.url} alt={block.alt || ''} style={{ width: '100%', height: '100%', objectFit: (block.styles?.objectFit || (block.styles?.isBackground ? 'cover' : 'fill')) as any, borderRadius: block.styles?.isBackground ? '0px' : '6px', display: 'block' }} />
        ) : (
          <YStack w="100%" h="100%" borderWidth={2} borderColor="$info" borderRadius="$3" borderStyle="dashed" ai="center" jc="center" gap="$2" bg="#eff6ff">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
            <Text fontSize={12} color="$info" fontWeight="500">Arraste uma imagem aqui</Text>
            <Text fontSize={11}>ou cole a URL no painel →</Text>
          </YStack>
        )}
      </YStack>
    );
  }

  if (block.type === 'heading') {
    const level = ((block as any).level as 1 | 2 | 3) || 2;
    const styles = ((block as any).styles || {}) as Record<string, string>;
    const tag = level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3';
    const fontSize = { 1: '32px', 2: '24px', 3: '20px' }[level];
    const headingStyle: React.CSSProperties = {
      fontSize, fontWeight: 700, lineHeight: 1.3, margin: 0, padding: 0,
      textAlign: (styles.align as React.CSSProperties['textAlign']) || 'left', color: styles.color || COLORS.textPrimary,
      fontFamily: styles.fontFamily || 'inherit', width: '100%', height: '100%',
    };

    if (isEditing) {
      return React.createElement(tag, {
        style: {
          ...headingStyle,
          cursor: 'text',
          outline: 'none',
          backgroundColor: 'white',
          border: '1px solid #3B82F6',
          borderRadius: '4px',
          padding: '8px',
        },
        contentEditable: true,
        suppressContentEditableWarning: true,
        onBlur: (e: React.FocusEvent<HTMLHeadingElement>) => onEditComplete?.(e.currentTarget.textContent || ''),
        onMouseDown: (e: React.MouseEvent) => e.stopPropagation(),
      }, block.content);
    }
    return React.createElement(tag, { style: headingStyle }, block.content);
  }

  if (block.type === 'divider') {
    const s = ((block as any).styles || {}) as Record<string, string>;
    const thickness = s.thickness ?? 1;
    const borderStyle = s.style || 'solid';
    const color = s.color || COLORS.borderLight;
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <hr style={{ width: '100%', border: 'none', borderTop: `${thickness}px ${borderStyle} ${color}`, margin: 0 }} />
      </div>
    );
  }

  if (block.type === 'quote') {
    const styles = ((block as any).styles || {}) as Record<string, string>;
    const fs = styles.fontSize || 'medium';
    const fontSize = isMobile ? FONT_MOBILE[fs] : FONT_DESKTOP[fs];

    const cardStyle = {
      backgroundColor: styles.backgroundColor || 'transparent',
      backgroundImage: styles.backgroundImage ? `url(${styles.backgroundImage})` : 'none',
      backgroundSize: 'cover' as const, backgroundPosition: 'center' as const,
      borderRadius: styles.backgroundColor || styles.backgroundImage ? '8px' : '0',
      padding: styles.backgroundColor || styles.backgroundImage ? '16px' : '0',
      borderLeft: styles.backgroundColor || styles.backgroundImage ? 'none' : `4px solid ${COLORS.accentBlue}`,
      paddingLeft: styles.backgroundColor || styles.backgroundImage ? '16px' : '16px',
      height: '100%', overflow: 'auto' as const,
      color: styles.color || COLORS.textSecondary,
      fontFamily: styles.fontFamily || 'inherit',
      textAlign: (styles.align || 'left') as React.CSSProperties['textAlign'],
    } satisfies React.CSSProperties;

    let textElement: React.ReactNode = <>{parseSimpleMarkdown(block.content)}</>;
    if (styles.bold) textElement = <strong>{textElement}</strong>;
    if (styles.italic) textElement = <em>{textElement}</em>;

    return (
      <div style={cardStyle}>
        {(styles.backgroundColor || styles.backgroundImage) && (
          <div style={{ opacity: 0.15, fontSize: '32px', lineHeight: 0.5, marginBottom: '4px', fontFamily: 'serif' }}>"</div>
        )}
        <div style={{ fontSize, fontStyle: 'italic', lineHeight: 1.6 }}>{textElement}</div>
        {block.author && (
          <Text fontSize={11} mt="$2" opacity={0.7} fontWeight="500">— {block.author}</Text>
        )}
      </div>
    );
  }

  if (block.type === 'html') {
    const srcDoc = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}html,body{margin:0;padding:0;width:100%;height:100%;font-family:system-ui,sans-serif;overflow:auto}</style></head><body>${block.htmlContent}</body></html>`;
    return (
      <iframe
        srcDoc={srcDoc}
        title={`html-${block.id}`}
        style={{ width: '100%', height: '100%', border: 'none', display: 'block', pointerEvents: isInteracting ? 'none' : 'auto' }}
        sandbox="allow-scripts allow-same-origin"
      />
    );
  }

  if (block.type === 'quiz') {
    const styles = ((block as any).styles || {}) as Record<string, string>;
    const fs = styles.fontSize || 'medium';
    const fontSize = isMobile ? FONT_MOBILE[fs] : FONT_DESKTOP[fs];

    const cardStyle: React.CSSProperties = {
      backgroundColor: styles.backgroundColor || COLORS.bgCanvas,
      backgroundImage: styles.backgroundImage ? `url(${styles.backgroundImage})` : 'none',
      backgroundSize: 'cover', backgroundPosition: 'center',
      borderRadius: '8px', padding: '12px',
      border: styles.backgroundColor || styles.backgroundImage ? 'none' : `1px solid ${COLORS.borderLight}`,
      height: '100%', overflow: 'auto',
      color: styles.color || COLORS.textPrimary,
      fontFamily: styles.fontFamily || 'inherit',
    };

    let questionElement: React.ReactNode = <>{parseSimpleMarkdown(block.question)}</>;
    if (styles.bold) questionElement = <strong>{questionElement}</strong>;
    if (styles.italic) questionElement = <em>{questionElement}</em>;

    return (
      <div style={cardStyle}>
        <div style={{ fontSize, fontWeight: 600, marginBottom: 12 }}>{questionElement}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(block.options || []).map((opt, i) => (
            <div
              key={opt.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px', borderRadius: 6,
                border: `1px solid ${COLORS.borderLight}`,
                backgroundColor: 'white',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMuted }}>{String.fromCharCode(65 + i)}.</span>
              <span style={{ fontSize }}>{opt.text}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
