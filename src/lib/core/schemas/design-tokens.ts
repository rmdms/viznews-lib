import { z } from "zod";

export const LocaleSchema = z.enum([
  "fr-CH",
  "fr-FR",
  "en-US",
  "en-GB",
  "de-CH",
]);

export const PaletteSchema = z.object({
  scheme: z.enum([
    "viridis",
    "okabe-ito",
    "tol-bright",
    "category10",
    "custom",
  ]),
  customColors: z.array(z.string()).optional(),
  background: z.string(),
  foreground: z.string(),
  muted: z.string(),
  accent: z.string(),
});

export const TypographySchema = z.object({
  bodyFontFamily: z.string(),
  headingFontFamily: z.string(),
  monoFontFamily: z.string(),
  baseSize: z.number(),
  scale: z.number(),
});

export const SpacingSchema = z.object({ unit: z.number() });

export const SourceStyleSchema = z.object({
  format: z.enum(["inline", "footnote", "panel"]),
  prefix: z.string(),
});

// v3 additions
export const PositioningSchema = z.enum([
  "editorial-tight",
  "balanced",
  "airy-contemplative",
  "dashboard-dense",
]);

export const LayoutRhythmSchema = z.enum([
  "dense",
  "tight",
  "balanced",
  "airy",
]);
export const RadiusSchema = z.enum(["sharp", "soft", "rounded"]);
export const ShadowSchema = z.enum(["none", "subtle", "dramatic"]);
export const BorderSchema = z.enum(["none", "hairline", "emphatic"]);
export const OverlaySchema = z.enum([
  "none",
  "darken-20",
  "darken-50",
  "gradient-bottom",
]);

export const BreakpointsSchema = z
  .object({
    mobile: z.literal(768),
    tablet: z.literal(1024),
  })
  .default({ mobile: 768, tablet: 1024 });

export const DesignTokensSchema = z.object({
  locale: LocaleSchema,
  palette: PaletteSchema,
  typography: TypographySchema,
  spacing: SpacingSchema,
  sourceStyle: SourceStyleSchema,
  mode: z.enum(["light", "dark"]),
  // v3 additions
  positioning: PositioningSchema.default("balanced"),
  layoutRhythm: LayoutRhythmSchema.optional(),
  radius: RadiusSchema.optional(),
  shadow: ShadowSchema.optional(),
  border: BorderSchema.optional(),
  overlay: OverlaySchema.optional(),
  breakpoints: BreakpointsSchema,
});

export type DesignTokens = z.infer<typeof DesignTokensSchema>;
export type Positioning = z.infer<typeof PositioningSchema>;
export type LayoutRhythm = z.infer<typeof LayoutRhythmSchema>;
export type Radius = z.infer<typeof RadiusSchema>;
export type Shadow = z.infer<typeof ShadowSchema>;
export type Border = z.infer<typeof BorderSchema>;
export type Overlay = z.infer<typeof OverlaySchema>;
