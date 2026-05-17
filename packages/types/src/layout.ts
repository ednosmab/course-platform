import { z } from 'zod';

// Schema de posicionamento livre (estilo Canva)
export const BlockLayoutSchema = z.object({
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  zIndex: z.number().default(0),
}).optional();

export type BlockLayout = z.infer<typeof BlockLayoutSchema>;
