// tests/unit/palettes.test.ts
import { describe, it, expect } from "bun:test";
import { paletteToColors, PALETTE_PRESETS } from "../../src/lib/core/palettes";

describe("PALETTE_PRESETS", () => {
  it("has viridis with 5 colors", () => {
    expect(PALETTE_PRESETS.viridis).toHaveLength(5);
  });

  it("has okabe-ito with 8 colors", () => {
    expect(PALETTE_PRESETS["okabe-ito"]).toHaveLength(8);
  });

  it("has tol-bright with 7 colors", () => {
    expect(PALETTE_PRESETS["tol-bright"]).toHaveLength(7);
  });

  it("has category10 with 10 colors", () => {
    expect(PALETTE_PRESETS.category10).toHaveLength(10);
  });
});

describe("paletteToColors", () => {
  it("returns preset colors for known scheme", () => {
    const colors = paletteToColors({ scheme: "viridis" });
    expect(colors).toEqual(PALETTE_PRESETS.viridis);
  });

  it("returns reversed colors when reverse is true", () => {
    const colors = paletteToColors({ scheme: "viridis", reverse: true });
    expect(colors).toEqual([...PALETTE_PRESETS.viridis].reverse());
  });

  it("returns customColors for custom scheme", () => {
    const custom = ["#f00", "#0f0", "#00f"];
    const colors = paletteToColors({ scheme: "custom", customColors: custom });
    expect(colors).toEqual(custom);
  });

  it("throws for custom scheme without customColors", () => {
    expect(() => paletteToColors({ scheme: "custom" })).toThrow(
      "custom palette requires customColors[]",
    );
  });

  it("throws for unknown scheme", () => {
    expect(() => paletteToColors({ scheme: "nope" as any })).toThrow(
      "unknown palette scheme: nope",
    );
  });

  it("slices to steps when provided", () => {
    const colors = paletteToColors({ scheme: "viridis", steps: 3 });
    expect(colors).toHaveLength(3);
    expect(colors).toEqual(PALETTE_PRESETS.viridis.slice(0, 3));
  });
});
