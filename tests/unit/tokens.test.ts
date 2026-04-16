import { describe, it, expect } from "bun:test";
import { DesignTokensSchema } from "../../src/lib/core/schemas/design-tokens";
import { defaultTokens } from "../../src/lib/core/design-tokens";
import { tokensToCSSVariables } from "../../src/lib/core/harmonize";

describe("DesignTokensSchema", () => {
  it("accepts defaultTokens()", () => {
    const parsed = DesignTokensSchema.parse(defaultTokens());
    expect(parsed.locale).toBe("fr-CH");
    expect(parsed.palette.scheme).toBe("viridis");
  });

  it("accepts dark mode", () => {
    const parsed = DesignTokensSchema.parse(defaultTokens({ mode: "dark" }));
    expect(parsed.mode).toBe("dark");
  });

  it("rejects invalid locale", () => {
    const invalid = { ...defaultTokens(), locale: "xx-XX" };
    expect(() => DesignTokensSchema.parse(invalid)).toThrow();
  });

  it("rejects missing palette.background", () => {
    const bad = defaultTokens();
    // @ts-expect-error intentional deletion
    delete bad.palette.background;
    expect(() => DesignTokensSchema.parse(bad)).toThrow();
  });

  it("accepts custom palette with customColors", () => {
    const t = defaultTokens();
    t.palette.scheme = "custom";
    t.palette.customColors = ["#ff0000", "#00ff00"];
    expect(() => DesignTokensSchema.parse(t)).not.toThrow();
  });
});

describe("tokensToCSSVariables", () => {
  it("returns CSS custom property lines", () => {
    const css = tokensToCSSVariables(defaultTokens());
    expect(css).toContain("--vn-color-bg: #ffffff");
    expect(css).toContain("--vn-color-fg: #111111");
    expect(css).toContain("--vn-color-accent: #156964");
    expect(css).toContain("--vn-font-body:");
    expect(css).toContain("--vn-font-size: 17px");
    expect(css).toContain("--vn-spacing: 8px");
  });

  it("is deterministic", () => {
    const a = tokensToCSSVariables(defaultTokens());
    const b = tokensToCSSVariables(defaultTokens());
    expect(a).toBe(b);
  });

  it("reflects dark mode values", () => {
    const dark = defaultTokens({ mode: "dark" });
    dark.palette.background = "#0a0a0a";
    const css = tokensToCSSVariables(dark);
    expect(css).toContain("--vn-color-bg: #0a0a0a");
  });
});
