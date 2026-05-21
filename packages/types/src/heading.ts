import { z } from 'zod';
import { BlockLayoutsSchema } from './layout';

export const HeadingBlockSchema = z.object({
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
}).strict();

export type HeadingBlock = z.infer<typeof HeadingBlockSchema>;
