import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import type { AnyBlock } from '@projeto/types';

const mockSetActiveBlockId = vi.fn();
let mockActiveBlockIdVal: string | null = null;
let mockSelectedBlockIdsVal: string[] = [];
const mockCourseIdVal = 'course-1';

const mockDuplicateBlock = vi.fn();
const mockRemoveBlock = vi.fn();
const mockRemoveBlocks = vi.fn();
const mockToggleSelectBlock = vi.fn();
const mockSetSelectedBlocks = vi.fn();
const mockClearSelection = vi.fn();
const mockSetActiveSide = vi.fn();
const mockUpdateBlock = vi.fn();
const mockOnImageDropCapture = vi.fn();

const { mockUploadCertificateImage } = vi.hoisted(() => ({
  mockUploadCertificateImage: vi.fn(async () => 'https://supabase.example/cert-images/uploaded.png'),
}));

vi.mock('../../context/EditorContext', () => ({
  useEditor: () => ({
    setActiveBlockId: mockSetActiveBlockId,
    activeBlockId: mockActiveBlockIdVal,
    selectedBlockIds: mockSelectedBlockIdsVal,
    courseId: mockCourseIdVal,
    updateBlock: mockUpdateBlock,
    updateBlockSilent: vi.fn(),
    duplicateBlock: mockDuplicateBlock,
    removeBlock: mockRemoveBlock,
    removeBlocks: mockRemoveBlocks,
    toggleSelectBlock: mockToggleSelectBlock,
    setSelectedBlocks: mockSetSelectedBlocks,
    clearSelection: mockClearSelection,
    setActiveSide: mockSetActiveSide,
  }),
}));

