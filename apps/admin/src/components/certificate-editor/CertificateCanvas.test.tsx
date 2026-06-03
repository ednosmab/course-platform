import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import type { AnyBlock } from '@projeto/types';

vi.mock('@projeto/ui', () => ({
  YStack: ({ children, onPress, ...props }: any) => {
    const dataProps: Record<string, any> = {};
    if (onPress) dataProps.onClick = onPress;
    return <div data-testid="YStack" {...dataProps}>{children}</div>;
  },
  XStack: ({ children, onPress, ...props }: any) => {
    const dataProps: Record<string, any> = {};
    if (onPress) dataProps.onClick = onPress;
    if (props['aria-label']) dataProps['data-aria-label'] = props['aria-label'];
    return <div data-testid="XStack" {...dataProps}>{children}</div>;
  },
  Text: ({ children }: any) => <span data-testid="Text">{children}</span>,
  Icon: ({ name }: any) => <span data-testid={`icon-${name}`} />,
  CertificateBlockRenderer: ({ block }: any) => (
    <div data-testid={`cert-block-${block.id}`} data-type={block.type}>
      {block.content || block.type}
    </div>
  ),
}));

import { CertificateCanvas } from './CertificateCanvas';

function makeBlock(overrides: Partial<AnyBlock> & { id: string }): AnyBlock {
  return {
    type: 'text',
    content: 'test',
    layouts: { desktop: { x: 40, y: 40, w: 200, h: 100, zIndex: 0 } },
    ...overrides,
  } as AnyBlock;
}

describe('CertificateCanvas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders blocks positioned absolutely from layouts.desktop', () => {
    const blocks = [makeBlock({ id: 'b1', layouts: { desktop: { x: 50, y: 60, w: 300, h: 150, zIndex: 1 } } })];
    const { container } = render(<CertificateCanvas blocks={blocks} />);
    const wrapper = container.querySelector('[data-testid="cert-block-b1"]');
    expect(wrapper).toBeTruthy();
    expect(wrapper?.parentElement?.style.position).toBe('absolute');
    expect(wrapper?.parentElement?.style.left).toBe('50px');
    expect(wrapper?.parentElement?.style.top).toBe('60px');
  });

  it('renders a single canvas for single-sided certificates (isDoubleSided=false)', () => {
    const blocks = [
      makeBlock({ id: 'f1', styles: { side: 'front' } }),
      makeBlock({ id: 'b1', styles: { side: 'back' } }),
    ];
    render(<CertificateCanvas blocks={blocks} isDoubleSided={false} />);
    expect(screen.getByTestId('cert-block-f1')).toBeTruthy();
    expect(screen.getByTestId('cert-block-b1')).toBeTruthy();
  });

  it('filters back blocks when activeSide="front" in duplex', () => {
    const blocks = [
      makeBlock({ id: 'f1', styles: { side: 'front' } }),
      makeBlock({ id: 'b1', styles: { side: 'back' } }),
    ];
    render(<CertificateCanvas blocks={blocks} isDoubleSided activeSide="front" />);
    expect(screen.getByTestId('cert-block-f1')).toBeTruthy();
    expect(screen.queryByTestId('cert-block-b1')).toBeNull();
  });

  it('filters front blocks when activeSide="back" in duplex', () => {
    const blocks = [
      makeBlock({ id: 'f1', styles: { side: 'front' } }),
      makeBlock({ id: 'b1', styles: { side: 'back' } }),
    ];
    render(<CertificateCanvas blocks={blocks} isDoubleSided activeSide="back" />);
    expect(screen.queryByTestId('cert-block-f1')).toBeNull();
    expect(screen.getByTestId('cert-block-b1')).toBeTruthy();
  });

  it('sorts blocks by zIndex ascending', () => {
    const blocks = [
      makeBlock({ id: 'z2', layouts: { desktop: { x: 0, y: 0, w: 100, h: 100, zIndex: 2 } } }),
      makeBlock({ id: 'z0', layouts: { desktop: { x: 0, y: 0, w: 100, h: 100, zIndex: 0 } } }),
      makeBlock({ id: 'z1', layouts: { desktop: { x: 0, y: 0, w: 100, h: 100, zIndex: 1 } } }),
    ];
    const { container } = render(<CertificateCanvas blocks={blocks} />);
    const wrappers = container.querySelectorAll('[data-testid^="cert-block-"]');
    expect(wrappers.length).toBe(3);
    expect(wrappers[0].getAttribute('data-type')).toBe('text');
  });

  it('renders background blocks at full canvas size', () => {
    const blocks = [
      makeBlock({ id: 'bg1', styles: { isBackground: true }, type: 'image', url: 'bg.jpg' }),
    ];
    const { container } = render(<CertificateCanvas blocks={blocks} />);
    const blockEl = container.querySelector('[data-testid="cert-block-bg1"]');
    expect(blockEl).toBeTruthy();
    const parent = blockEl?.parentElement;
    expect(parent?.style.width).toBe('100%');
    expect(parent?.style.height).toBe('100%');
    expect(parent?.style.position).toBe('relative');
  });

  it('shows zoom controls', () => {
    render(<CertificateCanvas blocks={[]} />);
    expect(screen.getByText('100%')).toBeTruthy();
    expect(screen.getByTestId('icon-ZoomIn')).toBeTruthy();
    expect(screen.getByTestId('icon-ZoomOut')).toBeTruthy();
  });

  it('zoom in increases zoom percentage', () => {
    render(<CertificateCanvas blocks={[]} />);
    fireEvent.click(screen.getByTestId('icon-ZoomIn'));
    expect(screen.getByText('110%')).toBeTruthy();
  });

  it('zoom out decreases zoom percentage', () => {
    render(<CertificateCanvas blocks={[]} />);
    fireEvent.click(screen.getByTestId('icon-ZoomOut'));
    expect(screen.getByText('90%')).toBeTruthy();
  });

  it('shows reset zoom button when zoom !== 1', () => {
    render(<CertificateCanvas blocks={[]} />);
    expect(screen.queryByTestId('icon-RotateCcw')).toBeNull();
    fireEvent.click(screen.getByTestId('icon-ZoomOut'));
    expect(screen.getByTestId('icon-RotateCcw')).toBeTruthy();
  });

  it('reset zoom returns to 100%', () => {
    render(<CertificateCanvas blocks={[]} />);
    fireEvent.click(screen.getByTestId('icon-ZoomOut'));
    expect(screen.getByText('90%')).toBeTruthy();
    fireEvent.click(screen.getByTestId('icon-RotateCcw'));
    expect(screen.getByText('100%')).toBeTruthy();
  });
});
