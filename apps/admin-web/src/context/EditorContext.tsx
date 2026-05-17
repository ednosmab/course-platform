'use client';

import React, { createContext, useContext, useReducer, useState, useEffect } from 'react';
import { AnyBlock } from '@projeto/types';
import { supabase } from '@projeto/core';

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
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  activeLessonId: string;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(editorReducer, initialState);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [activeLessonId] = useState('11111111-1111-1111-1111-111111111111');
  const [isLoaded, setIsLoaded] = useState(false);

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

  // 1. Carregamento inicial (e auto-seed se o banco estiver vazio)
  useEffect(() => {
    const initDatabase = async () => {
      try {
        console.log('Verificando aulas no Supabase...');
        const { data: lesson, error: fetchErr } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', activeLessonId)
          .maybeSingle();

        if (fetchErr) throw fetchErr;

        if (lesson) {
          console.log('Aula encontrada! Carregando blocos...', lesson.blocks);
          setBlocks(lesson.blocks || []);
        } else {
          console.log('Banco de dados vazio ou sem a aula padrão. Iniciando auto-seed...');
          
          // Seed Path
          const pathId = '88888888-8888-8888-8888-888888888888';
          await supabase.from('paths').upsert({
            id: pathId,
            title: 'Trilha Full Stack Developer',
            description: 'Aprenda do zero ao deploy com arquiteturas resilientes e modernas.',
            is_published: true
          });

          // Seed Course
          const courseId = '99999999-9999-9999-9999-999999999999';
          await supabase.from('courses').upsert({
            id: courseId,
            title: 'Desenvolvimento Web Full Stack',
            description: 'Torne-se um desenvolvedor completo, do frontend ao backend e DevOps.',
            is_published: true
          });

          // Link Path & Course
          await supabase.from('path_courses').upsert({
            path_id: pathId,
            course_id: courseId,
            order_index: 1
          });

          // Seed Module
          const moduleId = '00000000-0000-0000-0000-000000000000';
          await supabase.from('modules').upsert({
            id: moduleId,
            course_id: courseId,
            title: 'Módulo 1: Introdução Básica',
            order_index: 1
          });

          // Seed Lesson
          const defaultBlocks = [
            {
              id: 'block-text-1',
              type: 'text',
              content: 'Bem-vindo ao curso! Nesta aula estudaremos como a arquitetura do EAD está conectada.',
              styles: { align: 'left', fontSize: 'medium' }
            },
            {
              id: 'block-video-1',
              type: 'video',
              url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              provider: 'youtube'
            },
            {
              id: 'block-quiz-1',
              type: 'quiz',
              question: 'Qual banco de dados relacional é utilizado no Supabase?',
              options: [
                { id: 'opt-pg-1', text: 'PostgreSQL', isCorrect: true, feedback: 'Correto! O Supabase é construído sobre o PostgreSQL.' },
                { id: 'opt-pg-2', text: 'MongoDB', isCorrect: false, feedback: 'Incorreto! MongoDB é NoSQL.' }
              ]
            }
          ] as AnyBlock[];

          await supabase.from('lessons').upsert({
            id: activeLessonId,
            module_id: moduleId,
            title: '1. Introdução à Plataforma Híbrida',
            order_index: 1,
            is_published: true,
            blocks: defaultBlocks
          });

          setBlocks(defaultBlocks);
          console.log('Auto-seed realizado com sucesso!');
        }
      } catch (err) {
        console.error('Erro na inicialização do Supabase:', err);
        setSaveStatus('error');
      } finally {
        setIsLoaded(true);
      }
    };

    initDatabase();
  }, [activeLessonId]);

  // 2. Debounced Save para salvar no Supabase ao alterar blocos
  useEffect(() => {
    if (!isLoaded) return; // Não salvar durante a carga inicial

    setSaveStatus('saving');

    const timer = setTimeout(async () => {
      try {
        console.log('Salvando blocos no Supabase...', state.blocks);
        const { error: saveErr } = await supabase
          .from('lessons')
          .upsert({
            id: activeLessonId,
            module_id: '00000000-0000-0000-0000-000000000000',
            title: '1. Introdução à Plataforma Híbrida',
            order_index: 1,
            is_published: true,
            blocks: state.blocks
          });

        if (saveErr) throw saveErr;

        setSaveStatus('saved');
        const resetTimer = setTimeout(() => setSaveStatus('idle'), 2000);
        return () => clearTimeout(resetTimer);
      } catch (err) {
        console.error('Erro ao salvar no Supabase:', err);
        setSaveStatus('error');
      }
    }, 1500); // 1.5s de debounce

    return () => clearTimeout(timer);
  }, [state.blocks, activeLessonId, isLoaded]);

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
        saveStatus,
        activeLessonId,
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
