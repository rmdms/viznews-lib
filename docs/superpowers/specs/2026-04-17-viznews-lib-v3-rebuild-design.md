# WS2 — `@rmdms/viznews` v3.0.0 Rebuild — Design Spec

**Date :** 2026-04-17
**Repo :** `~/Sites/Professional/viznews-lib` (this repo)
**Branche prévue :** `feat/v3-rebuild` (depuis `main`, bump `v0.2.0` → `v3.0.0`)
**Workstream :** WS2 du rollout v3.0.0. WS1 (playbook) mergé séparément. WS3 (plugin rebuild) débloque après WS2 publish npm.
**Related docs :**
- Plugin spec consolidée : `~/Sites/Professional/vizualisation-skill-v2/docs/superpowers/specs/2026-04-17-plugin-viznews-rebuild-design.md`
- Playbook v3 (WS1 mergé) : `~/Sites/Professional/vizualisation-skill-v2/skills/viznews-playbook/`
- ROADMAP variants : `~/Sites/Professional/vizualisation-skill-v2/ROADMAP.md`
- Mémoire architecture : `project_viznews_lib_vision`, `feedback_atomic_block_decomposition`, `feedback_lib_uniform_integration`, `project_viznews_variants_roadmap`.

---

## 1. Contexte

`@rmdms/viznews` est la lib Svelte qui rend les articles composés par le plugin `viznews`. Version courante : `v0.2.0` (publiée). La spec v3.0.0 du plugin + le playbook v2 enrichi (WS1 mergé) demandent un paradigme nouveau à la lib :

- Système de variants **Tier 1/2/3** par primitive (matrice ROADMAP.md).
- Axe éditorial **`positioning`** (editorial-tight / balanced / airy-contemplative / dashboard-dense) avec cascade prescriptive vers tokens dérivés.
- Tokens pro : `radius`, `shadow`, `border`, `overlay`, `breakpoints`, `layoutRhythm`.
- Nouveau primitive **`Explore`** + **`ExploreLegend`** first-class.
- Nouveau primitive structural **`Flow`** (recouvre text-only + image+texte variants).
- Content primitives complétés : **`DWChart.svelte`** (actuellement config-only), **`Image.svelte`**, **`Markdown.svelte`** (nouveaux).
- Bump Zod `v3` → `v4` pour aligner avec le plugin (qui utilise `zod@4.3.6`).

WS2 livre ces changements comme un saut majeur `v0.2.0` → `v3.0.0` dans une PR monolithique. Publication npm en plusieurs beta tags intermédiaires pour débloquer l'itération parallèle du plugin.

---

## 2. Scope

**In scope :**
- Breaking change DesignTokens : nouveau schéma v3 (positioning + 6 tokens dérivés).
- `applyPositioning()` cascade build-time dans `buildArticlePage`.
- 22 variants Tier 1 implémentés end-to-end sur les 10 devices (Flow, Sticky+scroll, Chart ladder via Crossfade, FlyTo, Small multiples via Grid, Split, Sequence, Lightbox, Explore, Crossfade).
- `Flow.svelte`, `Explore.svelte`, `ExploreLegend.svelte`, `DWChart.svelte`, `Image.svelte`, `Markdown.svelte` nouveaux.
- Ajout prop `variant` + Zod enum sur chaque structural primitive existant.
- Bump Zod `^3.23.0` → `^4.0.0` (breaking).
- Tests unit (bun:test) + Playwright contract sur tous nouveaux primitives/variants non-CSS-flip.
- Dev harness routes `/dev/v3/*` pour chaque nouveau primitive/variant.
- Publication `3.0.0-beta.0` → `3.0.0-beta.1` → `3.0.0-beta.2` → `3.0.0` GA.

**Hors scope WS2 :**
- Tier 2 variants visual behavior (defer v3.1.0 — schema accepte, render fallback to default Tier 1).
- Tier 3 `sync-multi-viz` (open bucket, pas de code en v3.x).
- Plugin-side refactor (spec-composer, skills) → **WS3**.
- Enrichissement playbook → **WS1** (mergé).
- Traduction i18n de la lib (reste en-only).

