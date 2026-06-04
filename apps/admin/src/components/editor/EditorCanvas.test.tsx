import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import type { AnyBlock } from '@projeto/types';

const mockUpdateBlock = vi.fn();
const mockUpdateBlockSilent = vi.fn();
const mockSetActiveBlockId = vi.fn();
const mockToggleSelectBlock = vi.fn();
const mockClearSelection = vi.fn();
const mockRemoveBlock = vi.fn();
const mockRemoveBlocks = vi.fn();
const mockDuplicateBlock = vi.fn();
const mockSetCertDesignSize = vi.fn();
const mockSetActiveSide = vi.fn();

const defaultEditorState: any = {
  blocks: [],
  activeBlockId: null,
  selectedBlockIds: [],
  setActiveBlockId: mockSetActiveBlockId,
  removeBlock: mockRemoveBlock,
  removeBlocks: mockRemoveBlocks,
  duplicateBlock: mockDuplicateBlock,
  toggleSelectBlock: mockToggleSelectBlock,
  clearSelection: mockClearSelection,
  updateBlock: mockUpdateBlock,
  updateBlockSilent: mockUpdateBlockSilent,
  previewMode: false,
  viewportMode: 'desktop',
  mode: 'lesson',
  certDesignWidth: 1100,
  certDesignHeight: 778,
  certDesignChosen: false,
  setCertDesignSize: mockSetCertDesignSize,
  activeSide: 'front',
  setActiveSide: mockSetActiveSide,
  certIsDoubleSided: false,
};

vi.mock('../../context/EditorContext', () => ({
  useEditor: () => defaultEditorState,
}));

vi.mock('@projeto/ui', () => ({
  YStack: ({ children, onPress, onMouseDown, onClick, onDrop, onDragOver, onDoubleClick, onMouseEnter, onMouseLeave, onKeyDown, ...props }: any) => (
    <div
      data-testid={props['data-testid'] || 'YStack'}
      role={props.role}
      aria-label={props['aria-label']}
      onMouseDown={onMouseDown}
      onClick={onClick}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDoubleClick={onDoubleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onKeyDown={onKeyDown}
      style={props.style}
    >
      {children}
    </div>
  ),
  XStack: ({ children, onPress, onClick, onMouseDown, ...props }: any) => (
    <div
      data-testid={props['data-testid'] || 'XStack'}
      role={props.role}
      aria-label={props['aria-label']}
      aria-selected={props['aria-selected']}
      onClick={onClick}
      onMouseDown={onMouseDown}
      style={props.style}
    >
      {children}
    </div>
  ),
  Text: ({ children }: any) => <span data-testid="Text">{children}</span>,
  Icon: () => null,
  Spinner: () => <div data-testid="Spinner" />,
  Button: ({ children, onClick, onPress }: any) => (
    <button onClick={onClick || onPress}>{children}</button>
  ),
  CertificateBlockRenderer: () => null,
  color: { white: '#fff', black: '#000' },
  sanitizeHtml: (s: string) => s,
}));

import { EditorCanvas } from './EditorCanvas';

function makeImageBlock(overrides: Partial<AnyBlock> = {}): AnyBlock {
  return {
    type: 'image',
    url: '',
    layouts: { desktop: { x: 0, y: 0, w: 200, h: 200, zIndex: 0 } },
    ...overrides,
  } as AnyBlock;
}

function makeTextBlock(overrides: Partial<AnyBlock> = {}): AnyBlock {
  return {
    type: 'text',
    content: 'hello world',
    layouts: { desktop: { x: 0, y: 0, w: 200, h: 100, zIndex: 0 } },
    ...overrides,
  } as AnyBlock;
}

function dispatchDrop(target: HTMLElement, file: File) {
  const event = new Event('drop', { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'dataTransfer', { value: { files: [file] } });
  fireEvent(target, event);
}

describe('EditorCanvas — image block drag-and-drop (block outer div)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    defaultEditorState.blocks = [];
    defaultEditorState.activeBlockId = null;
    defaultEditorState.selectedBlockIds = [];
    defaultEditorState.previewMode = false;
    defaultEditorState.viewportMode = 'desktop';
    defaultEditorState.mode = 'lesson';
  });

  it('calls updateBlock with a DataURL when a file is dropped on an image block outer div', async () => {
    const block = makeImageBlock({ id: 'img-1' });
    defaultEditorState.blocks = [block];
    const { container } = render(<EditorCanvas />);

    const blockDiv = container.querySelector('[role="button"][aria-label^="Bloco image"]') as HTMLElement;
    expect(blockDiv).toBeTruthy();

    const file = new File(['fake-png-bytes'], 'logo.png', { type: 'image/png' });
    dispatchDrop(blockDiv, file);

    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(mockUpdateBlock).toHaveBeenCalledTimes(1);
    expect(mockUpdateBlock).toHaveBeenCalledWith(
      'img-1',
      expect.objectContaining({ url: expect.stringMatching(/^data:image\/png;base64,/) }),
    );
  });

  it('does NOT call updateBlock when a file is dropped on a non-image block (text)', async () => {
    const block = makeTextBlock({ id: 'txt-1' });
    defaultEditorState.blocks = [block];
    const { container } = render(<EditorCanvas />);

    const blockDiv = container.querySelector('[role="button"][aria-label^="Bloco text"]') as HTMLElement;
    expect(blockDiv).toBeTruthy();

    const file = new File(['fake-png-bytes'], 'logo.png', { type: 'image/png' });
    dispatchDrop(blockDiv, file);

    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(mockUpdateBlock).not.toHaveBeenCalled();
  });
});

