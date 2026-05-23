import { z } from 'zod';
import { TextBlockSchema } from './text';
import { VideoBlockSchema } from './video';
import { QuizBlockSchema } from './quiz';
import { ImageBlockSchema } from './image';
import { HtmlBlockSchema } from './html';
import { QuoteBlockSchema } from './quote';
import { HeadingBlockSchema } from './heading';
import { DividerBlockSchema } from './divider';

export * from './text';
export * from './video';
export * from './quiz';
export * from './image';
export * from './html';
export * from './quote';
export * from './heading';
export * from './divider';
export * from './layout';

// União discriminada baseada na propriedade 'type'
export const AnyBlockSchema = z.discriminatedUnion('type', [
  TextBlockSchema,
  VideoBlockSchema,
  QuizBlockSchema,
  ImageBlockSchema,
  HtmlBlockSchema,
  QuoteBlockSchema,
  HeadingBlockSchema,
  DividerBlockSchema,
]);

export type AnyBlock = z.infer<typeof AnyBlockSchema>;

// O esquema de uma aula inteira (usado para salvar no DB na coluna JSONB)
export const CourseLessonContentSchema = z.object({
  blocks: z.array(AnyBlockSchema),
});

export type CourseLessonContent = z.infer<typeof CourseLessonContentSchema>;

export * from './certificate-block';
export * from './database';
