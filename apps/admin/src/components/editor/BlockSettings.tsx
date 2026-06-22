'use client';

import React, { useState, useEffect, useRef } from 'react';
import { YStack, XStack, Text, Button, Icon, Spinner } from '@projeto/ui';
import { useEditor } from '../../context/EditorContext';
import type { AnyBlock } from '@projeto/types';
import { StorageService } from '@projeto/core';
import ImageCropOverlay from './ImageCropOverlay';

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
      const styles = (block as unknown as { styles?: Record<string, unknown> }).styles || {};
      
      let inlineStyle = `font-size: ${fsMap[fs]}; text-align: ${styles.align || 'left'}; line-height: 1.6;`;
      if (styles.fontFamily) inlineStyle += ` font-family: ${styles.fontFamily as string};`;
      if (styles.color) inlineStyle += ` color: ${styles.color as string};`;
      if (styles.backgroundColor) inlineStyle += ` background-color: ${styles.backgroundColor as string};`;
      if (styles.backgroundImage) inlineStyle += ` background-image: url(${styles.backgroundImage as string}); background-size: cover; background-position: center;`;
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
      const styles = block.styles || {};

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
      const styles = (block as unknown as { styles?: Record<string, unknown> }).styles || {};

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

const DimensionControls: React.FC<{ block: any; updateBlock: any }> = ({ block, updateBlock }) => (
  <YStack borderTopWidth={1} borderTopColor="$border" mt="$4" pt="$4">
    <Text fontSize={11} fontWeight="500" mb="$2">Dimensões</Text>
    <XStack gap="$2">
      <YStack flex={1}>
        <Text fontSize={10} color="$textMuted">Largura</Text>
        <input
          type="text"
          placeholder="ex: 100%, 400px"
          value={block.styles?.width || ''}
          onChange={(e) => updateBlock(block.id, { styles: { ...block.styles, width: e.target.value } })}
          style={{ height: 34, borderRadius: '6px', border: '1px solid var(--border-light)', padding: '0 10px', fontSize: 12, outline: 'none', width: '100%' }}
        />
      </YStack>
      <YStack flex={1}>
        <Text fontSize={10} color="$textMuted">Altura</Text>
        <input
          type="text"
          placeholder="ex: auto, 200px"
          value={block.styles?.height || ''}
          onChange={(e) => updateBlock(block.id, { styles: { ...block.styles, height: e.target.value } })}
          style={{ height: 34, borderRadius: '6px', border: '1px solid var(--border-light)', padding: '0 10px', fontSize: 12, outline: 'none', width: '100%' }}
        />
      </YStack>
    </XStack>
  </YStack>
);

const TypographyAndBackgroundControls: React.FC<{ block: any; updateBlock: any }> = ({ block, updateBlock }) => {
  const styles = block.styles || {};
  
  const setStyle = (key: string, value: any) => {
    updateBlock(block.id, { styles: { ...styles, [key]: value } });
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
    <YStack borderTopWidth={1} borderTopColor="$border" mt="$4" pt="$4" gap="$3">
      <Text fontSize={11} fontWeight="600" textTransform="uppercase" color="$textSecondary">Tipografia e Visual</Text>
      
      <YStack>
        <Text fontSize={10} color="$textMuted">Família da Fonte</Text>
        <XStack gap="$2" ai="flex-end">
          <select
            value={styles.fontFamily || ''}
            onChange={(e) => setStyle('fontFamily', e.target.value)}
            style={{ flex: 1, height: 34, borderRadius: '6px', border: '1px solid var(--border-light)', padding: '0 8px', fontSize: 12, outline: 'none', background: 'white' }}
          >
            {fontOptions.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>

          <XStack gap={1} height={34}>
            <Button
              variant="ghost"
              aria-label="Negrito"
              onPress={() => setStyle('bold', !styles.bold)}
              w={34} h={34} p={0}
              borderWidth={styles.bold ? 1 : 0}
              borderColor={styles.bold ? '$border' : 'transparent'}
            >
              <Text fontWeight="bold" fontSize={14}>B</Text>
            </Button>
            <Button
              variant="ghost"
              aria-label="Itálico"
              onPress={() => setStyle('italic', !styles.italic)}
              w={34} h={34} p={0}
              borderWidth={styles.italic ? 1 : 0}
              borderColor={styles.italic ? '$border' : 'transparent'}
            >
              <Text fontStyle="italic" fontSize={14}>I</Text>
            </Button>
          </XStack>
        </XStack>
      </YStack>

      <YStack>
        <XStack ai="center" jc="space-between">
          <Text fontSize={10} color="$textMuted">Cor do Texto</Text>
          <Text fontSize={9} color="$textMuted">{styles.color || 'Padrão'}</Text>
        </XStack>
        <XStack gap="$2" ai="center">
          <input
            type="color"
            value={styles.color || '#1e293b'}
            onChange={(e) => setStyle('color', e.target.value)}
            style={{ width: 32, height: 32, padding: 0, border: '1px solid var(--border-light)', borderRadius: '4px', cursor: 'pointer' }}
          />
          <XStack flexWrap="wrap" gap={1} flex={1}>
            {presetColors.map(c => (
              <XStack
                key={c}
                onPress={() => setStyle('color', c)}
                w={16} h={16}
                borderRadius={8}
                bg={c}
                style={{ border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer' }}
              />
            ))}
          </XStack>
        </XStack>
      </YStack>

      <YStack>
        <XStack ai="center" jc="space-between">
          <Text fontSize={10} color="$textMuted">Cor de Fundo</Text>
          <Text fontSize={9} color="$textMuted">{styles.backgroundColor || 'Transparente'}</Text>
        </XStack>
        <XStack gap="$2" ai="center">
          <input
            type="color"
            value={styles.backgroundColor || '#ffffff'}
            onChange={(e) => setStyle('backgroundColor', e.target.value)}
            style={{ width: 32, height: 32, padding: 0, border: '1px solid var(--border-light)', borderRadius: '4px', cursor: 'pointer' }}
          />
          <XStack flexWrap="wrap" gap={1} flex={1} ai="center">
            {presetColors.map(c => (
              <XStack
                key={c}
                onPress={() => setStyle('backgroundColor', c)}
                w={16} h={16}
                borderRadius={8}
                bg={c}
                style={{ border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer' }}
              />
            ))}
            <Button variant="ghost" onPress={() => setStyle('backgroundColor', '')} px="$1" py={0}>
              Limpar
            </Button>
          </XStack>
        </XStack>
      </YStack>

      <YStack>
        <Text fontSize={10} color="$textMuted">URL da Imagem de Fundo</Text>
        <input
          type="text"
          value={styles.backgroundImage || ''}
          onChange={(e) => setStyle('backgroundImage', e.target.value)}
          placeholder="https://exemplo.com/background.jpg"
          style={{ height: 34, borderRadius: '6px', border: '1px solid var(--border-light)', padding: '0 10px', fontSize: 12, outline: 'none', width: '100%' }}
        />
      </YStack>
    </YStack>
  );
};

const ImageUploadBlock: React.FC<{ blockId: string; courseId?: string; onUpload: (url: string) => void }> = ({ blockId, courseId, onUpload }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !courseId) return;
    if (file.size > 5 * 1024 * 1024) { alert('Arquivo muito grande. Máximo: 5MB.'); return; }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { alert('Formato não suportado. Use JPEG, PNG ou WebP.'); return; }
    setUploading(true);
    try {
      const url = await StorageService.uploadCertificateImage(file, courseId, blockId);
      if (url) onUpload(url);
      else alert('Erro ao enviar imagem.');
    } catch { alert('Erro ao enviar imagem.'); }
    finally { setUploading(false); if (inputRef.current) inputRef.current.value = ''; }
  };

  return (
    <YStack p="$3" borderRadius="$3" bg="$secondary" gap={8}>
      <Text fontSize={11} fontWeight="600">UPLOAD DE IMAGENS</Text>
      <Text fontSize={11} color="$textMuted">Envie uma imagem do seu computador. Formatos aceitos: JPEG, PNG, WebP (máx. 5MB).</Text>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleFile} />
      <Button variant="ghost" borderWidth={1} borderColor="$border" onPress={() => inputRef.current?.click()} disabled={uploading}>
        <Icon name="Upload" size={14} /><Text ml={4} fontSize={12}>{uploading ? 'Enviando...' : 'Selecionar imagem'}</Text>
      </Button>
    </YStack>
  );
};

function toGray(data: Uint8ClampedArray, w: number, h: number): Uint8Array {
  const gray = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    gray[i] = (data[i * 4] * 77 + data[i * 4 + 1] * 150 + data[i * 4 + 2] * 29) >> 8;
  }
  return gray;
}

function sobelEdgeMap(gray: Uint8Array, w: number, h: number, threshold: number): Uint8Array {
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  const mag = new Float32Array(w * h);
  let maxMag = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let gx = 0, gy = 0;
      for (let ky = 0; ky < 3; ky++)
        for (let kx = 0; kx < 3; kx++) {
          const p = gray[(y + ky - 1) * w + (x + kx - 1)];
          gx += p * sobelX[ky * 3 + kx];
          gy += p * sobelY[ky * 3 + kx];
        }
      const m = Math.sqrt(gx * gx + gy * gy);
      mag[y * w + x] = m;
      if (m > maxMag) maxMag = m;
    }
  }
  const edgeMap = new Uint8Array(w * h);
  const t = maxMag * threshold;
  for (let i = 0; i < w * h; i++) if (mag[i] > t) edgeMap[i] = 1;
  return edgeMap;
}

