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
  /** Load initial blocks and metadata for editing */
  load: (params: { courseId?: string; lessonId?: string }) => Promise<{
    blocks: AnyBlock[];
    courseTitle?: string;
    lessonMeta?: { module_id: string; title: string; order_index: number };
    certMeta?: { designWidth: number; designHeight: number };
  }>;
  /** Persist current blocks (auto-save or draft) */
  save: (params: {
    entityId: string;
    blocks: AnyBlock[];
    lessonMeta?: { module_id: string; title: string; order_index: number };
    certDesignWidth?: number;
    certDesignHeight?: number;
  }) => Promise<void>;
  /** Publish blocks (for lessons: validates course published first; for cert: same as save) */
  publish: (params: {
    entityId: string;
    blocks: AnyBlock[];
    lessonMeta?: { module_id: string; title: string; order_index: number };
    certDesignWidth?: number;
    certDesignHeight?: number;
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
    load: async ({ lessonId }) => {
      if (!lessonId) return { blocks: [] };
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
      return { blocks: [] };
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
    load: async ({ courseId }) => {
      if (!courseId) return { blocks: [], certMeta: { designWidth: DEFAULT_CERT_WIDTH, designHeight: DEFAULT_CERT_HEIGHT } };
      const cData = await CourseService.getCourse(courseId);
      if (!cData) return { blocks: [], certMeta: { designWidth: DEFAULT_CERT_WIDTH, designHeight: DEFAULT_CERT_HEIGHT } };
      const rawBlocks: AnyBlock[] = ((cData as any).certificate_blocks || []);
      const blocks = rawBlocks.filter(
        (b: AnyBlock) => CERTIFICATE_COMPATIBLE_TYPES.has(b.type as EditorBlockType),
      );
      const meta = rawBlocks.find((b: any) => b.type === '__meta__') as CertificateMetaBlock | undefined;
      return {
        blocks,
        courseTitle: cData.title || '',
        certMeta: meta
          ? { designWidth: meta.designWidth, designHeight: meta.designHeight }
          : { designWidth: DEFAULT_CERT_WIDTH, designHeight: DEFAULT_CERT_HEIGHT },
      };
    },
    save: async ({ entityId, blocks, certDesignWidth, certDesignHeight }) => {
      const sanitized = blocks.filter((b) =>
        CERTIFICATE_COMPATIBLE_TYPES.has(b.type as EditorBlockType),
      );
      const meta: CertificateMetaBlock = {
        type: '__meta__',
        designWidth: certDesignWidth ?? DEFAULT_CERT_WIDTH,
        designHeight: certDesignHeight ?? DEFAULT_CERT_HEIGHT,
      };
      await CourseService.updateCourse(entityId, { certificate_blocks: [...sanitized, meta] } as any);
    },
    publish: async ({ entityId, blocks, certDesignWidth, certDesignHeight }) => {
      const sanitized = blocks.filter((b) =>
        CERTIFICATE_COMPATIBLE_TYPES.has(b.type as EditorBlockType),
      );
      const meta: CertificateMetaBlock = {
        type: '__meta__',
        designWidth: certDesignWidth ?? DEFAULT_CERT_WIDTH,
        designHeight: certDesignHeight ?? DEFAULT_CERT_HEIGHT,
      };
      await CourseService.updateCourse(entityId, { certificate_blocks: [...sanitized, meta] } as any);
    },
    getTitle: () => 'Design de Certificado',
    allowedBlockTypes: CERTIFICATE_COMPATIBLE_TYPES,
    fetchBreadcrumb: false,
  };
}
