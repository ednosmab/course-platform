'use client';

/**
 * @description Defines the EditorModeConfig interface and factory functions for lesson
 * and certificate editing modes. This replaces inline if(mode==='certificate') branches
 * in EditorContext with a strategy object, keeping the shared editor core mode-agnostic.
 * Business rule: Each mode defines how blocks are loaded, saved, published, and titled,
 * as well as which block types are available in the palette.
 */

import { AnyBlock, CertificateMetaBlock } from '@projeto/types';
import { LessonService, CourseService } from '@projeto/core';

export type EditorBlockType = 'text' | 'video' | 'quiz' | 'image' | 'html' | 'quote' | 'heading' | 'divider';

export const A4_PRESETS = [
  { label: 'Pequeno', width: 700 },
  { label: 'Médio', width: 900 },
  { label: 'Padrão', width: 1100 },
  { label: 'Grande', width: 1300 },
] as const;

export const A4_RATIO = 1.414;
export const DEFAULT_CERT_WIDTH = 1100;
export const DEFAULT_CERT_HEIGHT = Math.round(DEFAULT_CERT_WIDTH / A4_RATIO);

export interface EditorModeConfig {
  /** Identifies the editing mode for the shared EditorProvider context */
  mode: 'lesson' | 'certificate';
  /** Load initial blocks and metadata for editing */
  load: (params: { courseId?: string; lessonId?: string }) => Promise<{
    blocks: AnyBlock[];
    courseTitle?: string;
    lessonMeta?: { module_id: string; title: string; order_index: number };
    certMeta?: { designWidth: number; designHeight: number; isDoubleSided?: boolean };
  }>;
  /** Persist current blocks (auto-save or draft) */
  save: (params: {
    entityId: string;
    blocks: AnyBlock[];
    lessonMeta?: { module_id: string; title: string; order_index: number };
    certDesignWidth?: number;
    certDesignHeight?: number;
    certIsDoubleSided?: boolean;
  }) => Promise<void>;
  /** Publish blocks (for lessons: validates course published first; for cert: same as save) */
  publish: (params: {
    entityId: string;
    blocks: AnyBlock[];
    lessonMeta?: { module_id: string; title: string; order_index: number };
    certDesignWidth?: number;
    certDesignHeight?: number;
    certIsDoubleSided?: boolean;
  }) => Promise<void>;
  /** Display title shown in the editor header breadcrumb */
  getTitle: (lessonMeta?: { title: string }) => string;
  /** Block types allowed in the palette */
  allowedBlockTypes: Set<EditorBlockType>;
  /** Whether to fetch breadcrumb metadata (module/course title) */
  fetchBreadcrumb: boolean;
}

/**
 * @description Factory for lesson editing mode. Loads/saves from LessonService,
 * supports all 8 block types, fetches breadcrumb, and provides lesson title.
 */
