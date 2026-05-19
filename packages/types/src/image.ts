import { z } from 'zod';
import { BlockLayoutSchema } from './layout';

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
  }).optional(),
  layout: BlockLayoutSchema,
}).strict();

export type ImageBlock = z.infer<typeof ImageBlockSchema>;