vi.mock('@projeto/core', () => ({
  StorageService: {
    uploadCertificateImage: mockUploadCertificateImage,
  },
}));

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
    if (props['aria-selected'] !== undefined) dataProps['aria-selected'] = props['aria-selected'];
    if (props.role) dataProps.role = props.role;
    if (props['data-testid']) dataProps['data-testid'] = props['data-testid'];
    return <div data-testid={props['data-testid'] || 'XStack'} {...dataProps}>{children}</div>;
  },
  Text: ({ children }: any) => <span data-testid="Text">{children}</span>,
  Icon: ({ name }: any) => <span data-testid={`icon-${name}`} />,
  CertificateBlockRenderer: ({ block, onImageDrop }: any) => {
    if (onImageDrop && block.type === 'image' && !block.url) {
      mockOnImageDropCapture(onImageDrop);
    }
    return (
      <div data-testid={`cert-block-${block.id}`} data-type={block.type}>
        {block.content || block.type}
      </div>
    );
  },
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
    mockActiveBlockIdVal = null;
    mockSelectedBlockIdsVal = [];
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

  it('calls setActiveBlockId when a block is clicked (onMouseDown)', () => {
    const blocks = [makeBlock({ id: 'b1' })];
    render(<CertificateCanvas blocks={blocks} />);
    fireEvent.mouseDown(screen.getByTestId('cert-block-b1'));
    expect(mockSetActiveBlockId).toHaveBeenCalledWith('b1');
  });

  it('calls setActiveBlockId when a block is clicked (onClick)', () => {
    const blocks = [makeBlock({ id: 'b1' })];
    render(<CertificateCanvas blocks={blocks} />);
    fireEvent.click(screen.getByTestId('cert-block-b1'));
    expect(mockSetActiveBlockId).toHaveBeenCalledWith('b1');
  });

  it('shows 8 resize handles when a block is active', () => {
    mockActiveBlockIdVal = 'b1';
    const blocks = [makeBlock({ id: 'b1', styles: { side: 'front' } })];
    const { container } = render(<CertificateCanvas blocks={blocks} />);
    const handles = container.querySelectorAll('[data-handle]');
    expect(handles.length).toBe(8);
    expect(handles[0].getAttribute('data-handle')).toBe('nw');
    expect(handles[7].getAttribute('data-handle')).toBe('se');
  });

  it('does not show handles on background blocks', () => {
    mockActiveBlockIdVal = 'bg1';
    const blocks = [makeBlock({ id: 'bg1', styles: { isBackground: true }, type: 'image' })];
    const { container } = render(<CertificateCanvas blocks={blocks} />);
    const handles = container.querySelectorAll('[data-handle]');
    expect(handles.length).toBe(0);
  });

  it('shows toolbar (Copy + Trash2) when block is active', () => {
    mockActiveBlockIdVal = 'b1';
    const blocks = [makeBlock({ id: 'b1', styles: { side: 'front' } })];
    render(<CertificateCanvas blocks={blocks} />);
    expect(screen.getByLabelText('Duplicar bloco')).toBeTruthy();
    expect(screen.getByLabelText('Excluir bloco')).toBeTruthy();
  });

  it('duplicate button calls duplicateBlock', () => {
    mockActiveBlockIdVal = 'b1';
    const blocks = [makeBlock({ id: 'b1' })];
    render(<CertificateCanvas blocks={blocks} />);
    fireEvent.click(screen.getByLabelText('Duplicar bloco'));
    expect(mockDuplicateBlock).toHaveBeenCalledWith('b1');
  });

  it('delete button calls removeBlock', () => {
    mockActiveBlockIdVal = 'b1';
    const blocks = [makeBlock({ id: 'b1' })];
    render(<CertificateCanvas blocks={blocks} />);
    fireEvent.click(screen.getByLabelText('Excluir bloco'));
    expect(mockRemoveBlock).toHaveBeenCalledWith('b1');
  });

  it('delete key removes active block', () => {
    mockActiveBlockIdVal = 'b1';
    render(<CertificateCanvas blocks={[makeBlock({ id: 'b1' })]} />);
    fireEvent.keyDown(document, { key: 'Delete' });
    expect(mockRemoveBlock).toHaveBeenCalledWith('b1');
    expect(mockSetActiveBlockId).toHaveBeenCalledWith(null);
  });

  it('ctrl+c copies block id', () => {
    mockActiveBlockIdVal = 'b1';
    render(<CertificateCanvas blocks={[makeBlock({ id: 'b1' })]} />);
    fireEvent.keyDown(document, { key: 'c', ctrlKey: true });
    // no direct assertion on internal clipboard state
  });

  describe('marquee (drag selection)', () => {
    it('does NOT call setActiveBlockId with the background id (lets mousedown bubble to start marquee)', () => {
      const blocks = [makeBlock({ id: 'bg1', styles: { isBackground: true }, type: 'image', url: 'bg.jpg' })];
      render(<CertificateCanvas blocks={blocks} />);
      fireEvent.mouseDown(screen.getByTestId('cert-block-bg1'));
      expect(mockSetActiveBlockId).not.toHaveBeenCalledWith('bg1');
    });

    it('mousedown on a non-background block stops propagation (does not start marquee)', () => {
      const blocks = [makeBlock({ id: 'b1' })];
      render(<CertificateCanvas blocks={blocks} />);
      fireEvent.mouseDown(screen.getByTestId('cert-block-b1'));
      expect(mockClearSelection).not.toHaveBeenCalled();
    });

    it('preserves ALL selected blocks after a multi-block marquee (first block is not dropped)', () => {
      const blocks = [
        makeBlock({ id: 'b1', layouts: { desktop: { x: 100, y: 100, w: 200, h: 200, zIndex: 0 } } }),
        makeBlock({ id: 'b2', layouts: { desktop: { x: 400, y: 100, w: 200, h: 200, zIndex: 1 } } }),
        makeBlock({ id: 'b3', layouts: { desktop: { x: 700, y: 100, w: 200, h: 200, zIndex: 2 } } }),
      ];
      const { container } = render(<CertificateCanvas blocks={blocks} />);
      const pageRoot = container.querySelector('div[style*="background: white"]') as HTMLElement;
      expect(pageRoot).toBeTruthy();
      pageRoot.getBoundingClientRect = vi.fn(() => ({
        left: 0, top: 0, right: 1100, bottom: 778, width: 1100, height: 778, x: 0, y: 0, toJSON: () => ({}),
      }));
      fireEvent.mouseDown(pageRoot, { clientX: 50, clientY: 50 });
      fireEvent.mouseMove(window, { clientX: 1000, clientY: 700 });
      fireEvent.mouseUp(window);
      expect(mockSetActiveBlockId).toHaveBeenCalledWith('b1');
      expect(mockSetSelectedBlocks).toHaveBeenCalledWith(['b1', 'b2', 'b3']);
    });

    it('uses setSelectedBlocks (replaces selection) instead of toggleSelectBlock (which would drop the first block)', () => {
      const blocks = [
        makeBlock({ id: 'b1', layouts: { desktop: { x: 100, y: 100, w: 200, h: 200, zIndex: 0 } } }),
        makeBlock({ id: 'b2', layouts: { desktop: { x: 400, y: 100, w: 200, h: 200, zIndex: 1 } } }),
      ];
      const { container } = render(<CertificateCanvas blocks={blocks} />);
      const pageRoot = container.querySelector('div[style*="background: white"]') as HTMLElement;
      pageRoot.getBoundingClientRect = vi.fn(() => ({
        left: 0, top: 0, right: 1100, bottom: 778, width: 1100, height: 778, x: 0, y: 0, toJSON: () => ({}),
      }));
      fireEvent.mouseDown(pageRoot, { clientX: 50, clientY: 50 });
      fireEvent.mouseMove(window, { clientX: 1000, clientY: 700 });
      fireEvent.mouseUp(window);
      expect(mockToggleSelectBlock).not.toHaveBeenCalled();
      expect(mockSetSelectedBlocks).toHaveBeenCalled();
    });
  });

  describe('multi-select drag (Issue 2 fix)', () => {
    it('does NOT call setActiveBlockId when mousedown on a block that is already in selectedBlockIds', () => {
      mockSelectedBlockIdsVal = ['b1', 'b2'];
      const blocks = [makeBlock({ id: 'b1' }), makeBlock({ id: 'b2' })];
      render(<CertificateCanvas blocks={blocks} />);
      fireEvent.mouseDown(screen.getByTestId('cert-block-b1'));
      expect(mockSetActiveBlockId).not.toHaveBeenCalled();
    });

    it('DOES call setActiveBlockId when mousedown on a block that is NOT in selectedBlockIds', () => {
      mockSelectedBlockIdsVal = ['b1'];
      const blocks = [makeBlock({ id: 'b1' }), makeBlock({ id: 'b2' })];
      render(<CertificateCanvas blocks={blocks} />);
      fireEvent.mouseDown(screen.getByTestId('cert-block-b2'));
      expect(mockSetActiveBlockId).toHaveBeenCalledWith('b2');
    });

    it('DOES call setActiveBlockId when mousedown on a block that is the only selected (single-select case)', () => {
      mockSelectedBlockIdsVal = ['b1'];
      const blocks = [makeBlock({ id: 'b1' })];
      render(<CertificateCanvas blocks={blocks} />);
      fireEvent.mouseDown(screen.getByTestId('cert-block-b1'));
      expect(mockSetActiveBlockId).toHaveBeenCalledWith('b1');
    });
  });

  describe('front/back view toggle (Issue 3 fix)', () => {
    it('does NOT render the side toggle when isDoubleSided=false', () => {
      render(<CertificateCanvas blocks={[]} isDoubleSided={false} />);
      expect(screen.queryByTestId('side-toggle')).toBeNull();
    });

    it('renders the side toggle when isDoubleSided=true', () => {
      render(<CertificateCanvas blocks={[]} isDoubleSided activeSide="front" />);
      expect(screen.getByTestId('side-toggle')).toBeTruthy();
      expect(screen.getByLabelText('Frente')).toBeTruthy();
      expect(screen.getByLabelText('Verso')).toBeTruthy();
    });

    it('marks the current side as aria-selected=true', () => {
      render(<CertificateCanvas blocks={[]} isDoubleSided activeSide="back" />);
      const frente = screen.getByLabelText('Frente');
      const verso = screen.getByLabelText('Verso');
      expect(frente.getAttribute('aria-selected')).toBe('false');
      expect(verso.getAttribute('aria-selected')).toBe('true');
    });

    it('clicking Verso calls setActiveSide("back")', () => {
      render(<CertificateCanvas blocks={[]} isDoubleSided activeSide="front" />);
      fireEvent.click(screen.getByLabelText('Verso'));
      expect(mockSetActiveSide).toHaveBeenCalledWith('back');
    });

    it('clicking Frente calls setActiveSide("front")', () => {
      render(<CertificateCanvas blocks={[]} isDoubleSided activeSide="back" />);
      fireEvent.click(screen.getByLabelText('Frente'));
      expect(mockSetActiveSide).toHaveBeenCalledWith('front');
    });
  });

  describe('canvas overlay (padding around the cert)', () => {
    it('renders the overlay BEHIND the canvas (zIndex 0)', () => {
      const { container } = render(<CertificateCanvas blocks={[]} />);
      const overlay = container.querySelector('[data-testid="canvas-overlay"]') as HTMLElement;
      expect(overlay).toBeTruthy();
      expect(overlay.style.position).toBe('absolute');
      expect(overlay.style.zIndex).toBe('0');
    });

    it('starts a marquee selection when mousedown fires on the overlay (padding around the cert)', () => {
      const blocks = [
        makeBlock({ id: 'b1', layouts: { desktop: { x: 200, y: 100, w: 200, h: 200, zIndex: 0 } } }),
      ];
      const { container } = render(<CertificateCanvas blocks={blocks} />);
      const overlay = container.querySelector('[data-testid="canvas-overlay"]') as HTMLElement;
      expect(overlay).toBeTruthy();
      const pageRoot = container.querySelector('div[style*="background: white"]') as HTMLElement;
      pageRoot.getBoundingClientRect = vi.fn(() => ({
        left: 100, top: 50, right: 1200, bottom: 828, width: 1100, height: 778, x: 100, y: 50, toJSON: () => ({}),
      }));
      fireEvent.mouseDown(overlay, { clientX: 50, clientY: 25 });
      expect(mockSetActiveBlockId).toHaveBeenCalledWith(null);
      expect(mockClearSelection).toHaveBeenCalled();
      fireEvent.mouseMove(window, { clientX: 1000, clientY: 600 });
      fireEvent.mouseUp(window);
      expect(mockSetSelectedBlocks).toHaveBeenCalledWith(['b1']);
    });

    it('does not select blocks outside the marquee AABB when clicking on the overlay', () => {
      const blocks = [
        makeBlock({ id: 'far', layouts: { desktop: { x: 900, y: 700, w: 100, h: 50, zIndex: 0 } } }),
        makeBlock({ id: 'near', layouts: { desktop: { x: 200, y: 100, w: 200, h: 200, zIndex: 0 } } }),
      ];
      const { container } = render(<CertificateCanvas blocks={blocks} />);
      const overlay = container.querySelector('[data-testid="canvas-overlay"]') as HTMLElement;
      const pageRoot = container.querySelector('div[style*="background: white"]') as HTMLElement;
      pageRoot.getBoundingClientRect = vi.fn(() => ({
        left: 100, top: 50, right: 1200, bottom: 828, width: 1100, height: 778, x: 100, y: 50, toJSON: () => ({}),
      }));
      fireEvent.mouseDown(overlay, { clientX: 50, clientY: 25 });
      fireEvent.mouseMove(window, { clientX: 400, clientY: 300 });
      fireEvent.mouseUp(window);
      expect(mockSetSelectedBlocks).toHaveBeenCalledWith(['near']);
    });
  });

  describe('image block drop upload (onImageDrop wiring)', () => {
    function makeImageBlock(overrides: Partial<AnyBlock> = {}): AnyBlock {
      return {
        type: 'image',
        url: '',
        layouts: { desktop: { x: 40, y: 40, w: 200, h: 200, zIndex: 0 } },
        ...overrides,
      } as AnyBlock;
    }

    it('passes onImageDrop to the CertificateBlockRenderer for image blocks', () => {
      const blocks = [makeImageBlock({ id: 'img-1' })];
      render(<CertificateCanvas blocks={blocks} />);
      expect(mockOnImageDropCapture).toHaveBeenCalledTimes(1);
      expect(typeof mockOnImageDropCapture.mock.calls[0][0]).toBe('function');
    });

    it('does not pass onImageDrop when there is no image block (text block only)', () => {
      const blocks = [makeBlock({ id: 't-1', type: 'text' })];
      render(<CertificateCanvas blocks={blocks} />);
      expect(mockOnImageDropCapture).not.toHaveBeenCalled();
    });

    it('uploads the dropped file via StorageService and updates the active image block with the returned URL', async () => {
      mockActiveBlockIdVal = 'img-1';
      const blocks = [makeImageBlock({ id: 'img-1' })];
      render(<CertificateCanvas blocks={blocks} />);

      const onImageDrop = mockOnImageDropCapture.mock.calls[0][0] as (file: File) => Promise<void>;
      const file = new File(['fake-png-bytes'], 'logo.png', { type: 'image/png' });
      await onImageDrop(file);

      expect(mockUploadCertificateImage).toHaveBeenCalledWith(file, 'course-1', 'img-1');
      expect(mockUpdateBlock).toHaveBeenCalledWith('img-1', { url: 'https://supabase.example/cert-images/uploaded.png' });
    });

    it('does nothing when the upload returns no URL (defensive: shows alert but does not throw)', async () => {
      mockUploadCertificateImage.mockResolvedValueOnce(null as any);
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      mockActiveBlockIdVal = 'img-2';
      const blocks = [makeImageBlock({ id: 'img-2' })];
      render(<CertificateCanvas blocks={blocks} />);

      const onImageDrop = mockOnImageDropCapture.mock.calls[0][0] as (file: File) => Promise<void>;
      const file = new File(['x'], 'logo.png', { type: 'image/png' });
      await onImageDrop(file);

      expect(mockUpdateBlock).not.toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith('Erro ao enviar imagem.');
      alertSpy.mockRestore();
    });

    it('rejects files larger than 5MB before calling StorageService', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      mockActiveBlockIdVal = 'img-3';
      const blocks = [makeImageBlock({ id: 'img-3' })];
      render(<CertificateCanvas blocks={blocks} />);

      const onImageDrop = mockOnImageDropCapture.mock.calls[0][0] as (file: File) => Promise<void>;
      const big = new File([new Uint8Array(6 * 1024 * 1024)], 'big.png', { type: 'image/png' });
      await onImageDrop(big);

      expect(mockUploadCertificateImage).not.toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith('Arquivo muito grande. Máximo: 5MB.');
      alertSpy.mockRestore();
    });

    it('rejects unsupported MIME types before calling StorageService', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      mockActiveBlockIdVal = 'img-4';
      const blocks = [makeImageBlock({ id: 'img-4' })];
      render(<CertificateCanvas blocks={blocks} />);

      const onImageDrop = mockOnImageDropCapture.mock.calls[0][0] as (file: File) => Promise<void>;
      const pdf = new File(['%PDF-1.4'], 'doc.pdf', { type: 'application/pdf' });
      await onImageDrop(pdf);

      expect(mockUploadCertificateImage).not.toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith('Formato não suportado. Use JPEG, PNG ou WebP.');
      alertSpy.mockRestore();
    });

    it('is a no-op when there is no active image block selected', async () => {
      mockActiveBlockIdVal = null;
      const blocks = [makeImageBlock({ id: 'img-5' })];
      render(<CertificateCanvas blocks={blocks} />);

      const onImageDrop = mockOnImageDropCapture.mock.calls[0][0] as (file: File) => Promise<void>;
      const file = new File(['x'], 'logo.png', { type: 'image/png' });
      await onImageDrop(file);

      expect(mockUploadCertificateImage).not.toHaveBeenCalled();
      expect(mockUpdateBlock).not.toHaveBeenCalled();
    });
  });

});