---

## 3. Principes directeurs

- **Uniform external contract, per-cell internals.** Un primitive expose une API journalist-facing unique (props Zod-typed). Ses internals respectent les spécificités de chaque content tool (MT / DW / FL) — pas de "lowest common denominator" qui dilue.
- **Schema-time refusal fail-fast.** Un variant ou une combinaison invalide est refusé au parse Zod (avant render). Pas de fallback silencieux en production (warning dev-mode OK).
- **Positioning → tokens cascade prescriptive.** Choisir `positioning` suffit à fixer `layoutRhythm`, `radius`, `shadow`, `border`, `overlay`. Override explicite possible par token, mais le default vient toujours du positioning mapping (§10.9.3 playbook).
- **Build-time heavy, render-time léger.** `buildArticlePage` fait la totalité de la logique (parse + expand + cascade + tokens resolve). Les components Svelte reçoivent des props déjà résolus, rendent simplement.
- **Variant = prop, Recipe = composition.** Orthogonaux. Variant = Zod enum sur un block individuel. Recipe = block type nommé qui `expandRecipes` décompose au build-time en plusieurs blocks. Pas de chevauchement conceptuel.
- **Matrix source-de-vérité = `ROADMAP.md`.** Zod enums par primitive matchent exactement la matrice ROADMAP. Drift = bug.

---

## 4. Schéma v3

### 4.1 DesignTokens v3

Fichier : `src/lib/core/schemas/design-tokens.ts`.

```ts
export const designTokensSchema = z.object({
  // Axe éditorial (source du cascade)
  positioning: z.enum([
    "editorial-tight",
    "balanced",
    "airy-contemplative",
    "dashboard-dense"
  ]).default("balanced"),

  // Tokens dérivés — valeurs nommées uniquement, pas de free-form
  layoutRhythm: z.enum(["dense", "tight", "balanced", "airy"]).optional(),
  radius: z.enum(["sharp", "soft", "rounded"]).optional(),
  shadow: z.enum(["none", "subtle", "dramatic"]).optional(),
  border: z.enum(["none", "hairline", "emphatic"]).optional(),
  overlay: z.enum(["none", "darken-20", "darken-50", "gradient-bottom"]).optional(),

  // Carry-over v0.2.0 (raffinés mais pas breaking)
  palette: paletteSchema,
  typography: typographySchema,

  // Fixe en v3.0 (non-configurable)
  breakpoints: z.object({
    mobile: z.literal(768),
    tablet: z.literal(1024)
  }).default({ mobile: 768, tablet: 1024 })
})
```

### 4.2 Positioning cascade

Nouveau module `src/lib/core/apply-positioning.ts` :

```ts
const POSITIONING_PRESETS = {
  "editorial-tight":   { layoutRhythm: "tight",    radius: "sharp",   shadow: "subtle",   border: "hairline" },
  "balanced":          { layoutRhythm: "balanced", radius: "soft",    shadow: "subtle",   border: "none"     },
  "airy-contemplative":{ layoutRhythm: "airy",     radius: "rounded", shadow: "dramatic", border: "none"     },
  "dashboard-dense":   { layoutRhythm: "dense",    radius: "sharp",   shadow: "none",     border: "hairline" }
} as const

export function applyPositioning(tokens: DesignTokens): ResolvedTokens {
  const preset = POSITIONING_PRESETS[tokens.positioning]
  return {
    ...tokens,
    layoutRhythm: tokens.layoutRhythm ?? preset.layoutRhythm,
    radius:       tokens.radius       ?? preset.radius,
    shadow:       tokens.shadow       ?? preset.shadow,
    border:       tokens.border       ?? preset.border,
    overlay:      tokens.overlay      ?? "none"  // pas dans le preset, default "none"
  }
}
```

Overrides explicites > preset. Cascade déterministe, testable unit.

### 4.3 Variant enums par primitive

Fichier : `src/lib/core/schemas/structural.ts`. Matrice ROADMAP v3.0.0 + v3.1.0 :

