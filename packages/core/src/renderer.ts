import { AnyBlock } from '@projeto/types';

/**
 * @description Reference width (in pixels) for the mobile breakpoint. Used by layout calculations and responsive design utilities to determine positioning and sizing at viewport widths ≤ 480px.
 */
export const MOBILE_W = 380;

/**
 * @description Reference width (in pixels) for the tablet breakpoint. Used by layout calculations and responsive design utilities for viewport widths between 481px and 768px.
 */
export const TABLET_W = 720;

/**
 * @description Reference width (in pixels) for the desktop breakpoint. Used by layout calculations and responsive design utilities for viewport widths > 768px.
 */
export const DESKTOP_W = 860;

/**
 * @description Default page content width (in pixels) for the desktop layout. Represents the width of the main content area on the canvas when rendered in a desktop-sized container.
 */
export const PAGE_W = 860;

function parseMarkdownToHtml(text: string): string {
  if (!text) return '';
  const lines = text.split('\n');
  return lines.map((line) => {
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
      return `<blockquote style="border-left:4px solid #3b82f6;padding-left:12px;margin:8px 0;font-style:italic;color:#4b5563;background:#f3f4f6;padding:6px 12px;border-radius:0 6px 6px 0">${cleanContent}</blockquote>`;
    }
    return `<div>${cleanContent}</div>`;
  }).join('');
}

function getStyles(block: AnyBlock): Record<string, unknown> {
  return (block as unknown as { styles?: Record<string, unknown> }).styles || {};
}

/**
 * @description Converts a single content block (text, heading, divider, video, image, HTML, quote, quiz) into an HTML string with inline styles. Supports rich text formatting via simple Markdown-like syntax (bold, italic, bold+italic) applied to text and quote blocks. Each block type maps to a specific HTML structure that can be safely rendered inside an iframe or preview container.
 *
 * @param block - The content block to render, typed as AnyBlock. Must have a `type` property and type-specific fields (e.g. `content` for text, `url` for video/image, `question`/`options` for quiz).
 *
 * @returns A fully styled HTML string suitable for preview rendering. Returns an empty string for unsupported block types or image blocks without a URL.
 */
