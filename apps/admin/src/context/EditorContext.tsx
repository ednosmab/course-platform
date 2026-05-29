'use client';

import React, { createContext, useContext, useReducer, useState, useEffect, useCallback } from 'react';
import { AnyBlock } from '@projeto/types';
import { LessonService, CourseService } from '@projeto/core';
import type { EditorModeConfig, EditorBlockType } from './editor-modes';
import { DEFAULT_CERT_WIDTH, DEFAULT_CERT_HEIGHT } from './editor-modes';

interface EditorState {
  blocks: AnyBlock[];
  activeBlockId: string | null;
  selectedBlockIds: string[];
  history: AnyBlock[][];
  historyIndex: number;
  previewMode: boolean;
  viewportMode: 'desktop' | 'tablet' | 'mobile';
  activeSide: 'front' | 'back';
}

type EditorAction =
  | { type: 'ADD_BLOCK'; payload: { type: EditorBlockType } }
  | { type: 'REMOVE_BLOCK'; payload: { id: string } }
  | { type: 'REMOVE_BLOCKS'; payload: { ids: string[] } }
  | { type: 'UPDATE_BLOCK'; payload: { id: string; updates: Partial<AnyBlock> } }
  | { type: 'UPDATE_BLOCK_SILENT'; payload: { id: string; updates: Partial<AnyBlock> } }
  | { type: 'MOVE_BLOCK'; payload: { fromIndex: number; toIndex: number } }
  | { type: 'SET_ACTIVE_BLOCK'; payload: { id: string | null } }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SET_BLOCKS'; payload: { blocks: AnyBlock[] } }
  | { type: 'DUPLICATE_BLOCK'; payload: { id: string } }
  | { type: 'REORDER_BLOCKS'; payload: { blocks: AnyBlock[] } }
  | { type: 'SET_SELECTED_BLOCKS'; payload: { ids: string[] } }
  | { type: 'TOGGLE_SELECT_BLOCK'; payload: { id: string } }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_PREVIEW_MODE'; payload: { active: boolean } }
  | { type: 'SET_VIEWPORT_MODE'; payload: { mode: 'desktop' | 'tablet' | 'mobile' } }
  | { type: 'SET_ACTIVE_SIDE'; payload: { side: 'front' | 'back' } };

