import { describe, it, expect } from "bun:test";
import {
  FlourishIntentSchema,
  buildFlourishEmbed,
  validateFlourishPublishable,
} from "../../src/lib/content-primitives/flourish";

const VALID_INTENT = {
  visualisationId: "123456",
  title: "Bump chart — rankings over time",
  alt: "Bump chart showing ranking changes",
  source: { label: "Eurostat" },
  palette: { scheme: "okabe-ito" as const },
};

describe("FlourishIntentSchema", () => {
  it("parses valid intent", () => {
    expect(FlourishIntentSchema.parse(VALID_INTENT).visualisationId).toBe(
      "123456",
    );
  });
  it("rejects missing visualisationId", () => {
    const { visualisationId, ...rest } = VALID_INTENT;
    expect(() => FlourishIntentSchema.parse(rest)).toThrow();
  });
});

describe("buildFlourishEmbed", () => {
  it("returns correct embed URL", () => {
    const intent = FlourishIntentSchema.parse(VALID_INTENT);
    expect(buildFlourishEmbed(intent)).toBe(
      "https://flo.uri.sh/visualisation/123456/embed",
    );
  });
  it("includes query params when autoplay", () => {
    const intent = FlourishIntentSchema.parse({
      ...VALID_INTENT,
      autoplay: true,
    });
    expect(buildFlourishEmbed(intent)).toContain("auto=1");
  });
});

describe("validateFlourishPublishable", () => {
  it("returns ok for valid intent", () => {
    const intent = FlourishIntentSchema.parse(VALID_INTENT);
    expect(validateFlourishPublishable(intent).ok).toBe(true);
  });
  it("reports missing fields", () => {
    const intent = FlourishIntentSchema.parse(VALID_INTENT);
    intent.title = "";
    intent.alt = "";
    const result = validateFlourishPublishable(intent);
    expect(result.ok).toBe(false);
    expect(result.missing).toContain("title");
    expect(result.missing).toContain("alt");
  });
});