```ts
const STICKY_VARIANTS       = ["sticky-left", "sticky-right", "sticky-center-overlay", "sticky-full-with-steps-panel"] as const
const SPLIT_VARIANTS        = ["static", "drag-separator", "toggle", "auto-sweep"] as const
const CROSSFADE_VARIANTS    = ["fade", "cut", "wipe", "zoom"] as const
const FLOW_VARIANTS         = ["text-only", "image-top", "image-left", "image-right", "image-bottom", "image-fullbleed", "image-background-textoverlay"] as const
const FLYTO_VARIANTS        = ["camera-scripted", "reveal-layers", "trail", "markers-pop-in"] as const
const CHARTLADDER_VARIANTS  = ["cross-dissolve", "annotation-accumulative", "camera-zoom", "data-filter-step"] as const
const GRID_VARIANTS         = ["uniform", "featured", "masonry", "carousel"] as const
const LIGHTBOX_VARIANTS     = ["modal", "inline-expand", "drawer", "fullscreen-takeover"] as const
const SEQUENCE_VARIANTS     = ["stack", "carousel", "accordion"] as const
const EXPLORE_VARIANTS      = ["native-interactivity", "controls-panel", "search-bar", "drill-down-reveals", "sync-multi-viz"] as const
```

Un sous-ensemble `TIER1_RENDER_READY` explicite par primitive — variants rendus visuellement en v3.0.0. Les autres sont acceptés schema-level mais `validateVariants()` (build-time) log un dev-warning et fallback au default Tier 1 du primitive.

### 4.4 Block.Explore

Fichier : `src/lib/core/schemas/block.ts` (union étendue).

```ts
export const exploreBlockSchema = z.object({
  type: z.literal("explore"),
  variant: z.enum(EXPLORE_VARIANTS).default("native-interactivity"),
  content: z.discriminatedUnion("type", [mtMapContentSchema, dwChartContentSchema, flourishContentSchema]),
  legend: z.object({
    position: z.enum(["top", "right", "overlay"]).default("top"),
    items: z.array(legendItemSchema).optional(),
    render: z.enum(["auto", "lib", "native"]).default("auto"),
    collapsibleOnMobile: z.boolean().default(true)
  }),
  sourceNote: z.string().optional()
})
```

Anti-pattern §9.4.9 (Explore sans legend) appliqué via `.refine` au block-level ou au article-level (à trancher en implementation).

### 4.5 Block.Flow

```ts
export const flowBlockSchema = z.object({
  type: z.literal("flow"),
  variant: z.enum(FLOW_VARIANTS).default("text-only"),
  children: z.array(z.discriminatedUnion("type", [markdownContentSchema, imageContentSchema]))
}).refine(
  b => !b.variant.startsWith("image-") || b.children.some(c => c.type === "image"),
  { message: "Flow variant image-* requires at least one image child" }
)
```

### 4.6 Article-level tokens

`src/lib/core/schemas/article.ts` : le champ `tokens: designTokensSchema.optional()` ajoute `positioning` au niveau article. Cascade au build (§4.2).

---

## 5. Components

### 5.1 Existing structural primitives — variant rendering

Patch uniforme (Svelte 5 runes) :

```svelte
<script lang="ts">
  import type { StickyBlock } from '../core/schemas/structural'
  let { variant, children } = $props<StickyBlock>()
</script>

<div class="vz-sticky vz-sticky--{variant}">
  {@render children()}
</div>
```

CSS dans `src/lib/structural-primitives/<Name>.svelte` ou fichier dédié `<name>.css`. BEM `.vz-<primitive>--<variant>`. Behavior conditionnel (drag, intersection observers, etc.) via `$derived` + `$effect`.

| Primitive | Tier 1 variants v3.0.0 | Effort |
|---|---|---|
| `Sticky` | `sticky-left` (default), `sticky-right` (flip), `sticky-center-overlay` | Low (CSS) |
| `Split` | `static`, `drag-separator` (pointer events + `clip-path` dynamique) | Medium |
| `Crossfade` | `fade`, `cut` (`transition: none`) | Low |
| `Sequence` | `stack` (seul Tier 1) | Trivial |
| `Grid` | `uniform`, `featured` (`grid-template-areas`) | Low-Medium |
| `Lightbox` | `modal`, `inline-expand` (transition max-height vs portal) | Medium |
| `ScrollSteps` | hérite du parent (pas de variant propre) | Trivial |

