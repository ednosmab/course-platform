import { z } from 'zod';

export const QuizOptionSchema = z.object({
  id: z.string().uuid(),
  text: z.string(),
  isCorrect: z.boolean(),
  feedback: z.string().optional(), // Explicação exibida após a escolha (acerto ou erro)
}).strict();

export const QuizBlockSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('quiz'),
  question: z.string(),
  options: z.array(QuizOptionSchema).min(2),
}).strict();

export type QuizOption = z.infer<typeof QuizOptionSchema>;
export type QuizBlock = z.infer<typeof QuizBlockSchema>;
