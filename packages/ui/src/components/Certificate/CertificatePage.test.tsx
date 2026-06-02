import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '../../tamagui.config';
import { CertificatePage } from './CertificatePage';
import type { CertificateBlock } from '@projeto/types';

/**
 * Tests for the printable A4 certificate page.
 *
 * Regression: commit ed231f7 refactored the preview/print DOM to a single
 * canvas filtered by `previewSide`, which means `window.print()` outputs
 * only the side currently visible in the UI. The duplex support must be
 * restored by rendering two stacked A4 canvases (front + back) with a
 * `page-break-after: always` between them, so the browser emits two
 * physical pages for a duplex print job.
 */
describe('CertificatePage', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    Object.defineProperty(container, 'clientWidth', { value: 900, configurable: true });

    // ResizeObserver mock that fires its callback synchronously when
    // `.observe()` is called. Combined with the rAF polyfill in
    // test-setup.ts, this makes useA4Scale flip `ready` to true on the
    // first render commit.
    vi.stubGlobal(
      'ResizeObserver',
      class {
        private cb: ResizeObserverCallback;
        constructor(cb: ResizeObserverCallback) {
          this.cb = cb;
        }
        observe(target: Element) {
          this.cb(
            [
              {
                target,
                contentRect: {
                  width: 900,
                  height: 600,
                  top: 0,
                  left: 0,
                  bottom: 600,
                  right: 900,
                  x: 0,
                  y: 0,
                  toJSON() {
                    return {};
                  },
                },
                borderBoxSize: [] as unknown as ResizeObserverSize[],
                contentBoxSize: [] as unknown as ResizeObserverSize[],
                devicePixelContentBoxSize: [] as unknown as ResizeObserverSize[],
              },
            ] as unknown as ResizeObserverEntry[],
            this as unknown as ResizeObserver,
          );
        }
        unobserve() {}
        disconnect() {}
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    act(() => root.unmount());
    document.body.removeChild(container);
  });

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

  async function renderPage(props: { blocks: CertificateBlock[]; isDoubleSided?: boolean }) {
    await act(async () => {
      root.render(
        <TamaguiProvider config={tamaguiConfig} defaultTheme="cloudWhite">
          <CertificatePage {...props} />
        </TamaguiProvider>,
      );
      // Yield so useEffect (and its requestAnimationFrame) runs.
      await Promise.resolve();
    });
    // Flush any remaining state updates from the effect chain.
    flushSync(() => {});
  }

  it('renders the print root so @media print can target it', async () => {
    await renderPage({ blocks: [frontBlock] });
    expect(container.querySelector('#certificate-print-root')).toBeTruthy();
  });

  it('renders a single A4 canvas when isDoubleSided is false', async () => {
    await renderPage({ blocks: [frontBlock], isDoubleSided: false });
    const canvases = container.querySelectorAll('#certificate-a4-canvas');
    expect(canvases.length).toBe(1);
    expect(container.textContent).toContain('FRENTE');
    expect(container.textContent).not.toContain('VERSO');
  });

  it('renders TWO A4 canvases when isDoubleSided is true (regression for ed231f7)', async () => {
    await renderPage({ blocks: [frontBlock, backBlock], isDoubleSided: true });
    const canvases = container.querySelectorAll('#certificate-a4-canvas');
    expect(canvases.length).toBe(2);
    expect(container.textContent).toContain('FRENTE');
    expect(container.textContent).toContain('VERSO');
  });

  it('the first A4 canvas has page-break-after so the browser starts a new page', async () => {
    await renderPage({ blocks: [frontBlock, backBlock], isDoubleSided: true });
    const canvases = Array.from(container.querySelectorAll('#certificate-a4-canvas'));
    expect(canvases.length).toBeGreaterThanOrEqual(1);
    const firstCanvas = canvases[0] as HTMLElement;
    const style = (firstCanvas.getAttribute('style') || '').toLowerCase();
    expect(style).toMatch(/page-break-after|break-after/);
  });

  it('the back page is omitted entirely when there are no back blocks (regression for empty back page)', async () => {
    await renderPage({ blocks: [frontBlock], isDoubleSided: true });
    const canvases = container.querySelectorAll('#certificate-a4-canvas');
    expect(canvases.length).toBe(1);
    expect(container.textContent).toContain('FRENTE');
    expect(container.textContent).not.toContain('VERSO');
  });

  it('scales duplex canvases to also fit the parent height (regression for modal overflow)', async () => {
    // Simulate a short-and-narrow modal: width=400, height=400.
    // Two A4 canvases would overflow vertically if the scale only considered
    // width. The hook must shrink the scale so total height (2 * 794 * scale)
    // fits within 400px (minus padding and gap).
    const shortContainer = document.createElement('div');
    shortContainer.style.width = '400px';
    shortContainer.style.height = '400px';
    document.body.appendChild(shortContainer);
    const shortRoot = createRoot(shortContainer);
    await act(async () => {
      shortRoot.render(
        <TamaguiProvider config={tamaguiConfig} defaultTheme="cloudWhite">
          <CertificatePage blocks={[frontBlock, backBlock]} isDoubleSided />
        </TamaguiProvider>,
      );
      await Promise.resolve();
    });
    flushSync(() => {});
    const shortCanvases = shortContainer.querySelectorAll('#certificate-a4-canvas');
    expect(shortCanvases.length).toBe(2);
    // jsdom has 0x0 layout, so we can only assert the canvases were rendered
    // (i.e. the hook did not crash with a negative or NaN scale).
    expect(shortCanvases[0]).toBeTruthy();
    expect(shortCanvases[1]).toBeTruthy();
    shortRoot.unmount();
  });
});
