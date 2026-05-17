import { z } from 'zod';
import { TextBlockSchema } from './text.js';
import { VideoBlockSchema } from './video.js';
import { QuizBlockSchema } from './quiz.js';

export * from './text.js';
export * from './video.js';
export * from './quiz.js';

// União discriminada baseada na propriedade 'type'
export const AnyBlockSchema = z.discriminatedUnion('type', [
  TextBlockSchema,
  VideoBlockSchema,
  QuizBlockSchema,
]);

export type AnyBlock = z.infer<typeof AnyBlockSchema>;

// O esquema de uma aula inteira (usado para salvar no DB na coluna JSONB)
export const CourseLessonContentSchema = z.object({
  blocks: z.array(AnyBlockSchema),
}).strict();

export type CourseLessonContent = z.infer<typeof CourseLessonContentSchema>;

export * from './database.js';
