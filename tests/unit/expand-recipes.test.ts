import { describe, it, expect } from "bun:test";
import { expandRecipes } from "../../src/lib/core/expand-recipes";
import type { Block } from "../../src/lib/core/schemas/block";

const markdown = (id: string): Block => ({
  type: "markdown",
  content: `# ${id}`,
});
const image = (src: string): Block => ({ type: "image", src, alt: "" });
const devStub = (): Block => ({ type: "dev-stub", label: "stub" });

describe("expandRecipes", () => {
  it("expands scrolly-sticky-content to sticky", () => {
    const visual = image("chart.png");
    const steps = [markdown("step1"), markdown("step2")];
    const input: Block = { type: "scrolly-sticky-content", visual, steps };

    const [result] = expandRecipes([input]);

    expect(result.type).toBe("sticky");
    if (result.type === "sticky") {
      expect(result.visual).toEqual(visual);
      expect(result.steps).toEqual(steps);
      expect(result.props).toEqual({ scrim: "default" });
    }
  });

  it("expands scrolly-sticky-content with scrim=none", () => {
    const input: Block = {
      type: "scrolly-sticky-content",
      visual: image("chart.png"),
      steps: [markdown("step1")],
      scrim: "none",
    };

    const [result] = expandRecipes([input]);

    expect(result.type).toBe("sticky");
    if (result.type === "sticky") {
      expect(result.props).toEqual({ scrim: "none" });
    }
  });

  it("expands chart-ladder to sticky > crossfade", () => {
    const frames = [image("frame1.png"), image("frame2.png")];
    const steps = [markdown("step1"), markdown("step2")];
    const input: Block = { type: "chart-ladder", frames, steps };

    const [result] = expandRecipes([input]);

    expect(result.type).toBe("sticky");
    if (result.type === "sticky") {
      expect(result.visual.type).toBe("crossfade");
      if (result.visual.type === "crossfade") {
        expect(result.visual.activeIndex).toBe(0);
        expect(result.visual.frames).toEqual(frames);
      }
      expect(result.steps).toEqual(steps);
      expect(result.props).toEqual({ scrim: "default" });
    }
  });

  it("expands gallery-carousel to grid > lightbox[]", () => {
    const cells = [image("a.png"), image("b.png")];
    const input: Block = {
      type: "gallery-carousel",
      cells,
      columns: 2,
      aspectRatio: "16 / 9",
    };

    const [result] = expandRecipes([input]);

    expect(result.type).toBe("grid");
    if (result.type === "grid") {
      expect(result.columns).toBe(2);
      expect(result.aspectRatio).toBe("16 / 9");
      expect(result.cells).toHaveLength(2);
      for (const cell of result.cells) {
        expect(cell.type).toBe("lightbox");
        if (cell.type === "lightbox") {
          expect(cell.trigger).toEqual(cells[result.cells.indexOf(cell)]);
          expect(cell.content).toEqual(cells[result.cells.indexOf(cell)]);
        }
      }
    }
  });

  it("expands gallery-carousel with defaults", () => {
    const input: Block = { type: "gallery-carousel", cells: [image("a.png")] };

    const [result] = expandRecipes([input]);

    expect(result.type).toBe("grid");
    if (result.type === "grid") {
      expect(result.columns).toBe(3);
      expect(result.aspectRatio).toBe("4 / 3");
    }
  });

  it("passes scrolly-map through unexpanded", () => {
    const input: Block = {
      type: "scrolly-map",
      map: {
        type: "mt-map",
        styleId: "style-123",
        center: [2.3, 48.8],
        zoom: 10,
        flyToSteps: [{ center: [2.3, 48.8], zoom: 12 }],
      },
      steps: [markdown("step1")],
    };

    const [result] = expandRecipes([input]);

    expect(result.type).toBe("scrolly-map");
    expect(result).toEqual(input);
  });

  it("passes non-recipe blocks through unchanged", () => {
    const stub = devStub();
    const md = markdown("content");
    const results = expandRecipes([stub, md]);

    expect(results[0]).toEqual(stub);
    expect(results[1]).toEqual(md);
  });

  it("expands recipes nested inside sequence.items", () => {
    const visual = image("chart.png");
    const steps = [markdown("step1")];
    const inner: Block = { type: "scrolly-sticky-content", visual, steps };
    const input: Block = { type: "sequence", items: [inner] };

    const [result] = expandRecipes([input]);

    expect(result.type).toBe("sequence");
    if (result.type === "sequence") {
      expect(result.items[0].type).toBe("sticky");
    }
  });

  it("expands recipes nested inside sticky.visual", () => {
    const cells = [image("a.png")];
    const carouselVisual: Block = { type: "gallery-carousel", cells };
    const input: Block = {
      type: "sticky",
      visual: carouselVisual,
      steps: [markdown("step1")],
    };

    const [result] = expandRecipes([input]);

    expect(result.type).toBe("sticky");
    if (result.type === "sticky") {
      expect(result.visual.type).toBe("grid");
    }
  });

  it("expands recipes nested inside grid.cells", () => {
    const visual = image("chart.png");
    const steps = [markdown("step1")];
    const inner: Block = { type: "scrolly-sticky-content", visual, steps };
    const input: Block = { type: "grid", cells: [inner] };

    const [result] = expandRecipes([input]);

    expect(result.type).toBe("grid");
    if (result.type === "grid") {
      expect(result.cells[0].type).toBe("sticky");
    }
  });
});
