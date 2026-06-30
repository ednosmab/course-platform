import React from 'react';
import { YStack, XStack, Text, color, sanitizeHtml, Icon } from '@projeto/ui';
import { VideoBlockRenderer } from '@projeto/ui';
import { QuizBlockRenderer } from '@projeto/ui';
import type { AnyBlock } from '@projeto/types';
import { ImageWithCache } from './ImageWithCache';

const COLORS = {
  textPrimary:   color.cwForeground,
  textSecondary: color.cwMutedForeground,
  textMuted:     color.cwMutedForeground,
  accentBlue:    color.cwPrimary,
  bgCanvas:      color.cwSurface,
  borderLight:   color.cwBorder,
};

export const FONT_DESKTOP: Record<string, string> = {
  small: '13',
  medium: '16',
  large: '24',
  xlarge: '32',
};

export const FONT_MOBILE: Record<string, string> = {
  small: '12',
  medium: '15',
  large: '19',
  xlarge: '24',
};

/**
 * Parse simple markdown to React Native Text nodes.
 * <strong> → <Text fontWeight="bold">, <em> → <Text fontStyle="italic">
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
        return <Text key={k} fontWeight="bold" fontStyle="italic">{part.slice(3, -3)}</Text>;
      }
      if (part.startsWith('___') && part.endsWith('___')) {
        return <Text key={k} fontWeight="bold" fontStyle="italic">{part.slice(3, -3)}</Text>;
      }
      if (part.startsWith('**_') && part.endsWith('_**')) {
        return <Text key={k} fontWeight="bold" fontStyle="italic">{part.slice(3, -3)}</Text>;
      }
      if (part.startsWith('_**') && part.endsWith('**_')) {
        return <Text key={k} fontWeight="bold" fontStyle="italic">{part.slice(3, -3)}</Text>;
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <Text key={k} fontWeight="bold">{part.slice(2, -2)}</Text>;
      }
      if (part.startsWith('__') && part.endsWith('__')) {
        return <Text key={k} fontWeight="bold">{part.slice(2, -2)}</Text>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <Text key={k} fontStyle="italic">{part.slice(1, -1)}</Text>;
      }
      if (part.startsWith('_') && part.endsWith('_')) {
        return <Text key={k} fontStyle="italic">{part.slice(1, -1)}</Text>;
      }
      return <Text key={k}>{part}</Text>;
    });
  };

  lines.forEach((line, lineIdx) => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('>') || trimmedLine.startsWith('&gt;')) {
      const cleanContent = trimmedLine.startsWith('&gt;') ? trimmedLine.slice(4).trim() : trimmedLine.slice(1).trim();
      renderedLines.push(
        <YStack
          key={lineIdx}
          borderLeftWidth={4}
          borderLeftColor={COLORS.accentBlue}
          pl="$3"
          py="$1"
          my="$1"
          backgroundColor={COLORS.bgCanvas}
          borderRadius="$2"
        >
          <Text fontStyle="italic" color={COLORS.textSecondary}>
            {parseInline(cleanContent, `quote-inline-${lineIdx}`)}
          </Text>
        </YStack>
      );
    } else {
      renderedLines.push(
        <Text key={lineIdx} style={{ minHeight: 20 }}>
          {parseInline(line, `inline-${lineIdx}`)}
        </Text>
      );
    }
  });

  return renderedLines;
}

export interface BlockRendererProps {
  block: AnyBlock;
  isMobile?: boolean;
  isEditing?: boolean;
  isInteracting?: boolean;
  onEditComplete?: (content: string) => void;
  savedStates?: Record<string, any>;
  onBlockStateChange?: (blockId: string, state: any) => void;
  savedPosition?: number;
  onVideoProgress?: (progressSec: number, durationSec: number) => void;
  imageResolver?: (url: string) => Promise<string>;
}

/**
 * Native block renderer — uses Tamagui/RN components instead of HTML.
 * Web version lives in BlockRenderer.tsx (same directory).
 */
