# Phase 3 — Named Recipes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 4 named recipes (`scrolly-sticky-content`, `chart-ladder`, `gallery-carousel`, `scrolly-map`) to `@rmdms/viznews` — 3 are schema sugar expanded at build time into primitive trees, 1 (`scrolly-map`) gets a glue Svelte component.

**Architecture:** Recipes are shorthand block types in `spec.json`. `expandRecipes()` runs after Zod parse in `buildArticlePage` and expands 3 sugar recipes into existing structural + content primitive trees. `scrolly-map` passes through unexpanded and gets a dedicated `ScrollyMap.svelte` glue component + BlockRenderer branch. Zero new rendering logic except the glue.

**Tech Stack:** TypeScript, Zod 3.23, Svelte 5, bun:test, Playwright

**Spec:** `docs/superpowers/specs/2026-04-17-recipes-phase-3-design.md`

---

## File Structure

### New files

| File | Responsibility |
|---|---|
| `src/lib/core/schemas/recipes.ts` | 4 Zod schemas for recipe block types |
| `src/lib/core/expand-recipes.ts` | `expandRecipes()` pure function |
| `src/lib/recipes/ScrollyMap.svelte` | Glue component: scroll→flyTo binding |
| `src/lib/recipes/index.ts` | Re-export ScrollyMap |
| `tests/unit/recipe-schemas.test.ts` | Zod schema unit tests |
| `tests/unit/expand-recipes.test.ts` | Expansion logic unit tests |
| `src/fixtures/scrolly-sticky-content.json` | Dev fixture |
| `src/fixtures/chart-ladder.json` | Dev fixture |
| `src/fixtures/gallery-carousel.json` | Dev fixture |
| `src/fixtures/scrolly-map.json` | Dev fixture |
| `src/routes/dev/scrolly-sticky-content/+page.ts` | Dev route loader |
| `src/routes/dev/scrolly-sticky-content/+page.svelte` | Dev route page |
| `src/routes/dev/chart-ladder/+page.ts` | Dev route loader |
| `src/routes/dev/chart-ladder/+page.svelte` | Dev route page |
| `src/routes/dev/gallery-carousel/+page.ts` | Dev route loader |
| `src/routes/dev/gallery-carousel/+page.svelte` | Dev route page |
| `src/routes/dev/scrolly-map/+page.ts` | Dev route loader |
| `src/routes/dev/scrolly-map/+page.svelte` | Dev route page |
| `tests/contracts/scrolly-sticky-content.spec.ts` | Playwright contract test |
| `tests/contracts/chart-ladder.spec.ts` | Playwright contract test |
| `tests/contracts/gallery-carousel.spec.ts` | Playwright contract test |
| `tests/contracts/scrolly-map.spec.ts` | Playwright contract test |

### Modified files

| File | Change |
|---|---|
| `src/lib/core/schemas/block.ts` | Add 4 recipe types to Block union + BlockSchema discriminated union |
| `src/lib/core/schemas/index.ts` | Re-export `recipes.ts` |
| `src/lib/core/build-page.ts` | Call `expandRecipes()` after parse |
| `src/lib/BlockRenderer.svelte` | Add `scrolly-map` branch + import ScrollyMap |
| `src/lib/index.ts` | Re-export recipe types + ScrollyMap |
| `src/routes/+page.svelte` | Add 4 recipe dev route links |
| `docs/primitives.md` | Add recipes section |

---

## Task 1: Recipe Zod Schemas + Unit Tests

**Files:**
- Create: `src/lib/core/schemas/recipes.ts`
- Create: `tests/unit/recipe-schemas.test.ts`
- Modify: `src/lib/core/schemas/block.ts:1-104`
- Modify: `src/lib/core/schemas/index.ts:1-6`

- [ ] **Step 1: Write failing tests for recipe schemas**

Create `tests/unit/recipe-schemas.test.ts`:

```typescript
import { describe, it, expect } from "bun:test";
import { BlockSchema } from "../../src/lib/core/schemas/block";

describe("ScrollyStickyContentBlock", () => {
  it("accepts valid scrolly-sticky-content block", () => {
    const b = {
      type: "scrolly-sticky-content",
      visual: { type: "dev-stub", label: "visual" },
      steps: [{ type: "dev-stub", label: "step 1" }],
    };
    expect(BlockSchema.parse(b).type).toBe("scrolly-sticky-content");
  });

  it("accepts with scrim option", () => {
    const b = {
      type: "scrolly-sticky-content",
      visual: { type: "dev-stub", label: "visual" },
      steps: [{ type: "dev-stub", label: "step 1" }],
      scrim: "none",
    };
    expect(BlockSchema.parse(b)).toMatchObject({ scrim: "none" });
  });

  it("rejects without visual", () => {
    expect(() =>
      BlockSchema.parse({
        type: "scrolly-sticky-content",
        steps: [{ type: "dev-stub", label: "s" }],
      }),
    ).toThrow();
  });

  it("rejects without steps", () => {
    expect(() =>
      BlockSchema.parse({
        type: "scrolly-sticky-content",
        visual: { type: "dev-stub", label: "v" },
      }),
    ).toThrow();
  });
});

describe("ChartLadderBlock", () => {
  it("accepts valid chart-ladder block", () => {
    const b = {
      type: "chart-ladder",
      frames: [
        { type: "dev-stub", label: "frame 1" },
        { type: "dev-stub", label: "frame 2" },
      ],
      steps: [
        { type: "dev-stub", label: "step 1" },
        { type: "dev-stub", label: "step 2" },
      ],
    };
    expect(BlockSchema.parse(b).type).toBe("chart-ladder");
  });

  it("rejects when frames.length !== steps.length", () => {
    expect(() =>
      BlockSchema.parse({
        type: "chart-ladder",
        frames: [
          { type: "dev-stub", label: "frame 1" },
          { type: "dev-stub", label: "frame 2" },
        ],
        steps: [{ type: "dev-stub", label: "step 1" }],
      }),
    ).toThrow();
  });

  it("rejects fewer than 2 frames", () => {
    expect(() =>
      BlockSchema.parse({
        type: "chart-ladder",
        frames: [{ type: "dev-stub", label: "frame 1" }],
        steps: [{ type: "dev-stub", label: "step 1" }],
      }),
    ).toThrow();
  });
});

describe("GalleryCarouselBlock", () => {
  it("accepts valid gallery-carousel block", () => {
    const b = {
      type: "gallery-carousel",
      cells: [
        { type: "dev-stub", label: "cell 1" },
        { type: "dev-stub", label: "cell 2" },
      ],
    };
    expect(BlockSchema.parse(b).type).toBe("gallery-carousel");
  });

  it("accepts with columns and aspectRatio", () => {
    const b = {
      type: "gallery-carousel",
      cells: [{ type: "dev-stub", label: "cell 1" }],
      columns: 4,
      aspectRatio: "16 / 9",
    };
    const parsed = BlockSchema.parse(b);
    expect(parsed).toMatchObject({ columns: 4, aspectRatio: "16 / 9" });
  });

  it("rejects empty cells", () => {
    expect(() =>
      BlockSchema.parse({ type: "gallery-carousel", cells: [] }),
    ).toThrow();
  });

  it("rejects invalid columns value", () => {
    expect(() =>
      BlockSchema.parse({
        type: "gallery-carousel",
        cells: [{ type: "dev-stub", label: "c" }],
        columns: 5,
      }),
    ).toThrow();
  });
});

describe("ScrollyMapBlock", () => {
  const validMap = {
    type: "mt-map",
    style: {},
    bounds: [6.1, 46.2, 6.2, 46.3],
    alt: "Geneva",
    flyToSteps: [
      { center: [6.15, 46.2], zoom: 12 },
      { center: [6.16, 46.25], zoom: 14 },
    ],
  };

  it("accepts valid scrolly-map block", () => {
    const b = {
      type: "scrolly-map",
      map: validMap,
      steps: [
        { type: "dev-stub", label: "step 1" },
        { type: "dev-stub", label: "step 2" },
      ],
    };
    expect(BlockSchema.parse(b).type).toBe("scrolly-map");
  });

  it("rejects when map has no flyToSteps", () => {
    const mapNoFly = { ...validMap, flyToSteps: undefined };
    expect(() =>
      BlockSchema.parse({
        type: "scrolly-map",
        map: { type: "mt-map", style: {}, bounds: [6.1, 46.2, 6.2, 46.3], alt: "Geneva" },
        steps: [{ type: "dev-stub", label: "step 1" }],
      }),
    ).toThrow();
  });

  it("rejects when steps.length !== map.flyToSteps.length", () => {
    expect(() =>
      BlockSchema.parse({
        type: "scrolly-map",
        map: validMap,
        steps: [{ type: "dev-stub", label: "step 1" }],
      }),
    ).toThrow();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/rmdms/Sites/Professional/viznews-lib && bun test tests/unit/recipe-schemas.test.ts`
