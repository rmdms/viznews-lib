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

describe("StickyBlock", () => {
  it("accepts nested dev-stub visual + steps", () => {
    const b = {
      type: "sticky",
      visual: { type: "dev-stub", label: "map" },
      steps: [
        { type: "dev-stub", label: "step 1" },
        { type: "dev-stub", label: "step 2" },
      ],
    };
    const parsed = BlockSchema.parse(b);
    expect(parsed.type).toBe("sticky");
  });

  it("defaults scrim to default when props.scrim omitted", () => {
    const b = {
      type: "sticky",
      visual: { type: "dev-stub", label: "v" },
      steps: [{ type: "dev-stub", label: "s" }],
      props: {},
    };
    const parsed = BlockSchema.parse(b);
    expect(parsed.type === "sticky" && parsed.props?.scrim).toBe("default");
  });

  it("rejects sticky with missing visual", () => {
    const bad = {
      type: "sticky",
      steps: [{ type: "dev-stub", label: "s" }],
    };
    expect(() => BlockSchema.parse(bad)).toThrow();
  });
});

describe("ScrollStepsBlock", () => {
  it("accepts a simple step list", () => {
    const b = {
      type: "scroll-steps",
      steps: [
        { type: "dev-stub", label: "a" },
        { type: "dev-stub", label: "b" },
      ],
    };
    expect(BlockSchema.parse(b).type).toBe("scroll-steps");
  });

  it("rejects scroll-steps with missing steps", () => {
    expect(() => BlockSchema.parse({ type: "scroll-steps" })).toThrow();
  });
});

describe("CrossfadeBlock", () => {
  it("accepts 2 frames with activeIndex 0", () => {
    const b = {
      type: "crossfade",
      activeIndex: 0,
      frames: [
        { type: "dev-stub", label: "A" },
        { type: "dev-stub", label: "B" },
      ],
    };
    expect(BlockSchema.parse(b).type).toBe("crossfade");
  });

  it("rejects frames.length < 2", () => {
    const b = {
      type: "crossfade",
      activeIndex: 0,
      frames: [{ type: "dev-stub", label: "A" }],
    };
    expect(() => BlockSchema.parse(b)).toThrow();
  });

  it("rejects negative activeIndex", () => {
    const b = {
      type: "crossfade",
      activeIndex: -1,
      frames: [
        { type: "dev-stub", label: "A" },
        { type: "dev-stub", label: "B" },
      ],
    };
    expect(() => BlockSchema.parse(b)).toThrow();
  });
});

describe("GridBlock", () => {
  it("accepts cells with optional columns + legend", () => {
    const b = {
      type: "grid",
      columns: 3,
      cells: [
        { type: "dev-stub", label: "A" },
        { type: "dev-stub", label: "B" },
        { type: "dev-stub", label: "C" },
      ],
      legend: { type: "dev-stub", label: "shared legend" },
    };
    expect(BlockSchema.parse(b).type).toBe("grid");
  });

  it("rejects bad aspectRatio format", () => {
    const b = {
      type: "grid",
      aspectRatio: "4:3",
      cells: [{ type: "dev-stub", label: "A" }],
    };
    expect(() => BlockSchema.parse(b)).toThrow();
  });

  it('accepts aspectRatio "4 / 3"', () => {
    const b = {
      type: "grid",
      aspectRatio: "4 / 3",
      cells: [{ type: "dev-stub", label: "A" }],
    };
    expect(() => BlockSchema.parse(b)).not.toThrow();
  });
});

describe("SplitBlock", () => {
  it("accepts left + right", () => {
    const b = {
      type: "split",
      left: { type: "dev-stub", label: "L" },
      right: { type: "dev-stub", label: "R" },
    };
    expect(BlockSchema.parse(b).type).toBe("split");
  });

  it("rejects missing right", () => {
    const b = { type: "split", left: { type: "dev-stub", label: "L" } };
    expect(() => BlockSchema.parse(b)).toThrow();
  });
});

describe("SequenceBlock", () => {
  it("accepts items list", () => {
    const b = { type: "sequence", items: [{ type: "dev-stub", label: "a" }] };
    expect(BlockSchema.parse(b).type).toBe("sequence");
  });

  it("rejects empty items", () => {
    const b = { type: "sequence", items: [] };
    expect(() => BlockSchema.parse(b)).toThrow();
  });
});

