# Content Primitives Phase 2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 6 content primitives (Markdown, Image, Video, DWChart, FlourishChart, MTMap) to `@rmdms/viznews`, plus migrate config builders/validators from the plugin into per-provider subpath exports.

**Architecture:** Content primitives are leaf-node Svelte components rendered inside structural containers. Config builders (DW, Flourish, MT) are pure functions exported via dedicated subpaths (`/datawrapper`, `/flourish`, `/maptiler`). Shared palette presets are factored into `core/palettes.ts`.

**Tech Stack:** Bun · Svelte 5 · SvelteKit · TypeScript strict · Zod · Playwright · bun:test · `@maptiler/sdk` (peer dep)

---

## File Structure

### New files

| File | Responsibility |
|---|---|
| `src/lib/core/palettes.ts` | Shared palette presets + `paletteToColors()` utility |
| `src/lib/core/schemas/content.ts` | Zod schemas for 6 content block types |
| `src/lib/content-primitives/Markdown.svelte` | `{@html}` wrapper with scoped typography |
| `src/lib/content-primitives/Image.svelte` | `<img>` wrapper with lazy loading + figcaption |
| `src/lib/content-primitives/Video.svelte` | `<video>` wrapper with reduced-motion |
| `src/lib/content-primitives/DWChart.svelte` | Datawrapper iframe with postMessage resize |
| `src/lib/content-primitives/FlourishChart.svelte` | Flourish iframe with postMessage resize |
| `src/lib/content-primitives/MTMap.svelte` | MapTiler SDK map with flyTo support |
| `src/lib/content-primitives/index.ts` | Re-exports all 6 components |
| `src/lib/content-primitives/datawrapper/intent-schema.ts` | Zod schema for EditorialIntent |
| `src/lib/content-primitives/datawrapper/build-config.ts` | `buildPublishableConfig()` + `validatePublishable()` |
| `src/lib/content-primitives/datawrapper/index.ts` | Re-exports |
| `src/lib/content-primitives/flourish/intent-schema.ts` | Zod schema for FlourishIntent |
| `src/lib/content-primitives/flourish/build-config.ts` | `buildFlourishEmbed()` + `validateFlourishPublishable()` |
| `src/lib/content-primitives/flourish/index.ts` | Re-exports |
| `src/lib/content-primitives/maptiler/intent-schema.ts` | Zod schema for SpatialIntent |
| `src/lib/content-primitives/maptiler/build-style.ts` | `buildPublishableStyle()` + `validateSpatialPublishable()` |
| `src/lib/content-primitives/maptiler/index.ts` | Re-exports |
| `tests/unit/content-schemas.test.ts` | Unit tests for 6 content Zod schemas |
| `tests/unit/palettes.test.ts` | Unit tests for palette presets + utility |
| `tests/unit/dw-builder.test.ts` | Unit tests for DW config builder + validator |
| `tests/unit/flourish-builder.test.ts` | Unit tests for Flourish embed builder + validator |
| `tests/unit/mt-builder.test.ts` | Unit tests for MT style builder + validator |
| `tests/contracts/markdown.spec.ts` | Playwright contract tests |
| `tests/contracts/image.spec.ts` | Playwright contract tests |
| `tests/contracts/video.spec.ts` | Playwright contract tests |
| `tests/contracts/dw-chart.spec.ts` | Playwright contract tests |
| `tests/contracts/flourish-chart.spec.ts` | Playwright contract tests |
| `tests/contracts/mt-map.spec.ts` | Playwright contract tests |
| `src/fixtures/markdown.json` | Dev fixture |
| `src/fixtures/image.json` | Dev fixture |
| `src/fixtures/video.json` | Dev fixture |
| `src/fixtures/dw-chart.json` | Dev fixture |
| `src/fixtures/flourish-chart.json` | Dev fixture |
| `src/fixtures/mt-map.json` | Dev fixture |
| `src/routes/dev/markdown/+page.ts` | Dev route loader |
| `src/routes/dev/markdown/+page.svelte` | Dev route page |
| `src/routes/dev/image/+page.ts` | Dev route loader |
| `src/routes/dev/image/+page.svelte` | Dev route page |
| `src/routes/dev/video/+page.ts` | Dev route loader |
| `src/routes/dev/video/+page.svelte` | Dev route page |
| `src/routes/dev/dw-chart/+page.ts` | Dev route loader |
| `src/routes/dev/dw-chart/+page.svelte` | Dev route page |
| `src/routes/dev/flourish-chart/+page.ts` | Dev route loader |
| `src/routes/dev/flourish-chart/+page.svelte` | Dev route page |
| `src/routes/dev/mt-map/+page.ts` | Dev route loader |
| `src/routes/dev/mt-map/+page.svelte` | Dev route page |

### Modified files

| File | Change |
|---|---|
| `src/lib/core/schemas/block.ts` | Add 6 content types to Block union + BlockSchema |
| `src/lib/core/schemas/index.ts` | Re-export `content.ts` |
| `src/lib/BlockRenderer.svelte` | Add 6 `{:else if}` branches for content blocks |
| `src/lib/index.ts` | Re-export content primitives + content block types |
| `src/routes/+page.svelte` | Add 6 content dev route links |
| `package.json` | Add 3 provider subpath exports + `@maptiler/sdk` peerDep |
| `docs/primitives.md` | Add content primitives section |

---

### Task 1: Shared palettes module

**Files:**
- Create: `src/lib/core/palettes.ts`
- Test: `tests/unit/palettes.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// tests/unit/palettes.test.ts
import { describe, it, expect } from "bun:test";
import { paletteToColors, PALETTE_PRESETS } from "../../src/lib/core/palettes";

describe("PALETTE_PRESETS", () => {
  it("has viridis with 5 colors", () => {
    expect(PALETTE_PRESETS.viridis).toHaveLength(5);
  });

  it("has okabe-ito with 8 colors", () => {
    expect(PALETTE_PRESETS["okabe-ito"]).toHaveLength(8);
  });

  it("has tol-bright with 7 colors", () => {
    expect(PALETTE_PRESETS["tol-bright"]).toHaveLength(7);
  });

  it("has category10 with 10 colors", () => {
    expect(PALETTE_PRESETS.category10).toHaveLength(10);
  });
});

describe("paletteToColors", () => {
  it("returns preset colors for known scheme", () => {
    const colors = paletteToColors({ scheme: "viridis" });
    expect(colors).toEqual(PALETTE_PRESETS.viridis);
  });

  it("returns reversed colors when reverse is true", () => {
    const colors = paletteToColors({ scheme: "viridis", reverse: true });
    expect(colors).toEqual([...PALETTE_PRESETS.viridis].reverse());
  });

  it("returns customColors for custom scheme", () => {
    const custom = ["#f00", "#0f0", "#00f"];
    const colors = paletteToColors({ scheme: "custom", customColors: custom });
    expect(colors).toEqual(custom);
  });

  it("throws for custom scheme without customColors", () => {
    expect(() => paletteToColors({ scheme: "custom" })).toThrow(
      "custom palette requires customColors[]",
    );
  });

  it("throws for unknown scheme", () => {
    expect(() => paletteToColors({ scheme: "nope" as any })).toThrow(
      "unknown palette scheme: nope",
    );
  });

  it("slices to steps when provided", () => {
    const colors = paletteToColors({ scheme: "viridis", steps: 3 });
    expect(colors).toHaveLength(3);
    expect(colors).toEqual(PALETTE_PRESETS.viridis.slice(0, 3));
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test tests/unit/palettes.test.ts`
Expected: FAIL — cannot resolve `../../src/lib/core/palettes`

- [ ] **Step 3: Implement palettes module**

```typescript
// src/lib/core/palettes.ts
export type PaletteConfig = {
  scheme: "viridis" | "okabe-ito" | "tol-bright" | "category10" | "custom";
  customColors?: string[];
  reverse?: boolean;
  steps?: number;
};

export const PALETTE_PRESETS: Record<string, string[]> = {
  viridis: ["#440154", "#3b528b", "#21918c", "#5ec962", "#fde725"],
  "okabe-ito": [
    "#000000", "#E69F00", "#56B4E9", "#009E73",
    "#F0E442", "#0072B2", "#D55E00", "#CC79A7",
  ],
  "tol-bright": [
    "#4477AA", "#EE6677", "#228833", "#CCBB44",
    "#66CCEE", "#AA3377", "#BBBBBB",
  ],
  category10: [
    "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
    "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf",
  ],
};

export function paletteToColors(palette: PaletteConfig): string[] {
  if (palette.scheme === "custom") {
    if (!palette.customColors?.length) {
      throw new Error("custom palette requires customColors[]");
    }
    return palette.customColors;
  }
  const preset = PALETTE_PRESETS[palette.scheme];
  if (!preset) {
    throw new Error(`unknown palette scheme: ${palette.scheme}`);
  }
  let colors = [...preset];
  if (palette.steps && palette.steps < colors.length) {
    colors = colors.slice(0, palette.steps);
  }
  if (palette.reverse) {
    colors.reverse();
  }
  return colors;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test tests/unit/palettes.test.ts`
