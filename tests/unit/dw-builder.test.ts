// tests/unit/dw-builder.test.ts
import { describe, it, expect } from "bun:test";
import {
  EditorialIntentSchema,
  buildPublishableConfig,
  validatePublishable,
} from "../../src/lib/content-primitives/datawrapper";

const VALID_INTENT = {
  chartType: "d3-bars" as const,
  title: "Top 10 cities",
  subtitle: "By population",
  source: { label: "UN Data", url: "https://data.un.org" },
  byline: "Test",
  data: { csv: "city,pop\nGeneva,200000\nZurich,400000" },
  palette: { scheme: "viridis" as const },
  annotations: [{ x: "Geneva", y: 200000, text: "Capital" }],
  altText: "Bar chart of top 10 cities by population",
  locale: "fr-CH" as const,
  yAxisLabel: "Population",
  xAxisLabel: "City",
  notes: "Source: 2024 estimate",
};

describe("EditorialIntentSchema", () => {
  it("parses valid intent", () => {
    const parsed = EditorialIntentSchema.parse(VALID_INTENT);
    expect(parsed.chartType).toBe("d3-bars");
  });

  it("rejects unknown chartType", () => {
    expect(() =>
      EditorialIntentSchema.parse({ ...VALID_INTENT, chartType: "unknown" }),
    ).toThrow();
  });

  it("rejects missing title", () => {
    const { title, ...noTitle } = VALID_INTENT;
    expect(() => EditorialIntentSchema.parse(noTitle)).toThrow();
  });
});

describe("buildPublishableConfig", () => {
  it("returns correct type and title", () => {
    const intent = EditorialIntentSchema.parse(VALID_INTENT);
    const config = buildPublishableConfig(intent);
    expect(config.type).toBe("d3-bars");
    expect(config.title).toBe("Top 10 cities");
  });

  it("includes palette colors in visualize", () => {
    const intent = EditorialIntentSchema.parse(VALID_INTENT);
    const config = buildPublishableConfig(intent);
    expect(config.metadata.visualize.colors).toBeArray();
    expect(
      (config.metadata.visualize.colors as string[]).length,
    ).toBeGreaterThan(0);
  });

  it("includes annotations in visualize", () => {
    const intent = EditorialIntentSchema.parse(VALID_INTENT);
    const config = buildPublishableConfig(intent);
    expect(config.metadata.visualize["text-annotations"]).toBeArray();
  });

  it("includes source in describe", () => {
    const intent = EditorialIntentSchema.parse(VALID_INTENT);
    const config = buildPublishableConfig(intent);
    expect(config.metadata.describe["source-name"]).toBe("UN Data");
    expect(config.metadata.describe["source-url"]).toBe("https://data.un.org");
  });

  it("includes csv data", () => {
    const intent = EditorialIntentSchema.parse(VALID_INTENT);
    const config = buildPublishableConfig(intent);
    expect(config.data).toContain("Geneva");
  });
});

describe("validatePublishable", () => {
  it("returns ok for valid intent", () => {
    const intent = EditorialIntentSchema.parse(VALID_INTENT);
    const result = validatePublishable(intent);
    expect(result.ok).toBe(true);
    expect(result.missing).toHaveLength(0);
  });

  it("reports missing fields", () => {
    const intent = EditorialIntentSchema.parse(VALID_INTENT);
    intent.title = "";
    intent.altText = "";
    const result = validatePublishable(intent);
    expect(result.ok).toBe(false);
    expect(result.missing).toContain("title");
    expect(result.missing).toContain("altText");
  });
});
