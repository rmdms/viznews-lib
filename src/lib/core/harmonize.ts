import type { DesignTokens } from "./design-tokens";
import type { ResolvedTokens } from "./apply-positioning";

const RADIUS_PX: Record<"sharp" | "soft" | "rounded", string> = {
  sharp: "0",
  soft: "4px",
  rounded: "12px",
};

const SHADOW_CSS: Record<"none" | "subtle" | "dramatic", string> = {
  none: "none",
  subtle: "0 1px 2px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)",
  dramatic: "0 8px 24px rgba(0,0,0,0.12), 0 16px 48px rgba(0,0,0,0.08)",
};

const BORDER_CSS: Record<"none" | "hairline" | "emphatic", string> = {
  none: "none",
  hairline: "1px solid color-mix(in srgb, var(--vn-color-fg) 12%, transparent)",
  emphatic: "2px solid var(--vn-color-fg)",
};

const OVERLAY_CSS: Record<
  "none" | "darken-20" | "darken-50" | "gradient-bottom",
  string
> = {
  none: "transparent",
  "darken-20": "rgba(0,0,0,0.2)",
  "darken-50": "rgba(0,0,0,0.5)",
  "gradient-bottom":
    "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.65) 100%)",
};

const RHYTHM_GAP: Record<"dense" | "tight" | "balanced" | "airy", string> = {
  dense: "calc(var(--vn-spacing) * 2)",
  tight: "calc(var(--vn-spacing) * 3)",
  balanced: "calc(var(--vn-spacing) * 5)",
  airy: "calc(var(--vn-spacing) * 8)",
};

export function tokensToCSSVariables(
  tokens: DesignTokens | ResolvedTokens,
): string {
  const lines = [
    `--vn-color-bg: ${tokens.palette.background};`,
    `--vn-color-fg: ${tokens.palette.foreground};`,
    `--vn-color-muted: ${tokens.palette.muted};`,
    `--vn-color-accent: ${tokens.palette.accent};`,
    `--vn-font-body: ${tokens.typography.bodyFontFamily};`,
    `--vn-font-heading: ${tokens.typography.headingFontFamily};`,
    `--vn-font-mono: ${tokens.typography.monoFontFamily};`,
    `--vn-font-size: ${tokens.typography.baseSize}px;`,
    `--vn-font-scale: ${tokens.typography.scale};`,
    `--vn-spacing: ${tokens.spacing.unit}px;`,
  ];
  // v3 derived tokens (emitted when resolved; ResolvedTokens has them non-optional)
  if (tokens.radius) lines.push(`--vn-radius: ${RADIUS_PX[tokens.radius]};`);
  if (tokens.shadow) lines.push(`--vn-shadow: ${SHADOW_CSS[tokens.shadow]};`);
  if (tokens.border) lines.push(`--vn-border: ${BORDER_CSS[tokens.border]};`);
  if (tokens.overlay)
    lines.push(`--vn-overlay: ${OVERLAY_CSS[tokens.overlay]};`);
  if (tokens.layoutRhythm)
    lines.push(`--vn-layout-rhythm-gap: ${RHYTHM_GAP[tokens.layoutRhythm]};`);
  return lines.join("\n");
}
