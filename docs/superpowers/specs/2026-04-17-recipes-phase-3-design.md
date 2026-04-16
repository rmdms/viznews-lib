# viznews-lib Phase 3 — Named Recipes

**Date:** 2026-04-17
**Branch:** `main`
**Status:** Design validated

---

## Goal

Add 4 named recipes to `@rmdms/viznews`: `scrolly-sticky-content`, `chart-ladder`, `gallery-carousel`, `scrolly-map`. Recipes are shorthand block types in `spec.json` that expand into trees of existing structural + content primitives at build time. Zero new rendering logic except one glue component for `scrolly-map`.

## Architecture

Three of the four recipes are **schema sugar**: Zod schemas that `buildArticlePage` expands into primitive block trees before rendering. The BlockRenderer never sees them — it renders the expanded primitives as usual.

`scrolly-map` is the exception: it requires a runtime binding between ScrollSteps active index and MTMap.flyTo(), so it gets a small glue Svelte component (~40 lines) and a BlockRenderer branch.

```
spec.json → Zod parse (recipes are valid block types)
          → expandRecipes() (3 sugar recipes → primitive trees)
          → ArticlePageData (only primitives + scrolly-map remain)
          → BlockRenderer (renders primitives + ScrollyMap glue)
```

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Number of recipes | 4 | ScrollyStickyContent (§6.2), ChartLadder (§6.3), GalleryCarousel (§6.7), ScrollyMap (§6.4) |
| Recipe nature | Schema sugar expanded at build time | Zero new rendering logic, compositions are pure |
| ScrollyMap exception | Glue component for scroll→flyTo binding | Runtime coordination needed between ScrollSteps and MTMap |
| Block type names | Long descriptive | `scrolly-sticky-content`, `chart-ladder`, `gallery-carousel`, `scrolly-map` |

---

## Recipe Schemas

### scrolly-sticky-content (§6.2 Sticky + scroll)

```typescript
{
  type: "scrolly-sticky-content",
  visual: Block,
  steps: Block[],
  scrim?: "default" | "none"
}
```

**Expands to:**
```typescript
{
  type: "sticky",
  visual: <visual>,
  steps: <steps>,
  props: { scrim: <scrim ?? "default"> }
}
```

This is the simplest recipe — a direct mapping to Sticky with a more editorial name. The value is in the spec.json vocabulary: `scrolly-sticky-content` communicates intent to the journalist better than `sticky`.

### chart-ladder (§6.3 Progressive annotation)

```typescript
{
  type: "chart-ladder",
  frames: Block[],    // N annotated versions of the same chart (min 2)
  steps: Block[]      // N narrative blocks (one per frame, same length as frames)
}
```

**Expands to:**
```typescript
{
  type: "sticky",
  visual: {
    type: "crossfade",
    activeIndex: 0,
    frames: <frames>
  },
  steps: <steps>,
  props: { scrim: "default" }
}
```

Validation: `frames.length` must equal `steps.length` (each step corresponds to a frame). The scroll step index drives the crossfade active index at runtime via the existing ScrollSteps → Crossfade coordination.

### gallery-carousel (§6.7 Small multiples + expand)

```typescript
{
  type: "gallery-carousel",
  cells: Block[],           // items to display in grid
  columns?: 2 | 3 | 4,     // default: 3
  aspectRatio?: string      // default: "4 / 3"
}
```

**Expands to:**
```typescript
{
  type: "grid",
  columns: <columns ?? 3>,
  aspectRatio: <aspectRatio ?? "4 / 3">,
  cells: cells.map(cell => ({
    type: "lightbox",
    trigger: cell,
    content: cell
  }))
}
```

Each cell becomes a lightbox: the cell itself is both the trigger (grid thumbnail) and the expanded content. If a journalist wants different trigger vs content (e.g., thumbnail vs full-res), they should use `grid` + `lightbox` primitives directly.

### scrolly-map (§6.4 FlyTo)

```typescript
{
  type: "scrolly-map",
  map: MTMapBlock,    // must have flyToSteps defined
  steps: Block[]      // narrative blocks, one per flyToStep
}
```

**NOT expanded** — rendered by `ScrollyMap.svelte` glue component.

Validation: `map.flyToSteps` must be defined and `map.flyToSteps.length` must equal `steps.length`.

---

## Expansion Pipeline

### expandRecipes(blocks: Block[]): Block[]

Pure function that recursively traverses a block tree and expands recipe types into primitive trees. Applied in `buildArticlePage` after Zod parse, before returning `ArticlePageData`.

Recursion: must also expand recipes found inside structural primitives (e.g., a `scrolly-sticky-content` inside a `sequence.items[]`). The function walks every Block[] and Block field in every block type.

`scrolly-map` blocks pass through unexpanded.

### Integration in buildArticlePage

Current flow:
```
parse → tokensToCSSVariables → return { blocks, metadata, cssVars }
```

New flow:
```
parse → expandRecipes(blocks) → tokensToCSSVariables → return { blocks, metadata, cssVars }
```

---

