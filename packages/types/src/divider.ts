import { z } from 'zod';
import { BlockLayoutsSchema } from './layout';

export const DividerBlockSchema = z.object({
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
}).strict();

export type DividerBlock = z.infer<typeof DividerBlockSchema>;
