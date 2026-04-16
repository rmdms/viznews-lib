import type { DesignTokens } from "./design-tokens";

export function tokensToCSSVariables(tokens: DesignTokens): string {
  return [
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
  ].join("\n");
}
