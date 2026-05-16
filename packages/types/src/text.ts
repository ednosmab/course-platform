import { z } from 'zod';

export const TextBlockSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('text'),
  content: z.string(),
  styles: z.object({
    align: z.enum(['left', 'center', 'right', 'justify']).optional(),
    color: z.string().optional(),
    fontSize: z.enum(['small', 'medium', 'large', 'xlarge']).optional(),
  }).strict().optional(),
}).strict();

export type TextBlock = z.infer<typeof TextBlockSchema>;