describe("LightboxBlock", () => {
  it("accepts trigger + content", () => {
    const b = {
      type: "lightbox",
      trigger: { type: "dev-stub", label: "open" },
      content: { type: "dev-stub", label: "inside" },
    };
    expect(BlockSchema.parse(b).type).toBe("lightbox");
  });

  it("rejects missing content", () => {
    const b = { type: "lightbox", trigger: { type: "dev-stub", label: "x" } };
    expect(() => BlockSchema.parse(b)).toThrow();
  });
});

import {
  StickyBlockSchema,
  SplitBlockSchema,
  CrossfadeBlockSchema,
  GridBlockSchema,
  LightboxBlockSchema,
  SequenceBlockSchema,
} from "../../src/lib/core/schemas/structural";

describe("StickyBlockSchema v3 variant", () => {
  const base = {
    type: "sticky" as const,
    visual: { type: "dev-stub", label: "v" },
    steps: [{ type: "dev-stub", label: "s1" }],
  };

  it("defaults variant to sticky-left", () => {
    const parsed = StickyBlockSchema.parse(base);
    expect(parsed.variant).toBe("sticky-left");
  });

  it("accepts explicit sticky-right", () => {
    const parsed = StickyBlockSchema.parse({
      ...base,
      variant: "sticky-right",
    });
    expect(parsed.variant).toBe("sticky-right");
  });

  it("accepts sticky-center-overlay (Tier 1)", () => {
    expect(() =>
      StickyBlockSchema.parse({ ...base, variant: "sticky-center-overlay" }),
    ).not.toThrow();
  });

  it("accepts sticky-full-with-steps-panel (Tier 2, warning at build)", () => {
    expect(() =>
      StickyBlockSchema.parse({
        ...base,
        variant: "sticky-full-with-steps-panel",
      }),
    ).not.toThrow();
  });

  it("rejects unknown variant", () => {
    expect(() =>
      StickyBlockSchema.parse({ ...base, variant: "diagonal" }),
    ).toThrow();
  });
});

describe("SplitBlockSchema v3 variant", () => {
  const base = {
    type: "split" as const,
    left: { type: "dev-stub", label: "l" },
    right: { type: "dev-stub", label: "r" },
  };

  it("defaults variant to static", () => {
    const p = SplitBlockSchema.parse(base);
    expect(p.variant).toBe("static");
  });

  it("accepts drag-separator", () => {
    expect(() =>
      SplitBlockSchema.parse({ ...base, variant: "drag-separator" }),
    ).not.toThrow();
  });

  it("rejects unknown variant", () => {
    expect(() =>
      SplitBlockSchema.parse({ ...base, variant: "side-by-side" }),
    ).toThrow();
  });
});

describe("Crossfade/Grid/Lightbox/Sequence — variant props", () => {
  it("Crossfade default fade, accepts cut", () => {
    const base = {
      type: "crossfade" as const,
      activeIndex: 0,
      frames: [
        { type: "dev-stub", label: "a" },
        { type: "dev-stub", label: "b" },
      ],
    };
    expect(CrossfadeBlockSchema.parse(base).variant).toBe("fade");
    expect(() =>
      CrossfadeBlockSchema.parse({ ...base, variant: "cut" }),
    ).not.toThrow();
  });

  it("Grid default uniform, accepts featured", () => {
    const base = {
      type: "grid" as const,
      cells: [{ type: "dev-stub", label: "c" }],
    };
    expect(GridBlockSchema.parse(base).variant).toBe("uniform");
    expect(() =>
      GridBlockSchema.parse({ ...base, variant: "featured" }),
    ).not.toThrow();
  });

  it("Lightbox default modal, accepts inline-expand", () => {
    const base = {
      type: "lightbox" as const,
      trigger: { type: "dev-stub", label: "t" },
      content: { type: "dev-stub", label: "c" },
    };
    expect(LightboxBlockSchema.parse(base).variant).toBe("modal");
    expect(() =>
      LightboxBlockSchema.parse({ ...base, variant: "inline-expand" }),
    ).not.toThrow();
  });

  it("Sequence default stack", () => {
    const base = {
      type: "sequence" as const,
      items: [{ type: "dev-stub", label: "i" }],
    };
    expect(SequenceBlockSchema.parse(base).variant).toBe("stack");
  });
});