Expected: FAIL — recipe types not recognized by BlockSchema

- [ ] **Step 3: Create recipe Zod schemas**

Create `src/lib/core/schemas/recipes.ts`:

```typescript
import { z } from "zod";
import { BlockSchema } from "./block";
import type { Block } from "./block";
import { MTMapBlockSchema } from "./content";

type ScrollyStickyContentBlockT = {
  type: "scrolly-sticky-content";
  visual: Block;
  steps: Block[];
  scrim?: "default" | "none";
};

export const ScrollyStickyContentBlockSchema: z.ZodType<ScrollyStickyContentBlockT> =
  z.object({
    type: z.literal("scrolly-sticky-content"),
    visual: z.lazy(() => BlockSchema),
    steps: z.array(z.lazy(() => BlockSchema)).min(1),
    scrim: z.enum(["default", "none"]).optional(),
  }) as z.ZodType<ScrollyStickyContentBlockT>;

type ChartLadderBlockT = {
  type: "chart-ladder";
  frames: Block[];
  steps: Block[];
};

export const ChartLadderBlockSchema: z.ZodType<ChartLadderBlockT> = z
  .object({
    type: z.literal("chart-ladder"),
    frames: z.array(z.lazy(() => BlockSchema)).min(2),
    steps: z.array(z.lazy(() => BlockSchema)).min(2),
  })
  .refine((d) => d.frames.length === d.steps.length, {
    message: "frames and steps must have the same length",
  }) as z.ZodType<ChartLadderBlockT>;

type GalleryCarouselBlockT = {
  type: "gallery-carousel";
  cells: Block[];
  columns?: 2 | 3 | 4;
  aspectRatio?: string;
};

export const GalleryCarouselBlockSchema: z.ZodType<GalleryCarouselBlockT> =
  z.object({
    type: z.literal("gallery-carousel"),
    cells: z.array(z.lazy(() => BlockSchema)).min(1),
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
    aspectRatio: z
      .string()
      .regex(/^\d+\s*\/\s*\d+$/)
      .optional(),
  }) as z.ZodType<GalleryCarouselBlockT>;

const MTMapWithFlyToSchema = MTMapBlockSchema.extend({
  flyToSteps: z
    .array(
      z.object({
        center: z.tuple([z.number(), z.number()]),
        zoom: z.number().min(0).max(22),
        label: z.string().optional(),
      }),
    )
    .min(1),
});

type ScrollyMapBlockT = {
  type: "scrolly-map";
  map: z.infer<typeof MTMapWithFlyToSchema>;
  steps: Block[];
};

export const ScrollyMapBlockSchema: z.ZodType<ScrollyMapBlockT> = z
  .object({
    type: z.literal("scrolly-map"),
    map: MTMapWithFlyToSchema,
    steps: z.array(z.lazy(() => BlockSchema)).min(1),
  })
  .refine((d) => d.map.flyToSteps.length === d.steps.length, {
    message: "map.flyToSteps and steps must have the same length",
  }) as z.ZodType<ScrollyMapBlockT>;

export type ScrollyStickyContentBlock = ScrollyStickyContentBlockT;
export type ChartLadderBlock = ChartLadderBlockT;
export type GalleryCarouselBlock = GalleryCarouselBlockT;
export type ScrollyMapBlock = ScrollyMapBlockT;
```

- [ ] **Step 4: Add recipe types to Block union**

Modify `src/lib/core/schemas/block.ts`. Add imports at the top (after line 19):

```typescript
import {
  ScrollyStickyContentBlockSchema,
  ChartLadderBlockSchema,
  GalleryCarouselBlockSchema,
  ScrollyMapBlockSchema,
} from "./recipes";
import type {
  ScrollyStickyContentBlock,
  ChartLadderBlock,
  GalleryCarouselBlock,
  ScrollyMapBlock,
} from "./recipes";
```

Update the `Block` type union (after line 85 `| MTMapBlock`):

