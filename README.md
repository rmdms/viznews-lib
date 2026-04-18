# @rmdms/viznews

Svelte 5 lib for newsroom data-viz articles. Structural primitives + content primitives + variant system driven by an editorial positioning axis.

## Installation

```bash
bun add @rmdms/viznews@^3.0.0
# peer deps
bun add svelte@^5 @maptiler/sdk@^2
```

## Quick start

```ts
import { buildArticlePage, BlockRenderer } from "@rmdms/viznews";
import type { Article } from "@rmdms/viznews";

const article: Article = {
  slug: "ma-story",
  metadata: { title: "Titre", byline: "Auteur", publishedAt: "2026-04-17" },
  tokens: {
    positioning: "airy-contemplative", // cascade sur radius/shadow/border/layoutRhythm
    locale: "fr-CH",
    palette: { scheme: "viridis", background: "#fff", foreground: "#111", muted: "#666", accent: "#156964" },
    typography: { bodyFontFamily: "Inter", headingFontFamily: "Inter", monoFontFamily: "Mono", baseSize: 17, scale: 1.25 },
    spacing: { unit: 8 },
    sourceStyle: { format: "footnote", prefix: "Source : " },
    mode: "light",
  },
  blocks: [
    { type: "flow", variant: "image-top", children: [
      { type: "image", src: "...", alt: "..." },
      { type: "markdown", md: "# Intro\n\nun paragraphe." },
    ]},
  ],
};

const page = buildArticlePage(article);
// page.cssVariables → CSS custom props dérivés du positioning
// page.blocks → blocks expandés (recipes résolus)
// page.warnings → string[] des Tier 2+ variants fallback-ed
```

```svelte
<svelte:head>
  <style>{page.cssVariables}</style>
</svelte:head>
{#each page.blocks as block}
  <BlockRenderer {block} />
{/each}
```

## Positioning cascade

Le champ `tokens.positioning` pilote 5 tokens dérivés :

| positioning | layoutRhythm | radius | shadow | border | overlay (default) |
|---|---|---|---|---|---|
| editorial-tight | tight | sharp | subtle | hairline | none |
| balanced (default) | balanced | soft | subtle | none | none |
| airy-contemplative | airy | rounded | dramatic | none | none |
| dashboard-dense | dense | sharp | none | hairline | none |

Override explicite possible token-par-token :

```ts
tokens: { positioning: "balanced", radius: "rounded" } // balanced preset + radius override
```

## Primitives

**Structural :** Sticky, Split, Crossfade, Grid, Lightbox, Sequence, Flow, Explore, ScrollSteps.

**Content :** MTMap, DWChart, FlourishChart, Image, Markdown, Video.

**Recipes :** ScrollyMap, ScrollyStickyContent, ChartLadder, GalleryCarousel.

Chaque structural primitive accepte une `variant` prop (Zod enum). Matrice complète → `ROADMAP.md` du plugin.

## Variants Tier 1 v3.0.0

- Sticky : `sticky-left`, `sticky-right`, `sticky-center-overlay`
- Split : `static`, `drag-separator`
- Crossfade : `fade`, `cut`
- Flow : 7 variants (text-only + image-*)
- Grid : `uniform`, `featured`
- Lightbox : `modal`, `inline-expand`
- Sequence : `stack`
- Explore : `native-interactivity`

Tier 2+ schema-accepted mais render fallback au default Tier 1 (dev-mode warning dans `page.warnings`).

## Migration v0.2.0 → v3.0.0

**Breaking :**
1. Zod peer v3 → v4 : `z.record(z.unknown())` → `z.record(z.string(), z.unknown())`.
2. DesignTokens ajoute `positioning` (default `"balanced"`) + `breakpoints` (fixe). Si vous parsiez des tokens v0.2.0, les defaults prennent le relais — pas de casse à l'exécution.
3. Structural blocks ont un `variant` prop par default sensé mais requis dans le type. Si vous construisiez des blocks manuellement sans passer par Zod : ajouter `variant: "<default>"` à chacun (ou passer par Zod parse qui injecte le default).
4. `buildArticlePage()` retourne désormais `{ ..., warnings: string[] }` (champ additif).

## Dev

```bash
bun install
bun run dev           # SvelteKit + /dev/v3/<primitive>/<variant>
bun test              # unit
bunx playwright test  # contract
bun run check:roadmap # drift check vs plugin ROADMAP.md
```

## License

MIT © Rémy Dumas
