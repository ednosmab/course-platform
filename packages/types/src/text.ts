import { z } from 'zod';
import { BlockLayoutSchema } from './layout';

export const TextBlockSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('text'),
  content: z.string(),
  styles: z.object({
    align: z.enum(['left', 'center', 'right', 'justify']).optional(),
    color: z.string().optional(),
    fontSize: z.enum(['small', 'medium', 'large', 'xlarge']).optional(),
    width: z.string().optional(),
    height: z.string().optional(),
  }).strict().optional(),
  layout: BlockLayoutSchema,
}).strict();

export type TextBlock = z.infer<typeof TextBlockSchema>;