### 5.2 Nouveau primitive `Flow.svelte`

Fichier : `src/lib/structural-primitives/Flow.svelte`.

- Accepte `variant` + `children: (Markdown | Image)[]`.
- Layout per variant via CSS Grid / Flexbox + CSS vars.
- Pour variants `image-*` : groupement implicite en paires `(Image, Markdown)` dans l'ordre des children. Order preserved.
- Responsive : breakpoint `mobile` (≤768px) force stack vertical quel que soit le variant (sauf `text-only` déjà stack).
- Variant `image-background-textoverlay` applique `background-image: url()` + `--vz-overlay` (utilise le token `overlay` résolu).

### 5.3 Nouveau primitive `Explore.svelte`

Fichier : `src/lib/structural-primitives/Explore.svelte`.

- Container full-width ou pinned (pas de variant container-level en v3.0.0 — juste `position: relative` + `width: 100%`).
- Slot `content` : le content primitive (MT/DW/FL).
- Slot `legend` : `<ExploreLegend>` lib-rendered OU passthrough natif.
- Routing automatique :
  ```ts
  const legendMode = 
    block.legend.render === "auto"
      ? block.content.type === "mt-map" ? "lib" : "native"
      : block.legend.render
  ```
- Variant `native-interactivity` (Tier 1) : rien de spécial, le content tool natif expose ses filtres natifs (pan/zoom pour MT, dropdowns pour DW interactifs, story controls pour FL).
- Variants Tier 2+ (`controls-panel`, `search-bar`, `drill-down-reveals`, `sync-multi-viz`) : schema accepté, render fallback au default `native-interactivity` + dev-warning (v3.1.0 implémente visuel).

### 5.4 Nouveau primitive `ExploreLegend.svelte`

Fichier : `src/lib/structural-primitives/ExploreLegend.svelte`.

- Props : `items: LegendItem[]`, `position: "top" | "right" | "overlay"`, `collapsibleOnMobile: boolean`.
- Rendu HTML pur : `<ul>` d'items, chaque item = swatch couleur + label.
- Positioning CSS :
  - `top` : `grid-area: legend; grid-row: 1`
  - `right` : `grid-area: legend; grid-column: 2`
  - `overlay` : `position: absolute; bottom: 12px; left: 12px` + background blur
- Mobile : si `collapsibleOnMobile`, `<details>` natif avec `<summary>` "Légende".

### 5.5 Content primitives

Fichiers dans `src/lib/content-primitives/` :

| Primitive | Statut | Rôle v3.0.0 |
|---|---|---|
| `FlourishChart.svelte` | Existant | Ajout prop `variant` (passthrough parent), passthrough story controls |
| `MTMap.svelte` | Existant | Ajout props pour Explore (filters passthrough, legend data extraction) |
| `Video.svelte` | Existant | Aucun changement |
| `DWChart.svelte` | **Nouveau** | Wrappe `<iframe src={dwUrl}>` responsive, reçoit config de `datawrapper/build-config.ts` |
| `Image.svelte` | **Nouveau** | `<picture>` + `<img srcset>` responsive, alt text obligatoire (Zod) |
| `Markdown.svelte` | **Nouveau** | Parseur markdown (via `marked` ou équivalent léger), sanitize, rendu comme `<div>` children |

### 5.6 BlockRenderer dispatch

`src/lib/BlockRenderer.svelte` ajoute les cas `flow`, `explore`, `markdown`, `image`, `dw-chart`. Pattern switch sur `block.type`, passe `{...block}` au component correspondant.

---

## 6. Build pipeline

Flow dans `src/lib/core/build-page.ts` :

1. Parse article JSON via Zod v4 (article + blocks + content + tokens).
2. `expandRecipes()` — existant, inchangé.
3. **`applyPositioning(tokens)`** — nouveau, cascade.
4. **`validateVariants(blocks)`** — nouveau, log dev-warnings pour variants Tier 2+ non-render-ready + fallback.
5. `tokensToCSSVariables(resolvedTokens)` — existant, consomme tokens résolus.
6. Render HTML via Svelte SSR + CSS critical.
7. Return `{ html, css, critical, warnings }` pour consommateur (plugin).

