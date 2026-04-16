// tests/unit/content-schemas.test.ts
import { describe, it, expect } from "bun:test";
import { BlockSchema } from "../../src/lib/core/schemas/block";

describe("MarkdownBlock", () => {
  it("accepts valid markdown block", () => {
    const b = { type: "markdown", html: "<p>Hello</p>" };
    expect(BlockSchema.parse(b).type).toBe("markdown");
  });

  it("rejects empty html", () => {
    expect(() => BlockSchema.parse({ type: "markdown", html: "" })).toThrow();
  });
});

describe("ImageBlock", () => {
  it("accepts minimal image block", () => {
    const b = {
      type: "image",
      src: "https://example.com/img.jpg",
      alt: "A photo",
    };
    expect(BlockSchema.parse(b).type).toBe("image");
  });

  it("accepts image with all optional fields", () => {
    const b = {
      type: "image",
      src: "https://example.com/img.jpg",
      alt: "A photo",
      aspectRatio: "16 / 9",
      caption: "Photo credit: test",
    };
    const parsed = BlockSchema.parse(b);
    expect(parsed).toMatchObject({
      type: "image",
      caption: "Photo credit: test",
    });
  });

  it("rejects image without alt", () => {
    expect(() =>
      BlockSchema.parse({ type: "image", src: "https://example.com/img.jpg" }),
    ).toThrow();
  });
});

describe("VideoBlock", () => {
  it("accepts minimal video block", () => {
    const b = {
      type: "video",
      src: "https://example.com/vid.mp4",
      alt: "A video",
    };
    expect(BlockSchema.parse(b).type).toBe("video");
  });

  it("accepts video with poster and caption", () => {
    const b = {
      type: "video",
      src: "https://example.com/vid.mp4",
      alt: "A video",
      poster: "https://example.com/poster.jpg",
      caption: "Video source",
    };
    expect(BlockSchema.parse(b)).toMatchObject({
      type: "video",
      poster: "https://example.com/poster.jpg",
    });
  });

  it("rejects video without alt", () => {
    expect(() =>
      BlockSchema.parse({ type: "video", src: "https://example.com/vid.mp4" }),
    ).toThrow();
  });
});

describe("DWChartBlock", () => {
  it("accepts valid dw-chart block", () => {
    const b = {
      type: "dw-chart",
      embedUrl: "https://datawrapper.dwcdn.net/abc12/1/",
      title: "Chart title",
      alt: "Chart description",
    };
    expect(BlockSchema.parse(b).type).toBe("dw-chart");
  });

  it("accepts dw-chart with height", () => {
    const b = {
      type: "dw-chart",
      embedUrl: "https://datawrapper.dwcdn.net/abc12/1/",
      title: "Chart title",
      alt: "Chart description",
      height: 500,
    };
    expect(BlockSchema.parse(b)).toMatchObject({
      type: "dw-chart",
      height: 500,
    });
  });

  it("rejects dw-chart without title", () => {
    expect(() =>
      BlockSchema.parse({
        type: "dw-chart",
        embedUrl: "https://datawrapper.dwcdn.net/abc12/1/",
        alt: "desc",
      }),
    ).toThrow();
  });
});

describe("FlourishChartBlock", () => {
  it("accepts valid flourish-chart block", () => {
    const b = {
      type: "flourish-chart",
      embedUrl: "https://flo.uri.sh/visualisation/123456/embed",
      title: "Flourish chart",
      alt: "Chart description",
    };
    expect(BlockSchema.parse(b).type).toBe("flourish-chart");
  });

  it("rejects flourish-chart without embedUrl", () => {
    expect(() =>
      BlockSchema.parse({ type: "flourish-chart", title: "x", alt: "y" }),
    ).toThrow();
  });
});

describe("MTMapBlock", () => {
  it("accepts minimal mt-map block", () => {
    const b = {
      type: "mt-map",
      style: { version: 8, sources: {}, layers: [] },
      bounds: [6.1, 46.2, 6.3, 46.3],
      alt: "Map of Geneva",
    };
    expect(BlockSchema.parse(b).type).toBe("mt-map");
  });

  it("accepts mt-map with flyToSteps", () => {
    const b = {
      type: "mt-map",
      style: { version: 8, sources: {}, layers: [] },
      bounds: [6.1, 46.2, 6.3, 46.3],
      alt: "Map",
      height: 600,
      interactive: true,
      flyToSteps: [
        { center: [6.15, 46.2], zoom: 12, label: "Geneva" },
        { center: [7.45, 46.95], zoom: 13, label: "Bern" },
      ],
    };
    const parsed = BlockSchema.parse(b);
    expect(parsed).toMatchObject({ type: "mt-map", height: 600 });
  });

  it("rejects mt-map with bounds.length != 4", () => {
    expect(() =>
      BlockSchema.parse({
        type: "mt-map",
        style: {},
        bounds: [6.1, 46.2],
        alt: "Map",
      }),
    ).toThrow();
  });

  it("rejects mt-map without alt", () => {
    expect(() =>
      BlockSchema.parse({
        type: "mt-map",
        style: {},
        bounds: [6.1, 46.2, 6.3, 46.3],
      }),
    ).toThrow();
  });
});
