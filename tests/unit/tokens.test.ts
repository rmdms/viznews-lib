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

describe("DesignTokensSchema v3 extensions", () => {
  const base = defaultTokens();

  it("accepts positioning editorial-tight", () => {
    const t = { ...base, positioning: "editorial-tight" as const };
    expect(() => DesignTokensSchema.parse(t)).not.toThrow();
  });

  it("accepts positioning airy-contemplative", () => {
    const t = { ...base, positioning: "airy-contemplative" as const };
    expect(() => DesignTokensSchema.parse(t)).not.toThrow();
  });

  it("defaults positioning to balanced when omitted", () => {
    const parsed = DesignTokensSchema.parse(base);
    expect(parsed.positioning).toBe("balanced");
  });

  it("rejects unknown positioning value", () => {
    const t = { ...base, positioning: "zen-ultra" };
    expect(() => DesignTokensSchema.parse(t)).toThrow();
  });

  it("accepts optional radius/shadow/border/overlay/layoutRhythm", () => {
    const t = {
      ...base,
      positioning: "balanced" as const,
      radius: "soft" as const,
      shadow: "dramatic" as const,
      border: "hairline" as const,
      overlay: "darken-20" as const,
      layoutRhythm: "airy" as const,
    };
    expect(() => DesignTokensSchema.parse(t)).not.toThrow();
  });

  it("rejects invalid radius value", () => {
    const t = { ...base, radius: "ultra-round" };
    expect(() => DesignTokensSchema.parse(t)).toThrow();
  });

  it("defaults breakpoints to { mobile: 768, tablet: 1024 }", () => {
    const parsed = DesignTokensSchema.parse(base);
    expect(parsed.breakpoints).toEqual({ mobile: 768, tablet: 1024 });
  });
});

describe("defaultTokens() v3 runtime type", () => {
  it("includes positioning defaulted to balanced", () => {
    const t = defaultTokens();
    expect(t.positioning).toBe("balanced");
  });

  it("includes breakpoints defaulted to { mobile: 768, tablet: 1024 }", () => {
    const t = defaultTokens();
    expect(t.breakpoints).toEqual({ mobile: 768, tablet: 1024 });
  });

  it("allows positioning override via opts", () => {
    const t = defaultTokens({ positioning: "airy-contemplative" });
    expect(t.positioning).toBe("airy-contemplative");
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