function sampleBorderColors(data: Uint8ClampedArray, w: number, h: number): number[] {
  const step = Math.max(1, (w + h) >> 7);
  let r = 0, g = 0, b = 0, n = 0;
  for (let x = 0; x < w; x += step) {
    const t = x * 4, bt = ((h - 1) * w + x) * 4;
    r += data[t]; g += data[t + 1]; b += data[t + 2]; n++;
    r += data[bt]; g += data[bt + 1]; b += data[bt + 2]; n++;
  }
  for (let y = 0; y < h; y += step) {
    const l = y * w * 4, r2 = (y * w + w - 1) * 4;
    if (l !== 0 && l !== (h - 1) * w * 4) { r += data[l]; g += data[l + 1]; b += data[l + 2]; n++; }
    if (r2 !== (w - 1) * 4 && r2 !== ((h - 1) * w + w - 1) * 4) { r += data[r2]; g += data[r2 + 1]; b += data[r2 + 2]; n++; }
  }
  return [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
}

function boundaryFill(data: Uint8ClampedArray, w: number, h: number, edgeMap: Uint8Array, bg: number[], tolerance: number): Uint8Array {
  const mask = new Uint8Array(w * h);
  const visited = new Uint8Array(w * h);
  const stack: number[] = [];
  const push = (x: number, y: number) => { if (x >= 0 && x < w && y >= 0 && y < h) stack.push(y * w + x); };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
  const [br, bgc, bb] = bg;
  while (stack.length) {
    const idx = stack.pop()!;
    if (visited[idx] || edgeMap[idx]) continue;
    visited[idx] = 1;
    const pos = idx * 4;
    if (Math.abs(data[pos] - br) > tolerance || Math.abs(data[pos + 1] - bgc) > tolerance || Math.abs(data[pos + 2] - bb) > tolerance) continue;
    mask[idx] = 1;
    const x = idx % w, y = (idx / w) | 0;
    push(x - 1, y); push(x + 1, y); push(x, y - 1); push(x, y + 1);
  }
  return mask;
}

function distanceTransform(mask: Uint8Array, w: number, h: number): Float32Array {
  const INF = 1e9;
  const dist = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) dist[i] = mask[i] ? 0 : INF;
  for (let y = 0; y < h; y++) {
    for (let x = 1; x < w; x++) dist[y * w + x] = Math.min(dist[y * w + x], dist[y * w + x - 1] + 1);
    for (let x = w - 2; x >= 0; x--) dist[y * w + x] = Math.min(dist[y * w + x], dist[y * w + x + 1] + 1);
  }
  for (let x = 0; x < w; x++) {
    for (let y = 1; y < h; y++) dist[y * w + x] = Math.min(dist[y * w + x], dist[(y - 1) * w + x] + 1);
    for (let y = h - 2; y >= 0; y--) dist[y * w + x] = Math.min(dist[y * w + x], dist[(y + 1) * w + x] + 1);
  }
  return dist;
}

function removeBackgroundFromImage(img: HTMLImageElement, tolerance: number, edgeThreshold: number, featherRadius: number): string {
  const c = document.createElement('canvas');
  c.width = img.naturalWidth || img.width;
  c.height = img.naturalHeight || img.height;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  const src = ctx.getImageData(0, 0, c.width, c.height);
  const gray = toGray(src.data, c.width, c.height);
  const edgeMap = sobelEdgeMap(gray, c.width, c.height, edgeThreshold);
  const bg = sampleBorderColors(src.data, c.width, c.height);
  const mask = boundaryFill(src.data, c.width, c.height, edgeMap, bg, tolerance);
  const out = new Uint8ClampedArray(src.data);
  if (featherRadius > 0) {
    const dist = distanceTransform(mask, c.width, c.height);
    for (let i = 0; i < c.width * c.height; i++) {
      if (mask[i]) { out[i * 4 + 3] = 0; continue; }
      const d = dist[i];
      out[i * 4 + 3] = d < featherRadius ? Math.round((d / featherRadius) * 255) : 255;
    }
  } else {
    for (let i = 0; i < c.width * c.height; i++) if (mask[i]) out[i * 4 + 3] = 0;
  }
  const imgData = ctx.createImageData(c.width, c.height);
  imgData.data.set(out);
  ctx.putImageData(imgData, 0, 0);
  return c.toDataURL('image/png');
}

