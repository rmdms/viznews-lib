import { describe, it, expect } from "bun:test";
import { FlowBlockSchema } from "../../src/lib/core/schemas/flow";

describe("FlowBlockSchema", () => {
  const md = { type: "markdown" as const, html: "<p>txt</p>" };
  const img = { type: "image" as const, src: "https://x.com/a.jpg", alt: "a" };

  it("text-only default accepts only markdown", () => {
    const parsed = FlowBlockSchema.parse({ type: "flow", children: [md] });
    expect(parsed.variant).toBe("text-only");
  });

  it("image-left requires at least one image child", () => {
    expect(() =>
      FlowBlockSchema.parse({
        type: "flow",
        variant: "image-left",
        children: [md],
      }),
    ).toThrow(/image/i);
  });

  it("image-left with one image passes", () => {
    expect(() =>
      FlowBlockSchema.parse({
        type: "flow",
        variant: "image-left",
        children: [md, img],
      }),
    ).not.toThrow();
  });

  it("rejects unknown variant", () => {
    expect(() =>
      FlowBlockSchema.parse({
        type: "flow",
        variant: "spiral",
        children: [md],
      }),
    ).toThrow();
  });
});
