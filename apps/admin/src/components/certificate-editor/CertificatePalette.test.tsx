import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('@projeto/ui', () => ({
  YStack: ({ children, onPress, ...props }: any) => {
    const dataProps: Record<string, any> = {};
    if (onPress) dataProps.onClick = onPress;
    if (props['aria-label']) dataProps['aria-label'] = props['aria-label'];
    if (props.role) dataProps.role = props.role;
    return <div data-testid="YStack" {...dataProps}>{children}</div>;
  },
  XStack: ({ children, onPress, ...props }: any) => {
    const dataProps: Record<string, any> = {};
    if (onPress) dataProps.onClick = onPress;
    if (props['aria-label']) dataProps['aria-label'] = props['aria-label'];
    if (props.role) dataProps.role = props.role;
    return <div data-testid="XStack" {...dataProps}>{children}</div>;
  },
  Text: ({ children, ...props }: any) => {
    const dataProps: Record<string, string> = {};
    if (props.color) dataProps['data-color'] = props.color;
    return <span data-testid="Text" {...dataProps}>{children}</span>;
  },
  Icon: ({ name }: any) => <span data-testid={`icon-${name}`} />,
}));

vi.mock('../../context/EditorContext', () => ({
  useEditor: vi.fn(),
}));

import { useEditor } from '../../context/EditorContext';
import { CertificatePalette } from './CertificatePalette';

function expandPalette() {
  fireEvent.click(screen.getByTestId('icon-ChevronRight'));
}

describe('CertificatePalette', () => {
  const addBlock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useEditor as ReturnType<typeof vi.fn>).mockReturnValue({
      addBlock,
      allowedBlockTypes: new Set(['text', 'heading', 'image', 'divider']),
    });
  });

  it('renders all 4 certificate-compatible block type buttons (by aria-label)', () => {
    render(<CertificatePalette />);
    expect(screen.getByLabelText('Adicionar bloco Texto')).toBeTruthy();
    expect(screen.getByLabelText('Adicionar bloco Título')).toBeTruthy();
    expect(screen.getByLabelText('Adicionar bloco Imagem')).toBeTruthy();
    expect(screen.getByLabelText('Adicionar bloco Divisor')).toBeTruthy();
  });

  it('does NOT render lesson-only block type buttons', () => {
    render(<CertificatePalette />);
    expect(screen.queryByLabelText('Adicionar bloco Vídeo')).toBeNull();
    expect(screen.queryByLabelText('Adicionar bloco Quiz')).toBeNull();
    expect(screen.queryByLabelText('Adicionar bloco HTML')).toBeNull();
    expect(screen.queryByLabelText('Adicionar bloco Citação')).toBeNull();
  });

  it('calls addBlock with "text" when Texto button is clicked', () => {
    render(<CertificatePalette />);
    expandPalette();
    fireEvent.click(screen.getByText('Texto'));
    expect(addBlock).toHaveBeenCalledWith('text');
  });

  it('calls addBlock with "heading" when Título is clicked', () => {
    render(<CertificatePalette />);
    expandPalette();
    fireEvent.click(screen.getByText('Título'));
    expect(addBlock).toHaveBeenCalledWith('heading');
  });

  it('calls addBlock with "image" when Imagem is clicked', () => {
    render(<CertificatePalette />);
    expandPalette();
    fireEvent.click(screen.getByText('Imagem'));
    expect(addBlock).toHaveBeenCalledWith('image');
  });

  it('calls addBlock with "divider" when Divisor is clicked', () => {
    render(<CertificatePalette />);
    expandPalette();
    fireEvent.click(screen.getByText('Divisor'));
    expect(addBlock).toHaveBeenCalledWith('divider');
  });

  it('starts collapsed — header hidden, chevron points right', () => {
    render(<CertificatePalette />);
    expect(screen.queryByText('Conteúdo')).toBeNull();
    expect(screen.queryByText('Arraste ou clique para adicionar')).toBeNull();
    expect(screen.getByTestId('icon-ChevronRight')).toBeTruthy();
  });

  it('toggles expand/collapse on chevron click', () => {
    render(<CertificatePalette />);
    expect(screen.queryByText('Conteúdo')).toBeNull();
    expandPalette();
    expect(screen.getByText('Conteúdo')).toBeTruthy();
    expect(screen.getByText('Arraste ou clique para adicionar')).toBeTruthy();
    expect(screen.getByTestId('icon-ChevronLeft')).toBeTruthy();
    fireEvent.click(screen.getByTestId('icon-ChevronLeft'));
    expect(screen.queryByText('Conteúdo')).toBeNull();
  });
});