/**
 * Helper que filtra strings de whitespace-only e valores nulos/bool
 * dos children antes de renderizar. Necessário porque o dev-mode do
 * Tamagui emite `console.error("Unexpected text node: .")` quando
 * encontra strings de whitespace entre children de componentes
 * (e.g. `"\n  "` entre dois `<Text>` num mesmo `<YStack>`).
 *
 * Mantém o código JSX formatado e legível (sem encolher tudo para
 * uma linha) sem disparar o warning em desenvolvimento.
 */
const ViewChildren: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cleaned = React.Children.toArray(children).filter((c) => {
    if (c == null || typeof c === 'boolean') return false;
    if (typeof c === 'string' && /^\s*$/.test(c)) return false;
    return true;
  });
  return <>{cleaned}</>;
};

/**
 * Painel de propriedades do bloco activo.
 *
 * Aceita três slots opcionais para conteúdo exclusivo do editor de
 * certificado (boundary rule SDR-001):
 * - `propsHeader` — renderizado no topo da tab "Propriedades"
 * - `imageSettingsSlot` — renderizado dentro do ramo de blocos de
 *   imagem, logo após o select de objectFit. O editor de certificado
 *   passa `<CertificateImageSettings />` (isBackground + objectFit
 *   default 'cover'); o editor de aula ignora-o.
 * - `propsFooter` — renderizado no rodapé da tab "Propriedades"
 *
 * O editor de aula passa sem slots; o `CertificateEditor` passa os
 * componentes extraídos em `apps/admin/src/components/certificate-editor/`.
 */
