import { AnyBlock } from '@projeto/types';

export const MOBILE_W = 380;
export const TABLET_W = 720;
export const DESKTOP_W = 860;
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
      return `<div style="display:flex;align-items:${halign};width:100%;height:100%"><img src="${b.url}" alt="${b.alt || ''}" style="max-width:100%;max-height:100%;border-radius:8px;object-fit:contain" /></div>`;
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

export function getDesignWidth(containerWidth: number): number {
  if (containerWidth <= 480) return MOBILE_W;
  if (containerWidth <= 768) return TABLET_W;
  return DESKTOP_W;
}

export function calcPageHeight(blocks: AnyBlock[], containerWidth?: number, padding = 80): number {
  if (!blocks.length) return 600;
  const maxBottom = Math.max(...blocks.map(b => {
    const l = getBlockLayout(b, containerWidth);
    return l.y + l.h;
  }));
  return maxBottom + padding;
}
