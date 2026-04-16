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

export const DesignTokensSchema = z.object({
  locale: LocaleSchema,
  palette: PaletteSchema,
  typography: TypographySchema,
  spacing: SpacingSchema,
  sourceStyle: SourceStyleSchema,
  mode: z.enum(["light", "dark"]),
});

export type DesignTokens = z.infer<typeof DesignTokensSchema>;
