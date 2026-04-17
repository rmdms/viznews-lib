# viznews structural primitives — phase 1

| Primitive | §11 contracts | Test files |
|---|---|---|
| `Sticky` | §11.4 z-order + source-order ; §11.5 readability (scrim, contrast ≥ 4.5:1) ; §11.6 Pattern A mobile sticky-top ; §11.7 a11y source-order | `tests/contracts/sticky.spec.ts` |
| `ScrollSteps` | §11.13 IntersectionObserver (thresholds multi, rootMargin biased, debounce ≥ 50ms, reduced-motion lock to final) ; §11.7 keyboard reachability | `tests/contracts/scroll-steps.spec.ts` |
| `Crossfade` | §11.2 fade 250–350ms ease-out ; both nodes present during transition (no display:none swap) ; reduced-motion → 0ms | `tests/contracts/crossfade.spec.ts` |
| `Grid` | §11.10 aspect-ratio locked per cell ; shared legend rendered once ; mobile reflow to single column | `tests/contracts/grid.spec.ts` |
| `Split` | §11.10 aspect-ratio locked per side ; shared legend ; mobile vertical reflow | `tests/contracts/split.spec.ts` |
| `Sequence` | §11.6 Pattern B full-width stacked ; iOS safe-area insets ; §11.7 source order | `tests/contracts/sequence.spec.ts` |
| `Lightbox` | §11.4 top-layer via native `<dialog>` + `showModal()` ; §11.7 focus trap (Escape closes, focus restored to trigger) | `tests/contracts/lightbox.spec.ts` |

---

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

---

## Contracts not carried by phase 1 primitives

- §11.1 (DW iframe sizing), §11.3 (MT flyTo), §11.9 (ladder axis-lock), §11.11 (hover/touch-parity), §11.12 (hero responsive), §11.14 (MT lifecycle) — phase 2+.
- §11.8 (Gate 4 verification procedure) — migrates to `dataviz-verification-before-completion` skill (workstream 3), not this library.

## Phase 1 acceptance checks

- All seven primitives have at least one contract test that fails when the contract is violated.
- Playwright matrix 375/768/1440 × [no-preference, reduce] green.
- `bun test tests/unit` green (schemas, build-page, tokens).
- `bun run check` = 0 errors.

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
