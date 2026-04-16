# viznews-lib Phase 2 — Content Primitives

**Date:** 2026-04-17
**Branch:** `main`
**Status:** Design validated

---

## Goal

Add 6 content primitives to `@rmdms/viznews`: Markdown, Image, Video, DWChart, FlourishChart, MTMap. These are leaf nodes in the block tree — they render actual content inside the structural containers built in Phase 1.

Additionally, migrate config builders and validators from the plugin (`vizualisation-skill-v2/skills/datawrapper/` and `skills/maptiler/`) into the lib, exported per-provider via dedicated subpaths.

## Architecture

Three concerns, cleanly separated:

1. **Svelte components** (rendering) — 6 new components in `content-primitives/`, exported via `@rmdms/viznews`
2. **Zod schemas** (validation) — 6 new block types added to the `Block` union, exported via `@rmdms/viznews/schemas`
3. **Config builders** (production) — intent schemas + builders + validators per SaaS provider, exported via `@rmdms/viznews/datawrapper`, `@rmdms/viznews/flourish`, `@rmdms/viznews/maptiler`

The Svelte components know nothing about config builders. The plugin consumes builders to create charts via APIs, gets back embed URLs, and writes them into `spec.json`. The lib renders the spec deterministically.

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| DWChart/FlourishChart rendering | iframe wrapper | Charts are pre-published; iframe is the standard embed |
| DWChart/FlourishChart production | Config builders + validators exported | Plugin needs them to create charts via API |
| MTMap rendering | Native SDK (`@maptiler/sdk`) | §6.4 FlyTo requires programmatic camera control |
| Image/Video | Minimal `<img>`/`<video>` | YAGNI — no srcset, no YouTube/Vimeo providers |
| Markdown | HTML pre-rendered (`{@html}`) | Sanitization at build time, zero runtime dependency |
| Export subpaths | Per-provider (`/datawrapper`, `/flourish`, `/maptiler`) | Tree-shakable, follows physical code structure |

---

## File Structure

```
src/lib/
  content-primitives/
    Markdown.svelte
    Image.svelte
    Video.svelte
    DWChart.svelte
    FlourishChart.svelte
    MTMap.svelte
    index.ts

  content-primitives/datawrapper/
    intent-schema.ts
    build-config.ts
    index.ts

  content-primitives/flourish/
    intent-schema.ts
    build-config.ts
    index.ts

  content-primitives/maptiler/
    intent-schema.ts
    build-style.ts
    index.ts

  core/
    palettes.ts              # shared palette presets (viridis, okabe-ito, tol-bright, category10)
    schemas/
      content.ts             # Zod schemas for 6 content block types
      block.ts               # Block union expanded (structural + content)
```

---

## Content Block Schemas

### Markdown

```typescript
{
  type: "markdown",
  html: string               // pre-rendered HTML
}
```

### Image

```typescript
{
  type: "image",
  src: string,               // image URL
  alt: string,               // required, a11y
  aspectRatio?: string,      // CSS aspect-ratio value, e.g. "16 / 9"
  caption?: string           // optional figcaption text
}
```

### Video

```typescript
{
  type: "video",
  src: string,               // video URL
  alt: string,               // required, a11y (used as aria-label)
  poster?: string,           // poster image URL
  aspectRatio?: string,
  caption?: string
}
```

### DWChart

```typescript
{
  type: "dw-chart",
  embedUrl: string,          // Datawrapper iframe embed URL (post-publish)
  title: string,             // iframe title attribute
  alt: string,               // aria-label on wrapper
  height?: number            // fallback height in px if postMessage resize fails
}
```

### FlourishChart

```typescript
{
  type: "flourish-chart",
  embedUrl: string,          // Flourish iframe embed URL
  title: string,
  alt: string,
  height?: number
}
```

### MTMap

```typescript
{
  type: "mt-map",
  style: Record<string, unknown>,  // MapTiler GL style JSON (free-form)
  bounds: [number, number, number, number],  // [west, south, east, north]
  alt: string,
  height?: number,           // container height in px (default: 500)
  interactive?: boolean,     // default: true
  flyToSteps?: Array<{
    center: [number, number],  // [lng, lat]
    zoom: number,
    label?: string
  }>
}
```

---

## Svelte Components

### Common patterns

- All 6 use `<figure>` as root element (HTML5 self-contained content)
- All have `data-testid` for Playwright
- All inherit design tokens via `--vn-*` CSS custom properties

### Markdown

`<figure class="vn-markdown">` + `{@html html}`. Scoped typography styles: `--vn-font-body`, `--vn-color-fg`, `--vn-spacing` for paragraph/heading margins. No runtime sanitization.

### Image

`<figure>` + `<img loading="lazy" alt={alt} style:aspect-ratio={aspectRatio}>` + optional `<figcaption>{caption}</figcaption>`. Image fills container width, height derived from aspect-ratio.

### Video

`<figure>` + `<video controls poster={poster} preload="metadata" aria-label={alt}>`. `$effect` watches `prefers-reduced-motion: reduce` media query — pauses autoplay. Optional `<figcaption>`.

### DWChart

`<figure>` + `<iframe src={embedUrl} title={title} loading="lazy" scrolling="no" frameborder="0" aria-label={alt}>`. Listens for Datawrapper `postMessage` height event (`datawrapper-height`), resizes iframe accordingly. Falls back to `height` prop (default: 400px).