Export API inchangée en signature externe : `buildArticlePage(article)` retourne le même shape (avec champ `warnings` ajouté, non-breaking).

---

## 7. Test strategy

**Unit (bun:test)** — `tests/unit/` :
- `core/apply-positioning.test.ts` : 4 positioning × avec/sans overrides = ~20 assertions.
- `core/validate-variants.test.ts` : Tier 1/2/3 acceptance + fallback logic.
- `schemas/variant-enums.test.ts` : chaque primitive accept Tier 1/2, reject inconnu.
- `schemas/explore.test.ts` : refusal si legend absent, routing legend.render auto→lib/native.
- `schemas/flow.test.ts` : refusal variant image-* sans child image.
- `core/build-page.test.ts` : golden file par Tier 1 variant (input JSON → HTML snapshot).

**Playwright contract** — `tests/e2e/` :
- Un test par nouveau primitive : Flow, Explore, ExploreLegend, DWChart, Image, Markdown.
- Un test par variant Tier 1 non-CSS-flip (~10 variants). Les CSS-flip (sticky-right, image-right) = unit test CSS class appliqué.
- Tests existants Phase 3 recipes : préservés.

**Dev harness** — `src/routes/dev/` :
- `/dev/v3/positioning/[axis]` : 4 routes.
- `/dev/v3/explore/[variant]` : 5 routes (incluant Tier 2 qui render fallback).
- `/dev/v3/flow/[variant]` : 7 routes.
- `/dev/v3/sticky/[variant]`, `/dev/v3/split/[variant]`, etc. : une route par variant Tier 1 par primitive.
- Routes existantes `/dev/recipes/*` : préservées.

---

## 8. Release & publication

**Changeset flow** (existant dans `.changeset/`) :
- Chaque phase `changeset add` avec description human-readable.
- `changeset publish` pour tag npm.

**Séquence de publication :**

1. **`3.0.0-beta.0`** — Phase 1 (schemas v3 + Zod v4 bump + positioning cascade + tests unit). Lib API stable pour plugin.
2. **`3.0.0-beta.1`** — Phase 2 (variants sur primitives existants + Flow nouveau).
3. **`3.0.0-beta.2`** — Phase 3 (Explore + ExploreLegend + DWChart + Image + Markdown).
4. **`3.0.0`** GA — Phase 4 (dev harness complet + Playwright green + doc + CHANGELOG final).

**Plugin repo dependency** : après chaque beta, plugin peut `bun install @rmdms/viznews@3.0.0-beta.N` et itérer son rebuild WS3 Phase 3 en parallèle.

**README / CHANGELOG** :
- `CHANGELOG.md` mis à jour par changeset à chaque phase.
- `README.md` réécrit à Phase 4 avec sections : Installation, Positioning cascade example, Variants matrix, Migration v0.2.0 → v3.0.0.

---

## 9. Phases de livraison

**Phase 1 — Foundation (prérequis tout le reste)**
- Zod v3 → v4 bump (dependency + code adjustments).
- `design-tokens.ts` v3 shape.
- `apply-positioning.ts` + tests unit.
- `validate-variants.ts` (skeleton, pas de fallback logic encore).
- `tokensToCSSVariables` adapté aux nouveaux tokens.
- Unit tests green.
- **Publish `3.0.0-beta.0`.**

**Phase 2 — Variants existing + Flow**
- Ajout prop `variant` + CSS variants Tier 1 sur Sticky/Split/Crossfade/Sequence/Grid/Lightbox.
- `Flow.svelte` nouveau + 7 variants Tier 1/2.
- Playwright contract tests pour variants non-CSS-flip.
- Dev harness routes `/dev/v3/<primitive>/<variant>`.
- **Publish `3.0.0-beta.1`.**

