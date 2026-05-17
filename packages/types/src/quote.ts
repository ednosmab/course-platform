import { z } from 'zod';
import { BlockLayoutSchema } from './layout';

export const QuoteBlockSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('quote'),
  content: z.string(),
  author: z.string().optional(),
  styles: z.object({
    align: z.enum(['left', 'center', 'right', 'justify']).optional(),
    color: z.string().optional(),
    fontSize: z.enum(['small', 'medium', 'large', 'xlarge']).optional(),
    fontFamily: z.string().optional(),
    bold: z.boolean().optional(),
    italic: z.boolean().optional(),
    backgroundColor: z.string().optional(),
    backgroundImage: z.string().optional(),
    width: z.string().optional(),
    height: z.string().optional(),
  }).strict().optional(),
  layout: BlockLayoutSchema,
}).strict();

export type QuoteBlock = z.infer<typeof QuoteBlockSchema>;
