import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('@projeto/ui', () => ({
  YStack: ({ children, onPress, ...props }: any) => {
    const dataProps: Record<string, any> = {};
    if (props.role) dataProps['data-role'] = props.role;
    if (props['aria-label']) dataProps['data-aria-label'] = props['aria-label'];
    if (onPress) dataProps.onClick = onPress;
    return <div data-testid="YStack" {...dataProps}>{children}</div>;
  },
  XStack: ({ children, onPress, ...props }: any) => {
    const dataProps: Record<string, any> = {};
    if (props.role) dataProps['data-role'] = props.role;
    if (props['aria-label']) dataProps['data-aria-label'] = props['aria-label'];
    if (onPress) dataProps.onClick = onPress;
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

describe('CertificatePalette', () => {
  const addBlock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useEditor as ReturnType<typeof vi.fn>).mockReturnValue({
      addBlock,
      allowedBlockTypes: new Set(['text', 'heading', 'image', 'divider']),
    });
  });

  it('renders all 4 certificate-compatible block type buttons', () => {
    render(<CertificatePalette />);
    expect(screen.getByText('Texto')).toBeTruthy();
    expect(screen.getByText('Título')).toBeTruthy();
    expect(screen.getByText('Imagem')).toBeTruthy();
    expect(screen.getByText('Divisor')).toBeTruthy();
  });

  it('does NOT render lesson-only block types', () => {
    render(<CertificatePalette />);
    expect(screen.queryByText('Vídeo')).toBeNull();
    expect(screen.queryByText('Quiz')).toBeNull();
    expect(screen.queryByText('HTML')).toBeNull();
    expect(screen.queryByText('Citação')).toBeNull();
  });

  it('calls addBlock with "text" when Texto is clicked', () => {
    render(<CertificatePalette />);
    fireEvent.click(screen.getByText('Texto'));
    expect(addBlock).toHaveBeenCalledWith('text');
  });

  it('calls addBlock with "heading" when Título is clicked', () => {
    render(<CertificatePalette />);
    fireEvent.click(screen.getByText('Título'));
    expect(addBlock).toHaveBeenCalledWith('heading');
  });

  it('calls addBlock with "image" when Imagem is clicked', () => {
    render(<CertificatePalette />);
    fireEvent.click(screen.getByText('Imagem'));
    expect(addBlock).toHaveBeenCalledWith('image');
  });

  it('calls addBlock with "divider" when Divisor is clicked', () => {
    render(<CertificatePalette />);
    fireEvent.click(screen.getByText('Divisor'));
    expect(addBlock).toHaveBeenCalledWith('divider');
  });

  it('shows the content section header', () => {
    render(<CertificatePalette />);
    expect(screen.getByText('Conteúdo')).toBeTruthy();
    expect(screen.getByText('Arraste ou clique para adicionar')).toBeTruthy();
  });
});