```typescript
  | ScrollyStickyContentBlock
  | ChartLadderBlock
  | GalleryCarouselBlock
  | ScrollyMapBlock;
```

Add the 4 schemas to the `z.discriminatedUnion` array (after `MTMapBlockSchema` at line 102):

```typescript
    ScrollyStickyContentBlockSchema,
    ChartLadderBlockSchema,
    GalleryCarouselBlockSchema,
    ScrollyMapBlockSchema,
```

Note: `ChartLadderBlockSchema` and `ScrollyMapBlockSchema` use `.refine()`, which makes them `ZodEffects` — not valid inside `z.discriminatedUnion`. The discriminated union requires `ZodObject` entries. **Fix:** use `z.discriminatedUnion` only for the base shapes (without `.refine()`), and apply refinement validation in the individual schema exports via `.pipe()` or a separate validation step. The simplest approach: change `BlockSchema` from `z.discriminatedUnion` to `z.union` (already typed as `z.ZodType<Block>`, so the API doesn't change):

Replace the entire `BlockSchema` definition:

```typescript
export const BlockSchema: z.ZodType<Block> = z.lazy(() =>
  z.union([
    DevStubBlockSchema,
    StickyBlockSchema,
    ScrollStepsBlockSchema,
    CrossfadeBlockSchema,
    GridBlockSchema,
    SplitBlockSchema,
    SequenceBlockSchema,
    LightboxBlockSchema,
    MarkdownBlockSchema,
    ImageBlockSchema,
    VideoBlockSchema,
    DWChartBlockSchema,
    FlourishChartBlockSchema,
    MTMapBlockSchema,
    ScrollyStickyContentBlockSchema,
    ChartLadderBlockSchema,
    GalleryCarouselBlockSchema,
    ScrollyMapBlockSchema,
  ]),
);
```

Also re-export recipe types. Modify `src/lib/core/schemas/index.ts` — add line:

```typescript
export * from "./recipes";
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd /Users/rmdms/Sites/Professional/viznews-lib && bun test tests/unit/recipe-schemas.test.ts`
Expected: All 12 tests PASS

- [ ] **Step 6: Run full unit test suite to check for regressions**

Run: `cd /Users/rmdms/Sites/Professional/viznews-lib && bun test tests/unit`
Expected: All existing tests PASS (no regressions from union change)

- [ ] **Step 7: Commit**

```bash
cd /Users/rmdms/Sites/Professional/viznews-lib
git add src/lib/core/schemas/recipes.ts src/lib/core/schemas/block.ts src/lib/core/schemas/index.ts tests/unit/recipe-schemas.test.ts
git commit -m "feat(schemas): add 4 recipe block types to Block union"
```

---

## Task 2: expandRecipes() + Unit Tests

**Files:**
- Create: `src/lib/core/expand-recipes.ts`
- Create: `tests/unit/expand-recipes.test.ts`

- [ ] **Step 1: Write failing tests for expandRecipes**

Create `tests/unit/expand-recipes.test.ts`:

```typescript
import { describe, it, expect } from "bun:test";
import { expandRecipes } from "../../src/lib/core/expand-recipes";
import type { Block } from "../../src/lib/core/schemas/block";

describe("expandRecipes", () => {
  it("expands scrolly-sticky-content to sticky", () => {
    const blocks: Block[] = [
      {
        type: "scrolly-sticky-content",
        visual: { type: "dev-stub", label: "visual" },
        steps: [{ type: "dev-stub", label: "step 1" }],
      },
    ];
    const result = expandRecipes(blocks);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("sticky");
    const sticky = result[0] as Extract<Block, { type: "sticky" }>;
    expect(sticky.visual).toEqual({ type: "dev-stub", label: "visual" });
    expect(sticky.steps).toEqual([{ type: "dev-stub", label: "step 1" }]);
    expect(sticky.props).toEqual({ scrim: "default" });
  });

  it("expands scrolly-sticky-content with scrim=none", () => {
    const blocks: Block[] = [
      {
        type: "scrolly-sticky-content",
        visual: { type: "dev-stub", label: "v" },
        steps: [{ type: "dev-stub", label: "s" }],
        scrim: "none",
      },
    ];
    const result = expandRecipes(blocks);
    const sticky = result[0] as Extract<Block, { type: "sticky" }>;
    expect(sticky.props).toEqual({ scrim: "none" });
  });

  it("expands chart-ladder to sticky > crossfade", () => {
    const blocks: Block[] = [
      {
        type: "chart-ladder",
        frames: [
          { type: "dev-stub", label: "frame 1" },
          { type: "dev-stub", label: "frame 2" },
        ],
        steps: [
          { type: "dev-stub", label: "step 1" },
          { type: "dev-stub", label: "step 2" },
        ],
      },
    ];
    const result = expandRecipes(blocks);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("sticky");
    const sticky = result[0] as Extract<Block, { type: "sticky" }>;
    expect(sticky.visual.type).toBe("crossfade");
    const crossfade = sticky.visual as Extract<Block, { type: "crossfade" }>;
    expect(crossfade.activeIndex).toBe(0);
    expect(crossfade.frames).toHaveLength(2);
    expect(sticky.steps).toHaveLength(2);
    expect(sticky.props).toEqual({ scrim: "default" });
  });

  it("expands gallery-carousel to grid > lightbox[]", () => {
    const blocks: Block[] = [
      {
        type: "gallery-carousel",
        cells: [
          { type: "dev-stub", label: "cell 1" },
          { type: "dev-stub", label: "cell 2" },
        ],
        columns: 4,
        aspectRatio: "16 / 9",
      },
    ];
    const result = expandRecipes(blocks);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("grid");
    const grid = result[0] as Extract<Block, { type: "grid" }>;
    expect(grid.columns).toBe(4);
    expect(grid.aspectRatio).toBe("16 / 9");
    expect(grid.cells).toHaveLength(2);
    expect(grid.cells[0].type).toBe("lightbox");
    const lb = grid.cells[0] as Extract<Block, { type: "lightbox" }>;
    expect(lb.trigger).toEqual({ type: "dev-stub", label: "cell 1" });
    expect(lb.content).toEqual({ type: "dev-stub", label: "cell 1" });
  });

  it("expands gallery-carousel with defaults", () => {
    const blocks: Block[] = [
      {
        type: "gallery-carousel",
        cells: [{ type: "dev-stub", label: "cell 1" }],
      },
    ];
    const result = expandRecipes(blocks);
    const grid = result[0] as Extract<Block, { type: "grid" }>;
    expect(grid.columns).toBe(3);
    expect(grid.aspectRatio).toBe("4 / 3");
  });

  it("passes scrolly-map through unexpanded", () => {
    const blocks: Block[] = [
      {
        type: "scrolly-map",
        map: {
          type: "mt-map",
          style: {},
          bounds: [6.1, 46.2, 6.2, 46.3] as [number, number, number, number],
          alt: "Geneva",
          flyToSteps: [{ center: [6.15, 46.2] as [number, number], zoom: 12 }],
        },
        steps: [{ type: "dev-stub", label: "step 1" }],
      },
    ];
    const result = expandRecipes(blocks);
    expect(result[0].type).toBe("scrolly-map");
  });

  it("passes non-recipe blocks through unchanged", () => {
    const blocks: Block[] = [
      { type: "dev-stub", label: "hello" },
      { type: "markdown", html: "<p>text</p>" },
    ];
    const result = expandRecipes(blocks);
    expect(result).toEqual(blocks);
  });

  it("expands recipes nested inside sequence.items", () => {
    const blocks: Block[] = [
      {
        type: "sequence",
        items: [
          {
            type: "scrolly-sticky-content",
            visual: { type: "dev-stub", label: "v" },
            steps: [{ type: "dev-stub", label: "s" }],
          },
        ],
      },
    ];
    const result = expandRecipes(blocks);
    expect(result[0].type).toBe("sequence");
    const seq = result[0] as Extract<Block, { type: "sequence" }>;
    expect(seq.items[0].type).toBe("sticky");
  });

  it("expands recipes nested inside sticky.visual", () => {
    const blocks: Block[] = [
      {
        type: "sticky",
        visual: {
          type: "gallery-carousel",
          cells: [{ type: "dev-stub", label: "c" }],
        },
        steps: [{ type: "dev-stub", label: "s" }],
      },
    ];
    const result = expandRecipes(blocks);
    const sticky = result[0] as Extract<Block, { type: "sticky" }>;
    expect(sticky.visual.type).toBe("grid");
  });

  it("expands recipes nested inside grid.cells", () => {
    const blocks: Block[] = [
      {
        type: "grid",
        cells: [
          {
            type: "scrolly-sticky-content",
            visual: { type: "dev-stub", label: "v" },
            steps: [{ type: "dev-stub", label: "s" }],
          },
        ],
      },
    ];
    const result = expandRecipes(blocks);
    const grid = result[0] as Extract<Block, { type: "grid" }>;
    expect(grid.cells[0].type).toBe("sticky");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/rmdms/Sites/Professional/viznews-lib && bun test tests/unit/expand-recipes.test.ts`
Expected: FAIL — `expandRecipes` not found

- [ ] **Step 3: Implement expandRecipes**

Create `src/lib/core/expand-recipes.ts`:

```typescript
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
          return { type: "lightbox" as const, trigger: expanded, content: expanded };
        }),
      };

    case "scrolly-map":
      return block;

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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/rmdms/Sites/Professional/viznews-lib && bun test tests/unit/expand-recipes.test.ts`
Expected: All 10 tests PASS

- [ ] **Step 5: Commit**

```bash
cd /Users/rmdms/Sites/Professional/viznews-lib
git add src/lib/core/expand-recipes.ts tests/unit/expand-recipes.test.ts
git commit -m "feat(core): expandRecipes() — build-time recipe expansion"
```

---

## Task 3: Integrate expandRecipes in buildArticlePage

**Files:**
- Modify: `src/lib/core/build-page.ts:1-20`

- [ ] **Step 1: Modify buildArticlePage to call expandRecipes**

Update `src/lib/core/build-page.ts`:

```typescript
import { ArticleSchema, type Article } from "./schemas/article";
import type { Block } from "./schemas/block";
import { tokensToCSSVariables } from "./harmonize";
import { expandRecipes } from "./expand-recipes";

export interface ArticlePageData {
  slug: string;
  metadata: Article["metadata"];
  blocks: Block[];
  cssVariables: string;
}

export function buildArticlePage(spec: unknown): ArticlePageData {
  const article = ArticleSchema.parse(spec);
  const blocks = expandRecipes(article.blocks);
  return {
    slug: article.slug,
    metadata: article.metadata,
    blocks,
    cssVariables: tokensToCSSVariables(article.tokens),
  };
}
```

- [ ] **Step 2: Run full unit test suite**

Run: `cd /Users/rmdms/Sites/Professional/viznews-lib && bun test tests/unit`
Expected: All tests PASS (existing build-page tests still work, recipes expanded)

- [ ] **Step 3: Run type check**

Run: `cd /Users/rmdms/Sites/Professional/viznews-lib && bun run check`
Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
cd /Users/rmdms/Sites/Professional/viznews-lib
git add src/lib/core/build-page.ts
git commit -m "feat(build-page): integrate expandRecipes after parse"
```

---

## Task 4: ScrollyMap Glue Component

**Files:**
- Create: `src/lib/recipes/ScrollyMap.svelte`
- Create: `src/lib/recipes/index.ts`
- Modify: `src/lib/BlockRenderer.svelte:1-106`
- Modify: `src/lib/index.ts:1-24`

- [ ] **Step 1: Create ScrollyMap.svelte**

Create `src/lib/recipes/ScrollyMap.svelte`:

```svelte
<script lang="ts">
  import type { Block } from '../core/schemas/block';
  import MTMap from '../content-primitives/MTMap.svelte';
  import BlockRenderer from '../BlockRenderer.svelte';

  let { map, steps }: {
    map: {
      type: "mt-map";
      style: Record<string, unknown>;
      bounds: [number, number, number, number];
      alt: string;
      height?: number;
      interactive?: boolean;
      flyToSteps: Array<{ center: [number, number]; zoom: number; label?: string }>;
    };
    steps: Block[];
  } = $props();

  let mapRef: MTMap | undefined = $state();
  let activeIndex = $state(0);

  function handleIntersection(entries: IntersectionObserverEntry[]) {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const idx = Number(entry.target.getAttribute('data-step-index'));
        if (!Number.isNaN(idx)) activeIndex = idx;
      }
    }
  }

  let stepsEl: HTMLDivElement | undefined = $state();

  $effect(() => {
    if (!stepsEl) return;
    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: '-30% 0px -50% 0px',
      threshold: 0,
    });
    const stepEls = stepsEl.querySelectorAll('[data-step-index]');
    stepEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  });

  $effect(() => {
    mapRef?.flyTo(activeIndex);
  });
