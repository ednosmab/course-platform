'use client';

import React, { createContext, useContext, useReducer } from 'react';
import { AnyBlock } from '@projeto/types';

interface EditorState {
  blocks: AnyBlock[];
  activeBlockId: string | null;
  history: AnyBlock[][];
  historyIndex: number;
}

type EditorAction =
  | { type: 'ADD_BLOCK'; payload: { type: 'text' | 'video' | 'quiz' } }
  | { type: 'REMOVE_BLOCK'; payload: { id: string } }
  | { type: 'UPDATE_BLOCK'; payload: { id: string; updates: Partial<AnyBlock> } }
  | { type: 'MOVE_BLOCK'; payload: { fromIndex: number; toIndex: number } }
  | { type: 'SET_ACTIVE_BLOCK'; payload: { id: string | null } }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SET_BLOCKS'; payload: { blocks: AnyBlock[] } };

const initialState: EditorState = {
  blocks: [],
  activeBlockId: null,
  history: [[]],
  historyIndex: 0,
};

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  const updateHistory = (newBlocks: AnyBlock[], nextActiveId: string | null = state.activeBlockId): EditorState => {
    const nextHistory = state.history.slice(0, state.historyIndex + 1);
    nextHistory.push(newBlocks);
    return {
      ...state,
      blocks: newBlocks,
      activeBlockId: nextActiveId,
      history: nextHistory,
      historyIndex: nextHistory.length - 1,
    };
  };

  switch (action.type) {
    case 'ADD_BLOCK': {
      const id = crypto.randomUUID();
      let newBlock: AnyBlock;

      if (action.payload.type === 'text') {
        newBlock = {
          id,
          type: 'text',
          content: 'Clique aqui para editar este texto...',
          styles: { align: 'left', fontSize: 'medium' },
        };
      } else if (action.payload.type === 'video') {
        newBlock = {
          id,
          type: 'video',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          provider: 'youtube',
        };
      } else {
        newBlock = {
          id,
          type: 'quiz',
          question: 'Digite sua pergunta de quiz aqui...',
          options: [
            { id: crypto.randomUUID(), text: 'Opção A', isCorrect: true, feedback: 'Excelente!' },
            { id: crypto.randomUUID(), text: 'Opção B', isCorrect: false, feedback: 'Tente novamente.' },
          ],
        };
      }

      const newBlocks = [...state.blocks, newBlock];
      return updateHistory(newBlocks, id);
    }

    case 'REMOVE_BLOCK': {
      const newBlocks = state.blocks.filter((b) => b.id !== action.payload.id);
      const nextActiveId = state.activeBlockId === action.payload.id ? null : state.activeBlockId;
      return updateHistory(newBlocks, nextActiveId);
    }

    case 'UPDATE_BLOCK': {
      const newBlocks = state.blocks.map((b) => {
        if (b.id !== action.payload.id) return b;
        return {
          ...b,
          ...action.payload.updates,
        } as AnyBlock;
      });
      return updateHistory(newBlocks);
    }

    case 'MOVE_BLOCK': {
      const { fromIndex, toIndex } = action.payload;
      if (fromIndex < 0 || fromIndex >= state.blocks.length || toIndex < 0 || toIndex >= state.blocks.length) {
        return state;
      }
      const newBlocks = [...state.blocks];
      const [removed] = newBlocks.splice(fromIndex, 1);
      newBlocks.splice(toIndex, 0, removed);
      return updateHistory(newBlocks);
    }

    case 'SET_ACTIVE_BLOCK': {
      return {
        ...state,
        activeBlockId: action.payload.id,
      };
    }

    case 'UNDO': {
      if (state.historyIndex <= 0) return state;
      const nextIndex = state.historyIndex - 1;
      return {
        ...state,
        blocks: state.history[nextIndex],
        historyIndex: nextIndex,
        activeBlockId: null,
      };
    }

    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1) return state;
      const nextIndex = state.historyIndex + 1;
      return {
        ...state,
        blocks: state.history[nextIndex],
        historyIndex: nextIndex,
        activeBlockId: null,
      };
    }

    case 'SET_BLOCKS': {
      return {
        ...state,
        blocks: action.payload.blocks,
        activeBlockId: null,
        history: [action.payload.blocks],
        historyIndex: 0,
      };
    }

    default:
      return state;
  }
}

interface EditorContextType extends EditorState {
  addBlock: (type: 'text' | 'video' | 'quiz') => void;
  removeBlock: (id: string) => void;
  updateBlock: (id: string, updates: Partial<AnyBlock>) => void;
  moveBlock: (fromIndex: number, toIndex: number) => void;
  setActiveBlockId: (id: string | null) => void;
  undo: () => void;
  redo: () => void;
  setBlocks: (blocks: AnyBlock[]) => void;
  canUndo: boolean;
  canRedo: boolean;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  const addBlock = (type: 'text' | 'video' | 'quiz') => dispatch({ type: 'ADD_BLOCK', payload: { type } });
  const removeBlock = (id: string) => dispatch({ type: 'REMOVE_BLOCK', payload: { id } });
  const updateBlock = (id: string, updates: Partial<AnyBlock>) => dispatch({ type: 'UPDATE_BLOCK', payload: { id, updates } });
  const moveBlock = (fromIndex: number, toIndex: number) => dispatch({ type: 'MOVE_BLOCK', payload: { fromIndex, toIndex } });
  const setActiveBlockId = (id: string | null) => dispatch({ type: 'SET_ACTIVE_BLOCK', payload: { id } });
  const undo = () => dispatch({ type: 'UNDO' });
  const redo = () => dispatch({ type: 'REDO' });
  const setBlocks = (blocks: AnyBlock[]) => dispatch({ type: 'SET_BLOCKS', payload: { blocks } });

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  return (
    <EditorContext.Provider
      value={{
        ...state,
        addBlock,
        removeBlock,
        updateBlock,
        moveBlock,
        setActiveBlockId,
        undo,
        redo,
        setBlocks,
        canUndo,
        canRedo,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) throw new Error('useEditor must be used within an EditorProvider');
  return context;
};
