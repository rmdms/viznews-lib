import { z } from "zod";
const MapTypeSchema = z.enum([
  "choropleth",
  "proportional-symbol",
  "dot",
  "heatmap",
  "flow",
  "interactive",
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
  steps: z.number().optional(),
});
const BoundsSchema = z.object({
  west: z.number(),
  south: z.number(),
  east: z.number(),
  north: z.number(),
});
const SourceSchema = z.object({
  label: z.string(),
  url: z.string().optional(),
});
const DataSourceSchema = z.union([
  z.object({
    geojsonUrl: z.string(),
    joinKey: z.string().optional(),
    attributes: z
      .object({ csvUrl: z.string(), valueColumn: z.string() })
      .optional(),
  }),
  z.object({
    csvUrl: z.string(),
    lonColumn: z.string(),
    latColumn: z.string(),
    valueColumn: z.string().optional(),
  }),
]);
export const SpatialIntentSchema = z.object({
  mapType: MapTypeSchema,
  title: z.string(),
  subtitle: z.string().optional(),
  source: SourceSchema,
  byline: z.string().optional(),
  baseStyle: z.enum([
    "DATAVIZ.LIGHT",
    "DATAVIZ.DARK",
    "STREETS.LIGHT",
    "BASIC",
  ]),
  data: DataSourceSchema,
  palette: PaletteSchema,
  bounds: BoundsSchema,
  legend: z.object({ title: z.string(), format: z.string().optional() }),
  altText: z.string(),
  locale: z.enum(["fr-CH", "fr-FR", "en-US", "en-GB", "de-CH"]),
  interactions: z
    .object({
      popupOnHover: z.boolean().optional(),
      flyToOnClick: z.boolean().optional(),
    })
    .optional(),
});
export type SpatialIntent = z.infer<typeof SpatialIntentSchema>;
