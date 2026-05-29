import { z } from 'zod';
import { BlockLayoutsSchema } from './layout';

export const ImageBlockSchema = z.object({
  id: z.string(),
  type: z.literal('image'),
  url: z.string().url().or(z.literal('')),
  alt: z.string().optional(),
  styles: z.object({
    align: z.enum(['left', 'center', 'right']).optional(),
    width: z.string().optional(),
    height: z.string().optional(),
    borderRadius: z.string().optional(),
    objectFit: z.enum(['cover', 'contain', 'fill']).optional(),
    isBackground: z.boolean().optional(),
    side: z.enum(['front', 'back']).optional(),
  }).optional(),
  layouts: BlockLayoutsSchema,
}).strict();

export type ImageBlock = z.infer<typeof ImageBlockSchema>;