### FlourishChart

Same iframe pattern as DWChart. Flourish uses `postMessage` for height (`flourish-resize`). Fallback to `height` prop (default: 400px).

### MTMap

Most complex component:
- `$effect` mounts `new maptilersdk.Map({ container, style, bounds })` on a `<div>`, disposes on cleanup
- Props: `style`, `bounds`, `interactive`, `flyToSteps`, `height`
- Exposes `flyTo(stepIndex)` method via `bind:this` for external control (e.g., ScrollSteps driving camera)
- `role="img"` + `aria-label={alt}` when `interactive === false`; `role="application"` + `aria-label={alt}` when interactive
- `prefers-reduced-motion: reduce` → `duration: 0` on all map transitions
- Wrapped in `<figure>` like the others

---

## Config Builders

### Shared: palettes

`src/lib/core/palettes.ts` — 4 palette presets (viridis, okabe-ito, tol-bright, category10) + `paletteToColors(palette)` utility. Imported by all 3 provider builders. Eliminates the current duplication across `skills/datawrapper/build-config.ts` and `skills/maptiler/build-style.ts`.

### Datawrapper (`@rmdms/viznews/datawrapper`)

Migrated from `skills/datawrapper/`:

- `EditorialIntentSchema` — Zod schema (replaces TS type)
- `buildPublishableConfig(intent: EditorialIntent): DWPublishableConfig` — produces the metadata object for `PATCH /charts/{id}`
- `validatePublishable(intent: EditorialIntent): ValidationResult` — checks required fields

### Flourish (`@rmdms/viznews/flourish`)

New:

- `FlourishIntentSchema` — Zod schema: `visualisationId: string`, `title`, `alt`, `source: { label, url? }`, `palette`
- `buildFlourishEmbed(intent: FlourishIntent): string` — produces the embed URL from visualisation ID
- `validateFlourishPublishable(intent: FlourishIntent): ValidationResult` — checks required fields

Flourish has no programmatic creation API like DW. The journalist creates the viz in Flourish Studio, the plugin captures the `visualisationId`, and the builder produces the embed URL.

### MapTiler (`@rmdms/viznews/maptiler`)

Migrated from `skills/maptiler/`:

- `SpatialIntentSchema` — Zod schema (replaces TS type)
- `buildPublishableStyle(intent: SpatialIntent): MTStyle` — produces the GL style JSON with layers
- `validateSpatialPublishable(intent: SpatialIntent): ValidationResult` — checks required fields
- Layer builders: choropleth, symbol, heatmap, dot (internal, used by `buildPublishableStyle`)

---

## BlockRenderer Updates

6 new `{:else if}` branches in `BlockRenderer.svelte`:

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

Content primitives are leaf nodes — no recursion needed.

---

## Package Exports

```jsonc
{
  ".": {
    "types": "./dist/index.d.ts",
    "svelte": "./dist/index.js",
    "default": "./dist/index.js"
  },
  "./schemas": {
    "types": "./dist/core/schemas/index.d.ts",
    "default": "./dist/core/schemas/index.js"
  },
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
}
```

---

## Dependencies

### New peer dependency

- `@maptiler/sdk: ^2.0.0` — required only if using MTMap component

### No new runtime dependencies

- Markdown: no parser needed (HTML pre-rendered)
- Image/Video: native HTML elements
- DWChart/FlourishChart: native iframes
- Zod: already a dependency

---

## Testing

### Unit tests (bun:test)

- Content Zod schemas: valid/reject for all 6 types
- Palettes: presets, custom, reverse, unknown scheme throws
- DW builder: `buildPublishableConfig` output shape + `validatePublishable`
- Flourish builder: `buildFlourishEmbed` URL format + `validateFlourishPublishable`
- MT builder: `buildPublishableStyle` output shape + layer types + `validateSpatialPublishable`

### Contract tests (Playwright)

- `markdown.spec.ts` — HTML rendered in DOM, typography tokens applied
- `image.spec.ts` — `loading="lazy"` present, `alt` present, aspect-ratio applied
- `video.spec.ts` — `controls` present, `prefers-reduced-motion` pauses playback
- `dw-chart.spec.ts` — iframe `src` matches embedUrl, `title` attr set, responsive height via postMessage
- `flourish-chart.spec.ts` — same iframe pattern
- `mt-map.spec.ts` — canvas mounted in container, `aria-label` present, bounds respected

### Dev harness

6 new routes: `/dev/markdown`, `/dev/image`, `/dev/video`, `/dev/dw-chart`, `/dev/flourish-chart`, `/dev/mt-map`

Each with `+page.ts` (loads fixture) + `+page.svelte` (renders via BlockRenderer).

Fixtures:
- Markdown: HTML string with headings, paragraphs, links
- Image: placeholder image URL + alt + caption
- Video: placeholder video URL + poster
- DWChart: public Datawrapper chart embed URL
- FlourishChart: public Flourish visualisation embed URL
- MTMap: minimal style JSON + bounds over a known area

Index page (`/dev`) updated with links to all 6 new routes.

---

## Out of Scope

- Recipes (Phase 3): ScrollyStickyContent, ChartLadder, GalleryCarousel
- Flourish programmatic API (doesn't exist)
- YouTube/Vimeo video providers
- Image srcset/responsive sources
- Markdown runtime parsing
- D3 custom visualizations (escape hatch deferred to v2)
