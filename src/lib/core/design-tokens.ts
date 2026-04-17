export type Locale = "fr-CH" | "fr-FR" | "en-US" | "en-GB" | "de-CH";
export type Positioning =
  | "editorial-tight"
  | "balanced"
  | "airy-contemplative"
  | "dashboard-dense";
export type LayoutRhythm = "dense" | "tight" | "balanced" | "airy";
export type Radius = "sharp" | "soft" | "rounded";
export type Shadow = "none" | "subtle" | "dramatic";
export type Border = "none" | "hairline" | "emphatic";
export type Overlay = "none" | "darken-20" | "darken-50" | "gradient-bottom";

export type DesignTokens = {
  locale: Locale;
  palette: {
    scheme: "viridis" | "okabe-ito" | "tol-bright" | "category10" | "custom";
    customColors?: string[];
    background: string;
    foreground: string;
    muted: string;
    accent: string;
  };
  typography: {
    bodyFontFamily: string;
    headingFontFamily: string;
    monoFontFamily: string;
    baseSize: number;
    scale: number;
  };
  spacing: { unit: number };
  sourceStyle: { format: "inline" | "footnote" | "panel"; prefix: string };
  mode: "light" | "dark";
  positioning: Positioning;
  layoutRhythm?: LayoutRhythm;
  radius?: Radius;
  shadow?: Shadow;
  border?: Border;
  overlay?: Overlay;
  breakpoints: { mobile: 768; tablet: 1024 };
};

export function defaultTokens(opts?: {
  locale?: Locale;
  mode?: "light" | "dark";
  positioning?: Positioning;
}): DesignTokens {
  return {
    locale: opts?.locale ?? "fr-CH",
    palette: {
      scheme: "viridis",
      background: "#ffffff",
      foreground: "#111111",
      muted: "#666666",
      accent: "#156964",
    },
    typography: {
      bodyFontFamily: "'Inter', system-ui, sans-serif",
      headingFontFamily: "'Inter', system-ui, sans-serif",
      monoFontFamily: "'JetBrains Mono', monospace",
      baseSize: 17,
      scale: 1.25,
    },
    spacing: { unit: 8 },
    sourceStyle: { format: "footnote", prefix: "Source : " },
    mode: opts?.mode ?? "light",
    positioning: opts?.positioning ?? "balanced",
    breakpoints: { mobile: 768, tablet: 1024 },
  };
}
