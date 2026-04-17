# @rmdms/viznews

## 3.0.0-beta.0

### Major Changes

- v3.0.0-beta.0 — Foundation

  - Bump Zod v3 → v4 (breaking on consumers using zod directly)
  - DesignTokens v3: new positioning axis + 5 optional derived tokens
  - applyPositioning() cascade: prescriptive mapping positioning → tokens
  - validateVariants() build-time warnings for Tier 2+ variants
  - tokensToCSSVariables emits --vn-radius/shadow/border/overlay/layout-rhythm-gap
  - buildArticlePage returns `warnings: string[]` (additive, non-breaking shape)
  - Exports: applyPositioning, validateVariants, all variant enums, Positioning types

## 0.2.0

### Minor Changes

- 83cdd0c: Expose core utilities from the root entry: `buildArticlePage`, `expandRecipes`, `tokensToCSSVariables`. These were previously only available by deep import, which is blocked by the `exports` map. Consumers can now build a runnable article page without re-implementing recipe expansion or CSS variable synthesis.

## 0.1.0

### Minor Changes

- 73ab7af: Phase 1 — structural primitives (Sticky, ScrollSteps, Crossfade, Grid, Split, Sequence, Lightbox), recursive BlockRenderer, design-token pipeline, Zod schemas, dev harness, Playwright contract tests.
- 83f552b: Phase 2 — content primitives (Markdown, Image, Video, DWChart, FlourishChart, MTMap), config builders migrated from plugin (datawrapper, flourish, maptiler subpath exports), shared palette module.
- 4430dc0: Phase 3 — named recipes (scrolly-sticky-content, chart-ladder, gallery-carousel, scrolly-map). Three expand to primitive trees at build time, scrolly-map gets a glue component for scroll→flyTo binding.