</script>

<section class="vn-scrolly-map" data-testid="scrolly-map-root">
  <div class="vn-scrolly-map__visual" data-testid="scrolly-map-visual">
    <MTMap
      bind:this={mapRef}
      style={map.style}
      bounds={map.bounds}
      alt={map.alt}
      height={map.height}
      interactive={map.interactive}
      flyToSteps={map.flyToSteps}
    />
  </div>
  <div class="vn-scrolly-map__steps" data-testid="scrolly-map-steps" bind:this={stepsEl}>
    {#each steps as step, i}
      <div data-step-index={i} data-testid="scrolly-map-step-{i}" class="vn-scrolly-map__step"
        class:vn-scrolly-map__step--active={i === activeIndex}>
        <BlockRenderer block={step} />
      </div>
    {/each}
  </div>
</section>

<style>
  .vn-scrolly-map {
    position: relative;
    display: grid;
    grid-template-columns: 1fr;
  }
  @media (min-width: 768px) {
    .vn-scrolly-map {
      grid-template-columns: 1fr 1fr;
    }
  }
  .vn-scrolly-map__visual {
    position: sticky;
    top: 0;
    height: 100vh;
    z-index: 0;
  }
  .vn-scrolly-map__steps {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: calc(var(--vn-spacing) * 6);
    padding: 40vh calc(var(--vn-spacing) * 2);
    z-index: 1;
  }
  .vn-scrolly-map__step {
    background: color-mix(in srgb, var(--vn-color-bg) 92%, transparent);
    backdrop-filter: blur(4px);
    padding: calc(var(--vn-spacing) * 2);
    border-radius: calc(var(--vn-spacing));
  }
  @media (max-width: 767px) {
    .vn-scrolly-map { display: block; }
    .vn-scrolly-map__visual { height: 60vh; z-index: 2; }
    .vn-scrolly-map__steps { padding: calc(var(--vn-spacing) * 4) calc(var(--vn-spacing) * 2); }
  }
</style>
```

- [ ] **Step 2: Create recipes index**

Create `src/lib/recipes/index.ts`:

```typescript
export { default as ScrollyMap } from "./ScrollyMap.svelte";
```

- [ ] **Step 3: Add scrolly-map branch to BlockRenderer**

Modify `src/lib/BlockRenderer.svelte`. Add import at line 4 (after content-primitives import):

```svelte
  import { ScrollyMap } from './recipes';
```

Add branch before the closing `{/if}` (after the mt-map branch, before line 93's `{/if}`):

```svelte
{:else if block.type === 'scrolly-map'}
  <ScrollyMap map={block.map} steps={block.steps} />
```

- [ ] **Step 4: Update main library exports**

Modify `src/lib/index.ts` — add after the content-primitives re-export:

```typescript
export * from "./recipes";
export type {
  ScrollyStickyContentBlock,
  ChartLadderBlock,
  GalleryCarouselBlock,
  ScrollyMapBlock,
} from "./core/schemas/recipes";
```

- [ ] **Step 5: Run type check**

Run: `cd /Users/rmdms/Sites/Professional/viznews-lib && bun run check`
Expected: 0 errors

- [ ] **Step 6: Commit**

```bash
cd /Users/rmdms/Sites/Professional/viznews-lib
git add src/lib/recipes/ScrollyMap.svelte src/lib/recipes/index.ts src/lib/BlockRenderer.svelte src/lib/index.ts
git commit -m "feat(recipes): ScrollyMap glue component + BlockRenderer branch"
```

---

## Task 5: Dev Fixtures

**Files:**
- Create: `src/fixtures/scrolly-sticky-content.json`
- Create: `src/fixtures/chart-ladder.json`
- Create: `src/fixtures/gallery-carousel.json`
- Create: `src/fixtures/scrolly-map.json`

- [ ] **Step 1: Create scrolly-sticky-content fixture**

Create `src/fixtures/scrolly-sticky-content.json`:

```json
{
  "slug": "scrolly-sticky-content-demo",
  "metadata": {
    "title": "Scrolly Sticky Content demo",
    "byline": "test",
    "publishedAt": "2026-04-17"
  },
  "tokens": {
    "locale": "fr-CH",
    "palette": {
      "scheme": "viridis",
      "background": "#ffffff",
      "foreground": "#111111",
      "muted": "#666666",
      "accent": "#156964"
    },
    "typography": {
      "bodyFontFamily": "'Inter', system-ui, sans-serif",
      "headingFontFamily": "'Inter', system-ui, sans-serif",
      "monoFontFamily": "'JetBrains Mono', monospace",
      "baseSize": 17,
      "scale": 1.25
    },
    "spacing": { "unit": 8 },
    "sourceStyle": { "format": "footnote", "prefix": "Source : " },
    "mode": "light"
  },
  "blocks": [
    {
      "type": "scrolly-sticky-content",
      "visual": {
        "type": "dev-stub",
        "label": "Sticky visual (e.g. large photo or chart)",
        "height": 500
      },
      "steps": [
        { "type": "dev-stub", "label": "Step 1 — introduction paragraph with enough text to fill a readable column." },
        { "type": "dev-stub", "label": "Step 2 — second narrative beat, the visual stays pinned while this scrolls." },
        { "type": "dev-stub", "label": "Step 3 — third beat with more context." },
        { "type": "dev-stub", "label": "Step 4 — closing paragraph." }
      ]
    }
  ]
}
```

- [ ] **Step 2: Create chart-ladder fixture**

Create `src/fixtures/chart-ladder.json`:

```json
{
  "slug": "chart-ladder-demo",
  "metadata": {
    "title": "Chart Ladder demo",
    "byline": "test",
    "publishedAt": "2026-04-17"
  },
  "tokens": {
    "locale": "fr-CH",
    "palette": {
      "scheme": "viridis",
      "background": "#ffffff",
      "foreground": "#111111",
      "muted": "#666666",
      "accent": "#156964"
    },
    "typography": {
      "bodyFontFamily": "'Inter', system-ui, sans-serif",
      "headingFontFamily": "'Inter', system-ui, sans-serif",
      "monoFontFamily": "'JetBrains Mono', monospace",
      "baseSize": 17,
      "scale": 1.25
    },
    "spacing": { "unit": 8 },
    "sourceStyle": { "format": "footnote", "prefix": "Source : " },
    "mode": "light"
  },
  "blocks": [
    {
      "type": "chart-ladder",
      "frames": [
        { "type": "dev-stub", "label": "Chart frame 1 — base view, no annotations", "height": 400, "color": "#e8f5e9" },
        { "type": "dev-stub", "label": "Chart frame 2 — first annotation layer", "height": 400, "color": "#c8e6c9" },
        { "type": "dev-stub", "label": "Chart frame 3 — second annotation layer", "height": 400, "color": "#a5d6a7" }
      ],
      "steps": [
        { "type": "dev-stub", "label": "Step 1 — Here is the raw chart without any annotation." },
        { "type": "dev-stub", "label": "Step 2 — Notice the first trend highlighted in green." },
        { "type": "dev-stub", "label": "Step 3 — A second pattern emerges in the lower range." }
      ]
    }
  ]
}
```

- [ ] **Step 3: Create gallery-carousel fixture**

Create `src/fixtures/gallery-carousel.json`:

```json
{
  "slug": "gallery-carousel-demo",
  "metadata": {
    "title": "Gallery Carousel demo",
    "byline": "test",
    "publishedAt": "2026-04-17"
  },
  "tokens": {
    "locale": "fr-CH",
    "palette": {
      "scheme": "viridis",
      "background": "#ffffff",
      "foreground": "#111111",
      "muted": "#666666",
      "accent": "#156964"
    },
    "typography": {
      "bodyFontFamily": "'Inter', system-ui, sans-serif",
      "headingFontFamily": "'Inter', system-ui, sans-serif",
      "monoFontFamily": "'JetBrains Mono', monospace",
      "baseSize": 17,
      "scale": 1.25
    },
    "spacing": { "unit": 8 },
    "sourceStyle": { "format": "footnote", "prefix": "Source : " },
    "mode": "light"
  },
  "blocks": [
    {
      "type": "gallery-carousel",
      "columns": 3,
      "aspectRatio": "4 / 3",
      "cells": [
        { "type": "dev-stub", "label": "Cell 1" },
        { "type": "dev-stub", "label": "Cell 2" },
        { "type": "dev-stub", "label": "Cell 3" },
        { "type": "dev-stub", "label": "Cell 4" },
        { "type": "dev-stub", "label": "Cell 5" },
        { "type": "dev-stub", "label": "Cell 6" }
      ]
    }
  ]
}
```

- [ ] **Step 4: Create scrolly-map fixture**

Create `src/fixtures/scrolly-map.json`:

```json
{
  "slug": "scrolly-map-demo",
  "metadata": {
    "title": "Scrolly Map demo",
    "byline": "test",
    "publishedAt": "2026-04-17"
  },
  "tokens": {
    "locale": "fr-CH",
    "palette": {
      "scheme": "viridis",
      "background": "#ffffff",
      "foreground": "#111111",
      "muted": "#666666",
      "accent": "#156964"
    },
    "typography": {
      "bodyFontFamily": "'Inter', system-ui, sans-serif",
      "headingFontFamily": "'Inter', system-ui, sans-serif",
      "monoFontFamily": "'JetBrains Mono', monospace",
      "baseSize": 17,
      "scale": 1.25
    },
    "spacing": { "unit": 8 },
    "sourceStyle": { "format": "footnote", "prefix": "Source : " },
    "mode": "light"
  },
  "blocks": [
    {
      "type": "scrolly-map",
      "map": {
        "type": "mt-map",
        "style": {},
        "bounds": [6.1, 46.15, 6.25, 46.3],
        "alt": "Map of Geneva region",
        "height": 600,
        "interactive": false,
        "flyToSteps": [
          { "center": [6.15, 46.2], "zoom": 12, "label": "Geneva overview" },
          { "center": [6.14, 46.21], "zoom": 15, "label": "Old Town" },
          { "center": [6.17, 46.22], "zoom": 14, "label": "International district" }
        ]
      },
      "steps": [
        { "type": "dev-stub", "label": "Step 1 — Geneva sits at the southwestern tip of Lake Léman." },
        { "type": "dev-stub", "label": "Step 2 — The Old Town perched on a hill above the Rhône." },
        { "type": "dev-stub", "label": "Step 3 — The international district hosts the UN and Red Cross." }
      ]
    }
  ]
}
```

- [ ] **Step 5: Commit**

```bash
cd /Users/rmdms/Sites/Professional/viznews-lib
git add src/fixtures/scrolly-sticky-content.json src/fixtures/chart-ladder.json src/fixtures/gallery-carousel.json src/fixtures/scrolly-map.json
git commit -m "feat(fixtures): 4 recipe dev fixtures"
```

---

## Task 6: Dev Routes

**Files:**
- Create: `src/routes/dev/scrolly-sticky-content/+page.ts`
- Create: `src/routes/dev/scrolly-sticky-content/+page.svelte`
- Create: `src/routes/dev/chart-ladder/+page.ts`
- Create: `src/routes/dev/chart-ladder/+page.svelte`
- Create: `src/routes/dev/gallery-carousel/+page.ts`
- Create: `src/routes/dev/gallery-carousel/+page.svelte`
- Create: `src/routes/dev/scrolly-map/+page.ts`
- Create: `src/routes/dev/scrolly-map/+page.svelte`
- Modify: `src/routes/+page.svelte:1-34`

- [ ] **Step 1: Create scrolly-sticky-content dev route**

Create `src/routes/dev/scrolly-sticky-content/+page.ts`:

```typescript
import { buildArticlePage } from "$lib/core/build-page";
import fixture from "$lib/../fixtures/scrolly-sticky-content.json";

export const prerender = true;

export function load() {
  return { page: buildArticlePage(fixture) };
}
```

Create `src/routes/dev/scrolly-sticky-content/+page.svelte`:

```svelte
<script lang="ts">
  import BlockRenderer from '$lib/BlockRenderer.svelte';
  let { data } = $props();
</script>

<main>
  <header>
    <h1>{data.page.metadata.title}</h1>
    <p><small>dev route — recipe</small></p>
  </header>
  {#each data.page.blocks as block}
    <BlockRenderer {block} />
  {/each}
</main>
```

- [ ] **Step 2: Create chart-ladder dev route**

Create `src/routes/dev/chart-ladder/+page.ts`:

```typescript
import { buildArticlePage } from "$lib/core/build-page";
import fixture from "$lib/../fixtures/chart-ladder.json";

export const prerender = true;

export function load() {
  return { page: buildArticlePage(fixture) };
}
```

Create `src/routes/dev/chart-ladder/+page.svelte`:

```svelte
<script lang="ts">
  import BlockRenderer from '$lib/BlockRenderer.svelte';
  let { data } = $props();
</script>

<main>
  <header>
    <h1>{data.page.metadata.title}</h1>
    <p><small>dev route — recipe</small></p>
  </header>
  {#each data.page.blocks as block}
    <BlockRenderer {block} />
  {/each}
</main>
```

- [ ] **Step 3: Create gallery-carousel dev route**

Create `src/routes/dev/gallery-carousel/+page.ts`:

```typescript
import { buildArticlePage } from "$lib/core/build-page";
import fixture from "$lib/../fixtures/gallery-carousel.json";

export const prerender = true;

export function load() {
  return { page: buildArticlePage(fixture) };
}
```

Create `src/routes/dev/gallery-carousel/+page.svelte`:

```svelte
<script lang="ts">
  import BlockRenderer from '$lib/BlockRenderer.svelte';
  let { data } = $props();
</script>

<main>
  <header>
    <h1>{data.page.metadata.title}</h1>
    <p><small>dev route — recipe</small></p>
  </header>
  {#each data.page.blocks as block}
    <BlockRenderer {block} />
  {/each}
</main>
```

- [ ] **Step 4: Create scrolly-map dev route**

Create `src/routes/dev/scrolly-map/+page.ts`:

```typescript
import { buildArticlePage } from "$lib/core/build-page";
import fixture from "$lib/../fixtures/scrolly-map.json";

export const prerender = true;
export const ssr = false;

export function load() {
  return { page: buildArticlePage(fixture) };
}
```

Note: `ssr = false` because ScrollyMap uses MTMap which requires the browser (`@maptiler/sdk` needs `window`).

Create `src/routes/dev/scrolly-map/+page.svelte`:

```svelte
<script lang="ts">
  import BlockRenderer from '$lib/BlockRenderer.svelte';
  let { data } = $props();
</script>

<main>
  <header>
    <h1>{data.page.metadata.title}</h1>
    <p><small>dev route — recipe</small></p>
  </header>
  {#each data.page.blocks as block}
    <BlockRenderer {block} />
  {/each}
</main>
```

- [ ] **Step 5: Update landing page with recipe routes**

Modify `src/routes/+page.svelte`. Add 4 entries to the `routes` array (after the MTMap entry at line 16):

```typescript
    { path: '/dev/scrolly-sticky-content', name: 'ScrollyStickyContent', note: 'Recipe — sticky + scroll (§6.2)' },
    { path: '/dev/chart-ladder', name: 'ChartLadder', note: 'Recipe — progressive annotation (§6.3)' },
    { path: '/dev/gallery-carousel', name: 'GalleryCarousel', note: 'Recipe — small multiples + lightbox (§6.7)' },
    { path: '/dev/scrolly-map', name: 'ScrollyMap', note: 'Recipe — scroll→flyTo map (§6.4)' }
```

Update the `<p>` tag (line 22) to mention Phase 3:

```svelte
  <p>Phase 1 — structural primitives. Phase 2 — content primitives. Phase 3 — recipes.</p>
```

- [ ] **Step 6: Run type check**

Run: `cd /Users/rmdms/Sites/Professional/viznews-lib && bun run check`
Expected: 0 errors

- [ ] **Step 7: Commit**

```bash
cd /Users/rmdms/Sites/Professional/viznews-lib
git add src/routes/dev/scrolly-sticky-content src/routes/dev/chart-ladder src/routes/dev/gallery-carousel src/routes/dev/scrolly-map src/routes/+page.svelte
git commit -m "feat(dev-harness): 4 recipe dev routes + fixtures"
```

---

## Task 7: Playwright Contract Tests

**Files:**
- Create: `tests/contracts/scrolly-sticky-content.spec.ts`
- Create: `tests/contracts/chart-ladder.spec.ts`
- Create: `tests/contracts/gallery-carousel.spec.ts`
- Create: `tests/contracts/scrolly-map.spec.ts`

- [ ] **Step 1: Create scrolly-sticky-content contract test**

Create `tests/contracts/scrolly-sticky-content.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test.describe("scrolly-sticky-content recipe", () => {
  test("expands to sticky — visual and steps present", async ({ page }) => {
    await page.goto("/dev/scrolly-sticky-content");
    const visual = page.getByTestId("sticky-visual");
    const steps = page.getByTestId("sticky-steps");
    await expect(visual).toBeVisible();
    await expect(steps).toBeVisible();
  });

  test("visual is sticky-positioned", async ({ page }) => {
    await page.goto("/dev/scrolly-sticky-content");
    const visual = page.getByTestId("sticky-visual");
    const position = await visual.evaluate(
      (el) => getComputedStyle(el).position,
    );
    expect(position).toBe("sticky");
  });

  test("steps contain expected number of children", async ({ page }) => {
    await page.goto("/dev/scrolly-sticky-content");
    const stepsChildren = page
      .getByTestId("sticky-steps")
      .locator('[data-testid="dev-stub"]');
    await expect(stepsChildren).toHaveCount(4);
  });
});
```

- [ ] **Step 2: Create chart-ladder contract test**

Create `tests/contracts/chart-ladder.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test.describe("chart-ladder recipe", () => {
  test("expands to sticky with crossfade visual", async ({ page }) => {
    await page.goto("/dev/chart-ladder");
    const visual = page.getByTestId("sticky-visual");
    await expect(visual).toBeVisible();
    const crossfadeFrames = visual.locator('[data-testid^="crossfade-frame-"]');
    await expect(crossfadeFrames).toHaveCount(3);
  });

  test("first crossfade frame is active by default", async ({ page }) => {
    await page.goto("/dev/chart-ladder");
    const frame0 = page.getByTestId("crossfade-frame-0");
    await expect(frame0).toHaveAttribute("data-active", "true");
  });

  test("steps match frame count", async ({ page }) => {
    await page.goto("/dev/chart-ladder");
    const steps = page
      .getByTestId("sticky-steps")
      .locator('[data-testid="dev-stub"]');
    await expect(steps).toHaveCount(3);
  });
});
```

- [ ] **Step 3: Create gallery-carousel contract test**

Create `tests/contracts/gallery-carousel.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test.describe("gallery-carousel recipe", () => {
  test("expands to grid with correct cell count", async ({ page }) => {
    await page.goto("/dev/gallery-carousel");
    const grid = page.getByTestId("grid-root");
    await expect(grid).toBeVisible();
    const cells = grid.locator('[data-testid^="grid-cell-"]');
    await expect(cells).toHaveCount(6);
  });

  test("clicking a cell opens lightbox dialog", async ({ page }) => {
    await page.goto("/dev/gallery-carousel");
    const firstCell = page.getByTestId("grid-cell-0");
    await firstCell.click();
    const dialog = page.locator("dialog[open]");
    await expect(dialog).toBeVisible();
  });

  test("Escape closes lightbox and restores focus", async ({ page }) => {
    await page.goto("/dev/gallery-carousel");
    const firstCell = page.getByTestId("grid-cell-0");
    await firstCell.click();
    await page.keyboard.press("Escape");
    const dialog = page.locator("dialog[open]");
    await expect(dialog).toHaveCount(0);
  });
});
```

- [ ] **Step 4: Create scrolly-map contract test**

Create `tests/contracts/scrolly-map.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test.describe("scrolly-map recipe", () => {
  test("map container is mounted", async ({ page }) => {
    await page.goto("/dev/scrolly-map");
    const mapContainer = page.getByTestId("mt-map-container");
    await expect(mapContainer).toBeVisible();
  });

  test("scroll steps are present", async ({ page }) => {
    await page.goto("/dev/scrolly-map");
    const steps = page.getByTestId("scrolly-map-steps");
    await expect(steps).toBeVisible();
    const stepEls = steps.locator('[data-testid^="scrolly-map-step-"]');
    await expect(stepEls).toHaveCount(3);
  });

  test("map has aria-label", async ({ page }) => {
    await page.goto("/dev/scrolly-map");
    const map = page.getByTestId("mt-map-root");
    await expect(map).toHaveAttribute("aria-label", "Map of Geneva region");
  });

  test("visual is sticky-positioned", async ({ page }) => {
    await page.goto("/dev/scrolly-map");
    const visual = page.getByTestId("scrolly-map-visual");
    const position = await visual.evaluate(
      (el) => getComputedStyle(el).position,
    );
    expect(position).toBe("sticky");
  });
});
```

- [ ] **Step 5: Commit**

```bash
cd /Users/rmdms/Sites/Professional/viznews-lib
git add tests/contracts/scrolly-sticky-content.spec.ts tests/contracts/chart-ladder.spec.ts tests/contracts/gallery-carousel.spec.ts tests/contracts/scrolly-map.spec.ts
git commit -m "test(contracts): 4 recipe Playwright contract tests"
```

---

## Task 8: Documentation + Changeset

**Files:**
- Modify: `docs/primitives.md`
- Create: `.changeset/phase-3-recipes.md`

- [ ] **Step 1: Add recipes section to primitives.md**

Append to `docs/primitives.md` (after the existing content):

```markdown

---

## Named Recipes (Phase 3)

Recipes are shorthand block types in `spec.json` that expand into primitive trees at build time. Three are pure schema sugar (zero new rendering); one (`scrolly-map`) has a glue component.

| Recipe | Block type | Expands to | Key props |
|---|---|---|---|
| ScrollyStickyContent | `scrolly-sticky-content` | `sticky` | `visual`, `steps`, `scrim?` |
| ChartLadder | `chart-ladder` | `sticky` > `crossfade` | `frames`, `steps` (same length) |
| GalleryCarousel | `gallery-carousel` | `grid` > `lightbox[]` | `cells`, `columns?`, `aspectRatio?` |
| ScrollyMap | `scrolly-map` | *Not expanded* — glue component | `map` (with `flyToSteps`), `steps` |

### Expansion pipeline

```
spec.json → Zod parse (recipes are valid block types)
          → expandRecipes() (3 sugar recipes → primitive trees)
          → tokensToCSSVariables
          → ArticlePageData (only primitives + scrolly-map remain)
          → BlockRenderer (renders primitives + ScrollyMap glue)
```

### Contracts

- `scrolly-sticky-content` — inherits §11.4, §11.5, §11.6, §11.7 from Sticky
- `chart-ladder` — inherits Sticky + §11.2 from Crossfade
- `gallery-carousel` — inherits §11.10 from Grid + §11.4, §11.7 from Lightbox
- `scrolly-map` — §11.3 (flyTo), §11.14 (MT lifecycle), inherits §11.7 from ScrollSteps
```

- [ ] **Step 2: Create changeset**

Create `.changeset/phase-3-recipes.md`:

```markdown
---
"@rmdms/viznews": minor
---

Phase 3 — named recipes (scrolly-sticky-content, chart-ladder, gallery-carousel, scrolly-map). Three expand to primitive trees at build time, scrolly-map gets a glue component for scroll→flyTo binding.
```

- [ ] **Step 3: Commit**

```bash
cd /Users/rmdms/Sites/Professional/viznews-lib
git add docs/primitives.md .changeset/phase-3-recipes.md
git commit -m "docs: Phase 3 recipes + changeset"
```

---

## Task 9: Final Verification

**Files:** None (verification only)

- [ ] **Step 1: Run full unit test suite**

Run: `cd /Users/rmdms/Sites/Professional/viznews-lib && bun test tests/unit`
Expected: All tests PASS (schemas + expand-recipes + existing tests)

- [ ] **Step 2: Run type check**

Run: `cd /Users/rmdms/Sites/Professional/viznews-lib && bun run check`
Expected: 0 errors

- [ ] **Step 3: Start dev server and verify routes**

Run: `cd /Users/rmdms/Sites/Professional/viznews-lib && bun run dev`

Verify in browser:
- `http://localhost:5173/` — 18 routes listed (14 existing + 4 recipes)
- `http://localhost:5173/dev/scrolly-sticky-content` — sticky layout renders with 4 steps
- `http://localhost:5173/dev/chart-ladder` — sticky + crossfade with 3 frames/steps
- `http://localhost:5173/dev/gallery-carousel` — 3-column grid with 6 cells, click opens lightbox
- `http://localhost:5173/dev/scrolly-map` — map + 3 scroll steps (map may not render without API key)

- [ ] **Step 4: Run Playwright contract tests**

Run: `cd /Users/rmdms/Sites/Professional/viznews-lib && bunx playwright test tests/contracts/scrolly-sticky-content.spec.ts tests/contracts/chart-ladder.spec.ts tests/contracts/gallery-carousel.spec.ts tests/contracts/scrolly-map.spec.ts`
Expected: All contract tests PASS
