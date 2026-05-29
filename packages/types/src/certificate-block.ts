import { z } from 'zod';
import { BlockLayoutsSchema } from './layout';

export const CertificateTextBlockSchema = z.object({
  id: z.string(),
  type: z.literal('text'),
  content: z.string(),
  styles: z.object({
    align: z.enum(['left', 'center', 'right', 'justify']).optional(),
    color: z.string().optional(),
    fontSize: z.enum(['small', 'medium', 'large', 'xlarge']).optional(),
    fontFamily: z.string().optional(),
    width: z.string().optional(),
    height: z.string().optional(),
  }).optional(),
  layouts: BlockLayoutsSchema,
}).passthrough();

export type CertificateTextBlock = z.infer<typeof CertificateTextBlockSchema>;

export const CertificateImageBlockSchema = z.object({
  id: z.string(),
  type: z.literal('image'),
  url: z.string().url().or(z.literal('')),
  alt: z.string().optional(),
  styles: z.object({
    align: z.enum(['left', 'center', 'right']).optional(),
    width: z.string().optional(),
    height: z.string().optional(),
    borderRadius: z.string().optional(),
  }).optional(),
  layouts: BlockLayoutsSchema,
}).passthrough();

export type CertificateImageBlock = z.infer<typeof CertificateImageBlockSchema>;

export const CertificateHeadingBlockSchema = z.object({
  id: z.string(),
  type: z.literal('heading'),
  content: z.string(),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(2),
  styles: z.object({
    align: z.enum(['left', 'center', 'right']).optional(),
    color: z.string().optional(),
    fontFamily: z.string().optional(),
    width: z.string().optional(),
    height: z.string().optional(),
  }).optional(),
  layouts: BlockLayoutsSchema,
}).passthrough();

export type CertificateHeadingBlock = z.infer<typeof CertificateHeadingBlockSchema>;

export const CertificateDividerBlockSchema = z.object({
  id: z.string(),
  type: z.literal('divider'),
  styles: z.object({
    color: z.string().optional(),
    thickness: z.number().min(1).max(8).default(1),
    style: z.enum(['solid', 'dashed', 'dotted']).default('solid'),
    width: z.string().optional(),
    height: z.string().optional(),
  }).optional(),
  layouts: BlockLayoutsSchema,
}).passthrough();

export type CertificateDividerBlock = z.infer<typeof CertificateDividerBlockSchema>;

export const CertificateMetaBlockSchema = z.object({
  id: z.string().optional(),
  type: z.literal('__meta__'),
  designWidth: z.number(),
  designHeight: z.number(),
}).passthrough();

export const CertificateBlockSchema = z.discriminatedUnion('type', [
  CertificateTextBlockSchema,
  CertificateImageBlockSchema,
  CertificateHeadingBlockSchema,
  CertificateDividerBlockSchema,
  CertificateMetaBlockSchema,
]);

export type CertificateBlock = z.infer<typeof CertificateBlockSchema>;

/** @description Metadata block appended to certificate_blocks array to persist design dimensions.
 *  Included in CertificateBlockSchema so CourseSchema.parse() doesn't .catch([]) the entire array.
 *  Filtered out by createCertificateModeConfig on load, injected on save. */
export interface CertificateMetaBlock {
  type: '__meta__';
  designWidth: number;
  designHeight: number;
}
