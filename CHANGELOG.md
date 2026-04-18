# @rmdms/viznews

## 3.0.0

### Major Changes

- 27caf86: v3.0.0-beta.0 — Foundation

  - Bump Zod v3 → v4 (breaking on consumers using zod directly)
  - DesignTokens v3: new positioning axis + 5 optional derived tokens
  - applyPositioning() cascade: prescriptive mapping positioning → tokens
  - validateVariants() build-time warnings for Tier 2+ variants
  - tokensToCSSVariables emits --vn-radius/shadow/border/overlay/layout-rhythm-gap
  - buildArticlePage returns `warnings: string[]` (additive, non-breaking shape)
  - Exports: applyPositioning, validateVariants, all variant enums, Positioning types

- 5704eb5: v3.0.0-beta.1 — Variants + Flow

  - Sticky/Split/Crossfade/Grid/Lightbox/Sequence: `variant` prop + Tier 1 CSS variants
  - Split: drag-separator with clip-path compare slider
  - Flow: new structural primitive (7 variants text-only + image-\*)
  - BlockRenderer dispatches all new variants
  - Dev harness /dev/v3/<primitive>/<variant> covers Tier 1 + fallback targets
  - Playwright contracts gate render behavior per variant

- 589702d: v3.0.0-beta.2 — Explore + content primitives

  - Explore primitive + ExploreLegend with auto legend routing
    (mt-map → lib, DW/FL → native)
  - DWChart adopts --vn-radius + --vn-shadow
  - Image: optional srcset + sizes with <picture>
  - Markdown: accepts raw md (marked) or html, DOMPurify sanitize

- v3.0.0 GA — Rebuild complet

  Consolidation des trois beta :

  - beta.0 : Zod v4, DesignTokens v3, positioning cascade, validateVariants.
  - beta.1 : variants Tier 1 sur 6 primitives + Flow.
  - beta.2 : Explore + ExploreLegend + DWChart/Image/Markdown upgrades.

  Dev harness complet. Playwright contract green. README v3. ROADMAP alignment verifié.

  Consommateur plugin : `bun add @rmdms/viznews@^3.0.0`.

## 3.0.0-beta.2

### Major Changes

- v3.0.0-beta.2 — Explore + content primitives

  - Explore primitive + ExploreLegend with auto legend routing
    (mt-map → lib, DW/FL → native)
  - DWChart adopts --vn-radius + --vn-shadow
  - Image: optional srcset + sizes with <picture>
  - Markdown: accepts raw md (marked) or html, DOMPurify sanitize

## 3.0.0-beta.1

### Major Changes

- v3.0.0-beta.1 — Variants + Flow

  - Sticky/Split/Crossfade/Grid/Lightbox/Sequence: `variant` prop + Tier 1 CSS variants
  - Split: drag-separator with clip-path compare slider
  - Flow: new structural primitive (7 variants text-only + image-\*)
  - BlockRenderer dispatches all new variants
  - Dev harness /dev/v3/<primitive>/<variant> covers Tier 1 + fallback targets
  - Playwright contracts gate render behavior per variant

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