export function blockToHtml(block: AnyBlock): string {
  const styles = getStyles(block);

  switch (block.type) {
    case 'text': {
      const fsMap: Record<string, string> = { small: '13px', medium: '16px', large: '24px', xlarge: '32px' };
      let inlineStyle = `font-size: ${fsMap[(block.styles?.fontSize as string) || 'medium']}; text-align: ${styles.align || 'left'}; line-height: 1.6; margin: 0; width: 100%; height: 100%; box-sizing: border-box;`;
      if (styles.fontFamily) inlineStyle += ` font-family: ${styles.fontFamily as string};`;
      if (styles.color) inlineStyle += ` color: ${styles.color as string};`;
      if (styles.backgroundColor) inlineStyle += ` background-color: ${styles.backgroundColor as string};`;
      if (styles.backgroundImage) inlineStyle += ` background-image: url(${styles.backgroundImage as string}); background-size: cover; background-position: center;`;
      if (styles.backgroundColor || styles.backgroundImage) inlineStyle += ` padding: 16px; border-radius: 8px;`;

      let content = parseMarkdownToHtml(block.content);
      if (styles.bold) content = `<strong>${content}</strong>`;
      if (styles.italic) content = `<em>${content}</em>`;

      return `<div style="${inlineStyle}">${content}</div>`;
    }

    case 'heading': {
      const h = block as AnyBlock & { level?: number; content?: string };
      const level = h.level || 2;
      const sizeMap: Record<number, string> = { 1: '28px', 2: '22px', 3: '18px' };
      let inlineStyle = `font-size: ${sizeMap[level] || '22px'}; font-weight: 700; line-height: 1.3; margin: 12px 0; width: 100%; height: 100%; box-sizing: border-box;`;
      if (styles.color) inlineStyle += ` color: ${styles.color as string};`;
      if (styles.fontFamily) inlineStyle += ` font-family: ${styles.fontFamily as string};`;
      if (styles.align) inlineStyle += ` text-align: ${styles.align as string};`;
      if (styles.backgroundColor) inlineStyle += ` background-color: ${styles.backgroundColor as string}; padding: 16px; border-radius: 8px;`;
      return `<div style="${inlineStyle}">${h.content || ''}</div>`;
    }

    case 'divider': {
      const d = block as AnyBlock & { styles?: { thickness?: number; style?: string; color?: string } };
      const thickness = d.styles?.thickness || 1;
      const style = d.styles?.style || 'solid';
      const color = d.styles?.color || '#e2e8f0';
      return `<div style="width:100%;height:1px;border-top:${thickness}px ${style} ${color};margin:16px 0"></div>`;
    }

    case 'video':
      return `<iframe src="https://www.youtube.com/embed/${(block as AnyBlock & { url?: string }).url}" width="100%" height="100%" style="border:none;border-radius:8px" allowfullscreen></iframe>`;

    case 'image': {
      const b = block as AnyBlock & { url?: string; alt?: string };
      if (!b.url) return '';
      const align = styles.align as string || 'center';
      const halign = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';
      return `<div style="display:flex;align-items:${halign};width:100%;height:100%"><img src="${b.url}" alt="${b.alt || ''}" style="width:100%;height:100%;border-radius:8px;object-fit:cover" /></div>`;
    }

    case 'html':
      return (block as AnyBlock & { htmlContent?: string }).htmlContent || '';

    case 'quote': {
      const b = block as AnyBlock & { content?: string; author?: string };
      const fsMap: Record<string, string> = { small: '13px', medium: '16px', large: '24px', xlarge: '32px' };
      let inlineStyle = `font-size: ${fsMap[(styles.fontSize as string) || 'medium']}; text-align: ${styles.align || 'left'}; line-height: 1.6; font-style: italic; margin: 0; width: 100%; height: 100%; box-sizing: border-box;`;
      if (styles.fontFamily) inlineStyle += ` font-family: ${styles.fontFamily as string};`;
      if (styles.color) inlineStyle += ` color: ${styles.color as string};`;
      if (styles.backgroundColor) inlineStyle += ` background-color: ${styles.backgroundColor as string};`;
      if (styles.backgroundImage) inlineStyle += ` background-image: url(${styles.backgroundImage as string}); background-size: cover; background-position: center;`;
      if (styles.backgroundColor || styles.backgroundImage) {
        inlineStyle += ` padding: 16px; border-radius: 8px;`;
      } else {
        inlineStyle += ` border-left: 4px solid #3b82f6; padding-left: 16px;`;
      }

      let content = b.content || '';
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

      const authorHtml = b.author ? `<div style="font-size:11px;margin-top:8px;opacity:0.7;font-weight:500">${b.author}</div>` : '';
      return `<blockquote style="${inlineStyle}"><div>${content}</div>${authorHtml}</blockquote>`;
    }

    case 'quiz': {
      const b = block as AnyBlock & { question?: string; options?: Array<{ id: string; text: string; isCorrect: boolean }> };
      const fsMap: Record<string, string> = { small: '13px', medium: '16px', large: '24px', xlarge: '32px' };
      const fs = (styles.fontSize as string) || 'medium';
      let inlineStyle = `font-family: ${styles.fontFamily || 'inherit'}; width: 100%; height: 100%; box-sizing: border-box;`;
      if (styles.color) inlineStyle += ` color: ${styles.color as string};`;
      if (styles.backgroundColor) inlineStyle += ` background-color: ${styles.backgroundColor as string};`;
      if (styles.backgroundImage) inlineStyle += ` background-image: url(${styles.backgroundImage as string}); background-size: cover; background-position: center;`;
      inlineStyle += styles.backgroundColor || styles.backgroundImage ? ` padding: 16px; border-radius: 8px;` : ` border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px;`;

      let question = parseMarkdownToHtml(b.question || '');
      if (styles.bold) question = `<strong>${question}</strong>`;
      if (styles.italic) question = `<em>${question}</em>`;

      const optionsHtml = (b.options || []).map((o, i) =>
        `<div style="display:flex;align-items:center;padding:6px 10px;border-radius:5px;border:${o.isCorrect ? '1px solid #10b981' : '1px solid #e2e8f0'};background:${o.isCorrect ? '#ecfdf5' : '#fff'};font-size:11px;margin-bottom:5px"><span style="margin-right:6px;font-weight:600;color:#64748b">${String.fromCharCode(65+i)}</span><span style="color:${o.isCorrect ? '#065f46' : '#475569'}">${o.text}</span></div>`
      ).join('');

      return `<div style="${inlineStyle}"><div style="font-size:${fsMap[fs]};margin-bottom:8px;line-height:1.4"><span style="background:#dbeafe;color:#1d4ed8;font-size:9px;font-weight:700;padding:2px 5px;border-radius:3px;margin-right:6px">QUIZ</span>${question}</div><div>${optionsHtml}</div></div>`;
    }

    default:
      return '';
  }
}

