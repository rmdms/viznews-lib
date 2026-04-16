import { describe, it, expect } from "bun:test";
import { ArticleSchema } from "../../src/lib/core/schemas/article";
import { BlockSchema } from "../../src/lib/core/schemas/block";
import { defaultTokens } from "../../src/lib/core/design-tokens";

describe("DevStubBlock", () => {
  it("accepts minimal dev-stub", () => {
    const parsed = BlockSchema.parse({ type: "dev-stub", label: "hello" });
    expect(parsed.type).toBe("dev-stub");
  });

  it("accepts dev-stub with height and color", () => {
    const parsed = BlockSchema.parse({
      type: "dev-stub",
      label: "A",
      height: 300,
      color: "#fee",
    });
    expect(parsed).toMatchObject({ type: "dev-stub", label: "A", height: 300 });
  });

  it("rejects dev-stub without label", () => {
    expect(() => BlockSchema.parse({ type: "dev-stub" })).toThrow();
  });
});

describe("ArticleSchema", () => {
  it("accepts a minimal article with dev-stub blocks", () => {
    const article = {
      slug: "test",
      metadata: {
        title: "Test",
        byline: "Anon",
        publishedAt: "2026-04-16",
      },
      tokens: defaultTokens(),
      blocks: [{ type: "dev-stub", label: "lead" }],
    };
    const parsed = ArticleSchema.parse(article);
    expect(parsed.slug).toBe("test");
    expect(parsed.blocks).toHaveLength(1);
  });

  it("rejects unknown block type", () => {
    const bad = {
      slug: "t",
      metadata: { title: "x", byline: "y", publishedAt: "2026-04-16" },
      tokens: defaultTokens(),
      blocks: [{ type: "not-a-real-type" }],
    };
    expect(() => ArticleSchema.parse(bad)).toThrow();
  });
});
