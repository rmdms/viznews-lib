# @rmdms/viznews

## 0.2.0

### Minor Changes

- 83cdd0c: Expose core utilities from the root entry: `buildArticlePage`, `expandRecipes`, `tokensToCSSVariables`. These were previously only available by deep import, which is blocked by the `exports` map. Consumers can now build a runnable article page without re-implementing recipe expansion or CSS variable synthesis.

## 0.1.0

### Minor Changes

- 73ab7af: Phase 1 — structural primitives (Sticky, ScrollSteps, Crossfade, Grid, Split, Sequence, Lightbox), recursive BlockRenderer, design-token pipeline, Zod schemas, dev harness, Playwright contract tests.
- 83f552b: Phase 2 — content primitives (Markdown, Image, Video, DWChart, FlourishChart, MTMap), config builders migrated from plugin (datawrapper, flourish, maptiler subpath exports), shared palette module.
- 4430dc0: Phase 3 — named recipes (scrolly-sticky-content, chart-ladder, gallery-carousel, scrolly-map). Three expand to primitive trees at build time, scrolly-map gets a glue component for scroll→flyTo binding.
