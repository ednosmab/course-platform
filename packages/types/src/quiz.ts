import { z } from 'zod';
import { BlockLayoutSchema } from './layout';

export const QuizOptionSchema = z.object({
  id: z.string().uuid(),
  text: z.string(),
  isCorrect: z.boolean(),
  feedback: z.string().optional(),
}).strict();

export const QuizBlockSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('quiz'),
  question: z.string(),
  options: z.array(QuizOptionSchema).min(2),
  styles: z.object({
    align: z.enum(['left', 'center', 'right', 'justify']).optional(),
    color: z.string().optional(),
    fontSize: z.enum(['small', 'medium', 'large', 'xlarge']).optional(),
    width: z.string().optional(),
    height: z.string().optional(),
  }).strict().optional(),
  layout: BlockLayoutSchema,
}).strict();

export type QuizOption = z.infer<typeof QuizOptionSchema>;
export type QuizBlock = z.infer<typeof QuizBlockSchema>;