const initialState: EditorState = {
  blocks: [],
  activeBlockId: null,
  selectedBlockIds: [],
  history: [[]],
  historyIndex: 0,
  previewMode: false,
  viewportMode: 'desktop',
  activeSide: 'front',
};

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  const updateHistory = (newBlocks: AnyBlock[], nextActiveId: string | null = state.activeBlockId, nextSelected: string[] = state.selectedBlockIds): EditorState => {
    const nextHistory = state.history.slice(0, state.historyIndex + 1);
    nextHistory.push(newBlocks);
    return {
      ...state,
      blocks: newBlocks,
      activeBlockId: nextActiveId,
      selectedBlockIds: nextSelected,
      history: nextHistory,
      historyIndex: nextHistory.length - 1,
    };
  };

  switch (action.type) {
    case 'ADD_BLOCK': {
      const id = crypto.randomUUID();
      let newBlock: AnyBlock;

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

      if (newBlock) {
        (newBlock as any).styles = {
          ...((newBlock as any).styles || {}),
          side: state.activeSide || 'front',
        };
      }

      const newBlocks = [...state.blocks, newBlock];
      return updateHistory(newBlocks, id);
    }

    case 'REMOVE_BLOCK': {
      const newBlocks = state.blocks.filter((b) => b.id !== action.payload.id);
      const nextActiveId = state.activeBlockId === action.payload.id ? null : state.activeBlockId;
      const nextSelected = state.selectedBlockIds.filter((s) => s !== action.payload.id);
      return updateHistory(newBlocks, nextActiveId, nextSelected);
    }

    case 'REMOVE_BLOCKS': {
      const ids = action.payload.ids;
      const idSet = new Set(ids);
      const newBlocks = state.blocks.filter((b) => !idSet.has(b.id));
      const nextActiveId = state.activeBlockId && idSet.has(state.activeBlockId) ? null : state.activeBlockId;
      const nextSelected = state.selectedBlockIds.filter((s) => !idSet.has(s));
      return updateHistory(newBlocks, nextActiveId, nextSelected);
    }

    case 'DUPLICATE_BLOCK': {
      const source = state.blocks.find((b) => b.id === action.payload.id);
      if (!source) return state;
      const newId = crypto.randomUUID();
      const maxZ = state.blocks.reduce((max, b) => Math.max(max, b.layouts?.desktop?.zIndex ?? 0), -1);
      const offset = 20;
      const cloneLayouts = (layouts: typeof source.layouts) => {
        if (!layouts) return undefined;
        const clone: Record<string, any> = {};
        for (const [vp, l] of Object.entries(layouts)) {
          if (l && typeof l === 'object') {
            clone[vp] = { ...l, x: l.x + offset, y: l.y + offset, zIndex: maxZ + 1 };
          } else {
            clone[vp] = l;
          }
        }
        return clone as typeof source.layouts;
      };
      const newBlock: AnyBlock = { ...source, id: newId, layouts: cloneLayouts(source.layouts) };
      const idx = state.blocks.findIndex((b) => b.id === action.payload.id);
      const newBlocks = [...state.blocks];
      newBlocks.splice(idx + 1, 0, newBlock);
      return updateHistory(newBlocks, newId);
    }

    case 'UPDATE_BLOCK': {
      const newBlocks = state.blocks.map((b) => {
        if (b.id !== action.payload.id) return b;
        return { ...b, ...action.payload.updates } as AnyBlock;
      });
      return updateHistory(newBlocks);
    }

    case 'UPDATE_BLOCK_SILENT': {
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

    case 'SET_SELECTED_BLOCKS': {
      return { ...state, selectedBlockIds: action.payload.ids };
    }

    case 'TOGGLE_SELECT_BLOCK': {
      const id = action.payload.id;
      const exists = state.selectedBlockIds.includes(id);
      const next = exists ? state.selectedBlockIds.filter((s) => s !== id) : [...state.selectedBlockIds, id];
      return { ...state, selectedBlockIds: next, activeBlockId: id };
    }

    case 'CLEAR_SELECTION': {
      return { ...state, selectedBlockIds: [] };
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

    case 'SET_ACTIVE_SIDE': {
      return {
        ...state,
        activeSide: action.payload.side,
        activeBlockId: null,
        selectedBlockIds: [],
      };
    }

    default:
      return state;
  }
}

interface EditorContextType extends EditorState {
  addBlock: (type: EditorBlockType) => void;
  removeBlock: (id: string) => void;
  removeBlocks: (ids: string[]) => void;
  updateBlock: (id: string, updates: Partial<AnyBlock>) => void;
  updateBlockSilent: (id: string, updates: Partial<AnyBlock>) => void;
  moveBlock: (fromIndex: number, toIndex: number) => void;
  duplicateBlock: (id: string) => void;
  setActiveBlockId: (id: string | null) => void;
  setSelectedBlocks: (ids: string[]) => void;
  toggleSelectBlock: (id: string) => void;
  clearSelection: () => void;
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
  saveContent: () => Promise<void>;
  courseId: string;
  courseTitle: string;
  moduleTitle: string;
  lessonTitle: string;
  mode: 'lesson' | 'certificate';
  allowedBlockTypes: Set<EditorBlockType>;
  certDesignWidth: number;
  certDesignHeight: number;
  certDesignChosen: boolean;
  setCertDesignSize: (width: number, height: number) => void;
  certIsDoubleSided: boolean;
  setCertIsDoubleSided: (val: boolean) => void;
  setActiveSide: (side: 'front' | 'back') => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{
  children: React.ReactNode;
  lessonId?: string;
  courseId?: string;
  mode?: 'lesson' | 'certificate';
  modeConfig: EditorModeConfig;
}> = ({ children, lessonId, courseId: initialCourseId, mode = 'lesson', modeConfig }) => {
  const [state, dispatch] = useReducer(editorReducer, initialState);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [activeLessonId] = useState(lessonId || '11111111-1111-1111-1111-111111111111');
  const [isLoaded, setIsLoaded] = useState(false);
  const [lessonMeta, setLessonMeta] = useState<{ module_id: string; title: string; order_index: number } | null>(null);
  const [courseId, setCourseId] = useState(initialCourseId || '');
  const [courseTitle, setCourseTitle] = useState('');
  const [moduleTitle, setModuleTitle] = useState('');
  const [certIsDoubleSided, setCertIsDoubleSided] = useState(false);

  const addBlock = useCallback((type: EditorBlockType) => dispatch({ type: 'ADD_BLOCK', payload: { type } }), []);
  const removeBlock = useCallback((id: string) => dispatch({ type: 'REMOVE_BLOCK', payload: { id } }), []);
  const removeBlocks = useCallback((ids: string[]) => dispatch({ type: 'REMOVE_BLOCKS', payload: { ids } }), []);
  const duplicateBlock = useCallback((id: string) => dispatch({ type: 'DUPLICATE_BLOCK', payload: { id } }), []);
  const setSelectedBlocks = useCallback((ids: string[]) => dispatch({ type: 'SET_SELECTED_BLOCKS', payload: { ids } }), []);
  const toggleSelectBlock = useCallback((id: string) => dispatch({ type: 'TOGGLE_SELECT_BLOCK', payload: { id } }), []);
  const clearSelection = useCallback(() => dispatch({ type: 'CLEAR_SELECTION' }), []);
  const updateBlock = useCallback((id: string, updates: Partial<AnyBlock>) => dispatch({ type: 'UPDATE_BLOCK', payload: { id, updates } }), []);
  const moveBlock = useCallback((fromIndex: number, toIndex: number) => dispatch({ type: 'MOVE_BLOCK', payload: { fromIndex, toIndex } }), []);
  const setActiveBlockId = useCallback((id: string | null) => dispatch({ type: 'SET_ACTIVE_BLOCK', payload: { id } }), []);
  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), []);
  const setBlocks = useCallback((blocks: AnyBlock[]) => dispatch({ type: 'SET_BLOCKS', payload: { blocks } }), []);
  const reorderBlocks = useCallback((blocks: AnyBlock[]) => dispatch({ type: 'REORDER_BLOCKS', payload: { blocks } }), []);
  const setPreviewMode = useCallback((active: boolean) => dispatch({ type: 'SET_PREVIEW_MODE', payload: { active } }), []);
  const setViewportMode = useCallback((mode: 'desktop' | 'tablet' | 'mobile') => dispatch({ type: 'SET_VIEWPORT_MODE', payload: { mode } }), []);
  const updateBlockSilent = useCallback((id: string, updates: Partial<AnyBlock>) => dispatch({ type: 'UPDATE_BLOCK_SILENT', payload: { id, updates } }), []);

  const [certDesignWidth, setCertDesignWidth] = useState(DEFAULT_CERT_WIDTH);
  const [certDesignHeight, setCertDesignHeight] = useState(DEFAULT_CERT_HEIGHT);
  const [certDesignChosen, setCertDesignChosen] = useState(false);
  const setCertDesignSize = useCallback((width: number, height: number) => {
    setCertDesignWidth(width);
    setCertDesignHeight(height);
    setCertDesignChosen(true);
  }, []);

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  /**
   * Computes the entity ID for the current editing context.
   * In lesson mode this is the lesson ID; in certificate mode it is the course ID.
   */
  const entityId: string = mode === 'certificate' ? (courseId || initialCourseId || '') : activeLessonId;

  // 1. Carregamento inicial via modeConfig.load()
  useEffect(() => {
    const initDatabase = async () => {
      try {
        const result = await modeConfig.load({
          courseId: initialCourseId || courseId,
          lessonId: activeLessonId,
        });
        if (result.blocks && result.blocks.length > 0) {
          setBlocks(result.blocks);
        }
        if (result.courseTitle) {
          setCourseTitle(result.courseTitle);
          if (initialCourseId) setCourseId(initialCourseId);
        }
        if (result.certMeta) {
          setCertDesignWidth(result.certMeta.designWidth);
          setCertDesignHeight(result.certMeta.designHeight);
          setCertIsDoubleSided(!!result.certMeta.isDoubleSided);
          setCertDesignChosen(true);
        } else if (mode === 'certificate' && result.blocks.length > 0) {
          setCertDesignChosen(true);
        }
        if (result.lessonMeta) {
          setLessonMeta(result.lessonMeta);
        } else if (mode === 'lesson' && activeLessonId === '11111111-1111-1111-1111-111111111111') {
          // Demo lesson fallback: seed data when no blocks were found
          const defaultBlocks = [
            { id: crypto.randomUUID(), type: 'text', content: 'Bem-vindo ao curso! Nesta aula estudaremos como a arquitetura do EAD está conectada.', styles: { align: 'left', fontSize: 'medium' }, layouts: { desktop: { x: 40, y: 40, w: 700, h: 80, zIndex: 0 }, tablet: { x: 40, y: 40, w: 700, h: 80, zIndex: 0 }, mobile: { x: 40, y: 40, w: 700, h: 80, zIndex: 0 } } },
            { id: crypto.randomUUID(), type: 'video', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', provider: 'youtube', layouts: { desktop: { x: 40, y: 160, w: 700, h: 380, zIndex: 1 }, tablet: { x: 40, y: 160, w: 700, h: 380, zIndex: 1 }, mobile: { x: 40, y: 160, w: 700, h: 380, zIndex: 1 } } },
            { id: crypto.randomUUID(), type: 'quiz', question: 'Qual banco de dados relacional é utilizado no Supabase?', options: [{ id: crypto.randomUUID(), text: 'PostgreSQL', isCorrect: true, feedback: 'Correto! O Supabase é construído sobre o PostgreSQL.' }, { id: crypto.randomUUID(), text: 'MongoDB', isCorrect: false, feedback: 'Incorreto! MongoDB é NoSQL.' }], layouts: { desktop: { x: 40, y: 580, w: 700, h: 240, zIndex: 2 }, tablet: { x: 40, y: 580, w: 700, h: 240, zIndex: 2 }, mobile: { x: 40, y: 580, w: 700, h: 240, zIndex: 2 } } },
          ] as AnyBlock[];

          await CourseService.seedDemoData({
            pathId: '88888888-8888-8888-8888-888888888888',
            courseId: '99999999-9999-9999-9999-999999999999',
            moduleId: '00000000-0000-0000-0000-000000000000',
            activeLessonId,
            blocks: defaultBlocks,
          });

          setBlocks(defaultBlocks);
          setLessonMeta({ module_id: '00000000-0000-0000-0000-000000000000', title: '1. Introdução à Plataforma Híbrida', order_index: 1 });
        } else if (mode === 'lesson' && !result.lessonMeta) {
          setLessonMeta({ module_id: '', title: 'Nova aula', order_index: 1 });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : typeof err === 'object' && err !== null ? JSON.stringify(err) : String(err);
        console.error(`EditorProvider init error [mode=${mode}, lessonId=${activeLessonId}]: ${msg}`);
        setSaveStatus('error');
      } finally {
        setIsLoaded(true);
      }
    };

    initDatabase();
  }, [activeLessonId, mode, initialCourseId]);

  // 1b. Breadcrumb meta (only for lesson mode)
  useEffect(() => {
    if (!modeConfig.fetchBreadcrumb || !lessonMeta?.module_id) return;
    (async () => {
      const meta = await LessonService.getBreadcrumbMeta(lessonMeta.module_id);
      if (meta) {
        setModuleTitle(meta.moduleTitle);
        setCourseId(meta.courseId);
        setCourseTitle(meta.courseTitle);
      }
    })();
  }, [lessonMeta?.module_id, modeConfig.fetchBreadcrumb]);

  // 2. Debounced Auto-Save (500ms debounce as per admin_canvas_plan.md)
  useEffect(() => {
    if (!isLoaded) return;

    if (modeConfig.fetchBreadcrumb && !lessonMeta?.module_id) {
      return;
    }

    setSaveStatus('saving');

    const timer = setTimeout(async () => {
      try {
        await modeConfig.save({
          entityId,
          blocks: state.blocks,
          lessonMeta: lessonMeta || undefined,
          certDesignWidth,
          certDesignHeight,
          certIsDoubleSided,
        });

        setSaveStatus('saved');
        const resetTimer = setTimeout(() => setSaveStatus('idle'), 2000);
        return () => clearTimeout(resetTimer);
      } catch (err) {
        const msg = err instanceof Error ? err.message : typeof err === 'object' && err !== null ? JSON.stringify(err) : String(err);
        console.error(`Failed to save draft: ${msg}`);
        setSaveStatus('error');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [state.blocks, activeLessonId, isLoaded, lessonMeta, entityId, modeConfig, certDesignWidth, certDesignHeight, certIsDoubleSided]);

  // 3. Save Content (renamed from publishLesson for semantic clarity)
  const saveContent = async () => {
    setSaveStatus('saving');

    try {
      await modeConfig.publish({
        entityId,
        blocks: state.blocks,
        lessonMeta: lessonMeta || undefined,
        certDesignWidth,
        certDesignHeight,
        certIsDoubleSided,
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      setSaveStatus('error');
      throw err;
    }
  };

  // Backward-compatible alias for components that reference publishLesson (EditorHeader)
  const publishLesson = saveContent;

  return (
    <EditorContext.Provider
      value={{
        ...state,
        addBlock,
        removeBlock,
        removeBlocks,
        duplicateBlock,
        updateBlock,
        updateBlockSilent,
        moveBlock,
        setActiveBlockId,
        setSelectedBlocks,
        toggleSelectBlock,
        clearSelection,
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
        saveContent,
        courseId,
        courseTitle,
        moduleTitle,
        lessonTitle: modeConfig.getTitle(lessonMeta || undefined),
        mode,
        allowedBlockTypes: modeConfig.allowedBlockTypes,
        certDesignWidth,
        certDesignHeight,
        certDesignChosen,
        setCertDesignSize,
        certIsDoubleSided,
        setCertIsDoubleSided,
        setActiveSide: useCallback((side: 'front' | 'back') => dispatch({ type: 'SET_ACTIVE_SIDE', payload: { side } }), []),
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
