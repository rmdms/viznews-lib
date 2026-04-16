import { z } from "zod";

const PaletteSchema = z.object({
  scheme: z.enum([
    "viridis",
    "okabe-ito",
    "tol-bright",
    "category10",
    "custom",
  ]),
  customColors: z.array(z.string()).optional(),
  reverse: z.boolean().optional(),
});
const SourceSchema = z.object({
  label: z.string(),
  url: z.string().optional(),
});

export const FlourishIntentSchema = z.object({
  visualisationId: z.string().min(1),
  title: z.string(),
  alt: z.string(),
  source: SourceSchema,
  palette: PaletteSchema,
  autoplay: z.boolean().optional(),
});

export type FlourishIntent = z.infer<typeof FlourishIntentSchema>;
