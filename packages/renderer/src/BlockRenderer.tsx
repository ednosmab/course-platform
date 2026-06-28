import React from 'react';
import { YStack, XStack, Text, color, sanitizeHtml } from '@projeto/ui';
import { VideoBlockRenderer } from '@projeto/ui';
import { QuizBlockRenderer } from '@projeto/ui';
import type { AnyBlock } from '@projeto/types';
import { ImageWithCache } from './ImageWithCache';

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
  /** Saved states for interactive blocks (keyed by block ID) */
  savedStates?: Record<string, any>;
  /** Callback when an interactive block changes state */
  onBlockStateChange?: (blockId: string, state: any) => void;
  /** Saved video playback position (seconds) */
  savedPosition?: number;
  /** Callback for video playback progress */
  onVideoProgress?: (progressSec: number, durationSec: number) => void;
  /** Optional URL resolver for offline image caching */
  imageResolver?: (url: string) => Promise<string>;
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
  savedStates = {},
  onBlockStateChange,
  savedPosition = 0,
  onVideoProgress,
  imageResolver,
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
    // Detect any HTML tag (single- or multi-character name) so that the
    // sanitized path is taken for `<img>`, `<script>`, `<a>`, etc. The
    // previous `/<[a-z][\s>]/i` only matched single-letter tags, causing
    // multi-letter tags to fall through to the markdown parser. The
    // markdown path is also XSS-safe (it HTML-escapes its input), but it
    // surprised teachers who used `<b>`, `<i>`, `<a>` and saw the raw
    // markup rendered as text.
    if (/<\w+[\s>\/]/i.test(block.content)) {
      textElement = <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.content) }} />;
    } else {
      textElement = <>{parseSimpleMarkdown(block.content)}</>;
    }
    if (styles.bold) textElement = <strong>{textElement}</strong>;
    if (styles.italic) textElement = <em>{textElement}</em>;

    return <div style={style}>{textElement}</div>;
  }

  if (block.type === 'video') {
    return (
      <VideoBlockRenderer
        block={block}
        onVideoProgress={onVideoProgress}
        savedPosition={savedPosition}
      />
    );
  }

  if (block.type === 'image') {
    return (
      <YStack w="100%" h="100%">
        {block.url ? (
          <ImageWithCache
            src={block.url}
            alt={block.alt || ''}
            resolveUrl={imageResolver}
            style={{ width: '100%', height: '100%', objectFit: (block.styles?.objectFit || (block.styles?.isBackground ? 'cover' : 'fill')) as any, borderRadius: block.styles?.isBackground ? '0px' : '6px', display: 'block' }}
          />
        ) : (
          <YStack w="100%" h="100%" borderWidth={2} borderColor="$info" borderRadius="$3" ai="center" jc="center" gap="$2" bg="#eff6ff">
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
    return (
      <QuizBlockRenderer
        block={block}
        defaultState={savedStates[block.id] ?? null}
        onStateChange={onBlockStateChange}
      />
    );
  }

  return null;
}