Expected: 6 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/core/palettes.ts tests/unit/palettes.test.ts
git commit -m "feat(core): shared palette presets + paletteToColors utility"
```

---

### Task 2: Content block Zod schemas

**Files:**
- Create: `src/lib/core/schemas/content.ts`
- Modify: `src/lib/core/schemas/block.ts`
- Modify: `src/lib/core/schemas/index.ts`
- Test: `tests/unit/content-schemas.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
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
    const b = { type: "image", src: "https://example.com/img.jpg", alt: "A photo" };
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
    expect(parsed).toMatchObject({ type: "image", caption: "Photo credit: test" });
  });

  it("rejects image without alt", () => {
    expect(() =>
      BlockSchema.parse({ type: "image", src: "https://example.com/img.jpg" }),
    ).toThrow();
  });
});

describe("VideoBlock", () => {
  it("accepts minimal video block", () => {
    const b = { type: "video", src: "https://example.com/vid.mp4", alt: "A video" };
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
    expect(BlockSchema.parse(b)).toMatchObject({ type: "video", poster: "https://example.com/poster.jpg" });
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
    expect(BlockSchema.parse(b)).toMatchObject({ type: "dw-chart", height: 500 });
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test tests/unit/content-schemas.test.ts`
Expected: FAIL — discriminator `type` values not found

- [ ] **Step 3: Create content schemas**

```typescript
// src/lib/core/schemas/content.ts
import { z } from "zod";

export const MarkdownBlockSchema = z.object({
  type: z.literal("markdown"),
  html: z.string().min(1),
});

export const ImageBlockSchema = z.object({
  type: z.literal("image"),
  src: z.string().url(),
  alt: z.string(),
  aspectRatio: z.string().regex(/^\d+\s*\/\s*\d+$/).optional(),
  caption: z.string().optional(),
});

export const VideoBlockSchema = z.object({
  type: z.literal("video"),
  src: z.string().url(),
  alt: z.string(),
  poster: z.string().url().optional(),
  aspectRatio: z.string().regex(/^\d+\s*\/\s*\d+$/).optional(),
  caption: z.string().optional(),
});

export const DWChartBlockSchema = z.object({
  type: z.literal("dw-chart"),
  embedUrl: z.string().url(),
  title: z.string(),
  alt: z.string(),
  height: z.number().positive().optional(),
});

export const FlourishChartBlockSchema = z.object({
  type: z.literal("flourish-chart"),
  embedUrl: z.string().url(),
  title: z.string(),
  alt: z.string(),
  height: z.number().positive().optional(),
});

const FlyToStepSchema = z.object({
  center: z.tuple([z.number(), z.number()]),
  zoom: z.number().min(0).max(22),
  label: z.string().optional(),
});

export const MTMapBlockSchema = z.object({
  type: z.literal("mt-map"),
  style: z.record(z.unknown()),
  bounds: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  alt: z.string(),
  height: z.number().positive().optional(),
  interactive: z.boolean().optional(),
  flyToSteps: z.array(FlyToStepSchema).optional(),
});

export type MarkdownBlock = z.infer<typeof MarkdownBlockSchema>;
export type ImageBlock = z.infer<typeof ImageBlockSchema>;
export type VideoBlock = z.infer<typeof VideoBlockSchema>;
export type DWChartBlock = z.infer<typeof DWChartBlockSchema>;
export type FlourishChartBlock = z.infer<typeof FlourishChartBlockSchema>;
export type MTMapBlock = z.infer<typeof MTMapBlockSchema>;
```

- [ ] **Step 4: Update block.ts to include content types in the union**

Add imports from `./content` and extend the `Block` type union and `BlockSchema` discriminated union with all 6 content schemas. The Block type becomes:

```typescript
export type Block =
  | DevStubBlock
  | StickyBlock | ScrollStepsBlock | CrossfadeBlock | GridBlock | SplitBlock | SequenceBlock | LightboxBlock
  | MarkdownBlock | ImageBlock | VideoBlock | DWChartBlock | FlourishChartBlock | MTMapBlock;
```

And `BlockSchema` adds all 6 content schemas to the `z.discriminatedUnion` array.

- [ ] **Step 5: Update schemas/index.ts**

Add: `export * from "./content";`

- [ ] **Step 6: Run tests to verify they pass**

Run: `bun test tests/unit/content-schemas.test.ts`
Expected: 14 tests PASS

Also run: `bun test tests/unit/schemas.test.ts`
Expected: all existing tests still PASS (no regressions)

- [ ] **Step 7: Commit**

```bash
git add src/lib/core/schemas/content.ts src/lib/core/schemas/block.ts src/lib/core/schemas/index.ts tests/unit/content-schemas.test.ts
git commit -m "feat(schemas): 6 content block types added to Block union"
```

---

### Task 3: Datawrapper config builder

**Files:**
- Create: `src/lib/content-primitives/datawrapper/intent-schema.ts`
- Create: `src/lib/content-primitives/datawrapper/build-config.ts`
- Create: `src/lib/content-primitives/datawrapper/index.ts`
- Test: `tests/unit/dw-builder.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
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
    expect((config.metadata.visualize.colors as string[]).length).toBeGreaterThan(0);
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test tests/unit/dw-builder.test.ts`
Expected: FAIL — cannot resolve module

- [ ] **Step 3: Create intent schema (Zod)**

```typescript
// src/lib/content-primitives/datawrapper/intent-schema.ts
import { z } from "zod";

const DWChartTypeSchema = z.enum([
  "d3-bars", "d3-bars-split", "d3-bars-stacked", "d3-bars-bullet",
  "column-chart", "grouped-column-chart", "stacked-column-chart",
  "d3-lines", "d3-area", "d3-scatter-plot", "d3-dot-plot",
  "d3-range-plot", "d3-arrow-plot", "d3-pies", "d3-donuts",
  "d3-multiple-pies", "tables",
]);

const PaletteSchema = z.object({
  scheme: z.enum(["viridis", "okabe-ito", "tol-bright", "category10", "custom"]),
  customColors: z.array(z.string()).optional(),
  reverse: z.boolean().optional(),
});

const AnnotationSchema = z.object({
  x: z.union([z.string(), z.number()]),
  y: z.number(),
  text: z.string(),
});

const SourceSchema = z.object({
  label: z.string(),
  url: z.string().optional(),
});

export const EditorialIntentSchema = z.object({
  chartType: DWChartTypeSchema,
  title: z.string(),
  subtitle: z.string().optional(),
  source: SourceSchema,
  byline: z.string().optional(),
  data: z.object({ csv: z.string() }),
  palette: PaletteSchema,
  annotations: z.array(AnnotationSchema).optional(),
  altText: z.string(),
  locale: z.enum(["fr-CH", "fr-FR", "en-US", "en-GB", "de-CH"]),
  yAxisLabel: z.string().optional(),
  xAxisLabel: z.string().optional(),
  notes: z.string().optional(),
});

export type EditorialIntent = z.infer<typeof EditorialIntentSchema>;
```

- [ ] **Step 4: Create build-config (migrate from plugin)**

```typescript
// src/lib/content-primitives/datawrapper/build-config.ts
import type { EditorialIntent } from "./intent-schema";
import { paletteToColors } from "../../core/palettes";

export type DWPublishableConfig = {
  type: string;
  title: string;
  language: string;
  metadata: {
    describe: {
      intro?: string;
      "source-name": string;
      "source-url"?: string;
      byline?: string;
    };
    visualize: Record<string, unknown>;
    annotate: { notes?: string };
    publish: { "embed-width"?: number };
  };
  data: string;
};

export type ValidationResult = { ok: boolean; missing: string[] };

export function buildPublishableConfig(
  intent: EditorialIntent,
): DWPublishableConfig {
  const visualize: Record<string, unknown> = {
    colors: paletteToColors(intent.palette),
  };
  if (intent.annotations?.length) {
    visualize["text-annotations"] = intent.annotations.map((a) => ({
      x: a.x,
      y: a.y,
      text: a.text,
      align: "tl",
      bold: false,
    }));
  }
  if (intent.yAxisLabel) visualize["y-axis-label"] = intent.yAxisLabel;
  if (intent.xAxisLabel) visualize["x-axis-label"] = intent.xAxisLabel;

  return {
    type: intent.chartType,
    title: intent.title,
    language: intent.locale,
    metadata: {
      describe: {
        intro: intent.subtitle,
        "source-name": intent.source.label,
        "source-url": intent.source.url,
        byline: intent.byline,
      },
      visualize,
      annotate: { notes: intent.notes },
      publish: {},
    },
    data: intent.data.csv,
  };
}

export function validatePublishable(intent: EditorialIntent): ValidationResult {
  const missing: string[] = [];
  if (!intent.title?.trim()) missing.push("title");
  if (!intent.source?.label?.trim()) missing.push("source.label");
  if (!intent.data?.csv?.trim()) missing.push("data.csv");
  if (!intent.altText?.trim()) missing.push("altText");
  if (!intent.locale) missing.push("locale");
  if (!intent.palette) missing.push("palette");
  return { ok: missing.length === 0, missing };
}
```

- [ ] **Step 5: Create index.ts**

```typescript
// src/lib/content-primitives/datawrapper/index.ts
export { EditorialIntentSchema, type EditorialIntent } from "./intent-schema";
export {
  buildPublishableConfig,
  validatePublishable,
  type DWPublishableConfig,
  type ValidationResult,
} from "./build-config";
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `bun test tests/unit/dw-builder.test.ts`
Expected: 8 tests PASS

- [ ] **Step 7: Commit**

```bash
git add src/lib/content-primitives/datawrapper/ tests/unit/dw-builder.test.ts
git commit -m "feat(datawrapper): intent schema + config builder + validator"
```

---

### Task 4: Flourish config builder

**Files:**
- Create: `src/lib/content-primitives/flourish/intent-schema.ts`
- Create: `src/lib/content-primitives/flourish/build-config.ts`
- Create: `src/lib/content-primitives/flourish/index.ts`
- Test: `tests/unit/flourish-builder.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// tests/unit/flourish-builder.test.ts
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
    const parsed = FlourishIntentSchema.parse(VALID_INTENT);
    expect(parsed.visualisationId).toBe("123456");
  });

  it("rejects missing visualisationId", () => {
    const { visualisationId, ...rest } = VALID_INTENT;
    expect(() => FlourishIntentSchema.parse(rest)).toThrow();
  });
});

describe("buildFlourishEmbed", () => {
  it("returns correct embed URL", () => {
    const intent = FlourishIntentSchema.parse(VALID_INTENT);
    const url = buildFlourishEmbed(intent);
    expect(url).toBe("https://flo.uri.sh/visualisation/123456/embed");
  });

  it("includes query params when autoplay", () => {
    const intent = FlourishIntentSchema.parse({
      ...VALID_INTENT,
      autoplay: true,
    });
    const url = buildFlourishEmbed(intent);
    expect(url).toContain("auto=1");
  });
});

describe("validateFlourishPublishable", () => {
  it("returns ok for valid intent", () => {
    const intent = FlourishIntentSchema.parse(VALID_INTENT);
    const result = validateFlourishPublishable(intent);
    expect(result.ok).toBe(true);
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test tests/unit/flourish-builder.test.ts`
Expected: FAIL

- [ ] **Step 3: Create intent schema**

```typescript
// src/lib/content-primitives/flourish/intent-schema.ts
import { z } from "zod";

const PaletteSchema = z.object({
  scheme: z.enum(["viridis", "okabe-ito", "tol-bright", "category10", "custom"]),
  customColors: z.array(z.string()).optional(),
  reverse: z.boolean().optional(),
});

const SourceSchema = z.object({
  label: z.string(),
  url: z.string().optional(),
});

export const FlourishIntentSchema = z.object({
  visualisationId: z.string().min(1),
  title: z.string(),
  alt: z.string(),
  source: SourceSchema,
  palette: PaletteSchema,
  autoplay: z.boolean().optional(),
});

export type FlourishIntent = z.infer<typeof FlourishIntentSchema>;
```

- [ ] **Step 4: Create build-config**

```typescript
// src/lib/content-primitives/flourish/build-config.ts
import type { FlourishIntent } from "./intent-schema";

export type ValidationResult = { ok: boolean; missing: string[] };

export function buildFlourishEmbed(intent: FlourishIntent): string {
  const base = `https://flo.uri.sh/visualisation/${intent.visualisationId}/embed`;
  const params = new URLSearchParams();
  if (intent.autoplay) params.set("auto", "1");
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export function validateFlourishPublishable(
  intent: FlourishIntent,
): ValidationResult {
  const missing: string[] = [];
  if (!intent.visualisationId?.trim()) missing.push("visualisationId");
  if (!intent.title?.trim()) missing.push("title");
  if (!intent.alt?.trim()) missing.push("alt");
  if (!intent.source?.label?.trim()) missing.push("source.label");
  return { ok: missing.length === 0, missing };
}
```

- [ ] **Step 5: Create index.ts**

```typescript
// src/lib/content-primitives/flourish/index.ts
export { FlourishIntentSchema, type FlourishIntent } from "./intent-schema";
export {
  buildFlourishEmbed,
  validateFlourishPublishable,
  type ValidationResult,
} from "./build-config";
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `bun test tests/unit/flourish-builder.test.ts`
Expected: 5 tests PASS

- [ ] **Step 7: Commit**

```bash
git add src/lib/content-primitives/flourish/ tests/unit/flourish-builder.test.ts
git commit -m "feat(flourish): intent schema + embed builder + validator"
```

---

### Task 5: MapTiler style builder

**Files:**
- Create: `src/lib/content-primitives/maptiler/intent-schema.ts`
- Create: `src/lib/content-primitives/maptiler/build-style.ts`
- Create: `src/lib/content-primitives/maptiler/index.ts`
- Test: `tests/unit/mt-builder.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// tests/unit/mt-builder.test.ts
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
    const parsed = SpatialIntentSchema.parse(VALID_INTENT);
    expect(parsed.mapType).toBe("choropleth");
  });

  it("rejects unknown mapType", () => {
    expect(() =>
      SpatialIntentSchema.parse({ ...VALID_INTENT, mapType: "unknown" }),
    ).toThrow();
  });
});

describe("buildPublishableStyle", () => {
  it("returns version 8 style", () => {
    const intent = SpatialIntentSchema.parse(VALID_INTENT);
    const style = buildPublishableStyle(intent);
    expect(style.version).toBe(8);
  });

  it("includes metadata", () => {
    const intent = SpatialIntentSchema.parse(VALID_INTENT);
    const style = buildPublishableStyle(intent);
    expect(style.metadata?.title).toBe("Income by canton");
  });

  it("produces choropleth-fill layer for choropleth type", () => {
    const intent = SpatialIntentSchema.parse(VALID_INTENT);
    const style = buildPublishableStyle(intent);
    expect(style.layers.some((l) => l.id === "choropleth-fill")).toBe(true);
  });

  it("produces symbol-circle layer for proportional-symbol type", () => {
    const intent = SpatialIntentSchema.parse({
      ...VALID_INTENT,
      mapType: "proportional-symbol",
    });
    const style = buildPublishableStyle(intent);
    expect(style.layers.some((l) => l.id === "symbol-circle")).toBe(true);
  });

  it("produces heatmap layer for heatmap type", () => {
    const intent = SpatialIntentSchema.parse({
      ...VALID_INTENT,
      mapType: "heatmap",
    });
    const style = buildPublishableStyle(intent);
    expect(style.layers.some((l) => l.id === "heatmap")).toBe(true);
  });

  it("includes bounds as [west, south, east, north]", () => {
    const intent = SpatialIntentSchema.parse(VALID_INTENT);
    const style = buildPublishableStyle(intent);
    expect(style.bounds).toEqual([5.9, 45.8, 10.5, 47.8]);
  });
});

describe("validateSpatialPublishable", () => {
  it("returns ok for valid intent", () => {
    const intent = SpatialIntentSchema.parse(VALID_INTENT);
    const result = validateSpatialPublishable(intent);
    expect(result.ok).toBe(true);
  });

  it("reports missing fields", () => {
    const intent = SpatialIntentSchema.parse(VALID_INTENT);
    intent.title = "";
    intent.altText = "";
    const result = validateSpatialPublishable(intent);
    expect(result.ok).toBe(false);
    expect(result.missing).toContain("title");
    expect(result.missing).toContain("altText");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test tests/unit/mt-builder.test.ts`
Expected: FAIL

- [ ] **Step 3: Create intent schema (Zod)**

```typescript
// src/lib/content-primitives/maptiler/intent-schema.ts
import { z } from "zod";

const MapTypeSchema = z.enum([
  "choropleth", "proportional-symbol", "dot", "heatmap", "flow", "interactive",
]);

const PaletteSchema = z.object({
  scheme: z.enum(["viridis", "okabe-ito", "tol-bright", "category10", "custom"]),
  customColors: z.array(z.string()).optional(),
  steps: z.number().optional(),
});

const BoundsSchema = z.object({
  west: z.number(),
  south: z.number(),
  east: z.number(),
  north: z.number(),
});

const SourceSchema = z.object({
  label: z.string(),
  url: z.string().optional(),
});

const DataSourceSchema = z.union([
  z.object({
    geojsonUrl: z.string(),
    joinKey: z.string().optional(),
    attributes: z
      .object({ csvUrl: z.string(), valueColumn: z.string() })
      .optional(),
  }),
  z.object({
    csvUrl: z.string(),
    lonColumn: z.string(),
    latColumn: z.string(),
    valueColumn: z.string().optional(),
  }),
]);

export const SpatialIntentSchema = z.object({
  mapType: MapTypeSchema,
  title: z.string(),
  subtitle: z.string().optional(),
  source: SourceSchema,
  byline: z.string().optional(),
  baseStyle: z.enum(["DATAVIZ.LIGHT", "DATAVIZ.DARK", "STREETS.LIGHT", "BASIC"]),
  data: DataSourceSchema,
  palette: PaletteSchema,
  bounds: BoundsSchema,
  legend: z.object({ title: z.string(), format: z.string().optional() }),
  altText: z.string(),
  locale: z.enum(["fr-CH", "fr-FR", "en-US", "en-GB", "de-CH"]),
  interactions: z
    .object({
      popupOnHover: z.boolean().optional(),
      flyToOnClick: z.boolean().optional(),
    })
    .optional(),
});

export type SpatialIntent = z.infer<typeof SpatialIntentSchema>;
```

- [ ] **Step 4: Create build-style (migrate from plugin)**

```typescript
// src/lib/content-primitives/maptiler/build-style.ts
import type { SpatialIntent } from "./intent-schema";
import { paletteToColors } from "../../core/palettes";

export type MTStyle = {
  version: 8;
  metadata?: {
    title?: string;
    subtitle?: string;
    source?: string;
    byline?: string;
    altText?: string;
    locale?: string;
  };
  bounds?: [number, number, number, number];
  sources: Record<string, unknown>;
  layers: Array<Record<string, unknown>>;
};

export type ValidationResult = { ok: boolean; missing: string[] };

function buildChoroplethLayer(
  intent: SpatialIntent,
): Array<Record<string, unknown>> {
  const colors = paletteToColors(intent.palette);
  const stepsExpr: unknown[] = ["step", ["get", "value"]];
  colors.forEach((c, i) => {
    if (i === 0) {
      stepsExpr.push(c);
    } else {
      stepsExpr.push(i / colors.length, c);
    }
  });
  return [
    {
      id: "choropleth-fill",
      type: "fill",
      source: "data",
      paint: {
        "fill-color": stepsExpr,
        "fill-opacity": 0.85,
        "fill-outline-color": "#ffffff",
      },
    },
  ];
}

function buildSymbolLayer(
  intent: SpatialIntent,
): Array<Record<string, unknown>> {
  const colors = paletteToColors(intent.palette);
  return [
    {
      id: "symbol-circle",
      type: "circle",
      source: "data",
      paint: {
        "circle-radius": [
          "interpolate", ["linear"], ["get", "value"], 0, 2, 100, 30,
        ],
        "circle-color": colors[0] ?? "#1f77b4",
        "circle-opacity": 0.7,
        "circle-stroke-width": 1,
        "circle-stroke-color": "#ffffff",
      },
    },
  ];
}

function buildHeatmapLayer(
  intent: SpatialIntent,
): Array<Record<string, unknown>> {
  const colors = paletteToColors(intent.palette);
  return [
    {
      id: "heatmap",
      type: "heatmap",
      source: "data",
      paint: {
        "heatmap-weight": ["coalesce", ["get", "value"], 1],
        "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 9, 3],
        "heatmap-color": [
          "interpolate", ["linear"], ["heatmap-density"],
          0, "rgba(0,0,0,0)",
          0.2, colors[0] ?? "#440154",
          0.4, colors[1] ?? "#3b528b",
          0.6, colors[2] ?? "#21918c",
          0.8, colors[3] ?? "#5ec962",
          1, colors[4] ?? "#fde725",
        ],
      },
    },
  ];
}

function buildDotLayer(
  intent: SpatialIntent,
): Array<Record<string, unknown>> {
  const colors = paletteToColors(intent.palette);
  return [
    {
      id: "dot",
      type: "circle",
      source: "data",
      paint: {
        "circle-radius": 3,
        "circle-color": colors[0] ?? "#1f77b4",
        "circle-opacity": 0.6,
      },
    },
  ];
}

export function buildPublishableStyle(intent: SpatialIntent): MTStyle {
  const sources: Record<string, unknown> = {};
  if ("geojsonUrl" in intent.data) {
    sources.data = { type: "geojson", data: intent.data.geojsonUrl };
  } else {
    sources.data = { type: "geojson", data: intent.data.csvUrl };
  }

  let layers: Array<Record<string, unknown>>;
  switch (intent.mapType) {
    case "choropleth":
      layers = buildChoroplethLayer(intent);
      break;
    case "proportional-symbol":
      layers = buildSymbolLayer(intent);
      break;
    case "heatmap":
      layers = buildHeatmapLayer(intent);
      break;
    case "dot":
      layers = buildDotLayer(intent);
      break;
    case "flow":
    case "interactive":
      layers = [{ id: "placeholder", type: "fill", source: "data" }];
      break;
  }

  return {
    version: 8,
    metadata: {
      title: intent.title,
      subtitle: intent.subtitle,
      source: intent.source.label,
      byline: intent.byline,
      altText: intent.altText,
      locale: intent.locale,
    },
    bounds: [
      intent.bounds.west,
      intent.bounds.south,
      intent.bounds.east,
      intent.bounds.north,
    ],
    sources,
    layers,
  };
}

export function validateSpatialPublishable(
  intent: SpatialIntent,
): ValidationResult {
  const missing: string[] = [];
  if (!intent.title?.trim()) missing.push("title");
  if (!intent.source?.label?.trim()) missing.push("source.label");
  if (!intent.altText?.trim()) missing.push("altText");
  if (!intent.locale) missing.push("locale");
  if (!intent.legend?.title?.trim()) missing.push("legend.title");
  if (!intent.bounds) missing.push("bounds");
  return { ok: missing.length === 0, missing };
}
```

- [ ] **Step 5: Create index.ts**

```typescript
// src/lib/content-primitives/maptiler/index.ts
export { SpatialIntentSchema, type SpatialIntent } from "./intent-schema";
export {
  buildPublishableStyle,
  validateSpatialPublishable,
  type MTStyle,
  type ValidationResult,
} from "./build-style";
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `bun test tests/unit/mt-builder.test.ts`
Expected: 8 tests PASS

- [ ] **Step 7: Commit**

```bash
git add src/lib/content-primitives/maptiler/ tests/unit/mt-builder.test.ts
git commit -m "feat(maptiler): intent schema + style builder + validator"
```

---

### Task 6: Package exports + peerDep

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add 3 provider subpath exports and @maptiler/sdk peerDep**

Add to `package.json` `exports`:

```jsonc
"./datawrapper": {
  "types": "./dist/content-primitives/datawrapper/index.d.ts",
  "default": "./dist/content-primitives/datawrapper/index.js"
},
"./flourish": {
  "types": "./dist/content-primitives/flourish/index.d.ts",
  "default": "./dist/content-primitives/flourish/index.js"
},
"./maptiler": {
  "types": "./dist/content-primitives/maptiler/index.d.ts",
  "default": "./dist/content-primitives/maptiler/index.js"
}
```

Add to `peerDependencies`:

```jsonc
"@maptiler/sdk": "^2.0.0"
```

Add `@maptiler/sdk` to `devDependencies` too (for dev harness):

Run: `cd /Users/rmdms/Sites/Professional/viznews-lib && bun add -d @maptiler/sdk`

- [ ] **Step 2: Verify bun install succeeds**

Run: `cd /Users/rmdms/Sites/Professional/viznews-lib && bun install`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add package.json bun.lock
git commit -m "chore: add provider subpath exports + @maptiler/sdk peerDep"
```

---

### Task 7: Markdown + Image + Video components

**Files:**
- Create: `src/lib/content-primitives/Markdown.svelte`
- Create: `src/lib/content-primitives/Image.svelte`
- Create: `src/lib/content-primitives/Video.svelte`
- Create: `src/lib/content-primitives/index.ts`

- [ ] **Step 1: Create Markdown component**

```svelte
<!-- src/lib/content-primitives/Markdown.svelte -->
<script lang="ts">
  let { html }: { html: string } = $props();
</script>

<figure class="vn-markdown" data-testid="markdown-root">
  {@html html}
</figure>

<style>
  .vn-markdown {
    margin: 0;
    font-family: var(--vn-font-body);
    color: var(--vn-color-fg);
    line-height: 1.6;
  }
  .vn-markdown :global(h1, h2, h3, h4, h5, h6) {
    font-family: var(--vn-font-heading);
    margin-top: calc(var(--vn-spacing) * 3);
    margin-bottom: calc(var(--vn-spacing) * 1);
  }
  .vn-markdown :global(p) {
    margin-top: 0;
    margin-bottom: calc(var(--vn-spacing) * 2);
  }
  .vn-markdown :global(a) {
    color: var(--vn-color-accent);
  }
</style>
```

- [ ] **Step 2: Create Image component**

```svelte
<!-- src/lib/content-primitives/Image.svelte -->
<script lang="ts">
  let {
    src,
    alt,
    aspectRatio,
    caption,
  }: {
    src: string;
    alt: string;
    aspectRatio?: string;
    caption?: string;
  } = $props();
</script>

<figure class="vn-image" data-testid="image-root">
  <img
    {src}
    {alt}
    loading="lazy"
    style:aspect-ratio={aspectRatio}
    data-testid="image-img"
  />
  {#if caption}
    <figcaption data-testid="image-caption">{caption}</figcaption>
  {/if}
</figure>

<style>
  .vn-image {
    margin: 0;
  }
  .vn-image img {
    width: 100%;
    height: auto;
    display: block;
    object-fit: cover;
  }
  .vn-image figcaption {
    font-family: var(--vn-font-body);
    font-size: 0.85em;
    color: var(--vn-color-muted);
    margin-top: calc(var(--vn-spacing) * 1);
  }
</style>
```

- [ ] **Step 3: Create Video component**

```svelte
<!-- src/lib/content-primitives/Video.svelte -->
<script lang="ts">
  let {
    src,
    alt,
    poster,
    aspectRatio,
    caption,
  }: {
    src: string;
    alt: string;
    poster?: string;
    aspectRatio?: string;
    caption?: string;
  } = $props();

  let videoEl: HTMLVideoElement | undefined = $state();

  $effect(() => {
    if (!videoEl) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handle = () => {
      if (mq.matches && videoEl && !videoEl.paused) videoEl.pause();
    };
    handle();
    mq.addEventListener("change", handle);
    return () => mq.removeEventListener("change", handle);
  });
</script>

<figure class="vn-video" data-testid="video-root">
  <video
    bind:this={videoEl}
    {src}
    {poster}
    controls
    preload="metadata"
    aria-label={alt}
    style:aspect-ratio={aspectRatio}
    data-testid="video-player"
  ></video>
  {#if caption}
    <figcaption data-testid="video-caption">{caption}</figcaption>
  {/if}
</figure>

<style>
  .vn-video {
    margin: 0;
  }
  .vn-video video {
    width: 100%;
    display: block;
  }
  .vn-video figcaption {
    font-family: var(--vn-font-body);
    font-size: 0.85em;
    color: var(--vn-color-muted);
    margin-top: calc(var(--vn-spacing) * 1);
  }
</style>
```

- [ ] **Step 4: Create content-primitives/index.ts**

```typescript
// src/lib/content-primitives/index.ts
export { default as Markdown } from "./Markdown.svelte";
export { default as Image } from "./Image.svelte";
export { default as Video } from "./Video.svelte";
export { default as DWChart } from "./DWChart.svelte";
export { default as FlourishChart } from "./FlourishChart.svelte";
export { default as MTMap } from "./MTMap.svelte";
```

Note: DWChart, FlourishChart, MTMap don't exist yet — that's OK, this file won't be imported until Task 8-9. Alternatively, add only the 3 that exist now and extend in Tasks 8-9.

- [ ] **Step 5: Commit**

```bash
git add src/lib/content-primitives/Markdown.svelte src/lib/content-primitives/Image.svelte src/lib/content-primitives/Video.svelte src/lib/content-primitives/index.ts
git commit -m "feat(content): Markdown + Image + Video components"
```

---

### Task 8: DWChart + FlourishChart iframe components

**Files:**
- Create: `src/lib/content-primitives/DWChart.svelte`
- Create: `src/lib/content-primitives/FlourishChart.svelte`

- [ ] **Step 1: Create DWChart component**

```svelte
<!-- src/lib/content-primitives/DWChart.svelte -->
<script lang="ts">
  let {
    embedUrl,
    title,
    alt,
    height = 400,
  }: {
    embedUrl: string;
    title: string;
    alt: string;
    height?: number;
  } = $props();

  let iframeHeight = $state(height);

  $effect(() => {
    const handler = (e: MessageEvent) => {
      if (typeof e.data === "object" && e.data?.["datawrapper-height"]) {
        const heights = e.data["datawrapper-height"];
        const firstKey = Object.keys(heights)[0];
        if (firstKey) iframeHeight = heights[firstKey];
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  });
</script>

<figure class="vn-dw-chart" data-testid="dw-chart-root" aria-label={alt}>
  <iframe
    src={embedUrl}
    {title}
    loading="lazy"
    scrolling="no"
    frameborder="0"
    style:height="{iframeHeight}px"
    style:width="100%"
    data-testid="dw-chart-iframe"
  ></iframe>
</figure>

<style>
  .vn-dw-chart {
    margin: 0;
  }
  .vn-dw-chart iframe {
    border: none;
    display: block;
  }
</style>
```

- [ ] **Step 2: Create FlourishChart component**

```svelte
<!-- src/lib/content-primitives/FlourishChart.svelte -->
<script lang="ts">
  let {
    embedUrl,
    title,
    alt,
    height = 400,
  }: {
    embedUrl: string;
    title: string;
    alt: string;
    height?: number;
  } = $props();

  let iframeHeight = $state(height);

  $effect(() => {
    const handler = (e: MessageEvent) => {
      if (
        typeof e.data === "object" &&
        e.data?.sender === "Flourish" &&
        e.data?.method === "resize" &&
        typeof e.data?.height === "number"
      ) {
        iframeHeight = e.data.height;
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  });
</script>

<figure class="vn-flourish-chart" data-testid="flourish-chart-root" aria-label={alt}>
  <iframe
    src={embedUrl}
    {title}
    loading="lazy"
    scrolling="no"
    frameborder="0"
    sandbox="allow-same-origin allow-forms allow-scripts allow-downloads allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
    style:height="{iframeHeight}px"
    style:width="100%"
    data-testid="flourish-chart-iframe"
  ></iframe>
</figure>

<style>
  .vn-flourish-chart {
    margin: 0;
  }
  .vn-flourish-chart iframe {
    border: none;
    display: block;
  }
</style>
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/content-primitives/DWChart.svelte src/lib/content-primitives/FlourishChart.svelte
git commit -m "feat(content): DWChart + FlourishChart iframe components"
```

---

### Task 9: MTMap component

**Files:**
- Create: `src/lib/content-primitives/MTMap.svelte`

- [ ] **Step 1: Create MTMap component**

```svelte
<!-- src/lib/content-primitives/MTMap.svelte -->
<script lang="ts">
  import * as maptilersdk from '@maptiler/sdk';
  import '@maptiler/sdk/dist/maptiler-sdk.css';

  let {
    style,
    bounds,
    alt,
    height = 500,
    interactive = true,
    flyToSteps,
  }: {
    style: Record<string, unknown>;
    bounds: [number, number, number, number];
    alt: string;
    height?: number;
    interactive?: boolean;
    flyToSteps?: Array<{ center: [number, number]; zoom: number; label?: string }>;
  } = $props();

  let containerEl: HTMLDivElement | undefined = $state();
  let map: maptilersdk.Map | undefined = $state();

  export function flyTo(stepIndex: number) {
    if (!map || !flyToSteps || !flyToSteps[stepIndex]) return;
    const step = flyToSteps[stepIndex];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    map.flyTo({
      center: step.center,
      zoom: step.zoom,
      duration: reducedMotion ? 0 : 1500,
    });
  }

  $effect(() => {
    if (!containerEl) return;

    map = new maptilersdk.Map({
      container: containerEl,
      style: style as maptilersdk.StyleSpecification,
      bounds: bounds as maptilersdk.LngLatBoundsLike,
      fitBoundsOptions: { padding: 20 },
      interactive,
      attributionControl: false,
    });

    return () => {
      map?.remove();
      map = undefined;
    };
  });
</script>

<figure
  class="vn-mt-map"
  data-testid="mt-map-root"
  role={interactive ? "application" : "img"}
  aria-label={alt}
>
  <div
    bind:this={containerEl}
    class="vn-mt-map-container"
    style:height="{height}px"
    data-testid="mt-map-container"
  ></div>
</figure>

<style>
  .vn-mt-map {
    margin: 0;
  }
  .vn-mt-map-container {
    width: 100%;
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/content-primitives/MTMap.svelte
git commit -m "feat(content): MTMap component with SDK + flyTo"
```

---

### Task 10: BlockRenderer + lib exports update

**Files:**
- Modify: `src/lib/BlockRenderer.svelte`
- Modify: `src/lib/index.ts`

- [ ] **Step 1: Update BlockRenderer.svelte**

Add import at top:

```typescript
import { Markdown, Image, Video, DWChart, FlourishChart, MTMap } from './content-primitives';
```

Add 6 new `{:else if}` branches before the closing `{/if}`, after the lightbox branch:

```svelte
{:else if block.type === 'markdown'}
  <Markdown html={block.html} />
{:else if block.type === 'image'}
  <Image src={block.src} alt={block.alt} aspectRatio={block.aspectRatio} caption={block.caption} />
{:else if block.type === 'video'}
  <Video src={block.src} alt={block.alt} poster={block.poster} aspectRatio={block.aspectRatio} caption={block.caption} />
{:else if block.type === 'dw-chart'}
  <DWChart embedUrl={block.embedUrl} title={block.title} alt={block.alt} height={block.height} />
{:else if block.type === 'flourish-chart'}
  <FlourishChart embedUrl={block.embedUrl} title={block.title} alt={block.alt} height={block.height} />
{:else if block.type === 'mt-map'}
  <MTMap style={block.style} bounds={block.bounds} alt={block.alt} height={block.height} interactive={block.interactive} flyToSteps={block.flyToSteps} />
```

- [ ] **Step 2: Update src/lib/index.ts**

Add content primitive exports:

```typescript
export * from "./content-primitives";
export type {
  MarkdownBlock,
  ImageBlock,
  VideoBlock,
  DWChartBlock,
  FlourishChartBlock,
  MTMapBlock,
} from "./core/schemas/content";
```

- [ ] **Step 3: Verify dev server compiles**

Run: `cd /Users/rmdms/Sites/Professional/viznews-lib && bun run dev &` then check no build errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/BlockRenderer.svelte src/lib/index.ts
git commit -m "feat(renderer): wire 6 content primitives into BlockRenderer"
```

---

### Task 11: Dev fixtures + routes (Markdown, Image, Video)

**Files:**
- Create: `src/fixtures/markdown.json`
- Create: `src/fixtures/image.json`
- Create: `src/fixtures/video.json`
- Create: `src/routes/dev/markdown/+page.ts`
- Create: `src/routes/dev/markdown/+page.svelte`
- Create: `src/routes/dev/image/+page.ts`
- Create: `src/routes/dev/image/+page.svelte`
- Create: `src/routes/dev/video/+page.ts`
- Create: `src/routes/dev/video/+page.svelte`
- Modify: `src/routes/+page.svelte`

- [ ] **Step 1: Create markdown fixture**

```json
{
  "slug": "markdown-demo",
  "metadata": {
    "title": "Markdown demo",
    "byline": "test",
    "publishedAt": "2026-04-17"
  },
  "tokens": {
    "locale": "fr-CH",
    "palette": { "scheme": "viridis", "background": "#ffffff", "foreground": "#111111", "muted": "#666666", "accent": "#156964" },
    "typography": { "bodyFontFamily": "'Inter', system-ui, sans-serif", "headingFontFamily": "'Inter', system-ui, sans-serif", "monoFontFamily": "'JetBrains Mono', monospace", "baseSize": 17, "scale": 1.25 },
    "spacing": { "unit": 8 },
    "sourceStyle": { "format": "footnote", "prefix": "Source : " },
    "mode": "light"
  },
  "blocks": [
    {
      "type": "markdown",
      "html": "<h2>Introduction</h2><p>This is a <strong>test paragraph</strong> with a <a href=\"https://example.com\">link</a>.</p><p>Second paragraph with <em>emphasis</em>.</p>"
    }
  ]
}
```

- [ ] **Step 2: Create image fixture**

```json
{
  "slug": "image-demo",
  "metadata": {
    "title": "Image demo",
    "byline": "test",
    "publishedAt": "2026-04-17"
  },
  "tokens": {
    "locale": "fr-CH",
    "palette": { "scheme": "viridis", "background": "#ffffff", "foreground": "#111111", "muted": "#666666", "accent": "#156964" },
    "typography": { "bodyFontFamily": "'Inter', system-ui, sans-serif", "headingFontFamily": "'Inter', system-ui, sans-serif", "monoFontFamily": "'JetBrains Mono', monospace", "baseSize": 17, "scale": 1.25 },
    "spacing": { "unit": 8 },
    "sourceStyle": { "format": "footnote", "prefix": "Source : " },
    "mode": "light"
  },
  "blocks": [
    {
      "type": "image",
      "src": "https://picsum.photos/800/450",
      "alt": "Random placeholder image",
      "aspectRatio": "16 / 9",
      "caption": "Photo: Lorem Picsum"
    }
  ]
}
```

- [ ] **Step 3: Create video fixture**

```json
{
  "slug": "video-demo",
  "metadata": {
    "title": "Video demo",
    "byline": "test",
    "publishedAt": "2026-04-17"
  },
  "tokens": {
    "locale": "fr-CH",
    "palette": { "scheme": "viridis", "background": "#ffffff", "foreground": "#111111", "muted": "#666666", "accent": "#156964" },
    "typography": { "bodyFontFamily": "'Inter', system-ui, sans-serif", "headingFontFamily": "'Inter', system-ui, sans-serif", "monoFontFamily": "'JetBrains Mono', monospace", "baseSize": 17, "scale": 1.25 },
    "spacing": { "unit": 8 },
    "sourceStyle": { "format": "footnote", "prefix": "Source : " },
    "mode": "light"
  },
  "blocks": [
    {
      "type": "video",
      "src": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm",
      "alt": "A flower blooming time-lapse",
      "poster": "https://picsum.photos/800/450",
      "aspectRatio": "16 / 9",
      "caption": "Source: MDN Web Docs"
    }
  ]
}
```

- [ ] **Step 4: Create dev routes (3 routes, same pattern)**

Each route has `+page.ts`:

```typescript
// src/routes/dev/markdown/+page.ts (same pattern for image, video)
import { buildArticlePage } from "$lib/core/build-page";
import fixture from "$lib/../fixtures/markdown.json"; // change per route

export const prerender = true;

export function load() {
  return { page: buildArticlePage(fixture) };
}
```

Each route has `+page.svelte`:

```svelte
<!-- src/routes/dev/markdown/+page.svelte -->
<script lang="ts">
  import BlockRenderer from '$lib/BlockRenderer.svelte';
  let { data } = $props();
</script>

<main>
  <header>
    <h1>{data.page.metadata.title}</h1>
    <p><small>dev route — content primitive</small></p>
  </header>
  {#each data.page.blocks as block}
    <BlockRenderer {block} />
  {/each}
</main>

<style>
  header { padding: 1rem; max-width: 720px; margin: 0 auto; }
  main { max-width: 720px; margin: 0 auto; padding: 1rem; }
</style>
```

Repeat for `image` and `video` (import the corresponding fixture).

- [ ] **Step 5: Update index page with new route links**

Add to the `routes` array in `src/routes/+page.svelte`:

```typescript
{ path: '/dev/markdown', name: 'Markdown', note: 'Pre-rendered HTML content' },
{ path: '/dev/image', name: 'Image', note: 'Lazy-loaded image with figcaption' },
{ path: '/dev/video', name: 'Video', note: 'Video with controls + reduced-motion' },
```

Update the description text from "Phase 1 — 7 structural primitives." to "Phase 1 — structural primitives. Phase 2 — content primitives."

- [ ] **Step 6: Verify dev server shows all 3 routes**

Run: `cd /Users/rmdms/Sites/Professional/viznews-lib && bun run dev`
Visit: `http://localhost:5173/dev/markdown`, `/dev/image`, `/dev/video`

- [ ] **Step 7: Commit**

```bash
git add src/fixtures/markdown.json src/fixtures/image.json src/fixtures/video.json src/routes/dev/markdown/ src/routes/dev/image/ src/routes/dev/video/ src/routes/+page.svelte
git commit -m "feat(dev-harness): Markdown + Image + Video dev routes + fixtures"
```

---

### Task 12: Dev fixtures + routes (DWChart, FlourishChart, MTMap)

**Files:**
- Create: `src/fixtures/dw-chart.json`
- Create: `src/fixtures/flourish-chart.json`
- Create: `src/fixtures/mt-map.json`
- Create: `src/routes/dev/dw-chart/+page.ts`
- Create: `src/routes/dev/dw-chart/+page.svelte`
- Create: `src/routes/dev/flourish-chart/+page.ts`
- Create: `src/routes/dev/flourish-chart/+page.svelte`
- Create: `src/routes/dev/mt-map/+page.ts`
- Create: `src/routes/dev/mt-map/+page.svelte`
- Modify: `src/routes/+page.svelte`

- [ ] **Step 1: Create dw-chart fixture**

```json
{
  "slug": "dw-chart-demo",
  "metadata": {
    "title": "DWChart demo",
    "byline": "test",
    "publishedAt": "2026-04-17"
  },
  "tokens": {
    "locale": "fr-CH",
    "palette": { "scheme": "viridis", "background": "#ffffff", "foreground": "#111111", "muted": "#666666", "accent": "#156964" },
    "typography": { "bodyFontFamily": "'Inter', system-ui, sans-serif", "headingFontFamily": "'Inter', system-ui, sans-serif", "monoFontFamily": "'JetBrains Mono', monospace", "baseSize": 17, "scale": 1.25 },
    "spacing": { "unit": 8 },
    "sourceStyle": { "format": "footnote", "prefix": "Source : " },
    "mode": "light"
  },
  "blocks": [
    {
      "type": "dw-chart",
      "embedUrl": "https://datawrapper.dwcdn.net/OskRB/1/",
      "title": "Datawrapper demo chart",
      "alt": "A bar chart from Datawrapper showing sample data",
      "height": 400
    }
  ]
}
```

- [ ] **Step 2: Create flourish-chart fixture**

```json
{
  "slug": "flourish-chart-demo",
  "metadata": {
    "title": "FlourishChart demo",
    "byline": "test",
    "publishedAt": "2026-04-17"
  },
  "tokens": {
    "locale": "fr-CH",
    "palette": { "scheme": "viridis", "background": "#ffffff", "foreground": "#111111", "muted": "#666666", "accent": "#156964" },
    "typography": { "bodyFontFamily": "'Inter', system-ui, sans-serif", "headingFontFamily": "'Inter', system-ui, sans-serif", "monoFontFamily": "'JetBrains Mono', monospace", "baseSize": 17, "scale": 1.25 },
    "spacing": { "unit": 8 },
    "sourceStyle": { "format": "footnote", "prefix": "Source : " },
    "mode": "light"
  },
  "blocks": [
    {
      "type": "flourish-chart",
      "embedUrl": "https://flo.uri.sh/visualisation/12345678/embed",
      "title": "Flourish demo chart",
      "alt": "A Flourish visualisation showing sample data",
      "height": 500
    }
  ]
}
```

- [ ] **Step 3: Create mt-map fixture**

```json
{
  "slug": "mt-map-demo",
  "metadata": {
    "title": "MTMap demo",
    "byline": "test",
    "publishedAt": "2026-04-17"
  },
  "tokens": {
    "locale": "fr-CH",
    "palette": { "scheme": "viridis", "background": "#ffffff", "foreground": "#111111", "muted": "#666666", "accent": "#156964" },
    "typography": { "bodyFontFamily": "'Inter', system-ui, sans-serif", "headingFontFamily": "'Inter', system-ui, sans-serif", "monoFontFamily": "'JetBrains Mono', monospace", "baseSize": 17, "scale": 1.25 },
    "spacing": { "unit": 8 },
    "sourceStyle": { "format": "footnote", "prefix": "Source : " },
    "mode": "light"
  },
  "blocks": [
    {
      "type": "mt-map",
      "style": {
        "version": 8,
        "sources": {},
        "layers": [{ "id": "background", "type": "background", "paint": { "background-color": "#e0dfdf" } }]
      },
      "bounds": [6.1, 46.2, 6.25, 46.25],
      "alt": "Map of Geneva area",
      "height": 500,
      "interactive": true
    }
  ]
}
```

- [ ] **Step 4: Create dev routes (3 routes)**

Same pattern as Task 11. Each route has `+page.ts` importing its fixture and `+page.svelte` rendering via BlockRenderer.

For mt-map `+page.ts`, add `export const ssr = false;` (MapTiler SDK requires DOM).

```typescript
// src/routes/dev/mt-map/+page.ts
import { buildArticlePage } from "$lib/core/build-page";
import fixture from "$lib/../fixtures/mt-map.json";

export const prerender = true;
export const ssr = false;

export function load() {
  return { page: buildArticlePage(fixture) };
}
```

- [ ] **Step 5: Add 3 route links to index page**

Add to the `routes` array in `src/routes/+page.svelte`:

```typescript
{ path: '/dev/dw-chart', name: 'DWChart', note: 'Datawrapper iframe embed' },
{ path: '/dev/flourish-chart', name: 'FlourishChart', note: 'Flourish iframe embed' },
{ path: '/dev/mt-map', name: 'MTMap', note: 'MapTiler SDK map' },
```

- [ ] **Step 6: Verify all 6 content dev routes work**

Run: `cd /Users/rmdms/Sites/Professional/viznews-lib && bun run dev`
Visit all 6 content routes.

- [ ] **Step 7: Commit**

```bash
git add src/fixtures/dw-chart.json src/fixtures/flourish-chart.json src/fixtures/mt-map.json src/routes/dev/dw-chart/ src/routes/dev/flourish-chart/ src/routes/dev/mt-map/ src/routes/+page.svelte
git commit -m "feat(dev-harness): DWChart + FlourishChart + MTMap dev routes + fixtures"
```

---

### Task 13: Playwright contract tests (Markdown, Image, Video)

**Files:**
- Create: `tests/contracts/markdown.spec.ts`
- Create: `tests/contracts/image.spec.ts`
- Create: `tests/contracts/video.spec.ts`

- [ ] **Step 1: Create markdown.spec.ts**

```typescript
import { test, expect } from "@playwright/test";

test.describe("Markdown — content rendering", () => {
  test("renders HTML content in DOM", async ({ page }) => {
    await page.goto("/dev/markdown");
    const root = page.getByTestId("markdown-root");
    await expect(root).toBeVisible();
    const html = await root.innerHTML();
    expect(html).toContain("<h2>");
    expect(html).toContain("<strong>");
    expect(html).toContain("<a ");
  });

  test("applies typography tokens", async ({ page }) => {
    await page.goto("/dev/markdown");
    const root = page.getByTestId("markdown-root");
    const fontFamily = await root.evaluate((el) => getComputedStyle(el).fontFamily);
    expect(fontFamily).toContain("Inter");
  });
});
```

- [ ] **Step 2: Create image.spec.ts**

```typescript
import { test, expect } from "@playwright/test";

test.describe("Image — content rendering", () => {
  test("img has loading=lazy", async ({ page }) => {
    await page.goto("/dev/image");
    const img = page.getByTestId("image-img");
    await expect(img).toBeVisible();
    const loading = await img.getAttribute("loading");
    expect(loading).toBe("lazy");
  });

  test("img has alt attribute", async ({ page }) => {
    await page.goto("/dev/image");
    const img = page.getByTestId("image-img");
    const alt = await img.getAttribute("alt");
    expect(alt).toBeTruthy();
    expect(alt!.length).toBeGreaterThan(0);
  });

  test("figcaption is rendered", async ({ page }) => {
    await page.goto("/dev/image");
    const caption = page.getByTestId("image-caption");
    await expect(caption).toBeVisible();
    const text = await caption.textContent();
    expect(text).toContain("Lorem Picsum");
  });

  test("aspect-ratio is applied", async ({ page }) => {
    await page.goto("/dev/image");
    const img = page.getByTestId("image-img");
    const ar = await img.evaluate((el) => getComputedStyle(el).aspectRatio);
    expect(ar).toContain("16");
  });
});
```

- [ ] **Step 3: Create video.spec.ts**

```typescript
import { test, expect } from "@playwright/test";

test.describe("Video — content rendering", () => {
  test("video has controls attribute", async ({ page }) => {
    await page.goto("/dev/video");
    const video = page.getByTestId("video-player");
    await expect(video).toBeAttached();
    const controls = await video.getAttribute("controls");
    expect(controls).not.toBeNull();
  });

  test("video has aria-label", async ({ page }) => {
    await page.goto("/dev/video");
    const video = page.getByTestId("video-player");
    const label = await video.getAttribute("aria-label");
    expect(label).toBeTruthy();
  });

  test("figcaption is rendered", async ({ page }) => {
    await page.goto("/dev/video");
    const caption = page.getByTestId("video-caption");
    await expect(caption).toBeVisible();
  });

  test("reduced-motion pauses autoplay", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/dev/video");
    const paused = await page
      .getByTestId("video-player")
      .evaluate((el: HTMLVideoElement) => el.paused);
    expect(paused).toBe(true);
    await ctx.close();
  });
});
```

- [ ] **Step 4: Run Playwright tests**

Run: `cd /Users/rmdms/Sites/Professional/viznews-lib && bunx playwright test tests/contracts/markdown.spec.ts tests/contracts/image.spec.ts tests/contracts/video.spec.ts`
Expected: all PASS

- [ ] **Step 5: Commit**

```bash
git add tests/contracts/markdown.spec.ts tests/contracts/image.spec.ts tests/contracts/video.spec.ts
git commit -m "test(contracts): Markdown + Image + Video Playwright specs"
```

---

### Task 14: Playwright contract tests (DWChart, FlourishChart, MTMap)

**Files:**
- Create: `tests/contracts/dw-chart.spec.ts`
- Create: `tests/contracts/flourish-chart.spec.ts`
- Create: `tests/contracts/mt-map.spec.ts`

- [ ] **Step 1: Create dw-chart.spec.ts**

```typescript
import { test, expect } from "@playwright/test";

test.describe("DWChart — iframe embed", () => {
  test("iframe has correct src", async ({ page }) => {
    await page.goto("/dev/dw-chart");
    const iframe = page.getByTestId("dw-chart-iframe");
    await expect(iframe).toBeAttached();
    const src = await iframe.getAttribute("src");
    expect(src).toContain("datawrapper.dwcdn.net");
  });

  test("iframe has title attribute", async ({ page }) => {
    await page.goto("/dev/dw-chart");
    const iframe = page.getByTestId("dw-chart-iframe");
    const title = await iframe.getAttribute("title");
    expect(title).toBeTruthy();
  });

  test("wrapper has aria-label", async ({ page }) => {
    await page.goto("/dev/dw-chart");
    const root = page.getByTestId("dw-chart-root");
    const label = await root.getAttribute("aria-label");
    expect(label).toBeTruthy();
  });

  test("iframe has non-zero height", async ({ page }) => {
    await page.goto("/dev/dw-chart");
    const iframe = page.getByTestId("dw-chart-iframe");
    const box = await iframe.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThan(100);
  });
});
```

- [ ] **Step 2: Create flourish-chart.spec.ts**

```typescript
import { test, expect } from "@playwright/test";

test.describe("FlourishChart — iframe embed", () => {
  test("iframe has correct src", async ({ page }) => {
    await page.goto("/dev/flourish-chart");
    const iframe = page.getByTestId("flourish-chart-iframe");
    await expect(iframe).toBeAttached();
    const src = await iframe.getAttribute("src");
    expect(src).toContain("flo.uri.sh");
  });

  test("iframe has title attribute", async ({ page }) => {
    await page.goto("/dev/flourish-chart");
    const iframe = page.getByTestId("flourish-chart-iframe");
    const title = await iframe.getAttribute("title");
    expect(title).toBeTruthy();
  });

  test("wrapper has aria-label", async ({ page }) => {
    await page.goto("/dev/flourish-chart");
    const root = page.getByTestId("flourish-chart-root");
    const label = await root.getAttribute("aria-label");
    expect(label).toBeTruthy();
  });

  test("iframe has non-zero height", async ({ page }) => {
    await page.goto("/dev/flourish-chart");
    const iframe = page.getByTestId("flourish-chart-iframe");
    const box = await iframe.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThan(100);
  });
});
```

- [ ] **Step 3: Create mt-map.spec.ts**

```typescript
import { test, expect } from "@playwright/test";

test.describe("MTMap — SDK rendering", () => {
  test("map container is mounted", async ({ page }) => {
    await page.goto("/dev/mt-map");
    const container = page.getByTestId("mt-map-container");
    await expect(container).toBeVisible();
    const box = await container.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(400);
  });

  test("figure has aria-label", async ({ page }) => {
    await page.goto("/dev/mt-map");
    const root = page.getByTestId("mt-map-root");
    const label = await root.getAttribute("aria-label");
    expect(label).toBeTruthy();
  });

  test("figure has role=application when interactive", async ({ page }) => {
    await page.goto("/dev/mt-map");
    const root = page.getByTestId("mt-map-root");
    const role = await root.getAttribute("role");
    expect(role).toBe("application");
  });

  test("canvas element appears inside container", async ({ page }) => {
    await page.goto("/dev/mt-map");
    const canvas = page.locator('[data-testid="mt-map-container"] canvas');
    await expect(canvas).toBeAttached({ timeout: 10000 });
  });
});
```

- [ ] **Step 4: Run Playwright tests**

Run: `cd /Users/rmdms/Sites/Professional/viznews-lib && bunx playwright test tests/contracts/dw-chart.spec.ts tests/contracts/flourish-chart.spec.ts tests/contracts/mt-map.spec.ts`
Expected: all PASS

- [ ] **Step 5: Commit**

```bash
git add tests/contracts/dw-chart.spec.ts tests/contracts/flourish-chart.spec.ts tests/contracts/mt-map.spec.ts
git commit -m "test(contracts): DWChart + FlourishChart + MTMap Playwright specs"
```

---

### Task 15: Update docs + all tests green

**Files:**
- Modify: `docs/primitives.md`

- [ ] **Step 1: Add content primitives section to docs/primitives.md**

Append a new section after the structural primitives table:

```markdown
## Content Primitives (Phase 2)

| Primitive | Block type | Rendering | Key props |
|---|---|---|---|
| `Markdown` | `markdown` | `{@html}` scoped typography | `html` |
| `Image` | `image` | `<img loading=lazy>` + figcaption | `src`, `alt`, `aspectRatio?`, `caption?` |
| `Video` | `video` | `<video controls>` + reduced-motion | `src`, `alt`, `poster?`, `aspectRatio?`, `caption?` |
| `DWChart` | `dw-chart` | iframe + postMessage resize | `embedUrl`, `title`, `alt`, `height?` |
| `FlourishChart` | `flourish-chart` | iframe + postMessage resize | `embedUrl`, `title`, `alt`, `height?` |
| `MTMap` | `mt-map` | `@maptiler/sdk` canvas | `style`, `bounds`, `alt`, `height?`, `interactive?`, `flyToSteps?` |

### Config Builders (subpath exports)

| Subpath | Purpose | Key exports |
|---|---|---|
| `@rmdms/viznews/datawrapper` | DW chart production | `EditorialIntentSchema`, `buildPublishableConfig`, `validatePublishable` |
| `@rmdms/viznews/flourish` | Flourish embed production | `FlourishIntentSchema`, `buildFlourishEmbed`, `validateFlourishPublishable` |
| `@rmdms/viznews/maptiler` | MT map production | `SpatialIntentSchema`, `buildPublishableStyle`, `validateSpatialPublishable` |
```

- [ ] **Step 2: Run full test suite**

Run: `cd /Users/rmdms/Sites/Professional/viznews-lib && bun test tests/unit && bunx playwright test`
Expected: all unit tests + all Playwright tests PASS

- [ ] **Step 3: Commit**

```bash
git add docs/primitives.md
git commit -m "docs: add content primitives + config builders to index"
```

---

### Task 16: Changeset for Phase 2

**Files:**
- Create: `.changeset/phase-2-content-primitives.md`

- [ ] **Step 1: Create changeset**

```markdown
---
"@rmdms/viznews": minor
---

Phase 2 — content primitives (Markdown, Image, Video, DWChart, FlourishChart, MTMap), config builders migrated from plugin (datawrapper, flourish, maptiler subpath exports), shared palette module.
```

- [ ] **Step 2: Commit**

```bash
git add .changeset/phase-2-content-primitives.md
git commit -m "chore: changeset for Phase 2 content primitives"
```

- [ ] **Step 3: Push to origin**

```bash
git push origin main
```
