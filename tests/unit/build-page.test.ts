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
