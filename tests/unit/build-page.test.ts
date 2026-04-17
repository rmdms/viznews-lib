import { describe, it, expect } from "bun:test";
import { buildArticlePage } from "../../src/lib/core/build-page";
import { defaultTokens } from "../../src/lib/core/design-tokens";

const validSpec = {
  slug: "demo",
  metadata: {
    title: "Demo",
    byline: "Test",
    publishedAt: "2026-04-16",
  },
  tokens: defaultTokens(),
  blocks: [
    { type: "dev-stub", label: "a" },
    { type: "dev-stub", label: "b" },
  ],
};

describe("buildArticlePage", () => {
  it("returns slug, metadata, blocks, cssVariables", () => {
    const page = buildArticlePage(validSpec);
    expect(page.slug).toBe("demo");
    expect(page.metadata.title).toBe("Demo");
    expect(page.blocks).toHaveLength(2);
    expect(page.cssVariables).toContain("--vn-color-bg");
  });

  it("throws with Zod error on invalid spec", () => {
    const bad = { ...validSpec, slug: 123 };
    expect(() => buildArticlePage(bad)).toThrow();
  });

  it("is pure — does not mutate input", () => {
    const snapshot = JSON.stringify(validSpec);
    buildArticlePage(validSpec);
    expect(JSON.stringify(validSpec)).toBe(snapshot);
  });
});

const baseArticle = {
  slug: "test",
  metadata: { title: "T", byline: "B", publishedAt: "2026-04-17" },
  tokens: {
    locale: "fr-CH",
    palette: {
      scheme: "viridis",
      background: "#fff",
      foreground: "#111",
      muted: "#666",
      accent: "#156964",
    },
    typography: {
      bodyFontFamily: "Inter",
      headingFontFamily: "Inter",
      monoFontFamily: "Mono",
      baseSize: 17,
      scale: 1.25,
    },
    spacing: { unit: 8 },
    sourceStyle: { format: "footnote", prefix: "Source : " },
    mode: "light",
    positioning: "balanced",
  },
  blocks: [{ type: "markdown", html: "<p>hi</p>" }],
};

describe("buildArticlePage v3 — cascade + warnings", () => {
  it("emits v3 CSS vars when positioning set", () => {
    const p = buildArticlePage(baseArticle);
    expect(p.cssVariables).toContain("--vn-radius:");
    expect(p.cssVariables).toContain("--vn-layout-rhythm-gap:");
  });

  it("returns warnings array (empty for Tier 1)", () => {
    const p = buildArticlePage(baseArticle);
    expect(p.warnings).toEqual([]);
  });

  it("preserves slug/metadata/blocks shape", () => {
    const p = buildArticlePage(baseArticle);
    expect(p.slug).toBe("test");
    expect(p.blocks.length).toBe(1);
  });
});
