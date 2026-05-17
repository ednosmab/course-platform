import { z } from 'zod';
import { TextBlockSchema } from './text';
import { VideoBlockSchema } from './video';
import { QuizBlockSchema } from './quiz';
import { ImageBlockSchema } from './image';
import { HtmlBlockSchema } from './html';

export * from './text';
export * from './video';
export * from './quiz';
export * from './image';
export * from './html';
export * from './layout';

// União discriminada baseada na propriedade 'type'
export const AnyBlockSchema = z.discriminatedUnion('type', [
  TextBlockSchema,
  VideoBlockSchema,
  QuizBlockSchema,
  ImageBlockSchema,
  HtmlBlockSchema,
]);

export type AnyBlock = z.infer<typeof AnyBlockSchema>;

// O esquema de uma aula inteira (usado para salvar no DB na coluna JSONB)
export const CourseLessonContentSchema = z.object({
  blocks: z.array(AnyBlockSchema),
}).strict();

export type CourseLessonContent = z.infer<typeof CourseLessonContentSchema>;

export * from './database';
