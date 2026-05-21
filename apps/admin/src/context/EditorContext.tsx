'use client';

import React, { createContext, useContext, useReducer, useState, useEffect } from 'react';
import { AnyBlock } from '@projeto/types';
import { supabase } from '@projeto/core';

interface EditorState {
  blocks: AnyBlock[];
  activeBlockId: string | null;
  history: AnyBlock[][];
  historyIndex: number;
  previewMode: boolean;
  viewportMode: 'desktop' | 'tablet' | 'mobile';
}

type EditorAction =
  | { type: 'ADD_BLOCK'; payload: { type: 'text' | 'video' | 'quiz' | 'image' | 'html' | 'quote' | 'heading' | 'divider' } }
  | { type: 'REMOVE_BLOCK'; payload: { id: string } }
  | { type: 'UPDATE_BLOCK'; payload: { id: string; updates: Partial<AnyBlock> } }
  | { type: 'UPDATE_BLOCK_SILENT'; payload: { id: string; updates: Partial<AnyBlock> } }
  | { type: 'MOVE_BLOCK'; payload: { fromIndex: number; toIndex: number } }
  | { type: 'SET_ACTIVE_BLOCK'; payload: { id: string | null } }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SET_BLOCKS'; payload: { blocks: AnyBlock[] } }
  | { type: 'REORDER_BLOCKS'; payload: { blocks: AnyBlock[] } }
  | { type: 'SET_PREVIEW_MODE'; payload: { active: boolean } }
  | { type: 'SET_VIEWPORT_MODE'; payload: { mode: 'desktop' | 'tablet' | 'mobile' } };

const initialState: EditorState = {
  blocks: [],
  activeBlockId: null,
  history: [[]],
  historyIndex: 0,
  previewMode: false,
  viewportMode: 'desktop',
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

      // Calcula a posição Y padrão: empilha abaixo do último bloco
      const lastBlock = state.blocks[state.blocks.length - 1];
      const lastL = lastBlock?.layouts?.desktop;
      const defaultY = lastBlock ? (lastL?.y ?? 40) + (lastL?.h ?? 120) + 20 : 40;

      const maxZ = state.blocks.reduce((max, b) => {
        const z = b.layouts?.desktop?.zIndex ?? 0;
        return z > max ? z : max;
      }, -1);
      const nextZ = maxZ + 1;

      if (action.payload.type === 'text') {
        newBlock = {
          id,
          type: 'text',
          content: 'Clique aqui para editar este texto...',
          styles: { align: 'left', fontSize: 'medium' },
          layouts: { desktop: { x: 40, y: defaultY, w: 600, h: 80, zIndex: nextZ }, tablet: { x: 40, y: defaultY, w: 600, h: 80, zIndex: nextZ }, mobile: { x: 40, y: defaultY, w: 600, h: 80, zIndex: nextZ } },
        };
      } else if (action.payload.type === 'video') {
        newBlock = {
          id,
          type: 'video',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          provider: 'youtube',
          layouts: { desktop: { x: 40, y: defaultY, w: 600, h: 340, zIndex: nextZ }, tablet: { x: 40, y: defaultY, w: 600, h: 340, zIndex: nextZ }, mobile: { x: 40, y: defaultY, w: 600, h: 340, zIndex: nextZ } },
        };
      } else if (action.payload.type === 'image') {
        newBlock = {
          id,
          type: 'image',
          url: '',
          alt: 'Nova imagem',
          styles: { align: 'center' },
          layouts: { desktop: { x: 40, y: defaultY, w: 500, h: 300, zIndex: nextZ }, tablet: { x: 40, y: defaultY, w: 500, h: 300, zIndex: nextZ }, mobile: { x: 40, y: defaultY, w: 500, h: 300, zIndex: nextZ } },
        };
      } else if (action.payload.type === 'quote') {
        newBlock = {
          id,
          type: 'quote',
          content: 'Digite sua citação aqui...',
          author: 'Autor da citação',
          styles: { align: 'left', fontSize: 'medium' },
          layouts: { desktop: { x: 40, y: defaultY, w: 600, h: 100, zIndex: nextZ }, tablet: { x: 40, y: defaultY, w: 600, h: 100, zIndex: nextZ }, mobile: { x: 40, y: defaultY, w: 600, h: 100, zIndex: nextZ } },
        };
      } else if (action.payload.type === 'html') {
        newBlock = {
          id,
          type: 'html',
          htmlContent: '<div style="padding: 20px; background: #f0f0f0;">\n  <h2>Código Customizado</h2>\n</div>',
          layouts: { desktop: { x: 40, y: defaultY, w: 600, h: 120, zIndex: nextZ }, tablet: { x: 40, y: defaultY, w: 600, h: 120, zIndex: nextZ }, mobile: { x: 40, y: defaultY, w: 600, h: 120, zIndex: nextZ } },
        };
      } else if (action.payload.type === 'heading') {
        newBlock = {
          id,
          type: 'heading',
          content: 'Título',
          level: 2,
          styles: { align: 'left' },
          layouts: { desktop: { x: 40, y: defaultY, w: 600, h: 60, zIndex: nextZ }, tablet: { x: 40, y: defaultY, w: 600, h: 60, zIndex: nextZ }, mobile: { x: 40, y: defaultY, w: 600, h: 60, zIndex: nextZ } },
        };
      } else if (action.payload.type === 'divider') {
        newBlock = {
          id,
          type: 'divider',
          styles: { thickness: 1, style: 'solid' },
          layouts: { desktop: { x: 40, y: defaultY, w: 600, h: 40, zIndex: nextZ }, tablet: { x: 40, y: defaultY, w: 600, h: 40, zIndex: nextZ }, mobile: { x: 40, y: defaultY, w: 600, h: 40, zIndex: nextZ } },
        };
      } else {
        newBlock = {
          id,
          type: 'quiz',
          question: 'Digite sua pergunta de quiz aqui...',
          layouts: { desktop: { x: 40, y: defaultY, w: 600, h: 280, zIndex: nextZ }, tablet: { x: 40, y: defaultY, w: 600, h: 280, zIndex: nextZ }, mobile: { x: 40, y: defaultY, w: 600, h: 280, zIndex: nextZ } },
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
        return { ...b, ...action.payload.updates } as AnyBlock;
      });
      return updateHistory(newBlocks);
    }

    case 'UPDATE_BLOCK_SILENT': {
      // Atualiza sem criar entrada no histórico (usado durante drag)
      const newBlocks = state.blocks.map((b) => {
        if (b.id !== action.payload.id) return b;
        return { ...b, ...action.payload.updates } as AnyBlock;
      });
      return { ...state, blocks: newBlocks };
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

    case 'REORDER_BLOCKS': {
      // Atualiza blocos mantendo o activeBlockId e criando entrada no histórico
      return updateHistory(action.payload.blocks);
    }

    case 'SET_PREVIEW_MODE': {
      return {
        ...state,
        previewMode: action.payload.active,
        activeBlockId: action.payload.active ? null : state.activeBlockId,
      };
    }

    case 'SET_VIEWPORT_MODE': {
      const newMode = action.payload.mode;
      const newBlocks = state.blocks.map((block) => {
        const layouts = block.layouts || {};
        if (layouts[newMode]) return block;
        const dl = layouts.desktop;
        if (dl) {
          return { ...block, layouts: { ...layouts, [newMode]: { ...dl } } } as AnyBlock;
        }
        return block;
      });
      return { ...state, viewportMode: newMode, blocks: newBlocks };
    }

    default:
      return state;
  }
}

