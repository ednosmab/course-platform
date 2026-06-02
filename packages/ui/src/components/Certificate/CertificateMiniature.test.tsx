import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '../../tamagui.config';
import { CertificateMiniature } from './CertificateMiniature';
import type { CertificateBlock } from '@projeto/types';

/**
 * Tests for the certificate miniature shown on the course configuration page.
 *
 * Regression: commit ed231f7 removed the `isDoubleSided` prop from the call
 * site, even though the component still accepted it. This made the miniature
 * always render the front page only. These tests pin down the duplex behaviour
 * so the bug cannot regress.
 */
describe('CertificateMiniature', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    // jsdom does not implement ResizeObserver. Mock it so the miniature
    // scale calculation can run.
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    root.unmount();
    document.body.removeChild(container);
  });

  function renderMiniature(props: {
    blocks: CertificateBlock[];
    designWidth?: number;
    designHeight?: number;
    isDoubleSided?: boolean;
  }) {
    Object.defineProperty(container, 'clientWidth', { value: 600, configurable: true });
    flushSync(() => {
      root.render(
        <TamaguiProvider config={tamaguiConfig} defaultTheme="cloudWhite">
          <CertificateMiniature {...props} />
        </TamaguiProvider>,
      );
    });
  }

  const frontBlock: CertificateBlock = {
    id: 'f1',
    type: 'text',
    content: 'FRENTE',
    styles: { side: 'front' },
    layouts: { desktop: { x: 50, y: 50, w: 400, h: 40, zIndex: 0 } },
  } as any;

  const backBlock: CertificateBlock = {
    id: 'b1',
    type: 'text',
    content: 'VERSO',
    styles: { side: 'back' },
    layouts: { desktop: { x: 50, y: 50, w: 400, h: 40, zIndex: 0 } },
  } as any;

  it('renders the empty state when there are no blocks', () => {
    renderMiniature({ blocks: [] });
    expect(container.textContent).toContain('Sem blocos');
  });

  it('renders the front page when isDoubleSided is false', () => {
    renderMiniature({ blocks: [frontBlock], isDoubleSided: false });
    expect(container.textContent).toContain('FRENTE');
    expect(container.textContent).not.toContain('VERSO');
  });

  it('renders BOTH front and back pages when isDoubleSided is true (regression for ed231f7)', () => {
    renderMiniature({ blocks: [frontBlock, backBlock], isDoubleSided: true });
    expect(container.textContent).toContain('FRENTE');
    expect(container.textContent).toContain('VERSO');
  });

  it('still renders only the front page when isDoubleSided is omitted (back-compat)', () => {
    renderMiniature({ blocks: [frontBlock, backBlock] });
    expect(container.textContent).toContain('FRENTE');
    // Back should NOT be visible by default
    expect(container.textContent).not.toContain('VERSO');
  });
});