## ScrollyMap Glue Component

`src/lib/recipes/ScrollyMap.svelte` (~40 lines):

- Props: `map` (MTMapBlock schema shape), `steps` (Block[])
- Renders a sticky layout: map pinned, steps scroll
- Uses `bind:this` on MTMap to get `flyTo()` method
- ScrollSteps (or IntersectionObserver directly) detects which step is active
- `$effect` calls `mapRef.flyTo(activeIndex)` when index changes
- Inherits all a11y from underlying MTMap and ScrollSteps

### Why not reuse Sticky + ScrollSteps primitives?

The Sticky primitive renders `visual` and `steps` as opaque blocks. There's no mechanism for the steps to communicate an active index back to the visual. The glue component needs this bidirectional binding, which justifies a dedicated component rather than trying to add inter-primitive messaging.

---

## BlockRenderer Changes

One new branch:
```svelte
{:else if block.type === 'scrolly-map'}
  <ScrollyMap map={block.map} steps={block.steps} />
```

Import added: `import { ScrollyMap } from './recipes';`

The 3 sugar recipes don't appear in BlockRenderer — they're expanded before rendering.

---

## File Structure

### New files

| File | Responsibility |
|---|---|
| `src/lib/core/schemas/recipes.ts` | 4 Zod schemas for recipe block types |
| `src/lib/core/expand-recipes.ts` | `expandRecipes()` pure function |
| `src/lib/recipes/ScrollyMap.svelte` | Glue component for scroll→flyTo |
| `src/lib/recipes/index.ts` | Re-export ScrollyMap |
| `tests/unit/recipes-schemas.test.ts` | Zod schema tests |
| `tests/unit/expand-recipes.test.ts` | Expansion logic tests |
| `tests/contracts/scrolly-sticky-content.spec.ts` | Playwright |
| `tests/contracts/chart-ladder.spec.ts` | Playwright |
| `tests/contracts/gallery-carousel.spec.ts` | Playwright |
| `tests/contracts/scrolly-map.spec.ts` | Playwright |
| `src/fixtures/scrolly-sticky-content.json` | Dev fixture |
| `src/fixtures/chart-ladder.json` | Dev fixture |
| `src/fixtures/gallery-carousel.json` | Dev fixture |
| `src/fixtures/scrolly-map.json` | Dev fixture |
| `src/routes/dev/scrolly-sticky-content/+page.ts` | Dev route |
| `src/routes/dev/scrolly-sticky-content/+page.svelte` | Dev route |
| `src/routes/dev/chart-ladder/+page.ts` | Dev route |
| `src/routes/dev/chart-ladder/+page.svelte` | Dev route |
| `src/routes/dev/gallery-carousel/+page.ts` | Dev route |
| `src/routes/dev/gallery-carousel/+page.svelte` | Dev route |
| `src/routes/dev/scrolly-map/+page.ts` | Dev route |
| `src/routes/dev/scrolly-map/+page.svelte` | Dev route |

### Modified files

| File | Change |
|---|---|
| `src/lib/core/schemas/block.ts` | Add 4 recipe types to Block union + BlockSchema |
| `src/lib/core/schemas/index.ts` | Re-export recipes.ts |
| `src/lib/core/build-page.ts` | Call expandRecipes() after parse |
| `src/lib/BlockRenderer.svelte` | Add scrolly-map branch + import |
| `src/lib/index.ts` | Re-export recipes + recipe block types |
| `src/routes/+page.svelte` | Add 4 recipe dev route links |
| `docs/primitives.md` | Add recipes section |

---

## Testing

### Unit tests (bun:test)

**recipes-schemas.test.ts:**
- Each recipe schema accepts valid input
- Each recipe schema rejects invalid input (missing fields, wrong types)
- `chart-ladder` rejects when `frames.length !== steps.length`
- `scrolly-map` rejects when `map.flyToSteps` is missing

**expand-recipes.test.ts:**
- `scrolly-sticky-content` expands to `sticky` with correct props
- `chart-ladder` expands to `sticky` > `crossfade` with correct frames/steps
- `gallery-carousel` expands to `grid` > `lightbox[]`
- `scrolly-map` passes through unexpanded
- Recipes nested in `sequence.items` are expanded recursively
- Non-recipe blocks pass through unchanged

### Playwright contract tests

- `scrolly-sticky-content.spec.ts` — sticky-visual and sticky-steps present, visual is sticky-positioned
- `chart-ladder.spec.ts` — crossfade frames in DOM, active frame has opacity 1
- `gallery-carousel.spec.ts` — grid cells rendered, clicking a cell opens lightbox dialog
- `scrolly-map.spec.ts` — map container mounted, scroll steps present, aria-label on map

---

## Dependencies

No new dependencies. All primitives already exist.

`@maptiler/sdk` is already a peerDep (Phase 2).

---

## Out of Scope

- Article shell / page chrome (header, footer, nav) — separate concern
- Recipe parameterization beyond what's in the schemas (e.g., custom transition timing for chart-ladder)
- New staging devices beyond the 4 recipes