**Phase 3 — Explore + content primitives**
- `Explore.svelte` + `ExploreLegend.svelte` + routing auto/lib/native.
- `DWChart.svelte` nouveau (wrap config existant).
- `Image.svelte` + `Markdown.svelte` nouveaux.
- `BlockRenderer` dispatch mis à jour.
- Playwright contract tests pour nouveaux primitives.
- **Publish `3.0.0-beta.2`.**

**Phase 4 — Polish & GA**
- Dev harness complet : toutes variants Tier 1 couvertes.
- Playwright contract tests 100 % green (tous primitives × variants non-CSS-flip).
- `README.md` v3 réécrit.
- `CHANGELOG.md` final consolidé via changeset.
- Bump `package.json` → `3.0.0` (GA).
- **Publish `3.0.0` GA + tag git v3.0.0.**

---

## 10. Success criteria

WS2 est ship-ready (GA `3.0.0`) quand :

1. **4 phases commitées** avec 4 tags npm (beta.0/beta.1/beta.2/GA).
2. **`bun test` vert** sur tous les tests unit (incluant golden files HTML).
3. **`bunx playwright test` vert** sur toutes les contract routes.
4. **Matrix ROADMAP ↔ Zod enums alignée** : script de vérif (grep enum list vs ROADMAP) clean.
5. **Plugin repo peut `bun install @rmdms/viznews@3.0.0`** et débloquer WS3 Task #14 (Update viznews-playbook skill) et downstream.
6. **Dev harness** présente chaque variant Tier 1 (22 routes minimum).
7. **README v3** complet avec migration path v0.2.0 → v3.0.0 documenté.
8. **CHANGELOG final** human-readable avec breaking changes listés.

---

## 11. Risques identifiés

| Risque | Impact | Mitigation |
|---|---|---|
| Zod v4 API breaks (record, nativeEnum, error maps) | Tests unit cassent | Phase 1 = Zod bump isolé, golden tests détectent régression fast. Budget 0.5j. |
| MT filter passthrough API hétérogène selon sources (raster/vector/custom) | Explore `native-interactivity` inconsistent | Fallback `native-interactivity` = pan/zoom seul (garanti par MT SDK). Filters natifs en best-effort. Documenté dans dev-warning. |
| DW iframe postMessage bridge pour Tier 2 `controls-panel` fragile | Blocage v3.1 uniquement, pas v3.0 | Tier 2 hors scope v3.0. §9.3.6 anti-pattern documenté côté playbook. |
| Svelte 5 runes API encore jeune, patterns legacy v0.2.0 | Régressions silencieuses | Playwright contract tests catch render regressions. Svelte-check strict en CI. |
| Plugin ne peut pas itérer pendant WS2 si beta.0 tarde | Blocage WS3 | Phase 1 ciblée à 2 jours max. beta.0 = API stable suffit, pas besoin de tout. |
| Breaking v0.2.0 consumers externes | Users tiers bloqués | v0.2.0 est interne (pas de users publics). Non-bloquant. Migration note dans README v3. |

---

## 12. Questions ouvertes (aucune bloquante)

- **Markdown parser** : `marked` (stable, popular) vs `remark` (plugin-friendly) vs custom minimal. À trancher Phase 3 lors de l'implémentation `Markdown.svelte`.
- **CSS methodology** : BEM uniform (`.vz-<primitive>--<variant>`) confirmé pour variants. Autres styles (tokens, responsive utils) : utility classes vs CSS modules — à trancher en implémentation, non-bloquant.
- **Explore Tier 2 `controls-panel` API shape** : défini en v3.1.0, pas en v3.0. Mais les Zod enums acceptent déjà le nom — à renforcer en v3.1.

---

## 13. Non-goals explicites

- Pas de breaking change sur la signature externe de `buildArticlePage` (retourne même shape + champ `warnings` additif).
- Pas de nouveau framework JS (reste Svelte 5 + Vite).
- Pas de dépendance design-system externe (Tailwind, daisyUI, etc.). CSS vars uniquement.
- Pas de CSS-in-JS ou styled-components. Pure Svelte scoped styles + CSS vars.
- Pas de build server-side custom — reste svelte-package + vite build.
- Pas de hot-reload server en prod — dev harness seul, prod = `dist/` statique.