export const BlockSettings: React.FC<{
  propsHeader?: React.ReactNode;
  propsFooter?: React.ReactNode;
  imageSettingsSlot?: React.ReactNode;
}> = ({ propsHeader, propsFooter, imageSettingsSlot }) => {
  const { blocks, activeBlockId, updateBlock, removeBlock, courseId, mode } = useEditor();
  const isCertMode = mode === 'certificate';
  const [activeTab, setActiveTab] = useState<'props' | 'html'>('props');
  const [collapsed, setCollapsed] = useState(false);
  const [bgProcessing, setBgProcessing] = useState(false);
  const [bgError, setBgError] = useState<string | null>(null);
  const [showBgEditor, setShowBgEditor] = useState(false);
  const [bgTolerance, setBgTolerance] = useState(30);
  const [bgEdgeThreshold, setBgEdgeThreshold] = useState(0.3);
  const [bgFeatherRadius, setBgFeatherRadius] = useState(2);
  const [bgPreviewUrl, setBgPreviewUrl] = useState<string | null>(null);
  const [showCropOverlay, setShowCropOverlay] = useState(false);

  const activeBlock = blocks.find((b) => b.id === activeBlockId);
  const [htmlDraft, setHtmlDraft] = useState('');

  useEffect(() => {
    if (activeBlock) setHtmlDraft(getHtmlFromBlock(activeBlock));
  }, [activeBlock]);

  useEffect(() => {
    if (activeBlock) setCollapsed(false);
  }, [activeBlockId]);

  if (collapsed) {
    return (
      <XStack w={36} minWidth={36} h="100%" bg="$background" borderLeftWidth={1} borderLeftColor="$border" ai="center" jc="center" overflow="hidden">
        <XStack
          w={28} h={28} ai="center" jc="center"
          borderWidth={1} borderColor="$border" borderRadius="$3" bg="$background"
          cursor="pointer" role="button" tabIndex={0}
          aria-label="Expandir painel de propriedades"
          onPress={() => setCollapsed(false)}
          onKeyDown={(e: any) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCollapsed(false); } }}
          hoverStyle={{ borderColor: '$primary' }}
        >
          <Icon name="ChevronLeft" size={16} />
        </XStack>
      </XStack>
    );
  }

  if (!activeBlock) {
    return null;
  }

  const handleHtmlEdit = (value: string) => {
    setHtmlDraft(value);
    if (activeBlock.type === 'html') {
      updateBlock(activeBlock.id, { htmlContent: value });
    } else if (activeBlock.type === 'text') {
      const div = document.createElement('div');
      div.innerHTML = value;
      updateBlock(activeBlock.id, { content: div.textContent || div.innerText || value });
    }
  };

  return (
    <ViewChildren>
    <YStack w={320} minWidth={320} h="100%" overflowY="auto" borderLeftWidth={1} borderLeftColor="$border" bg="$background">
      <YStack px="$5" pt="$4" borderBottomWidth={1} borderBottomColor="$border" flexShrink={0}>
        <XStack ai="center" jc="space-between" mb="$3">
          <Text fontSize={11} fontWeight="700" textTransform="uppercase" color="$textSecondary" letterSpacing={0.5}>Editar Bloco</Text>
          <XStack gap="$1">
            <Button variant="ghost" aria-label="Excluir bloco" onPress={() => removeBlock(activeBlock.id)} px="$1">
              <Icon name="Trash2" size={14} color="$danger" />
            </Button>
            <XStack
              w={26} h={26} ai="center" jc="center"
              borderWidth={1} borderColor="$border" borderRadius="$3" bg="$background"
              cursor="pointer" role="button" tabIndex={0}
              aria-label="Recolher painel"
              onPress={() => setCollapsed(true)}
              onKeyDown={(e: any) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCollapsed(true); } }}
              hoverStyle={{ borderColor: '$primary' }}
            >
              <Icon name="ChevronRight" size={14} />
            </XStack>
          </XStack>
        </XStack>
        <XStack bg="$background" borderRadius={7} p={3} gap={1}>
          {(['props', 'html'] as const).map((tab) => (
            <Button
              key={tab}
              variant="ghost"
              onPress={() => setActiveTab(tab)}
              flex={1}
              py="$1"
              borderRadius={5}
              ai="center" jc="center"
              borderWidth={activeTab === tab ? 1 : 0}
              borderColor={activeTab === tab ? '$border' : 'transparent'}
            >
              {tab === 'props' ? (
                <Text fontSize={11} fontWeight="600">Propriedades</Text>
              ) : (
                <XStack ai="center" gap={1}>
                  <Icon name="Code" size={11} />
                  <Text fontSize={11} fontWeight="600">HTML Fonte</Text>
                </XStack>
              )}
            </Button>
          ))}
        </XStack>
      </YStack>

      {activeTab === 'html' && (
        <YStack p="$4" gap="$2" flex={1} overflow="hidden">
          <Text fontSize={11} fontWeight="500">Código — HTML / CSS / JavaScript</Text>
          <textarea
            value={htmlDraft}
            onChange={(e) => handleHtmlEdit(e.target.value)}
            rows={20}
            spellCheck={false}
            style={{ fontFamily: 'monospace', fontSize: 11, lineHeight: 1.6, flex: 1, resize: 'vertical', borderRadius: '6px', border: '1px solid var(--border-light)', padding: '8px', outline: 'none', color: 'var(--text-primary)', backgroundColor: 'white' }}
            placeholder={activeBlock.type === 'html'
              ? '<div style="color:red">HTML direto</div>\n<style>p{color:blue}</style>\n<script>console.log("JS")</script>'
              : 'Visualização do HTML gerado pelo bloco'}
          />
          {activeBlock.type === 'html' && (
            <YStack p="$3" borderRadius="$3" bg="$secondary" mt={0}>
              <Text fontSize={11} fontWeight="600">✅ SUPORTE COMPLETO</Text>
              <Text fontSize={11} color="$textMuted">Aceita HTML, CSS e JavaScript — executados em iframe isolado.</Text>
            </YStack>
          )}
          {activeBlock.type !== 'html' && activeBlock.type !== 'text' && (
            <YStack p="$3" borderRadius="$3" bg="$secondary" mt={0}>
              <Text fontSize={11} fontWeight="600">SOMENTE LEITURA</Text>
              <Text fontSize={11} color="$textMuted">Edite pelo painel "Propriedades". Para código livre, use o bloco HTML.</Text>
            </YStack>
          )}
        </YStack>
      )}

      {activeTab === 'props' && (
      <YStack p="$4" overflowY="auto" flex={1}>

      {propsHeader}

      {activeBlock.type === 'text' && (
        <ViewChildren>
        <YStack gap="$2">
          <YStack>
            <Text fontSize={11} fontWeight="500">Conteúdo do Texto</Text>
            <textarea
              value={activeBlock.content}
              onChange={(e) => updateBlock(activeBlock.id, { content: e.target.value })}
              rows={4}
              style={{ width: '100%', borderRadius: '6px', border: '1px solid var(--border-light)', padding: '8px', fontSize: 13, outline: 'none', resize: 'vertical', color: 'var(--text-primary)', backgroundColor: 'white' }}
            />
            <Button
              variant="ghost"
              onPress={() => {
                const currentContent = activeBlock.content || '';
                const divider = currentContent ? '\n' : '';
                updateBlock(activeBlock.id, { content: currentContent + divider + '> "Insira sua citação aqui"\n— Autor' });
              }}
            >
              💬 Inserir Citação Formatada
            </Button>
          </YStack>

          <YStack>
            <Text fontSize={11} fontWeight="500">Tamanho da Fonte</Text>
            <select
              value={activeBlock.styles?.fontSize || 'medium'}
               onChange={(e) => updateBlock(activeBlock.id, { styles: { ...activeBlock.styles, fontSize: e.target.value as 'small' | 'medium' | 'large' | 'xlarge' } })}
              style={{ height: 34, borderRadius: '6px', border: '1px solid var(--border-light)', padding: '0 8px', fontSize: 12, outline: 'none', background: 'white', width: '100%' }}
            >
              <option value="small">Pequena</option>
              <option value="medium">Média</option>
              <option value="large">Grande</option>
              <option value="xlarge">Muito Grande</option>
            </select>
          </YStack>

          <YStack>
            <Text fontSize={11} fontWeight="500">Alinhamento</Text>
            <XStack bg="$background" borderRadius="$3" p={1} borderWidth={1} borderColor="$border">
              {(['left', 'center', 'right', 'justify'] as const).map((align) => {
                const isSelected = activeBlock.styles?.align === align;
                const iconName: Record<string, string> = { left: 'AlignLeft', center: 'AlignCenter', right: 'AlignRight', justify: 'AlignJustify' };
                return (
                  <Button
                    key={align}
                    variant="ghost"
                    aria-label={`Alinhar ${align === 'left' ? 'à esquerda' : align === 'right' ? 'à direita' : align === 'center' ? 'ao centro' : 'justificado'}`}
                    borderWidth={isSelected ? 1 : 0}
                    borderColor={isSelected ? '$border' : 'transparent'}
                    onPress={() => updateBlock(activeBlock.id, { styles: { ...activeBlock.styles, align } })}
                    flex={1}
                    py="$1"
                  >
                    <Icon name={iconName[align]} size={16} />
                  </Button>
                );
              })}
            </XStack>
          </YStack>

          <YStack p="$3" borderRadius="$3" bg="$secondary">
            <Text fontSize={11} fontWeight="600">✨ ÊNFASE INLINE (MARKDOWN)</Text>
            <Text fontSize={11} color="$textMuted">
              Para destacar palavras específicas, digite <Text fontSize={11} style={{ fontFamily: 'monospace' }}>**negrito**</Text> ou <Text fontSize={11} style={{ fontFamily: 'monospace' }}>*itálico*</Text> no texto.
            </Text>
          </YStack>

          <TypographyAndBackgroundControls block={activeBlock} updateBlock={updateBlock} />
          <DimensionControls block={activeBlock} updateBlock={updateBlock} />
        </YStack>
        </ViewChildren>
      )}

      {activeBlock.type === 'video' && (
        <ViewChildren>
        <YStack gap="$2">
          <YStack>
            <Text fontSize={11} fontWeight="500">Provedor de Vídeo</Text>
            <select
              value={activeBlock.provider}
              onChange={(e) => updateBlock(activeBlock.id, { provider: e.target.value as 'youtube' | 'vimeo' | 'storage_supabase' })}
              style={{ height: 34, borderRadius: '6px', border: '1px solid var(--border-light)', padding: '0 8px', fontSize: 12, outline: 'none', background: 'white', width: '100%' }}
            >
              <option value="youtube">YouTube</option>
              <option value="vimeo">Vimeo</option>
              <option value="storage_supabase">Supabase Storage</option>
            </select>
          </YStack>

          <YStack>
            <Text fontSize={11} fontWeight="500">URL do Vídeo</Text>
            <input
              type="text"
              value={activeBlock.url}
              onChange={(e) => updateBlock(activeBlock.id, { url: e.target.value })}
              placeholder="Ex: https://youtube.com/watch?v=..."
              style={{ height: 34, borderRadius: '6px', border: '1px solid var(--border-light)', padding: '0 10px', fontSize: 12, outline: 'none', width: '100%' }}
            />
          </YStack>

          <YStack p="$3" borderRadius="$3" bg="$secondary">
            <Text fontSize={11} fontWeight="600">DICA DE EMBED</Text>
            <Text fontSize={11} color="$textMuted">
              Certifique-se de colar a URL completa do vídeo. O sistema converterá automaticamente para o formato de incorporação sem barras pretas laterais (16:9).
            </Text>
          </YStack>

          <DimensionControls block={activeBlock} updateBlock={updateBlock} />
        </YStack>
        </ViewChildren>
      )}

      {activeBlock.type === 'quiz' && (
        <ViewChildren>
        <YStack gap="$2">
          <YStack>
            <Text fontSize={11} fontWeight="500">Pergunta</Text>
            <textarea
              value={activeBlock.question}
              onChange={(e) => updateBlock(activeBlock.id, { question: e.target.value })}
              rows={3}
              placeholder="Digite a pergunta do quiz aqui..."
              style={{ width: '100%', borderRadius: '6px', border: '1px solid var(--border-light)', padding: '8px', fontSize: 13, outline: 'none', resize: 'vertical', color: 'var(--text-primary)', backgroundColor: 'white' }}
            />
            <Button
              variant="ghost"
              onPress={() => {
                const currentQuestion = activeBlock.question || '';
                const divider = currentQuestion ? '\n' : '';
                updateBlock(activeBlock.id, { question: currentQuestion + divider + '> "Insira sua citação aqui"\n— Autor' });
              }}
            >
              💬 Inserir Citação Formatada
            </Button>
          </YStack>

          <XStack ai="center" jc="space-between" mt="$4" mb="$2">
            <Text fontSize={11} fontWeight="500" mb={0}>Opções de Resposta</Text>
            <Button
              variant="ghost"
              onPress={() => {
                const newOption = { id: crypto.randomUUID(), text: 'Nova Opção', isCorrect: false, feedback: 'Dica do professor.' };
                updateBlock(activeBlock.id, { options: [...activeBlock.options, newOption] });
              }}
            >
              <Icon name="Plus" size={14} /> Add Opção
            </Button>
          </XStack>

          <YStack gap="$3">
            {activeBlock.options.map((opt) => (
              <YStack key={opt.id} p="$3" borderRadius="$3" bg="$background" borderWidth={1} borderColor="$border" gap="$2">
                <XStack ai="center" gap="$2">
                  <input
                    type="radio"
                    name={`correct-option-${activeBlock.id}`}
                    checked={opt.isCorrect}
                    onChange={() => {
                      const updatedOptions = activeBlock.options.map((o) => ({ ...o, isCorrect: o.id === opt.id }));
                      updateBlock(activeBlock.id, { options: updatedOptions });
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => {
                      const updatedOptions = activeBlock.options.map((o) => o.id === opt.id ? { ...o, text: e.target.value } : o);
                      updateBlock(activeBlock.id, { options: updatedOptions });
                    }}
                    style={{ border: 'none', background: 'transparent', fontSize: 13, flex: 1, color: 'var(--text-primary)', outline: 'none', padding: '4px 0' }}
                  />
                  {activeBlock.options.length > 2 && (
                    <Button variant="ghost" aria-label="Excluir opção" onPress={() => {
                      const updatedOptions = activeBlock.options.filter((o) => o.id !== opt.id);
                      if (opt.isCorrect && updatedOptions.length > 0) updatedOptions[0].isCorrect = true;
                      updateBlock(activeBlock.id, { options: updatedOptions });
                    }} w={24} h={24} p={0}>
                      <Icon name="Trash2" size={12} color="$danger" />
                    </Button>
                  )}
                </XStack>
                <input
                  type="text"
                  placeholder="Feedback para o aluno ao marcar esta opção..."
                  value={opt.feedback || ''}
                  onChange={(e) => {
                    const updatedOptions = activeBlock.options.map((o) => o.id === opt.id ? { ...o, feedback: e.target.value } : o);
                    updateBlock(activeBlock.id, { options: updatedOptions });
                  }}
                  style={{ borderRadius: '4px', border: '1px solid var(--border-light)', padding: '6px 8px', fontSize: 11, color: 'var(--text-secondary)', outline: 'none', width: '100%' }}
                />
              </YStack>
            ))}
          </YStack>

          <YStack p="$3" borderRadius="$3" bg="$secondary">
            <Text fontSize={11} fontWeight="600">FEEDBACK ESTRUTURADO</Text>
            <Text fontSize={11} color="$textMuted">
              O texto preenchido no "Feedback" só aparecerá para o aluno após ele responder a questão.
            </Text>
          </YStack>

          <TypographyAndBackgroundControls block={activeBlock} updateBlock={updateBlock} />
          <DimensionControls block={activeBlock} updateBlock={updateBlock} />
        </YStack>
        </ViewChildren>
      )}

      {activeBlock.type === 'image' && (
        <ViewChildren>
        <YStack gap="$2">
          <YStack>
            <Text fontSize={11} fontWeight="500">URL da Imagem</Text>
            <input
              type="text"
              value={activeBlock.url}
              onChange={(e) => updateBlock(activeBlock.id, { url: e.target.value })}
              placeholder="https://exemplo.com/imagem.jpg"
              style={{ height: 34, borderRadius: '6px', border: '1px solid var(--border-light)', padding: '0 10px', fontSize: 12, outline: 'none', width: '100%' }}
            />
          </YStack>

          <YStack>
            <Text fontSize={11} fontWeight="500">Texto Alternativo (Alt)</Text>
            <input
              type="text"
              value={activeBlock.alt || ''}
              onChange={(e) => updateBlock(activeBlock.id, { alt: e.target.value })}
              placeholder="Descrição da imagem para acessibilidade"
              style={{ height: 34, borderRadius: '6px', border: '1px solid var(--border-light)', padding: '0 10px', fontSize: 12, outline: 'none', width: '100%' }}
            />
          </YStack>

          {/* Opções de Ajuste de Imagem + slot para extras específicos
              do editor de certificado (`CertificateImageSettings`).
              Ver boundary rule SDR-001. */}
          {activeBlock.type === 'image' && (
            <YStack mt="$2" gap="$2">
              <Text fontSize={11} fontWeight="500">Ajuste de Imagem (Fit)</Text>
              <select
                value={activeBlock.styles?.objectFit || 'contain'}
                onChange={(e) => updateBlock(activeBlock.id, { styles: { ...activeBlock.styles, objectFit: e.target.value as 'cover' | 'contain' | 'fill' } })}
                style={{ height: 34, borderRadius: '6px', border: '1px solid var(--border-light)', padding: '0 8px', fontSize: 12, outline: 'none', background: 'white', width: '100%' }}
              >
                <option value="cover">Cortar para Caber (Cover)</option>
                <option value="contain">Conter Proporção (Contain)</option>
                <option value="fill">Preencher/Esticar (Fill)</option>
              </select>
              {imageSettingsSlot}
            </YStack>
          )}


          <YStack>
            <Text fontSize={11} fontWeight="500">Alinhamento</Text>
            <XStack bg="$background" borderRadius="$3" p={1} borderWidth={1} borderColor="$border">
              {(['left', 'center', 'right'] as const).map((align) => {
                const isSelected = activeBlock.styles?.align === align;
                const iconName: Record<string, string> = { left: 'AlignLeft', center: 'AlignCenter', right: 'AlignRight' };
                return (
                  <Button
                    key={align}
                    variant="ghost"
                    aria-label={`Alinhar ${align === 'left' ? 'à esquerda' : align === 'right' ? 'à direita' : 'ao centro'}`}
                    borderWidth={isSelected ? 1 : 0}
                    borderColor={isSelected ? '$border' : 'transparent'}
                    onPress={() => updateBlock(activeBlock.id, { styles: { ...activeBlock.styles, align } })}
                    flex={1}
                    py="$1"
                  >
                    <Icon name={iconName[align]} size={16} />
                  </Button>
                );
              })}
            </XStack>
          </YStack>

          {/* Rotate, Flip & Crop */}
          {activeBlock.url && (
            <YStack gap="$1">
              <Text fontSize={11} fontWeight="500">Rotacionar / Espelhar / Cortar</Text>
              <XStack gap="$1" flexWrap="wrap">
                <Button
                  variant="ghost"
                  borderWidth={1}
                  borderColor="$border"
                  flex={1}
                  py="$1"
                  onPress={() => updateBlock(activeBlock.id, { styles: { ...activeBlock.styles, rotate: ((activeBlock.styles?.rotate ?? 0) - 90 + 360) % 360 } })}
                >
                  <XStack ai="center" gap={4}><Icon name="RotateCcw" size={14} /><Text fontSize={10}>90°</Text></XStack>
                </Button>
                <Button
                  variant="ghost"
                  borderWidth={1}
                  borderColor="$border"
                  flex={1}
                  py="$1"
                  onPress={() => updateBlock(activeBlock.id, { styles: { ...activeBlock.styles, rotate: ((activeBlock.styles?.rotate ?? 0) + 90) % 360 } })}
                >
                  <XStack ai="center" gap={4}><Icon name="RotateCw" size={14} /><Text fontSize={10}>90°</Text></XStack>
                </Button>
                <Button
                  variant="ghost"
                  borderWidth={1}
                  borderColor="$border"
                  flex={1}
                  py="$1"
                  onPress={() => updateBlock(activeBlock.id, { styles: { ...activeBlock.styles, flipH: !activeBlock.styles?.flipH } })}
                >
                  <XStack ai="center" gap={4}><Icon name="FlipHorizontal" size={14} /><Text fontSize={10}>H</Text></XStack>
                </Button>
                <Button
                  variant="ghost"
                  borderWidth={1}
                  borderColor="$border"
                  flex={1}
                  py="$1"
                  onPress={() => updateBlock(activeBlock.id, { styles: { ...activeBlock.styles, flipV: !activeBlock.styles?.flipV } })}
                >
                  <XStack ai="center" gap={4}><Icon name="FlipVertical" size={14} /><Text fontSize={10}>V</Text></XStack>
                </Button>
                <Button
                  variant="ghost"
                  borderWidth={1}
                  borderColor="$border"
                  flex={1}
                  py="$1"
                  onPress={() => setShowCropOverlay(true)}
                >
                  <XStack ai="center" gap={4}><Icon name="Crop" size={14} /><Text fontSize={10}>Cortar</Text></XStack>
                </Button>
              </XStack>
            </YStack>
          )}

          {activeBlock.url ? (
            <YStack borderRadius="$3" overflow="hidden" borderWidth={1} borderColor="$border">
              <img src={activeBlock.url} alt={activeBlock.alt} style={{ width: '100%', height: 'auto', display: 'block' }} />
            </YStack>
          ) : null}

          {!isCertMode && (
            <>
              <ImageUploadBlock blockId={activeBlock.id} courseId={courseId} onUpload={(url) => updateBlock(activeBlock.id, { url })} />

              <YStack onPress={() => setShowBgEditor(!showBgEditor)} role="button" tabIndex={0} borderRadius="$3" borderWidth={1} borderColor={showBgEditor ? '$primary' : '$border'} paddingVertical="$2" paddingHorizontal="$3" backgroundColor={showBgEditor ? '$primary' : '$background'} hoverStyle={{ backgroundColor: showBgEditor ? '$primary' : '$backgroundHover' }} cursor="pointer">
                <Text fontSize={12} fontWeight="600" color={showBgEditor ? 'white' : '$text'}>{showBgEditor ? 'Fechar' : '✦ Remover Fundo'}</Text>
              </YStack>
            </>
          )}

          {!isCertMode && showBgEditor && (
            <YStack gap="$2" p="$2" bg="$background" borderRadius="$3" borderWidth={1} borderColor="$border">
              <Text fontSize={11} fontWeight="500">Remoção de Fundo</Text>
              <XStack gap="$2" flexWrap="wrap">
                <YStack flex={1} minWidth={100}>
                  <Text fontSize={10} color="$textMuted">Tolerância</Text>
                  <input type="range" min={0} max={100} value={bgTolerance} onChange={(e) => setBgTolerance(Number(e.target.value))} style={{ width: '100%' }} />
                  <Text fontSize={10} color="$textMuted">{bgTolerance}</Text>
                </YStack>
                <YStack flex={1} minWidth={100}>
                  <Text fontSize={10} color="$textMuted">Sensib. Borda</Text>
                  <input type="range" min={0} max={1} step={0.01} value={bgEdgeThreshold} onChange={(e) => setBgEdgeThreshold(Number(e.target.value))} style={{ width: '100%' }} />
                  <Text fontSize={10} color="$textMuted">{bgEdgeThreshold}</Text>
                </YStack>
                <YStack flex={1} minWidth={100}>
                  <Text fontSize={10} color="$textMuted">Suavização</Text>
                  <input type="range" min={0} max={10} value={bgFeatherRadius} onChange={(e) => setBgFeatherRadius(Number(e.target.value))} style={{ width: '100%' }} />
                  <Text fontSize={10} color="$textMuted">{bgFeatherRadius}</Text>
                </YStack>
              </XStack>
              <Button onPress={async () => {
                setBgProcessing(true); setBgError(null);
                try {
                  const img = new Image(); img.crossOrigin = 'anonymous';
                  await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(new Error('Falha ao carregar imagem')); img.src = activeBlock.url; });
                  setBgPreviewUrl(removeBackgroundFromImage(img, bgTolerance, bgEdgeThreshold, bgFeatherRadius));
                } catch (err) { setBgError(err instanceof Error ? err.message : 'Erro ao processar imagem'); }
                finally { setBgProcessing(false); }
              }} disabled={bgProcessing} bg="$primary" py="$1">
                {bgProcessing ? <Spinner size="small" /> : <Text fontSize={11} color="white">Processar</Text>}
              </Button>
              {bgError && <Text fontSize={10} color="$error">{bgError}</Text>}
              {bgPreviewUrl && (
                <YStack gap="$1">
                  <Text fontSize={10} color="$textMuted">Preview</Text>
                  <YStack borderRadius="$3" overflow="hidden" borderWidth={1} borderColor="$border" bg="white" style={{ backgroundImage: 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)', backgroundSize: '12px 12px', backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px' }}>
                    <img src={bgPreviewUrl} alt="Preview" style={{ width: '100%', height: 'auto', display: 'block' }} />
                  </YStack>
                  <XStack gap="$2" mt="$1">
                    <Button onPress={async () => {
                      if (!bgPreviewUrl || !courseId) return;
                      setBgProcessing(true); setBgError(null);
                      try {
                        const blob = await (await fetch(bgPreviewUrl)).blob();
                        const file = new File([blob], `bg-removed-${activeBlock.id}.png`, { type: 'image/png' });
                        const url = await StorageService.uploadCertificateImage(file, courseId, activeBlock.id);
                        if (url) { updateBlock(activeBlock.id, { url }); setBgPreviewUrl(null); setShowBgEditor(false); }
                        else throw new Error('Falha ao enviar');
                      } catch (err) { setBgError(err instanceof Error ? err.message : 'Erro ao salvar'); }
                      finally { setBgProcessing(false); }
                    }} disabled={bgProcessing} bg="$primary" flex={1} py="$1">
                      <Text fontSize={11} color="white">Salvar no Curso</Text>
                    </Button>
                    <Button onPress={() => { setBgPreviewUrl(null); setShowBgEditor(false); setBgError(null); }} variant="ghost" flex={1} py="$1">
                      <Text fontSize={11}>Cancelar</Text>
                    </Button>
                  </XStack>
                </YStack>
              )}
            </YStack>
          )}

          <DimensionControls block={activeBlock} updateBlock={updateBlock} />
        </YStack>
        </ViewChildren>
      )}

      {activeBlock.type === 'html' && (
        <ViewChildren>
        <YStack gap="$2">
          <YStack>
            <Text fontSize={11} fontWeight="500">Código HTML</Text>
            <textarea
              value={activeBlock.htmlContent}
              onChange={(e) => updateBlock(activeBlock.id, { htmlContent: e.target.value })}
              rows={12}
              spellCheck={false}
              style={{ fontFamily: 'monospace', fontSize: 12, lineHeight: 1.5, width: '100%', borderRadius: '6px', border: '1px solid var(--border-light)', padding: '8px', outline: 'none', color: 'var(--text-primary)', backgroundColor: 'white' }}
              placeholder={'<div>\n  Seu HTML aqui...\n</div>'}
            />
          </YStack>

          <YStack p="$3" borderRadius="$3" bg="$secondary">
            <Text fontSize={11} fontWeight="600">⚠️ AVISO DE SEGURANÇA</Text>
            <Text fontSize={11} color="$textMuted">
              Este bloco executa HTML bruto na tela do aluno. Certifique-se de usar apenas código confiável.
            </Text>
          </YStack>

          <DimensionControls block={activeBlock} updateBlock={updateBlock} />
        </YStack>
        </ViewChildren>
      )}

      {activeBlock.type === 'heading' && (
        <ViewChildren>
        <YStack gap="$2">
          <YStack>
            <Text fontSize={11} fontWeight="500">Conteúdo do Título</Text>
            <input
              type="text"
              value={activeBlock.content}
              onChange={(e) => updateBlock(activeBlock.id, { content: e.target.value })}
              placeholder="Digite o título..."
              style={{ height: 34, borderRadius: '6px', border: '1px solid var(--border-light)', padding: '0 10px', fontSize: 13, outline: 'none', width: '100%' }}
            />
          </YStack>
          <YStack>
            <Text fontSize={11} fontWeight="500">Nível</Text>
            <select
              value={String((activeBlock as any).level || 2)}
              onChange={(e) => updateBlock(activeBlock.id, { level: Number(e.target.value) as 1 | 2 | 3 })}
              style={{ height: 34, borderRadius: '6px', border: '1px solid var(--border-light)', padding: '0 8px', fontSize: 12, outline: 'none', background: 'white', width: '100%' }}
            >
              <option value="1">H1 — Principal</option>
              <option value="2">H2 — Seção</option>
              <option value="3">H3 — Subseção</option>
            </select>
          </YStack>
          <YStack>
            <Text fontSize={11} fontWeight="500">Alinhamento</Text>
            <XStack bg="$background" borderRadius="$3" p={1} borderWidth={1} borderColor="$border">
              {(['left', 'center', 'right'] as const).map((align) => {
                const isSelected = (activeBlock as any).styles?.align === align;
                const iconName: Record<string, string> = { left: 'AlignLeft', center: 'AlignCenter', right: 'AlignRight' };
                return (
                  <Button
                    key={align}
                    variant="ghost"
                    aria-label={`Alinhar ${align === 'left' ? 'à esquerda' : align === 'right' ? 'à direita' : 'ao centro'}`}
                    borderWidth={isSelected ? 1 : 0}
                    borderColor={isSelected ? '$border' : 'transparent'}
                    onPress={() => updateBlock(activeBlock.id, { styles: { ...(activeBlock as any).styles, align } })}
                    flex={1} py="$1"
                  >
                    <Icon name={iconName[align]} size={16} />
                  </Button>
                );
              })}
            </XStack>
          </YStack>
        </YStack>
        </ViewChildren>
      )}

      {activeBlock.type === 'divider' && (
        <ViewChildren>
        <YStack gap="$2">
          <YStack>
            <Text fontSize={11} fontWeight="500">Espessura</Text>
            <select
              value={String((activeBlock as any).styles?.thickness ?? 1)}
              onChange={(e) => updateBlock(activeBlock.id, { styles: { ...(activeBlock as any).styles, thickness: Number(e.target.value) } })}
              style={{ height: 34, borderRadius: '6px', border: '1px solid var(--border-light)', padding: '0 8px', fontSize: 12, outline: 'none', background: 'white', width: '100%' }}
            >
              <option value="1">1px — Fino</option>
              <option value="2">2px — Médio</option>
              <option value="4">4px — Grosso</option>
              <option value="8">8px — Extremo</option>
            </select>
          </YStack>
          <YStack>
            <Text fontSize={11} fontWeight="500">Estilo</Text>
            <select
              value={(activeBlock as any).styles?.style || 'solid'}
              onChange={(e) => updateBlock(activeBlock.id, { styles: { ...(activeBlock as any).styles, style: e.target.value } })}
              style={{ height: 34, borderRadius: '6px', border: '1px solid var(--border-light)', padding: '0 8px', fontSize: 12, outline: 'none', background: 'white', width: '100%' }}
            >
              <option value="solid">Sólida</option>
              <option value="dashed">Tracejada</option>
              <option value="dotted">Pontilhada</option>
            </select>
          </YStack>
          <YStack>
            <XStack ai="center" jc="space-between">
              <Text fontSize={11} fontWeight="500">Cor</Text>
              <Text fontSize={9} color="$textMuted">{(activeBlock as any).styles?.color || 'Cinza padrão'}</Text>
            </XStack>
            <input
              type="color"
              value={(activeBlock as any).styles?.color || '#e2e8f0'}
              onChange={(e) => updateBlock(activeBlock.id, { styles: { ...(activeBlock as any).styles, color: e.target.value } })}
              style={{ width: '100%', height: 36, padding: 0, border: '1px solid var(--border-light)', borderRadius: '6px', cursor: 'pointer' }}
            />
          </YStack>
        </YStack>
        </ViewChildren>
      )}

      {activeBlock.type === 'quote' && (
        <ViewChildren>
        <YStack gap="$2">
          <YStack>
            <Text fontSize={11} fontWeight="500">Conteúdo da Citação</Text>
            <textarea
              value={activeBlock.content}
              onChange={(e) => updateBlock(activeBlock.id, { content: e.target.value })}
              rows={4}
              placeholder="Digite a citação aqui..."
              style={{ width: '100%', borderRadius: '6px', border: '1px solid var(--border-light)', padding: '8px', fontSize: 13, outline: 'none', resize: 'vertical', color: 'var(--text-primary)', backgroundColor: 'white' }}
            />
          </YStack>

          <YStack>
            <Text fontSize={11} fontWeight="500">Autor / Fonte</Text>
            <input
              type="text"
              value={activeBlock.author || ''}
              onChange={(e) => updateBlock(activeBlock.id, { author: e.target.value })}
              placeholder="— Nome do Autor, Livro, etc."
              style={{ height: 34, borderRadius: '6px', border: '1px solid var(--border-light)', padding: '0 10px', fontSize: 12, outline: 'none', width: '100%' }}
            />
          </YStack>

          <YStack>
            <Text fontSize={11} fontWeight="500">Tamanho da Fonte</Text>
            <select
              value={activeBlock.styles?.fontSize || 'medium'}
              onChange={(e) => updateBlock(activeBlock.id, { styles: { ...activeBlock.styles, fontSize: e.target.value as 'small' | 'medium' | 'large' | 'xlarge' } })}
              style={{ height: 34, borderRadius: '6px', border: '1px solid var(--border-light)', padding: '0 8px', fontSize: 12, outline: 'none', background: 'white', width: '100%' }}
            >
              <option value="small">Pequeno (13px)</option>
              <option value="medium">Médio (16px)</option>
              <option value="large">Grande (24px)</option>
              <option value="xlarge">Gigante (32px)</option>
            </select>
          </YStack>

          <YStack>
            <Text fontSize={11} fontWeight="500">Alinhamento</Text>
            <XStack bg="$background" borderRadius="$3" p={1} borderWidth={1} borderColor="$border">
              {(['left', 'center', 'right', 'justify'] as const).map((align) => {
                const isSelected = activeBlock.styles?.align === align;
                const iconName: Record<string, string> = { left: 'AlignLeft', center: 'AlignCenter', right: 'AlignRight', justify: 'AlignJustify' };
                return (
                  <Button
                    key={align}
                    variant="ghost"
                    aria-label={`Alinhar ${align === 'left' ? 'à esquerda' : align === 'right' ? 'à direita' : align === 'center' ? 'ao centro' : 'justificado'}`}
                    borderWidth={isSelected ? 1 : 0}
                    borderColor={isSelected ? '$border' : 'transparent'}
                    onPress={() => updateBlock(activeBlock.id, { styles: { ...activeBlock.styles, align } })}
                    flex={1}
                    py="$1"
                  >
                    <Icon name={iconName[align]} size={16} />
                  </Button>
                );
              })}
            </XStack>
          </YStack>

          <YStack p="$3" borderRadius="$3" bg="$secondary">
            <Text fontSize={11} fontWeight="600">✨ ÊNFASE INLINE (MARKDOWN)</Text>
            <Text fontSize={11} color="$textMuted">
              Assim como no texto, você pode usar <Text fontSize={11} style={{ fontFamily: 'monospace' }}>**negrito**</Text> ou <Text fontSize={11} style={{ fontFamily: 'monospace' }}>*itálico*</Text> no conteúdo da citação.
            </Text>
          </YStack>

          <TypographyAndBackgroundControls block={activeBlock} updateBlock={updateBlock} />
          <DimensionControls block={activeBlock} updateBlock={updateBlock} />

          {/* Slot para selector de lado (frente/verso) — exclusivo do
              editor de certificado, boundary rule SDR-001. */}
          {propsFooter}
        </YStack>
        </ViewChildren>
      )}
      </YStack>
      )}

      {/* Crop overlay */}
      {showCropOverlay && activeBlock.type === 'image' && activeBlock.url && (
        <ImageCropOverlay
          imageUrl={activeBlock.url}
          blockId={activeBlock.id}
          courseId={courseId}
          onCrop={(newUrl) => {
            updateBlock(activeBlock.id, { url: newUrl });
            setShowCropOverlay(false);
          }}
          onClose={() => setShowCropOverlay(false)}
        />
      )}
    </YStack>
    </ViewChildren>
  );
};