describe('EditorCanvas — image block drag-and-drop (mobile viewport)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    defaultEditorState.blocks = [];
    defaultEditorState.activeBlockId = null;
    defaultEditorState.selectedBlockIds = [];
    defaultEditorState.previewMode = false;
    defaultEditorState.viewportMode = 'mobile';
    defaultEditorState.mode = 'lesson';
  });

  it('calls updateBlock with a DataURL when a file is dropped on an image block in mobile viewport', async () => {
    const block = makeImageBlock({ id: 'img-mobile-1' });
    defaultEditorState.blocks = [block];
    const { container } = render(<EditorCanvas />);

    const blockDiv = container.querySelector('[data-block-id="img-mobile-1"]') as HTMLElement;
    expect(blockDiv).toBeTruthy();

    const file = new File(['fake-png-bytes'], 'logo.png', { type: 'image/png' });
    dispatchDrop(blockDiv, file);

    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(mockUpdateBlock).toHaveBeenCalledWith(
      'img-mobile-1',
      expect.objectContaining({ url: expect.stringMatching(/^data:image\/png;base64,/) }),
    );
  });
});

describe('EditorCanvas — image block drag-and-drop (tablet viewport)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    defaultEditorState.blocks = [];
    defaultEditorState.activeBlockId = null;
    defaultEditorState.selectedBlockIds = [];
    defaultEditorState.previewMode = false;
    defaultEditorState.viewportMode = 'tablet';
    defaultEditorState.mode = 'lesson';
  });

  it('calls updateBlock with a DataURL when a file is dropped on an image block in tablet viewport', async () => {
    const block = makeImageBlock({ id: 'img-tablet-1' });
    defaultEditorState.blocks = [block];
    const { container } = render(<EditorCanvas />);

    const blockDiv = container.querySelector('[data-block-id="img-tablet-1"]') as HTMLElement;
    expect(blockDiv).toBeTruthy();

    const file = new File(['fake-png-bytes'], 'logo.png', { type: 'image/png' });
    dispatchDrop(blockDiv, file);

    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(mockUpdateBlock).toHaveBeenCalledWith(
      'img-tablet-1',
      expect.objectContaining({ url: expect.stringMatching(/^data:image\/png;base64,/) }),
    );
  });
});
