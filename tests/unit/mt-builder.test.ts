import { describe, it, expect } from "bun:test";
import {
  SpatialIntentSchema,
  buildPublishableStyle,
  validateSpatialPublishable,
} from "../../src/lib/content-primitives/maptiler";

const VALID_INTENT = {
  mapType: "choropleth" as const,
  title: "Income by canton",
  subtitle: "2024 data",
  source: { label: "FSO" },
  byline: "Test",
  baseStyle: "DATAVIZ.LIGHT" as const,
  data: { geojsonUrl: "https://example.com/cantons.geojson" },
  palette: { scheme: "viridis" as const },
  bounds: { west: 5.9, south: 45.8, east: 10.5, north: 47.8 },
  legend: { title: "CHF/year" },
  altText: "Choropleth of income by canton",
  locale: "fr-CH" as const,
};

describe("SpatialIntentSchema", () => {
  it("parses valid choropleth intent", () => {
    expect(SpatialIntentSchema.parse(VALID_INTENT).mapType).toBe("choropleth");
  });
  it("rejects unknown mapType", () => {
    expect(() =>
      SpatialIntentSchema.parse({ ...VALID_INTENT, mapType: "unknown" }),
    ).toThrow();
  });
});

describe("buildPublishableStyle", () => {
  it("returns version 8 style", () => {
    expect(
      buildPublishableStyle(SpatialIntentSchema.parse(VALID_INTENT)).version,
    ).toBe(8);
  });
  it("includes metadata", () => {
    expect(
      buildPublishableStyle(SpatialIntentSchema.parse(VALID_INTENT)).metadata
        ?.title,
    ).toBe("Income by canton");
  });
  it("produces choropleth-fill layer", () => {
    expect(
      buildPublishableStyle(
        SpatialIntentSchema.parse(VALID_INTENT),
      ).layers.some((l) => l.id === "choropleth-fill"),
    ).toBe(true);
  });
  it("produces symbol-circle layer for proportional-symbol", () => {
    expect(
      buildPublishableStyle(
        SpatialIntentSchema.parse({
          ...VALID_INTENT,
          mapType: "proportional-symbol",
        }),
      ).layers.some((l) => l.id === "symbol-circle"),
    ).toBe(true);
  });
  it("produces heatmap layer for heatmap", () => {
    expect(
      buildPublishableStyle(
        SpatialIntentSchema.parse({ ...VALID_INTENT, mapType: "heatmap" }),
      ).layers.some((l) => l.id === "heatmap"),
    ).toBe(true);
  });
  it("includes bounds", () => {
    expect(
      buildPublishableStyle(SpatialIntentSchema.parse(VALID_INTENT)).bounds,
    ).toEqual([5.9, 45.8, 10.5, 47.8]);
  });
});

describe("validateSpatialPublishable", () => {
  it("returns ok for valid intent", () => {
    expect(
      validateSpatialPublishable(SpatialIntentSchema.parse(VALID_INTENT)).ok,
    ).toBe(true);
  });
  it("reports missing fields", () => {
    const intent = SpatialIntentSchema.parse(VALID_INTENT);
    intent.title = "";
    intent.altText = "";
    const r = validateSpatialPublishable(intent);
    expect(r.ok).toBe(false);
    expect(r.missing).toContain("title");
    expect(r.missing).toContain("altText");
  });
});
