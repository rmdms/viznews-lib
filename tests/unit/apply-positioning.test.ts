import { describe, it, expect } from "bun:test";
import { applyPositioning } from "../../src/lib/core/apply-positioning";
import { defaultTokens } from "../../src/lib/core/design-tokens";

describe("applyPositioning — preset mapping", () => {
  it("editorial-tight preset", () => {
    const t = defaultTokens({ positioning: "editorial-tight" });
    const r = applyPositioning(t);
    expect(r.layoutRhythm).toBe("tight");
    expect(r.radius).toBe("sharp");
    expect(r.shadow).toBe("subtle");
    expect(r.border).toBe("hairline");
    expect(r.overlay).toBe("none");
  });

  it("balanced preset (default)", () => {
    const r = applyPositioning(defaultTokens({ positioning: "balanced" }));
    expect(r.layoutRhythm).toBe("balanced");
    expect(r.radius).toBe("soft");
    expect(r.shadow).toBe("subtle");
    expect(r.border).toBe("none");
    expect(r.overlay).toBe("none");
  });

  it("airy-contemplative preset", () => {
    const r = applyPositioning(
      defaultTokens({ positioning: "airy-contemplative" }),
    );
    expect(r.layoutRhythm).toBe("airy");
    expect(r.radius).toBe("rounded");
    expect(r.shadow).toBe("dramatic");
    expect(r.border).toBe("none");
    expect(r.overlay).toBe("none");
  });

  it("dashboard-dense preset", () => {
    const r = applyPositioning(
      defaultTokens({ positioning: "dashboard-dense" }),
    );
    expect(r.layoutRhythm).toBe("dense");
    expect(r.radius).toBe("sharp");
    expect(r.shadow).toBe("none");
    expect(r.border).toBe("hairline");
    expect(r.overlay).toBe("none");
  });
});

describe("applyPositioning — explicit overrides", () => {
  it("explicit radius overrides preset radius", () => {
    const t = {
      ...defaultTokens({ positioning: "balanced" }),
      radius: "rounded" as const,
    };
    const r = applyPositioning(t);
    expect(r.radius).toBe("rounded");
    expect(r.layoutRhythm).toBe("balanced");
  });

  it("explicit overlay overrides default none", () => {
    const t = { ...defaultTokens(), overlay: "darken-50" as const };
    const r = applyPositioning(t);
    expect(r.overlay).toBe("darken-50");
  });

  it("all 5 explicit overrides win over any preset", () => {
    const t = {
      ...defaultTokens({ positioning: "dashboard-dense" }),
      layoutRhythm: "airy" as const,
      radius: "rounded" as const,
      shadow: "dramatic" as const,
      border: "emphatic" as const,
      overlay: "gradient-bottom" as const,
    };
    const r = applyPositioning(t);
    expect(r.layoutRhythm).toBe("airy");
    expect(r.radius).toBe("rounded");
    expect(r.shadow).toBe("dramatic");
    expect(r.border).toBe("emphatic");
    expect(r.overlay).toBe("gradient-bottom");
  });
});

describe("applyPositioning — determinism", () => {
  it("same input produces same output", () => {
    const t = defaultTokens({ positioning: "airy-contemplative" });
    expect(applyPositioning(t)).toEqual(applyPositioning(t));
  });
});