interface EditorContextType extends EditorState {
  addBlock: (type: 'text' | 'video' | 'quiz' | 'image' | 'html' | 'quote' | 'heading' | 'divider') => void;
  removeBlock: (id: string) => void;
  updateBlock: (id: string, updates: Partial<AnyBlock>) => void;
  updateBlockSilent: (id: string, updates: Partial<AnyBlock>) => void;
  moveBlock: (fromIndex: number, toIndex: number) => void;
  setActiveBlockId: (id: string | null) => void;
  undo: () => void;
  redo: () => void;
  setBlocks: (blocks: AnyBlock[]) => void;
  reorderBlocks: (blocks: AnyBlock[]) => void;
  setPreviewMode: (active: boolean) => void;
  setViewportMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  canUndo: boolean;
  canRedo: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  activeLessonId: string;
  publishLesson: () => Promise<void>;
  courseTitle: string;
  moduleTitle: string;
  lessonTitle: string;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: React.ReactNode; lessonId?: string }> = ({ children, lessonId }) => {
  const [state, dispatch] = useReducer(editorReducer, initialState);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [activeLessonId] = useState(lessonId || '11111111-1111-1111-1111-111111111111');
  const [isLoaded, setIsLoaded] = useState(false);
  const [lessonMeta, setLessonMeta] = useState<{ module_id: string; title: string; order_index: number } | null>(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [moduleTitle, setModuleTitle] = useState('');

  const addBlock = (type: 'text' | 'video' | 'quiz' | 'image' | 'html' | 'quote' | 'heading' | 'divider') => dispatch({ type: 'ADD_BLOCK', payload: { type } });
  const removeBlock = (id: string) => dispatch({ type: 'REMOVE_BLOCK', payload: { id } });
  const updateBlock = (id: string, updates: Partial<AnyBlock>) => dispatch({ type: 'UPDATE_BLOCK', payload: { id, updates } });
  const moveBlock = (fromIndex: number, toIndex: number) => dispatch({ type: 'MOVE_BLOCK', payload: { fromIndex, toIndex } });
  const setActiveBlockId = (id: string | null) => dispatch({ type: 'SET_ACTIVE_BLOCK', payload: { id } });
  const undo = () => dispatch({ type: 'UNDO' });
  const redo = () => dispatch({ type: 'REDO' });
  const setBlocks = (blocks: AnyBlock[]) => dispatch({ type: 'SET_BLOCKS', payload: { blocks } });
  const reorderBlocks = (blocks: AnyBlock[]) => dispatch({ type: 'REORDER_BLOCKS', payload: { blocks } });
  const setPreviewMode = (active: boolean) => dispatch({ type: 'SET_PREVIEW_MODE', payload: { active } });
  const setViewportMode = (mode: 'desktop' | 'tablet' | 'mobile') => dispatch({ type: 'SET_VIEWPORT_MODE', payload: { mode } });
  const updateBlockSilent = (id: string, updates: Partial<AnyBlock>) => dispatch({ type: 'UPDATE_BLOCK_SILENT', payload: { id, updates } });

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

const getDraftId = (lessonId: string) => {
  return lessonId.substring(0, 24) + 'dddddddddddd';
};

// 1. Carregamento inicial (e auto-seed se o banco estiver vazio)
  useEffect(() => {
    const initDatabase = async () => {
      try {
        const draftId = getDraftId(activeLessonId);
        const { data: draftLesson, error: draftErr } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', draftId)
          .maybeSingle();

        if (draftErr) throw draftErr;

        if (draftLesson) {
          setBlocks(draftLesson.blocks || []);
          setLessonMeta({ module_id: draftLesson.module_id, title: draftLesson.title, order_index: draftLesson.order_index });
        } else {
          // Se não há rascunho, tentamos carregar a publicada e clonar
          const { data: publishedLesson, error: pubErr } = await supabase
            .from('lessons')
            .select('*')
            .eq('id', activeLessonId)
            .maybeSingle();

          if (pubErr) throw pubErr;

          if (publishedLesson) {
            await supabase.from('lessons').upsert({
              id: draftId,
              module_id: publishedLesson.module_id,
              title: publishedLesson.title,
              order_index: publishedLesson.order_index,
              is_published: false,
              blocks: publishedLesson.blocks || []
            });
            setBlocks(publishedLesson.blocks || []);
            setLessonMeta({ module_id: publishedLesson.module_id, title: publishedLesson.title, order_index: publishedLesson.order_index });
          } else {
            setBlocks([]);
            // Auto-seed apenas para o lessonId padrão de desenvolvimento
            if (activeLessonId === '11111111-1111-1111-1111-111111111111') {
              const pathId = '88888888-8888-8888-8888-888888888888';
              await supabase.from('paths').upsert({ id: pathId, title: 'Trilha Full Stack Developer', description: 'Aprenda do zero ao deploy com arquiteturas resilientes e modernas.', is_published: true });
              const courseId = '99999999-9999-9999-9999-999999999999';
              await supabase.from('courses').upsert({ id: courseId, title: 'Desenvolvimento Web Full Stack', description: 'Torne-se um desenvolvedor completo, do frontend ao backend e DevOps.', is_published: true });
              await supabase.from('path_courses').upsert({ path_id: pathId, course_id: courseId, order_index: 1 });
              const moduleId = '00000000-0000-0000-0000-000000000000';
              await supabase.from('modules').upsert({ id: moduleId, course_id: courseId, title: 'Módulo 1: Introdução Básica', order_index: 1 });
              const defaultBlocks = [
                { id: crypto.randomUUID(), type: 'text', content: 'Bem-vindo ao curso! Nesta aula estudaremos como a arquitetura do EAD está conectada.', styles: { align: 'left', fontSize: 'medium' }, layouts: { desktop: { x: 40, y: 40, w: 700, h: 80, zIndex: 0 }, tablet: { x: 40, y: 40, w: 700, h: 80, zIndex: 0 }, mobile: { x: 40, y: 40, w: 700, h: 80, zIndex: 0 } } },
                { id: crypto.randomUUID(), type: 'video', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', provider: 'youtube', layouts: { desktop: { x: 40, y: 160, w: 700, h: 380, zIndex: 1 }, tablet: { x: 40, y: 160, w: 700, h: 380, zIndex: 1 }, mobile: { x: 40, y: 160, w: 700, h: 380, zIndex: 1 } } },
                { id: crypto.randomUUID(), type: 'quiz', question: 'Qual banco de dados relacional é utilizado no Supabase?', options: [{ id: crypto.randomUUID(), text: 'PostgreSQL', isCorrect: true, feedback: 'Correto! O Supabase é construído sobre o PostgreSQL.' }, { id: crypto.randomUUID(), text: 'MongoDB', isCorrect: false, feedback: 'Incorreto! MongoDB é NoSQL.' }], layouts: { desktop: { x: 40, y: 580, w: 700, h: 240, zIndex: 2 }, tablet: { x: 40, y: 580, w: 700, h: 240, zIndex: 2 }, mobile: { x: 40, y: 580, w: 700, h: 240, zIndex: 2 } } }
              ] as AnyBlock[];
              await supabase.from('lessons').upsert({ id: activeLessonId, module_id: moduleId, title: '1. Introdução à Plataforma Híbrida', order_index: 1, is_published: true, blocks: defaultBlocks });
              await supabase.from('lessons').upsert({ id: draftId, module_id: moduleId, title: '1. Introdução à Plataforma Híbrida', order_index: 1, is_published: false, blocks: defaultBlocks });
              setBlocks(defaultBlocks);
              setLessonMeta({ module_id: moduleId, title: '1. Introdução à Plataforma Híbrida', order_index: 1 });
            } else {
              setLessonMeta({ module_id: '', title: 'Nova aula', order_index: 1 });
            }
          }
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

  // 1b. Fetch course and module titles when lessonMeta changes
  useEffect(() => {
    if (!lessonMeta?.module_id) return;
    (async () => {
      const { data: mod } = await supabase.from('modules').select('title, course_id').eq('id', lessonMeta.module_id).single();
      if (mod) {
        setModuleTitle(mod.title);
        const { data: course } = await supabase.from('courses').select('title').eq('id', mod.course_id).single();
        if (course) setCourseTitle(course.title);
      }
    })();
  }, [lessonMeta?.module_id]);

  // 2. Debounced Save para salvar no Supabase ao alterar blocos (Apenas na versão Rascunho!)
  useEffect(() => {
    if (!isLoaded) return; 

    setSaveStatus('saving');

    const timer = setTimeout(async () => {
      try {
        const draftId = getDraftId(activeLessonId);
        const meta = lessonMeta || { module_id: '00000000-0000-0000-0000-000000000000', title: 'Sem título', order_index: 1 };
        const { error: saveErr } = await supabase
          .from('lessons')
          .upsert({
            id: draftId,
            module_id: meta.module_id,
            title: meta.title,
            order_index: meta.order_index,
            is_published: false,
            blocks: state.blocks
          });

        if (saveErr) throw saveErr;

        setSaveStatus('saved');
        const resetTimer = setTimeout(() => setSaveStatus('idle'), 2000);
        return () => clearTimeout(resetTimer);
      } catch (err) {
        console.error('Erro ao salvar rascunho no Supabase:', err);
        setSaveStatus('error');
      }
    }, 10000); // 10s de debounce

    return () => clearTimeout(timer);
  }, [state.blocks, activeLessonId, isLoaded, lessonMeta]);

  // 3. Função oficial de publicação (Copia o rascunho para a aula publicada de produção)
  const publishLesson = async () => {
    setSaveStatus('saving');
    const meta = lessonMeta || { module_id: '00000000-0000-0000-0000-000000000000', title: 'Sem título', order_index: 1 };

    const { data: mod, error: modErr } = await supabase
      .from('modules')
      .select('course_id')
      .eq('id', meta.module_id)
      .single();
    if (modErr || !mod) {
      setSaveStatus('error');
      throw new Error('Módulo não encontrado.');
    }

    const { data: course, error: courseErr } = await supabase
      .from('courses')
      .select('is_published')
      .eq('id', mod.course_id)
      .single();
    if (courseErr || !course) {
      setSaveStatus('error');
      throw new Error('Curso não encontrado.');
    }

    if (!course.is_published) {
      setSaveStatus('error');
      throw new Error('O curso precisa estar publicado antes de publicar aulas.');
    }

    const { error: pubErr } = await supabase
      .from('lessons')
      .upsert({
        id: activeLessonId,
        module_id: meta.module_id,
        title: meta.title,
        order_index: meta.order_index,
        is_published: true,
        blocks: state.blocks
      });

    if (pubErr) {
      setSaveStatus('error');
      throw new Error('Erro ao publicar aula.');
    }
    setSaveStatus('saved');
    const resetTimer = setTimeout(() => setSaveStatus('idle'), 2000);
  };

  return (
    <EditorContext.Provider
      value={{
        ...state,
        addBlock,
        removeBlock,
        updateBlock,
        updateBlockSilent,
        moveBlock,
        setActiveBlockId,
        undo,
        redo,
        setBlocks,
        reorderBlocks,
        setPreviewMode,
        setViewportMode,
        canUndo,
        canRedo,
        saveStatus,
        activeLessonId,
        publishLesson,
        courseTitle,
        moduleTitle,
        lessonTitle: lessonMeta?.title || 'Nova aula',
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
