export type Locale = "fr-CH" | "fr-FR" | "en-US" | "en-GB" | "de-CH";

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
};

export function defaultTokens(opts?: {
  locale?: Locale;
  mode?: "light" | "dark";
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
  };
}
