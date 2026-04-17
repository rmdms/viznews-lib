import type { Block } from "./schemas/block";

function expandBlock(block: Block): Block {
  switch (block.type) {
    case "scrolly-sticky-content":
      return {
        type: "sticky",
        visual: expandBlock(block.visual),
        steps: expandBlocks(block.steps),
        props: { scrim: block.scrim ?? "default" },
      };
    case "chart-ladder":
      return {
        type: "sticky",
        visual: {
          type: "crossfade",
          activeIndex: 0,
          frames: expandBlocks(block.frames),
        },
        steps: expandBlocks(block.steps),
        props: { scrim: "default" },
      };
    case "gallery-carousel":
      return {
        type: "grid",
        columns: block.columns ?? 3,
        aspectRatio: block.aspectRatio ?? "4 / 3",
        cells: block.cells.map((cell) => {
          const expanded = expandBlock(cell);
          return {
            type: "lightbox" as const,
            trigger: expanded,
            content: expanded,
          };
        }),
      };
    case "scrolly-map":
      return block;
    // Recurse into structural primitives
    case "sticky":
      return {
        ...block,
        visual: expandBlock(block.visual),
        steps: expandBlocks(block.steps),
      };
    case "sequence":
      return { ...block, items: expandBlocks(block.items) };
    case "grid":
      return {
        ...block,
        cells: expandBlocks(block.cells),
        legend: block.legend ? expandBlock(block.legend) : undefined,
      };
    case "split":
      return {
        ...block,
        left: expandBlock(block.left),
        right: expandBlock(block.right),
        legend: block.legend ? expandBlock(block.legend) : undefined,
      };
    case "lightbox":
      return {
        ...block,
        trigger: expandBlock(block.trigger),
        content: expandBlock(block.content),
      };
    case "crossfade":
      return { ...block, frames: expandBlocks(block.frames) };
    case "scroll-steps":
      return { ...block, steps: expandBlocks(block.steps) };
    default:
      return block;
  }
}

export function expandRecipes(blocks: Block[]): Block[] {
  return blocks.map(expandBlock);
}

function expandBlocks(blocks: Block[]): Block[] {
  return blocks.map(expandBlock);
}
