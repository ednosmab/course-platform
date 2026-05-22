import { z } from 'zod';

export const ViewportLayoutSchema = z.object({
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  zIndex: z.number().default(0),
});

export type ViewportLayout = z.infer<typeof ViewportLayoutSchema>;

export const BlockLayoutsSchema = z.object({
  desktop: ViewportLayoutSchema.optional(),
  tablet: ViewportLayoutSchema.optional(),
  mobile: ViewportLayoutSchema.optional(),
  isTest: z.boolean().optional(),
}).optional();

export type BlockLayouts = z.infer<typeof BlockLayoutsSchema>;
