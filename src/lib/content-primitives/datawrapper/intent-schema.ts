import { z } from "zod";

const DWChartTypeSchema = z.enum([
  "d3-bars",
  "d3-bars-split",
  "d3-bars-stacked",
  "d3-bars-bullet",
  "column-chart",
  "grouped-column-chart",
  "stacked-column-chart",
  "d3-lines",
  "d3-area",
  "d3-scatter-plot",
  "d3-dot-plot",
  "d3-range-plot",
  "d3-arrow-plot",
  "d3-pies",
  "d3-donuts",
  "d3-multiple-pies",
  "tables",
]);

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

const AnnotationSchema = z.object({
  x: z.union([z.string(), z.number()]),
  y: z.number(),
  text: z.string(),
});

const SourceSchema = z.object({
  label: z.string(),
  url: z.string().optional(),
});

export const EditorialIntentSchema = z.object({
  chartType: DWChartTypeSchema,
  title: z.string(),
  subtitle: z.string().optional(),
  source: SourceSchema,
  byline: z.string().optional(),
  data: z.object({ csv: z.string() }),
  palette: PaletteSchema,
  annotations: z.array(AnnotationSchema).optional(),
  altText: z.string(),
  locale: z.enum(["fr-CH", "fr-FR", "en-US", "en-GB", "de-CH"]),
  yAxisLabel: z.string().optional(),
  xAxisLabel: z.string().optional(),
  notes: z.string().optional(),
});

export type EditorialIntent = z.infer<typeof EditorialIntentSchema>;