export function BlockRenderer({
  block,
  isMobile = false,
  savedStates = {},
  onBlockStateChange,
  savedPosition = 0,
  onVideoProgress,
  imageResolver,
}: BlockRendererProps): React.ReactNode {
  if (block.type === 'text') {
    const styles = (block.styles || {}) as Record<string, string>;
    const fs = styles.fontSize as string || 'medium';
    const fontSize = parseInt(isMobile ? FONT_MOBILE[fs] : FONT_DESKTOP[fs], 10);

    const textStyle: Record<string, unknown> = {
      fontSize,
      fontFamily: styles.fontFamily as string || undefined,
      color: styles.color as string || COLORS.textPrimary,
      textAlign: (styles.align as 'left' | 'center' | 'right') || 'left',
      lineHeight: fontSize * 1.6,
    };

    let textElement: React.ReactNode;
    if (/<\w+[\s>\/]/i.test(block.content)) {
      const sanitized = sanitizeHtml(block.content);
      textElement = <Text style={textStyle}>{sanitized}</Text>;
    } else {
      textElement = <>{parseSimpleMarkdown(block.content)}</>;
    }
    if (styles.bold) textElement = <Text fontWeight="bold">{textElement}</Text>;
    if (styles.italic) textElement = <Text fontStyle="italic">{textElement}</Text>;

    return (
      <YStack
        p={styles.backgroundColor || styles.backgroundImage ? '$4' : 0}
        borderRadius={styles.backgroundColor || styles.backgroundImage ? '$2' : 0}
        backgroundColor={styles.backgroundColor || 'transparent'}
        overflow="hidden"
        w="100%"
        h="100%"
      >
        {textElement}
      </YStack>
    );
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
            style={{ width: '100%', height: '100%', borderRadius: 6 }}
          />
        ) : (
          <YStack w="100%" h="100%" borderWidth={2} borderColor="$info" borderRadius="$3" alignItems="center" justifyContent="center" gap="$2" backgroundColor="#eff6ff">
            <Icon name="Image" size={28} color="#60a5fa" />
            <Text fontSize={12} color="$info" fontWeight="500">Arraste uma imagem aqui</Text>
            <Text fontSize={11}>ou cole a URL no painel</Text>
          </YStack>
        )}
      </YStack>
    );
  }

  if (block.type === 'heading') {
    const level = ((block as any).level as 1 | 2 | 3) || 2;
    const styles = ((block as any).styles || {}) as Record<string, string>;
    const fontSizeMap: Record<number, string> = { 1: '32', 2: '24', 3: '20' };
    const fontSize = parseInt(fontSizeMap[level], 10);

    return (
      <Text
        fontSize={fontSize}
        fontWeight="700"
        lineHeight={fontSize * 1.3}
        textAlign={(styles.align as 'left' | 'center' | 'right') || 'left'}
        color={styles.color || COLORS.textPrimary}
        fontFamily={styles.fontFamily || undefined}
        w="100%"
        h="100%"
      >
        {block.content}
      </Text>
    );
  }

  if (block.type === 'divider') {
    const s = ((block as any).styles || {}) as Record<string, string>;
    const thickness = s.thickness ?? 1;
    const borderStyle = s.style || 'solid';
    const borderColor = s.color || COLORS.borderLight;

    return (
      <YStack w="100%" h="100%" alignItems="center" justifyContent="center">
        <YStack
          w="100%"
          borderTopWidth={thickness}
          borderTopColor={borderColor}
          borderTopStyle={borderStyle as any}
        />
      </YStack>
    );
  }

  if (block.type === 'quote') {
    const styles = ((block as any).styles || {}) as Record<string, string>;
    const fs = styles.fontSize || 'medium';
    const fontSize = parseInt(isMobile ? FONT_MOBILE[fs] : FONT_DESKTOP[fs], 10);

    return (
      <YStack
        backgroundColor={styles.backgroundColor || 'transparent'}
        borderRadius={styles.backgroundColor || styles.backgroundImage ? '$2' : 0}
        p={styles.backgroundColor || styles.backgroundImage ? '$4' : 0}
        borderLeftWidth={styles.backgroundColor || styles.backgroundImage ? 0 : 4}
        borderLeftColor={COLORS.accentBlue}
        pl="$4"
        h="100%"
      >
        {block.author && (
          <Text fontSize={11} mt="$2" opacity={0.7} fontWeight="500">— {block.author}</Text>
        )}
      </YStack>
    );
  }

  if (block.type === 'html') {
    return (
      <YStack w="100%" h="100%" alignItems="center" justifyContent="center" p="$4" backgroundColor={COLORS.bgCanvas} borderRadius="$2">
        <Icon name="Code" size={24} color={COLORS.textMuted} />
        <Text fontSize={12} color={COLORS.textMuted} mt="$2">HTML embed não suportado no app móvel</Text>
      </YStack>
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
