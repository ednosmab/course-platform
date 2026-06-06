import { describe, it, expect } from 'vitest';
import {
  editorReducer,
  initialState,
  type EditorState,
} from './EditorContext';
import type { AnyBlock } from '@projeto/types';

/**
 * EditorContext contract tests (5A.5).
 *
 * These tests lock down the editorReducer's pure contract so that the
 * future refactors documented in BACKLOG.md can proceed safely:
 *   - "Eliminar prop `mode` do EditorProvider" (blocked by 5A.5)
 *   - "Limpar 3 branches de init do EditorContext" (blocked by 5A.5)
 *
 * They are pure-reducer tests: no React, no jsdom, no Supabase mocks.
 * The reducer is the brain of the editor state machine — its input/output
 * shape is the contract consumers depend on via `useEditor()`.
 */

function makeState(overrides: Partial<EditorState> = {}): EditorState {
  return {
    ...initialState,
    ...overrides,
  };
}

function makeTextBlock(id: string): AnyBlock {
  return {
    id,
    type: 'text',
    content: 'hello',
    layouts: { desktop: { x: 0, y: 0, w: 100, h: 50, zIndex: 0 } },
  } as AnyBlock;
}

describe('editorReducer — undo / canUndo contract', () => {
  it('returns state unchanged on UNDO at historyIndex 0 (no-op edge case)', () => {
    const state = makeState({ historyIndex: 0, history: [[]] });
    const result = editorReducer(state, { type: 'UNDO' });
    expect(result).toEqual(state);
  });

  it('UNDO after ADD_BLOCK reverts to the previous blocks snapshot', () => {
    const state = makeState();

    const afterAdd = editorReducer(state, {
      type: 'ADD_BLOCK',
      payload: { type: 'text' },
    });
    expect(afterAdd.blocks.length).toBe(1);
    expect(afterAdd.historyIndex).toBe(1);
    expect(afterAdd.activeBlockId).toBe(afterAdd.blocks[0].id);

    const afterUndo = editorReducer(afterAdd, { type: 'UNDO' });
    expect(afterUndo.blocks.length).toBe(0);
    expect(afterUndo.historyIndex).toBe(0);
    expect(afterUndo.activeBlockId).toBeNull();
  });
});

describe('editorReducer — REMOVE_BLOCK cross-field invariants', () => {
  it('clears activeBlockId and selectedBlockIds when removing the active block', () => {
    const block = makeTextBlock('b-1');
    const state = makeState({
      blocks: [block],
      activeBlockId: 'b-1',
      selectedBlockIds: ['b-1'],
      history: [[block]],
      historyIndex: 0,
    });

    const result = editorReducer(state, {
      type: 'REMOVE_BLOCK',
      payload: { id: 'b-1' },
    });

    expect(result.blocks).toEqual([]);
    expect(result.activeBlockId).toBeNull();
    expect(result.selectedBlockIds).toEqual([]);
  });
});

describe('editorReducer — bug-hunting regressions', () => {
  it('ADD_BLOCK with unknown type falls through to the quiz default (type safety)', () => {
    const state = makeState();
    const result = editorReducer(state, {
      type: 'ADD_BLOCK',
      payload: { type: 'unknown' as any },
    });

    expect(result.blocks).toHaveLength(1);
    expect(result.blocks[0].type).toBe('quiz');
  });

  it('ADD_BLOCK injects styles.side from state.activeSide (cert mode handling)', () => {
    const state = makeState({ activeSide: 'back' });
    const result = editorReducer(state, {
      type: 'ADD_BLOCK',
      payload: { type: 'text' },
    });

    expect((result.blocks[0] as any).styles).toEqual(
      expect.objectContaining({ side: 'back' }),
    );
  });

  it('UPDATE_BLOCK grows history by exactly 1 (bounded history growth)', () => {
    const block = makeTextBlock('b-1');
    const state = makeState({
      blocks: [block],
      history: [[block]],
      historyIndex: 0,
    });

    const result = editorReducer(state, {
      type: 'UPDATE_BLOCK',
      payload: { id: 'b-1', updates: { content: 'updated' } },
    });

    expect(result.history.length).toBe(state.history.length + 1);
    expect(result.historyIndex).toBe(state.historyIndex + 1);
  });
});