/**
 * @description Resolves the layout (`x`, `y`, `w`, `h`, `zIndex`) for a given block based on the container width. Applies responsive breakpoints: mobile (≤ 480px), tablet (≤ 768px), and desktop (> 768px). Falls back through layout tiers (mobile → tablet → desktop) if a specific breakpoint layout is not defined.
 *
 * @param block - The content block containing a `layouts` property with optional `mobile`, `tablet`, and `desktop` layout definitions.
 * @param containerWidth - Optional current viewport / container width in pixels. If omitted, defaults to the desktop layout.
 *
 * @returns A layout object with `x`, `y`, `w`, `h` coordinates and a `zIndex` stacking value. Returns sensible defaults (x: 40, y: 40, w: 700, h: 150) when no layout data exists.
 */
export function getBlockLayout(block: AnyBlock, containerWidth?: number) {
  const layouts = block.layouts || {};
  if (!containerWidth) {
    return layouts.desktop || { x: 40, y: 40, w: 700, h: 150, zIndex: 0 };
  }
  
  if (containerWidth <= 480) {
    return layouts.mobile || layouts.tablet || layouts.desktop || { x: 20, y: 20, w: 340, h: 120, zIndex: 0 };
  }
  if (containerWidth <= 768) {
    return layouts.tablet || layouts.desktop || { x: 30, y: 30, w: 660, h: 140, zIndex: 0 };
  }
  return layouts.desktop || { x: 40, y: 40, w: 700, h: 150, zIndex: 0 };
}

/**
 * @description Returns the reference design width for the given container width. Used by the canvas to determine which breakpoint's layout values to use for rendering calculations.
 *
 * @param containerWidth - The current container or viewport width in pixels.
 *
 * @returns The reference width constant: MOBILE_W (380) for widths ≤ 480px, TABLET_W (720) for widths ≤ 768px, or DESKTOP_W (860) for larger widths.
 */
export function getDesignWidth(containerWidth: number): number {
  if (containerWidth <= 480) return MOBILE_W;
  if (containerWidth <= 768) return TABLET_W;
  return DESKTOP_W;
}

/**
 * @description Calculates the total height of a page canvas based on the bottom-most block's position. Iterates through all blocks, resolves their responsive layouts, and computes the maximum vertical extent (y + h) before adding bottom padding.
 *
 * @param blocks - Array of content blocks on the page, each containing layout information.
 * @param containerWidth - Optional container width for responsive layout resolution. If omitted, uses default (desktop) layout values.
 * @param padding - Optional bottom padding in pixels added to the tallest block's bottom edge. Defaults to 80.
 *
 * @returns The calculated page height in pixels, or 600 if the blocks array is empty.
 */
export function calcPageHeight(blocks: AnyBlock[], containerWidth?: number, padding = 80): number {
  if (!blocks.length) return 600;
  const maxBottom = Math.max(...blocks.map(b => {
    const l = getBlockLayout(b, containerWidth);
    return l.y + l.h;
  }));
  return maxBottom + padding;
}
