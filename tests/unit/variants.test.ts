import { describe, it, expect } from "bun:test";
import {
  STICKY_VARIANTS,
  SPLIT_VARIANTS,
  CROSSFADE_VARIANTS,
  FLOW_VARIANTS,
  FLYTO_VARIANTS,
  CHARTLADDER_VARIANTS,
  GRID_VARIANTS,
  LIGHTBOX_VARIANTS,
  SEQUENCE_VARIANTS,
  EXPLORE_VARIANTS,
  TIER1_RENDER_READY,
  StickyVariantSchema,
  SplitVariantSchema,
} from "../../src/lib/core/schemas/variants";
import { validateVariants } from "../../src/lib/core/validate-variants";

describe("variant enums — ROADMAP alignment", () => {
  it("STICKY_VARIANTS matches ROADMAP v3.0/3.1 matrix", () => {
    expect(STICKY_VARIANTS).toEqual([
      "sticky-left",
      "sticky-right",
      "sticky-center-overlay",
      "sticky-full-with-steps-panel",
    ]);
  });

  it("FLOW_VARIANTS matches spec §4.3", () => {
    expect(FLOW_VARIANTS).toEqual([
      "text-only",
      "image-top",
      "image-left",
      "image-right",
      "image-bottom",
      "image-fullbleed",
      "image-background-textoverlay",
    ]);
  });

  it("EXPLORE_VARIANTS includes all 5 tiered variants", () => {
    expect(EXPLORE_VARIANTS.length).toBe(5);
    expect(EXPLORE_VARIANTS).toContain("native-interactivity");
    expect(EXPLORE_VARIANTS).toContain("sync-multi-viz");
  });
});

describe("variant Zod schemas — accept/reject", () => {
  it("StickyVariantSchema accepts all 4 Tier 1/2", () => {
    for (const v of STICKY_VARIANTS) {
      expect(() => StickyVariantSchema.parse(v)).not.toThrow();
    }
  });

  it("StickyVariantSchema rejects unknown", () => {
    expect(() => StickyVariantSchema.parse("sticky-everywhere")).toThrow();
  });

  it("SplitVariantSchema accepts drag-separator", () => {
    expect(() => SplitVariantSchema.parse("drag-separator")).not.toThrow();
  });
});

describe("TIER1_RENDER_READY — spec §5.1 table", () => {
  it("sticky Tier 1 = 3 variants", () => {
    expect(TIER1_RENDER_READY.sticky).toEqual([
      "sticky-left",
      "sticky-right",
      "sticky-center-overlay",
    ]);
  });

  it("split Tier 1 = static + drag-separator", () => {
    expect(TIER1_RENDER_READY.split).toEqual(["static", "drag-separator"]);
  });

  it("sequence Tier 1 = stack only", () => {
    expect(TIER1_RENDER_READY.sequence).toEqual(["stack"]);
  });
});

describe("validateVariants — warnings", () => {
  it("no warning when all variants Tier 1 render-ready", () => {
    const { warnings } = validateVariants([
      {
        type: "sticky",
        variant: "sticky-left",
        visual: { type: "dev-stub", label: "v" },
        steps: [],
      },
    ] as any);
    expect(warnings).toEqual([]);
  });

  it("emits warning for Tier 2+ variant not yet render-ready", () => {
    const { warnings } = validateVariants([
      {
        type: "sticky",
        variant: "sticky-full-with-steps-panel",
        visual: { type: "dev-stub", label: "v" },
        steps: [],
      },
    ] as any);
    expect(warnings.length).toBe(1);
    expect(warnings[0]).toMatch(/sticky-full-with-steps-panel/);
    expect(warnings[0]).toMatch(/fallback/);
  });

  it("emits warning for split toggle (Tier 2)", () => {
    const { warnings } = validateVariants([
      {
        type: "split",
        variant: "toggle",
        left: { type: "dev-stub", label: "l" },
        right: { type: "dev-stub", label: "r" },
      },
    ] as any);
    expect(warnings.length).toBe(1);
  });
});
