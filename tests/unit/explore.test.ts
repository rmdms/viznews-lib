import { describe, it, expect } from "bun:test";
import { ExploreBlockSchema } from "../../src/lib/core/schemas/explore";

describe("ExploreBlockSchema", () => {
  const mtContent = {
    type: "mt-map" as const,
    style: { version: 8 },
    bounds: [0, 0, 10, 10] as [number, number, number, number],
    alt: "a map",
  };
  const baseLegend = {
    position: "top" as const,
    render: "auto" as const,
    collapsibleOnMobile: true,
  };

  it("defaults variant to native-interactivity", () => {
    const b = ExploreBlockSchema.parse({
      type: "explore",
      content: mtContent,
      legend: baseLegend,
    });
    expect(b.variant).toBe("native-interactivity");
  });

  it("defaults legend.position to top, render to auto", () => {
    const b = ExploreBlockSchema.parse({
      type: "explore",
      content: mtContent,
      legend: {},
    });
    expect(b.legend.position).toBe("top");
    expect(b.legend.render).toBe("auto");
    expect(b.legend.collapsibleOnMobile).toBe(true);
  });

  it("accepts dw-chart content", () => {
    const dw = {
      type: "dw-chart" as const,
      embedUrl: "https://example.com/c",
      title: "t",
      alt: "a",
    };
    expect(() =>
      ExploreBlockSchema.parse({
        type: "explore",
        content: dw,
        legend: baseLegend,
      }),
    ).not.toThrow();
  });

  it("accepts flourish-chart content", () => {
    const fl = {
      type: "flourish-chart" as const,
      embedUrl: "https://example.com/f",
      title: "t",
      alt: "a",
    };
    expect(() =>
      ExploreBlockSchema.parse({
        type: "explore",
        content: fl,
        legend: baseLegend,
      }),
    ).not.toThrow();
  });

  it("rejects unknown variant", () => {
    expect(() =>
      ExploreBlockSchema.parse({
        type: "explore",
        variant: "crazy",
        content: mtContent,
        legend: baseLegend,
      }),
    ).toThrow();
  });

  it("rejects content with unsupported type (e.g. markdown)", () => {
    expect(() =>
      ExploreBlockSchema.parse({
        type: "explore",
        content: { type: "markdown", html: "<p>x</p>" },
        legend: baseLegend,
      }),
    ).toThrow();
  });
});
