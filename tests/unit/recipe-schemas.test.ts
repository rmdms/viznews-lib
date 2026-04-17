import { describe, it, expect } from "bun:test";
import { BlockSchema } from "../../src/lib/core/schemas/block";

const validMarkdown = { type: "markdown", html: "<p>hello</p>" };
const validImage = {
  type: "image",
  src: "https://example.com/img.jpg",
  alt: "img",
};
const validMap = {
  type: "mt-map",
  style: {},
  bounds: [0, 0, 1, 1],
  alt: "map",
  flyToSteps: [{ center: [2, 3], zoom: 5 }],
};

describe("ScrollyStickyContentBlock", () => {
  it("accepts valid", () => {
    const result = BlockSchema.safeParse({
      type: "scrolly-sticky-content",
      visual: validImage,
      steps: [validMarkdown],
    });
    expect(result.success).toBe(true);
  });

  it("accepts with scrim option", () => {
    const result = BlockSchema.safeParse({
      type: "scrolly-sticky-content",
      visual: validImage,
      steps: [validMarkdown],
      scrim: "none",
    });
    expect(result.success).toBe(true);
  });

  it("rejects without visual", () => {
    const result = BlockSchema.safeParse({
      type: "scrolly-sticky-content",
      steps: [validMarkdown],
    });
    expect(result.success).toBe(false);
  });

  it("rejects without steps", () => {
    const result = BlockSchema.safeParse({
      type: "scrolly-sticky-content",
      visual: validImage,
    });
    expect(result.success).toBe(false);
  });
});

describe("ChartLadderBlock", () => {
  it("accepts valid", () => {
    const result = BlockSchema.safeParse({
      type: "chart-ladder",
      frames: [validImage, validImage],
      steps: [validMarkdown, validMarkdown],
    });
    expect(result.success).toBe(true);
  });

  it("rejects frames.length !== steps.length", () => {
    const result = BlockSchema.safeParse({
      type: "chart-ladder",
      frames: [validImage, validImage, validImage],
      steps: [validMarkdown, validMarkdown],
    });
    expect(result.success).toBe(false);
  });

  it("rejects fewer than 2 frames", () => {
    const result = BlockSchema.safeParse({
      type: "chart-ladder",
      frames: [validImage],
      steps: [validMarkdown],
    });
    expect(result.success).toBe(false);
  });
});

describe("GalleryCarouselBlock", () => {
  it("accepts valid", () => {
    const result = BlockSchema.safeParse({
      type: "gallery-carousel",
      cells: [validImage],
    });
    expect(result.success).toBe(true);
  });

  it("accepts with columns+aspectRatio", () => {
    const result = BlockSchema.safeParse({
      type: "gallery-carousel",
      cells: [validImage, validImage],
      columns: 3,
      aspectRatio: "16 / 9",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty cells", () => {
    const result = BlockSchema.safeParse({
      type: "gallery-carousel",
      cells: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid columns", () => {
    const result = BlockSchema.safeParse({
      type: "gallery-carousel",
      cells: [validImage],
      columns: 5,
    });
    expect(result.success).toBe(false);
  });
});

describe("ScrollyMapBlock", () => {
  it("accepts valid", () => {
    const result = BlockSchema.safeParse({
      type: "scrolly-map",
      map: validMap,
      steps: [validMarkdown],
    });
    expect(result.success).toBe(true);
  });

  it("rejects map without flyToSteps", () => {
    const result = BlockSchema.safeParse({
      type: "scrolly-map",
      map: { type: "mt-map", style: {}, bounds: [0, 0, 1, 1], alt: "map" },
      steps: [validMarkdown],
    });
    expect(result.success).toBe(false);
  });

  it("rejects steps.length !== flyToSteps.length", () => {
    const result = BlockSchema.safeParse({
      type: "scrolly-map",
      map: {
        type: "mt-map",
        style: {},
        bounds: [0, 0, 1, 1],
        alt: "map",
        flyToSteps: [
          { center: [2, 3], zoom: 5 },
          { center: [4, 5], zoom: 7 },
        ],
      },
      steps: [validMarkdown],
    });
    expect(result.success).toBe(false);
  });
});
