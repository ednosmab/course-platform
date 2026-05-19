import { z } from 'zod';
import { BlockLayoutSchema } from './layout';

export const HtmlBlockSchema = z.object({
  id: z.string(),
  type: z.literal('html'),
  htmlContent: z.string(),
  styles: z.object({
    width: z.string().optional(),
    height: z.string().optional(),
  }).optional(),
  layout: BlockLayoutSchema,
}).strict();

export type HtmlBlock = z.infer<typeof HtmlBlockSchema>;
