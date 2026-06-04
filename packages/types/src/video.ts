import { z } from 'zod';
import { BlockLayoutsSchema } from './layout';

export const VideoBlockSchema = z.object({
  id: z.string(),
  type: z.literal('video'),
  url: z.string(),
  provider: z.enum(['youtube', 'vimeo', 'storage_supabase']),
  styles: z.object({
    width: z.string().optional(),
    height: z.string().optional(),
  }).optional(),
  layouts: BlockLayoutsSchema,
}).strict();

export type VideoBlock = z.infer<typeof VideoBlockSchema>;