export function createLessonModeConfig(): EditorModeConfig {
  return {
    mode: 'lesson',
    load: async ({ lessonId }) => {
      if (!lessonId) return { blocks: [], lessonMeta: { module_id: '', title: 'Nova aula', order_index: 1 } };

      if (lessonId === '11111111-1111-1111-1111-111111111111') {
        const defaultBlocks = [
          { id: crypto.randomUUID(), type: 'text', content: 'Bem-vindo ao curso! Nesta aula estudaremos como a arquitetura do EAD está conectada.', styles: { align: 'left', fontSize: 'medium' }, layouts: { desktop: { x: 40, y: 40, w: 700, h: 80, zIndex: 0 }, tablet: { x: 40, y: 40, w: 700, h: 80, zIndex: 0 }, mobile: { x: 40, y: 40, w: 700, h: 80, zIndex: 0 } } },
          { id: crypto.randomUUID(), type: 'video', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', provider: 'youtube', layouts: { desktop: { x: 40, y: 160, w: 700, h: 380, zIndex: 1 }, tablet: { x: 40, y: 160, w: 700, h: 380, zIndex: 1 }, mobile: { x: 40, y: 160, w: 700, h: 380, zIndex: 1 } } },
          { id: crypto.randomUUID(), type: 'quiz', question: 'Qual banco de dados relacional é utilizado no Supabase?', options: [{ id: crypto.randomUUID(), text: 'PostgreSQL', isCorrect: true, feedback: 'Correto! O Supabase é construído sobre o PostgreSQL.' }, { id: crypto.randomUUID(), text: 'MongoDB', isCorrect: false, feedback: 'Incorreto! MongoDB é NoSQL.' }], layouts: { desktop: { x: 40, y: 580, w: 700, h: 240, zIndex: 2 }, tablet: { x: 40, y: 580, w: 700, h: 240, zIndex: 2 }, mobile: { x: 40, y: 580, w: 700, h: 240, zIndex: 2 } } },
        ] as AnyBlock[];

        await CourseService.seedDemoData({
          pathId: '88888888-8888-8888-8888-888888888888',
          courseId: '99999999-9999-9999-9999-999999999999',
          moduleId: '00000000-0000-0000-0000-000000000000',
          activeLessonId: lessonId,
          blocks: defaultBlocks,
        });

        return { blocks: defaultBlocks, lessonMeta: { module_id: '00000000-0000-0000-0000-000000000000', title: '1. Introdução à Plataforma Híbrida', order_index: 1 } };
      }

      const draft = await LessonService.getDraftLesson(lessonId);
      if (draft) {
        return {
          blocks: draft.blocks || [],
          lessonMeta: { module_id: draft.module_id, title: draft.title, order_index: draft.order_index },
        };
      }
      const published = await LessonService.getLesson(lessonId);
      if (published) {
        await LessonService.createDraftFromPublished(lessonId);
        return {
          blocks: published.blocks || [],
          lessonMeta: { module_id: published.module_id, title: published.title, order_index: published.order_index },
        };
      }
      return { blocks: [], lessonMeta: { module_id: '', title: 'Nova aula', order_index: 1 } };
    },
    save: async ({ entityId, blocks, lessonMeta }) => {
      const meta = lessonMeta || {
        module_id: '00000000-0000-0000-0000-000000000000',
        title: 'Sem título',
        order_index: 1,
      };
      await LessonService.saveDraft(entityId, {
        module_id: meta.module_id,
        title: meta.title,
        order_index: meta.order_index,
        blocks,
      });
    },
    publish: async ({ entityId, blocks, lessonMeta }) => {
      const meta = lessonMeta || {
        module_id: '00000000-0000-0000-0000-000000000000',
        title: 'Sem título',
        order_index: 1,
      };
      await LessonService.publishLesson(entityId, {
        module_id: meta.module_id,
        title: meta.title,
        order_index: meta.order_index,
        blocks,
      });
    },
    getTitle: (meta) => meta?.title || 'Nova aula',
    allowedBlockTypes: new Set<EditorBlockType>([
      'text', 'video', 'quiz', 'image', 'html', 'quote', 'heading', 'divider',
    ]),
    fetchBreadcrumb: true,
  };
}

const CERTIFICATE_COMPATIBLE_TYPES = new Set<EditorBlockType>(['text', 'heading', 'image', 'divider']);

/**
 * @description Factory for certificate editing mode. Loads/saves from CourseService
 * as certificate_blocks, only allows text/heading/image/divider types, and shows
 * 'Design de Certificado' as title.
 */
export function createCertificateModeConfig(): EditorModeConfig {
  return {
    mode: 'certificate',
    load: async ({ courseId }) => {
      if (!courseId) return { blocks: [], certMeta: { designWidth: DEFAULT_CERT_WIDTH, designHeight: DEFAULT_CERT_HEIGHT, isDoubleSided: false } };
      const cData = await CourseService.getCourse(courseId);
      if (!cData) return { blocks: [], certMeta: { designWidth: DEFAULT_CERT_WIDTH, designHeight: DEFAULT_CERT_HEIGHT, isDoubleSided: false } };
      const rawBlocks: AnyBlock[] = ((cData as any).certificate_blocks || []);
      const blocks = rawBlocks.filter(
        (b: AnyBlock) => CERTIFICATE_COMPATIBLE_TYPES.has(b.type as EditorBlockType),
      );
      const meta = rawBlocks.find((b: any) => b.type === '__meta__') as any;
      return {
        blocks,
        courseTitle: cData.title || '',
        certMeta: meta
          ? { designWidth: meta.designWidth, designHeight: meta.designHeight, isDoubleSided: !!meta.isDoubleSided }
          : { designWidth: DEFAULT_CERT_WIDTH, designHeight: DEFAULT_CERT_HEIGHT, isDoubleSided: false },
      };
    },
    save: async ({ entityId, blocks, certDesignWidth, certDesignHeight, certIsDoubleSided }) => {
      const sanitized = blocks.filter((b) =>
        CERTIFICATE_COMPATIBLE_TYPES.has(b.type as EditorBlockType),
      );
      const meta: any = {
        type: '__meta__',
        designWidth: certDesignWidth ?? DEFAULT_CERT_WIDTH,
        designHeight: certDesignHeight ?? DEFAULT_CERT_HEIGHT,
        isDoubleSided: !!certIsDoubleSided,
      };
      await CourseService.updateCourse(entityId, { certificate_blocks: [...sanitized, meta] } as any);
    },
    publish: async ({ entityId, blocks, certDesignWidth, certDesignHeight, certIsDoubleSided }) => {
      const sanitized = blocks.filter((b) =>
        CERTIFICATE_COMPATIBLE_TYPES.has(b.type as EditorBlockType),
      );
      const meta: any = {
        type: '__meta__',
        designWidth: certDesignWidth ?? DEFAULT_CERT_WIDTH,
        designHeight: certDesignHeight ?? DEFAULT_CERT_HEIGHT,
        isDoubleSided: !!certIsDoubleSided,
      };
      await CourseService.updateCourse(entityId, { certificate_blocks: [...sanitized, meta] } as any);
    },
    getTitle: () => 'Design de Certificado',
    allowedBlockTypes: CERTIFICATE_COMPATIBLE_TYPES,
    fetchBreadcrumb: false,
  };
}
