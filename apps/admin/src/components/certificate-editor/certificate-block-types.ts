import type { EditorBlockType } from '../../context/editor-modes';

export interface CertificateBlockTypeEntry {
  icon: string;
  label: string;
  type: EditorBlockType;
}

export const CERTIFICATE_BLOCK_TYPES: CertificateBlockTypeEntry[] = [
  { icon: 'Type', label: 'Texto', type: 'text' },
  { icon: 'Heading', label: 'Título', type: 'heading' },
  { icon: 'Image', label: 'Imagem', type: 'image' },
  { icon: 'Minus', label: 'Divisor', type: 'divider' },
];
