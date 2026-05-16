import { z } from 'zod';

export const VideoBlockSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('video'),
  url: z.string().url(),
  provider: z.enum(['youtube', 'vimeo', 'storage_supabase']),
}).strict();

export type VideoBlock = z.infer<typeof VideoBlockSchema>;
