# `@rmdms/viznews` v3.0.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refondre `@rmdms/viznews` de `v0.2.0` vers `v3.0.0` : positioning cascade, 22 variants Tier 1 sur 10 structural primitives, nouveaux primitives `Flow` / `Explore` / `ExploreLegend`, upgrade content primitives `DWChart` / `Image` / `Markdown`, bump Zod v3 → v4, publication en 4 beta npm successifs puis GA.

**Architecture :** Build-time heavy (Zod parse → `expandRecipes` → `applyPositioning` → `validateVariants` → `tokensToCSSVariables`), render-time léger (Svelte 5 runes + scoped CSS + BEM `.vn-<primitive>--<variant>`). Schema-time refusal via Zod enums per-primitive. Positioning axis pilote 5 tokens dérivés (`layoutRhythm` / `radius` / `shadow` / `border` / `overlay`) avec override explicite possible. Publication 4-phase (beta.0 foundation, beta.1 variants+Flow, beta.2 Explore+content, 3.0.0 GA).

**Tech Stack :** Svelte 5 (runes), Vite 5, SvelteKit 2 (static adapter), TypeScript 5.5, Zod v4, bun:test (unit), Playwright (contract), `@changesets/cli` (release), `marked` (Markdown parsing Phase 3), MapTiler SDK (peer), changeset-driven npm publish.

**Spec :** `docs/superpowers/specs/2026-04-17-viznews-lib-v3-rebuild-design.md` (commit `f80341d`).

**Branche :** `feat/v3-rebuild` (existante, basée sur `main`).

**Préambule** — exécuter une seule fois avant Phase 1 :

```bash
cd /Users/rmdms/Sites/Professional/viznews-lib
git status                  # doit être clean sur feat/v3-rebuild
bun install                 # sanity-check deps actuelles
bun test tests/unit         # baseline vert
```

---

## Phase 1 — Foundation (publish `3.0.0-beta.0`)

Objectif : bump Zod v4, schéma DesignTokens v3, cascade `applyPositioning`, skeleton `validateVariants`, tokens CSS étendus, wire dans `buildArticlePage`. Aucun changement visuel côté components — API côté plugin stable au terme de cette phase.

### Task 1: Bump Zod v3 → v4

**Files:**
- Modify: `package.json` (dependency `zod`)
- Modify: `bun.lock` (régénéré)

- [ ] **Step 1: Mettre à jour la dépendance Zod**

Edit `package.json` ligne 52, remplacer `"zod": "^3.23.0"` par `"zod": "^4.0.0"`.

- [ ] **Step 2: Installer Zod v4**

```bash
bun install
```

Expected : `bun.lock` mis à jour, `node_modules/zod/package.json` version `4.x.x`.

- [ ] **Step 3: Vérifier que la suite unit tourne (potentiellement rouge — c'est attendu)**

```bash
bun test tests/unit 2>&1 | tail -40
```

Expected : soit tout vert (API compatible), soit erreurs Zod v4 (signature de `z.record`, `z.nativeEnum`, error maps changées). Noter les fichiers rouges pour Step 4.

- [ ] **Step 4: Fixer les ruptures Zod v4**

Les ruptures fréquentes Zod v3 → v4 (à corriger uniquement si les tests les remontent) :
- `z.record(z.unknown())` → `z.record(z.string(), z.unknown())` (clé explicite requise en v4)
- `z.nativeEnum(E)` → `z.enum(E)` (la lib accepte enum TS directement)
- `.error.issues` → `.error.issues` (inchangé) mais `.error.format()` peut avoir signatures différentes

Check `src/lib/core/schemas/content.ts:55` (`style: z.record(z.unknown())` → `z.record(z.string(), z.unknown())`).

- [ ] **Step 5: Re-run tests**

```bash
bun test tests/unit
```

Expected : all green.

- [ ] **Step 6: Commit**

```bash
git add package.json bun.lock src/lib/core/schemas/content.ts
git commit -m "$(cat <<'EOF'
feat(deps): bump Zod v3.23 → v4 (breaking)

Zod v4 required for alignment with plugin (uses zod@4.3.6) and
upcoming v3 schemas. z.record requires explicit key type in v4.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: DesignTokens v3 schema

**Files:**
- Modify: `src/lib/core/schemas/design-tokens.ts`
- Test: `tests/unit/tokens.test.ts` (existant, étendu)

- [ ] **Step 1: Écrire les tests pour le schéma v3**

Ajouter dans `tests/unit/tokens.test.ts` à la fin :

```ts
describe("DesignTokensSchema v3 extensions", () => {
  const base = defaultTokens();

  it("accepts positioning editorial-tight", () => {
    const t = { ...base, positioning: "editorial-tight" as const };
    expect(() => DesignTokensSchema.parse(t)).not.toThrow();
  });

  it("accepts positioning airy-contemplative", () => {
    const t = { ...base, positioning: "airy-contemplative" as const };
    expect(() => DesignTokensSchema.parse(t)).not.toThrow();
  });

  it("defaults positioning to balanced when omitted", () => {
    const parsed = DesignTokensSchema.parse(base);
    expect(parsed.positioning).toBe("balanced");
  });

  it("rejects unknown positioning value", () => {
    const t = { ...base, positioning: "zen-ultra" };
    expect(() => DesignTokensSchema.parse(t)).toThrow();
  });

  it("accepts optional radius/shadow/border/overlay/layoutRhythm", () => {
    const t = {
      ...base,
      positioning: "balanced" as const,
      radius: "soft" as const,
      shadow: "dramatic" as const,
      border: "hairline" as const,
      overlay: "darken-20" as const,
      layoutRhythm: "airy" as const,
    };
    expect(() => DesignTokensSchema.parse(t)).not.toThrow();
  });

  it("rejects invalid radius value", () => {
    const t = { ...base, radius: "ultra-round" };
    expect(() => DesignTokensSchema.parse(t)).toThrow();
  });

  it("defaults breakpoints to { mobile: 768, tablet: 1024 }", () => {
    const parsed = DesignTokensSchema.parse(base);
    expect(parsed.breakpoints).toEqual({ mobile: 768, tablet: 1024 });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
bun test tests/unit/tokens.test.ts
```

Expected : FAIL on "DesignTokensSchema v3 extensions" (unknown keys `positioning`, `radius`, etc.).

- [ ] **Step 3: Étendre le schéma v3**

Remplacer `src/lib/core/schemas/design-tokens.ts` intégralement :

```ts
import { z } from "zod";

export const LocaleSchema = z.enum([
  "fr-CH",
  "fr-FR",
  "en-US",
  "en-GB",
  "de-CH",
]);

export const PaletteSchema = z.object({
  scheme: z.enum([
    "viridis",
    "okabe-ito",
    "tol-bright",
    "category10",
    "custom",
  ]),
  customColors: z.array(z.string()).optional(),
  background: z.string(),
  foreground: z.string(),
  muted: z.string(),
  accent: z.string(),
});

export const TypographySchema = z.object({
  bodyFontFamily: z.string(),
  headingFontFamily: z.string(),
  monoFontFamily: z.string(),
  baseSize: z.number(),
  scale: z.number(),
});

export const SpacingSchema = z.object({ unit: z.number() });

export const SourceStyleSchema = z.object({
  format: z.enum(["inline", "footnote", "panel"]),
  prefix: z.string(),
});

// v3 additions
export const PositioningSchema = z.enum([
  "editorial-tight",
  "balanced",
  "airy-contemplative",
  "dashboard-dense",
]);

export const LayoutRhythmSchema = z.enum(["dense", "tight", "balanced", "airy"]);
export const RadiusSchema = z.enum(["sharp", "soft", "rounded"]);
export const ShadowSchema = z.enum(["none", "subtle", "dramatic"]);
export const BorderSchema = z.enum(["none", "hairline", "emphatic"]);
export const OverlaySchema = z.enum([
  "none",
  "darken-20",
  "darken-50",
  "gradient-bottom",
]);

export const BreakpointsSchema = z
  .object({
    mobile: z.literal(768),
    tablet: z.literal(1024),
  })
  .default({ mobile: 768, tablet: 1024 });

export const DesignTokensSchema = z.object({
  locale: LocaleSchema,
  palette: PaletteSchema,
  typography: TypographySchema,
  spacing: SpacingSchema,
  sourceStyle: SourceStyleSchema,
  mode: z.enum(["light", "dark"]),
  // v3 additions
  positioning: PositioningSchema.default("balanced"),
  layoutRhythm: LayoutRhythmSchema.optional(),
  radius: RadiusSchema.optional(),
  shadow: ShadowSchema.optional(),
  border: BorderSchema.optional(),
  overlay: OverlaySchema.optional(),
  breakpoints: BreakpointsSchema,
});

export type DesignTokens = z.infer<typeof DesignTokensSchema>;
export type Positioning = z.infer<typeof PositioningSchema>;
export type LayoutRhythm = z.infer<typeof LayoutRhythmSchema>;
export type Radius = z.infer<typeof RadiusSchema>;
export type Shadow = z.infer<typeof ShadowSchema>;
export type Border = z.infer<typeof BorderSchema>;
export type Overlay = z.infer<typeof OverlaySchema>;
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
bun test tests/unit/tokens.test.ts
```

Expected : PASS sur les nouveaux cas. Tests pré-existants doivent continuer de passer (les tokens v0.2.0 n'ont pas `positioning` → default pris en compte).

- [ ] **Step 5: Commit**

```bash
git add src/lib/core/schemas/design-tokens.ts tests/unit/tokens.test.ts
git commit -m "$(cat <<'EOF'
feat(schemas): DesignTokens v3 with positioning + derived tokens

Add positioning axis (editorial-tight/balanced/airy-contemplative/
dashboard-dense) + 5 optional derived tokens (layoutRhythm, radius,
shadow, border, overlay) + fixed breakpoints. Default positioning
balanced preserves v0.2.0 behavior for unaware callers.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: `defaultTokens()` runtime updated

**Files:**
- Modify: `src/lib/core/design-tokens.ts`
- Test: `tests/unit/tokens.test.ts`

- [ ] **Step 1: Écrire le test**

Ajouter dans `tests/unit/tokens.test.ts` :

```ts
describe("defaultTokens() v3 runtime type", () => {
  it("includes positioning defaulted to balanced", () => {
    const t = defaultTokens();
    expect(t.positioning).toBe("balanced");
  });

  it("includes breakpoints defaulted to { mobile: 768, tablet: 1024 }", () => {
    const t = defaultTokens();
    expect(t.breakpoints).toEqual({ mobile: 768, tablet: 1024 });
  });

  it("allows positioning override via opts", () => {
    const t = defaultTokens({ positioning: "airy-contemplative" });
    expect(t.positioning).toBe("airy-contemplative");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
bun test tests/unit/tokens.test.ts
```

Expected : FAIL (`positioning` undefined + `breakpoints` undefined sur runtime type).

- [ ] **Step 3: Mettre à jour `defaultTokens()`**

Remplacer intégralement `src/lib/core/design-tokens.ts` :

```ts
export type Locale = "fr-CH" | "fr-FR" | "en-US" | "en-GB" | "de-CH";
export type Positioning =
  | "editorial-tight"
  | "balanced"
  | "airy-contemplative"
  | "dashboard-dense";
export type LayoutRhythm = "dense" | "tight" | "balanced" | "airy";
export type Radius = "sharp" | "soft" | "rounded";
export type Shadow = "none" | "subtle" | "dramatic";
export type Border = "none" | "hairline" | "emphatic";
export type Overlay = "none" | "darken-20" | "darken-50" | "gradient-bottom";

export type DesignTokens = {
  locale: Locale;
  palette: {
    scheme: "viridis" | "okabe-ito" | "tol-bright" | "category10" | "custom";
    customColors?: string[];
    background: string;
    foreground: string;
    muted: string;
    accent: string;
  };
  typography: {
    bodyFontFamily: string;
    headingFontFamily: string;
    monoFontFamily: string;
    baseSize: number;
    scale: number;
  };
  spacing: { unit: number };
  sourceStyle: { format: "inline" | "footnote" | "panel"; prefix: string };
  mode: "light" | "dark";
  positioning: Positioning;
  layoutRhythm?: LayoutRhythm;
  radius?: Radius;
  shadow?: Shadow;
  border?: Border;
  overlay?: Overlay;
  breakpoints: { mobile: 768; tablet: 1024 };
};

export function defaultTokens(opts?: {
  locale?: Locale;
  mode?: "light" | "dark";
  positioning?: Positioning;
}): DesignTokens {
  return {
    locale: opts?.locale ?? "fr-CH",
    palette: {
      scheme: "viridis",
      background: "#ffffff",
      foreground: "#111111",
      muted: "#666666",
      accent: "#156964",
    },
    typography: {
      bodyFontFamily: "'Inter', system-ui, sans-serif",
      headingFontFamily: "'Inter', system-ui, sans-serif",
      monoFontFamily: "'JetBrains Mono', monospace",
      baseSize: 17,
      scale: 1.25,
    },
    spacing: { unit: 8 },
    sourceStyle: { format: "footnote", prefix: "Source : " },
    mode: opts?.mode ?? "light",
    positioning: opts?.positioning ?? "balanced",
    breakpoints: { mobile: 768, tablet: 1024 },
  };
}
```

- [ ] **Step 4: Run tests**

```bash
bun test tests/unit/tokens.test.ts
```

Expected : PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/core/design-tokens.ts tests/unit/tokens.test.ts
git commit -m "$(cat <<'EOF'
feat(tokens): defaultTokens() emits v3 shape with positioning

Runtime DesignTokens type aligned with Zod schema. positioning
default "balanced" preserves v0.2.0 behavior. breakpoints fixed.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: `applyPositioning()` cascade

**Files:**
- Create: `src/lib/core/apply-positioning.ts`
- Test: `tests/unit/apply-positioning.test.ts`

- [ ] **Step 1: Écrire les tests**

Créer `tests/unit/apply-positioning.test.ts` :

```ts
import { describe, it, expect } from "bun:test";
import { applyPositioning } from "../../src/lib/core/apply-positioning";
import { defaultTokens } from "../../src/lib/core/design-tokens";

describe("applyPositioning — preset mapping", () => {
  it("editorial-tight preset", () => {
    const t = defaultTokens({ positioning: "editorial-tight" });
    const r = applyPositioning(t);
    expect(r.layoutRhythm).toBe("tight");
    expect(r.radius).toBe("sharp");
    expect(r.shadow).toBe("subtle");
    expect(r.border).toBe("hairline");
    expect(r.overlay).toBe("none");
  });

  it("balanced preset (default)", () => {
    const r = applyPositioning(defaultTokens({ positioning: "balanced" }));
    expect(r.layoutRhythm).toBe("balanced");
    expect(r.radius).toBe("soft");
    expect(r.shadow).toBe("subtle");
    expect(r.border).toBe("none");
    expect(r.overlay).toBe("none");
  });

  it("airy-contemplative preset", () => {
    const r = applyPositioning(defaultTokens({ positioning: "airy-contemplative" }));
    expect(r.layoutRhythm).toBe("airy");
    expect(r.radius).toBe("rounded");
    expect(r.shadow).toBe("dramatic");
    expect(r.border).toBe("none");
    expect(r.overlay).toBe("none");
  });

  it("dashboard-dense preset", () => {
    const r = applyPositioning(defaultTokens({ positioning: "dashboard-dense" }));
    expect(r.layoutRhythm).toBe("dense");
    expect(r.radius).toBe("sharp");
    expect(r.shadow).toBe("none");
    expect(r.border).toBe("hairline");
    expect(r.overlay).toBe("none");
  });
});

describe("applyPositioning — explicit overrides", () => {
  it("explicit radius overrides preset radius", () => {
    const t = { ...defaultTokens({ positioning: "balanced" }), radius: "rounded" as const };
    const r = applyPositioning(t);
    expect(r.radius).toBe("rounded");
    expect(r.layoutRhythm).toBe("balanced");
  });

  it("explicit overlay overrides default none", () => {
    const t = { ...defaultTokens(), overlay: "darken-50" as const };
    const r = applyPositioning(t);
    expect(r.overlay).toBe("darken-50");
  });

  it("all 5 explicit overrides win over any preset", () => {
    const t = {
      ...defaultTokens({ positioning: "dashboard-dense" }),
      layoutRhythm: "airy" as const,
      radius: "rounded" as const,
      shadow: "dramatic" as const,
      border: "emphatic" as const,
      overlay: "gradient-bottom" as const,
    };
    const r = applyPositioning(t);
    expect(r.layoutRhythm).toBe("airy");
    expect(r.radius).toBe("rounded");
    expect(r.shadow).toBe("dramatic");
    expect(r.border).toBe("emphatic");
    expect(r.overlay).toBe("gradient-bottom");
  });
});

describe("applyPositioning — determinism", () => {
  it("same input produces same output", () => {
    const t = defaultTokens({ positioning: "airy-contemplative" });
    expect(applyPositioning(t)).toEqual(applyPositioning(t));
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
bun test tests/unit/apply-positioning.test.ts
```

Expected : FAIL — module `apply-positioning.ts` introuvable.

- [ ] **Step 3: Implémenter `applyPositioning`**

Créer `src/lib/core/apply-positioning.ts` :

```ts
import type {
  DesignTokens,
  Positioning,
  LayoutRhythm,
  Radius,
  Shadow,
  Border,
  Overlay,
} from "./design-tokens";

export type ResolvedTokens = DesignTokens & {
  layoutRhythm: LayoutRhythm;
  radius: Radius;
  shadow: Shadow;
  border: Border;
  overlay: Overlay;
};

type Preset = {
  layoutRhythm: LayoutRhythm;
  radius: Radius;
  shadow: Shadow;
  border: Border;
};

const POSITIONING_PRESETS: Record<Positioning, Preset> = {
  "editorial-tight": {
    layoutRhythm: "tight",
    radius: "sharp",
    shadow: "subtle",
    border: "hairline",
  },
  balanced: {
    layoutRhythm: "balanced",
    radius: "soft",
    shadow: "subtle",
    border: "none",
  },
  "airy-contemplative": {
    layoutRhythm: "airy",
    radius: "rounded",
    shadow: "dramatic",
    border: "none",
  },
  "dashboard-dense": {
    layoutRhythm: "dense",
    radius: "sharp",
    shadow: "none",
    border: "hairline",
  },
};

export function applyPositioning(tokens: DesignTokens): ResolvedTokens {
  const preset = POSITIONING_PRESETS[tokens.positioning];
  return {
    ...tokens,
    layoutRhythm: tokens.layoutRhythm ?? preset.layoutRhythm,
    radius: tokens.radius ?? preset.radius,
    shadow: tokens.shadow ?? preset.shadow,
    border: tokens.border ?? preset.border,
    overlay: tokens.overlay ?? "none",
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
bun test tests/unit/apply-positioning.test.ts
```

Expected : PASS (11 assertions green).

- [ ] **Step 5: Commit**

```bash
git add src/lib/core/apply-positioning.ts tests/unit/apply-positioning.test.ts
git commit -m "$(cat <<'EOF'
feat(core): applyPositioning() cascade (positioning → 5 tokens)

Deterministic prescriptive cascade: positioning axis fixes
layoutRhythm, radius, shadow, border defaults. overlay defaults
to "none" outside the preset. Explicit overrides win.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Variant enums + `validateVariants()` skeleton

**Files:**
- Create: `src/lib/core/schemas/variants.ts` (enums + tier matrix)
- Create: `src/lib/core/validate-variants.ts` (skeleton, no fallback logic yet)
- Test: `tests/unit/variants.test.ts`

- [ ] **Step 1: Écrire les tests**

Créer `tests/unit/variants.test.ts` :

```ts
import { describe, it, expect } from "bun:test";
import {
  STICKY_VARIANTS,
  SPLIT_VARIANTS,
  CROSSFADE_VARIANTS,
  FLOW_VARIANTS,
  FLYTO_VARIANTS,
  CHARTLADDER_VARIANTS,
  GRID_VARIANTS,
  LIGHTBOX_VARIANTS,
  SEQUENCE_VARIANTS,
  EXPLORE_VARIANTS,
  TIER1_RENDER_READY,
  StickyVariantSchema,
  SplitVariantSchema,
} from "../../src/lib/core/schemas/variants";
import { validateVariants } from "../../src/lib/core/validate-variants";

describe("variant enums — ROADMAP alignment", () => {
  it("STICKY_VARIANTS matches ROADMAP v3.0/3.1 matrix", () => {
    expect(STICKY_VARIANTS).toEqual([
      "sticky-left",
      "sticky-right",
      "sticky-center-overlay",
      "sticky-full-with-steps-panel",
    ]);
  });

  it("FLOW_VARIANTS matches spec §4.3", () => {
    expect(FLOW_VARIANTS).toEqual([
      "text-only",
      "image-top",
      "image-left",
      "image-right",
      "image-bottom",
      "image-fullbleed",
      "image-background-textoverlay",
    ]);
  });

  it("EXPLORE_VARIANTS includes all 5 tiered variants", () => {
    expect(EXPLORE_VARIANTS.length).toBe(5);
    expect(EXPLORE_VARIANTS).toContain("native-interactivity");
    expect(EXPLORE_VARIANTS).toContain("sync-multi-viz");
  });
});

describe("variant Zod schemas — accept/reject", () => {
  it("StickyVariantSchema accepts all 4 Tier 1/2", () => {
    for (const v of STICKY_VARIANTS) {
      expect(() => StickyVariantSchema.parse(v)).not.toThrow();
    }
  });

  it("StickyVariantSchema rejects unknown", () => {
    expect(() => StickyVariantSchema.parse("sticky-everywhere")).toThrow();
  });

  it("SplitVariantSchema accepts drag-separator", () => {
    expect(() => SplitVariantSchema.parse("drag-separator")).not.toThrow();
  });
});

describe("TIER1_RENDER_READY — spec §5.1 table", () => {
  it("sticky Tier 1 = 3 variants", () => {
    expect(TIER1_RENDER_READY.sticky).toEqual([
      "sticky-left",
      "sticky-right",
      "sticky-center-overlay",
    ]);
  });

  it("split Tier 1 = static + drag-separator", () => {
    expect(TIER1_RENDER_READY.split).toEqual(["static", "drag-separator"]);
  });

  it("sequence Tier 1 = stack only", () => {
    expect(TIER1_RENDER_READY.sequence).toEqual(["stack"]);
  });
});

describe("validateVariants — warnings", () => {
  it("no warning when all variants Tier 1 render-ready", () => {
    const { warnings } = validateVariants([
      { type: "sticky", variant: "sticky-left", visual: { type: "dev-stub", label: "v" }, steps: [] },
    ] as any);
    expect(warnings).toEqual([]);
  });

  it("emits warning for Tier 2+ variant not yet render-ready", () => {
    const { warnings } = validateVariants([
      { type: "sticky", variant: "sticky-full-with-steps-panel", visual: { type: "dev-stub", label: "v" }, steps: [] },
    ] as any);
    expect(warnings.length).toBe(1);
    expect(warnings[0]).toMatch(/sticky-full-with-steps-panel/);
    expect(warnings[0]).toMatch(/fallback/);
  });

  it("emits warning for split toggle (Tier 2)", () => {
    const { warnings } = validateVariants([
      { type: "split", variant: "toggle", left: { type: "dev-stub", label: "l" }, right: { type: "dev-stub", label: "r" } },
    ] as any);
    expect(warnings.length).toBe(1);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
bun test tests/unit/variants.test.ts
```

Expected : FAIL (modules introuvables).

- [ ] **Step 3: Créer le fichier variants schemas**

Créer `src/lib/core/schemas/variants.ts` :

```ts
import { z } from "zod";

export const STICKY_VARIANTS = [
  "sticky-left",
  "sticky-right",
  "sticky-center-overlay",
  "sticky-full-with-steps-panel",
] as const;

export const SPLIT_VARIANTS = [
  "static",
  "drag-separator",
  "toggle",
  "auto-sweep",
] as const;

export const CROSSFADE_VARIANTS = ["fade", "cut", "wipe", "zoom"] as const;

export const FLOW_VARIANTS = [
  "text-only",
  "image-top",
  "image-left",
  "image-right",
  "image-bottom",
  "image-fullbleed",
  "image-background-textoverlay",
] as const;

export const FLYTO_VARIANTS = [
  "camera-scripted",
  "reveal-layers",
  "trail",
  "markers-pop-in",
] as const;

export const CHARTLADDER_VARIANTS = [
  "cross-dissolve",
  "annotation-accumulative",
  "camera-zoom",
  "data-filter-step",
] as const;

export const GRID_VARIANTS = [
  "uniform",
  "featured",
  "masonry",
  "carousel",
] as const;

export const LIGHTBOX_VARIANTS = [
  "modal",
  "inline-expand",
  "drawer",
  "fullscreen-takeover",
] as const;

export const SEQUENCE_VARIANTS = ["stack", "carousel", "accordion"] as const;

export const EXPLORE_VARIANTS = [
  "native-interactivity",
  "controls-panel",
  "search-bar",
  "drill-down-reveals",
  "sync-multi-viz",
] as const;

export const StickyVariantSchema = z.enum(STICKY_VARIANTS);
export const SplitVariantSchema = z.enum(SPLIT_VARIANTS);
export const CrossfadeVariantSchema = z.enum(CROSSFADE_VARIANTS);
export const FlowVariantSchema = z.enum(FLOW_VARIANTS);
export const FlyToVariantSchema = z.enum(FLYTO_VARIANTS);
export const ChartLadderVariantSchema = z.enum(CHARTLADDER_VARIANTS);
export const GridVariantSchema = z.enum(GRID_VARIANTS);
export const LightboxVariantSchema = z.enum(LIGHTBOX_VARIANTS);
export const SequenceVariantSchema = z.enum(SEQUENCE_VARIANTS);
export const ExploreVariantSchema = z.enum(EXPLORE_VARIANTS);

export type StickyVariant = z.infer<typeof StickyVariantSchema>;
export type SplitVariant = z.infer<typeof SplitVariantSchema>;
export type CrossfadeVariant = z.infer<typeof CrossfadeVariantSchema>;
export type FlowVariant = z.infer<typeof FlowVariantSchema>;
export type FlyToVariant = z.infer<typeof FlyToVariantSchema>;
export type ChartLadderVariant = z.infer<typeof ChartLadderVariantSchema>;
export type GridVariant = z.infer<typeof GridVariantSchema>;
export type LightboxVariant = z.infer<typeof LightboxVariantSchema>;
export type SequenceVariant = z.infer<typeof SequenceVariantSchema>;
export type ExploreVariant = z.infer<typeof ExploreVariantSchema>;

// Tier 1 render-ready (spec §5.1 + §5.2 + §5.3)
export const TIER1_RENDER_READY = {
  sticky: ["sticky-left", "sticky-right", "sticky-center-overlay"] as StickyVariant[],
  split: ["static", "drag-separator"] as SplitVariant[],
  crossfade: ["fade", "cut"] as CrossfadeVariant[],
  flow: [
    "text-only",
    "image-top",
    "image-left",
    "image-right",
    "image-bottom",
    "image-fullbleed",
    "image-background-textoverlay",
  ] as FlowVariant[],
  grid: ["uniform", "featured"] as GridVariant[],
  lightbox: ["modal", "inline-expand"] as LightboxVariant[],
  sequence: ["stack"] as SequenceVariant[],
  explore: ["native-interactivity"] as ExploreVariant[],
} as const;

// Tier 1 defaults per primitive — fallback target when variant is Tier 2+
export const TIER1_DEFAULTS = {
  sticky: "sticky-left" as StickyVariant,
  split: "static" as SplitVariant,
  crossfade: "fade" as CrossfadeVariant,
  flow: "text-only" as FlowVariant,
  grid: "uniform" as GridVariant,
  lightbox: "modal" as LightboxVariant,
  sequence: "stack" as SequenceVariant,
  explore: "native-interactivity" as ExploreVariant,
} as const;
```

- [ ] **Step 4: Créer `validate-variants.ts`**

Créer `src/lib/core/validate-variants.ts` :

```ts
import type { Block } from "./schemas/block";
import { TIER1_RENDER_READY } from "./schemas/variants";

export type ValidationResult = {
  warnings: string[];
};

type WithVariant = { type: string; variant?: string };

function walk(block: Block, warnings: string[]): void {
  const b = block as unknown as WithVariant;
  const variantKey = b.type as keyof typeof TIER1_RENDER_READY;
  if (variantKey in TIER1_RENDER_READY && b.variant) {
    const ready = TIER1_RENDER_READY[variantKey] as readonly string[];
    if (!ready.includes(b.variant)) {
      warnings.push(
        `[viznews] variant "${b.variant}" on ${b.type} is Tier 2+ — not yet render-ready in v3.0.0. Falling back to Tier 1 default.`,
      );
    }
  }
  // Recurse into known container shapes
  const any = block as any;
  if (any.steps) for (const s of any.steps) walk(s, warnings);
  if (any.items) for (const s of any.items) walk(s, warnings);
  if (any.cells) for (const s of any.cells) walk(s, warnings);
  if (any.frames) for (const s of any.frames) walk(s, warnings);
  if (any.visual) walk(any.visual, warnings);
  if (any.left) walk(any.left, warnings);
  if (any.right) walk(any.right, warnings);
  if (any.trigger) walk(any.trigger, warnings);
  if (any.content && typeof any.content === "object" && "type" in any.content)
    walk(any.content, warnings);
  if (any.legend && typeof any.legend === "object" && "type" in any.legend)
    walk(any.legend, warnings);
  if (any.children)
    for (const s of any.children as Block[]) walk(s, warnings);
}

export function validateVariants(blocks: Block[]): ValidationResult {
  const warnings: string[] = [];
  for (const b of blocks) walk(b, warnings);
  return { warnings };
}
```

- [ ] **Step 5: Run tests**

```bash
bun test tests/unit/variants.test.ts
```

Expected : PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/core/schemas/variants.ts src/lib/core/validate-variants.ts tests/unit/variants.test.ts
git commit -m "$(cat <<'EOF'
feat(core): variant enums + validateVariants() skeleton

10 variant enum const arrays matching ROADMAP v3.0/3.1 matrix.
validateVariants() walks blocks + emits warnings for Tier 2+
variants not yet render-ready. No fallback render logic yet
(lives in components per primitive, added Phase 2).

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: `tokensToCSSVariables` v3 (nouveaux CSS vars)

**Files:**
- Modify: `src/lib/core/harmonize.ts`
- Test: `tests/unit/tokens.test.ts`

- [ ] **Step 1: Écrire le test**

Ajouter dans `tests/unit/tokens.test.ts` :

```ts
import { applyPositioning } from "../../src/lib/core/apply-positioning";

describe("tokensToCSSVariables v3 — derived tokens", () => {
  it("emits --vn-radius from resolved radius", () => {
    const resolved = applyPositioning(defaultTokens({ positioning: "balanced" }));
    const css = tokensToCSSVariables(resolved);
    expect(css).toContain("--vn-radius:");
    expect(css).toMatch(/--vn-radius:\s*(0|4px|12px)/);
  });

  it("emits --vn-shadow from resolved shadow", () => {
    const resolved = applyPositioning(defaultTokens({ positioning: "airy-contemplative" }));
    const css = tokensToCSSVariables(resolved);
    expect(css).toContain("--vn-shadow:");
  });

  it("emits --vn-border from resolved border", () => {
    const resolved = applyPositioning(defaultTokens({ positioning: "editorial-tight" }));
    const css = tokensToCSSVariables(resolved);
    expect(css).toContain("--vn-border:");
  });

  it("emits --vn-overlay", () => {
    const resolved = applyPositioning({ ...defaultTokens(), overlay: "darken-50" });
    const css = tokensToCSSVariables(resolved);
    expect(css).toContain("--vn-overlay:");
  });

  it("emits --vn-layout-rhythm-gap from layoutRhythm", () => {
    const r = applyPositioning(defaultTokens({ positioning: "dashboard-dense" }));
    const css = tokensToCSSVariables(r);
    expect(css).toContain("--vn-layout-rhythm-gap:");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
bun test tests/unit/tokens.test.ts
```

Expected : FAIL (les nouveaux CSS vars n'existent pas).

- [ ] **Step 3: Étendre `tokensToCSSVariables`**

Remplacer `src/lib/core/harmonize.ts` intégralement :

```ts
import type { DesignTokens } from "./design-tokens";
import type { ResolvedTokens } from "./apply-positioning";

const RADIUS_PX: Record<"sharp" | "soft" | "rounded", string> = {
  sharp: "0",
  soft: "4px",
  rounded: "12px",
};

const SHADOW_CSS: Record<"none" | "subtle" | "dramatic", string> = {
  none: "none",
  subtle: "0 1px 2px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)",
  dramatic: "0 8px 24px rgba(0,0,0,0.12), 0 16px 48px rgba(0,0,0,0.08)",
};

const BORDER_CSS: Record<"none" | "hairline" | "emphatic", string> = {
  none: "none",
  hairline: "1px solid color-mix(in srgb, var(--vn-color-fg) 12%, transparent)",
  emphatic: "2px solid var(--vn-color-fg)",
};

const OVERLAY_CSS: Record<
  "none" | "darken-20" | "darken-50" | "gradient-bottom",
  string
> = {
  none: "transparent",
  "darken-20": "rgba(0,0,0,0.2)",
  "darken-50": "rgba(0,0,0,0.5)",
  "gradient-bottom":
    "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.65) 100%)",
};

const RHYTHM_GAP: Record<"dense" | "tight" | "balanced" | "airy", string> = {
  dense: "calc(var(--vn-spacing) * 2)",
  tight: "calc(var(--vn-spacing) * 3)",
  balanced: "calc(var(--vn-spacing) * 5)",
  airy: "calc(var(--vn-spacing) * 8)",
};

export function tokensToCSSVariables(
  tokens: DesignTokens | ResolvedTokens,
): string {
  const lines = [
    `--vn-color-bg: ${tokens.palette.background};`,
    `--vn-color-fg: ${tokens.palette.foreground};`,
    `--vn-color-muted: ${tokens.palette.muted};`,
    `--vn-color-accent: ${tokens.palette.accent};`,
    `--vn-font-body: ${tokens.typography.bodyFontFamily};`,
    `--vn-font-heading: ${tokens.typography.headingFontFamily};`,
    `--vn-font-mono: ${tokens.typography.monoFontFamily};`,
    `--vn-font-size: ${tokens.typography.baseSize}px;`,
    `--vn-font-scale: ${tokens.typography.scale};`,
    `--vn-spacing: ${tokens.spacing.unit}px;`,
  ];
  // v3 derived tokens (emitted when resolved; ResolvedTokens has them non-optional)
  if (tokens.radius) lines.push(`--vn-radius: ${RADIUS_PX[tokens.radius]};`);
  if (tokens.shadow) lines.push(`--vn-shadow: ${SHADOW_CSS[tokens.shadow]};`);
  if (tokens.border) lines.push(`--vn-border: ${BORDER_CSS[tokens.border]};`);
  if (tokens.overlay)
    lines.push(`--vn-overlay: ${OVERLAY_CSS[tokens.overlay]};`);
  if (tokens.layoutRhythm)
    lines.push(`--vn-layout-rhythm-gap: ${RHYTHM_GAP[tokens.layoutRhythm]};`);
  return lines.join("\n");
}
```

- [ ] **Step 4: Run tests**

```bash
bun test tests/unit/tokens.test.ts
```

Expected : PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/core/harmonize.ts tests/unit/tokens.test.ts
git commit -m "$(cat <<'EOF'
feat(tokens): emit v3 CSS vars (radius/shadow/border/overlay/rhythm)

tokensToCSSVariables accepts ResolvedTokens + emits 5 new vars
mapped from radius/shadow/border/overlay/layoutRhythm. Backward
compatible: v0.2.0 callers without derived tokens emit original
CSS only.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: `buildArticlePage` wires cascade + validateVariants + changeset beta.0

**Files:**
- Modify: `src/lib/core/build-page.ts`
- Modify: `src/lib/index.ts` (export `ResolvedTokens`, `applyPositioning`, `validateVariants`)
- Test: `tests/unit/build-page.test.ts`
- Create: `.changeset/v3-beta-0-foundation.md`

- [ ] **Step 1: Écrire les tests build-page**

Ajouter dans `tests/unit/build-page.test.ts` :

```ts
import { describe, it, expect } from "bun:test";
import { buildArticlePage } from "../../src/lib/core/build-page";

const baseArticle = {
  slug: "test",
  metadata: { title: "T", byline: "B", publishedAt: "2026-04-17" },
  tokens: {
    locale: "fr-CH",
    palette: {
      scheme: "viridis",
      background: "#fff",
      foreground: "#111",
      muted: "#666",
      accent: "#156964",
    },
    typography: {
      bodyFontFamily: "Inter",
      headingFontFamily: "Inter",
      monoFontFamily: "Mono",
      baseSize: 17,
      scale: 1.25,
    },
    spacing: { unit: 8 },
    sourceStyle: { format: "footnote", prefix: "Source : " },
    mode: "light",
    positioning: "balanced",
  },
  blocks: [{ type: "markdown", html: "<p>hi</p>" }],
};

describe("buildArticlePage v3 — cascade + warnings", () => {
  it("emits v3 CSS vars when positioning set", () => {
    const p = buildArticlePage(baseArticle);
    expect(p.cssVariables).toContain("--vn-radius:");
    expect(p.cssVariables).toContain("--vn-layout-rhythm-gap:");
  });

  it("returns warnings array (empty for Tier 1)", () => {
    const p = buildArticlePage(baseArticle);
    expect(p.warnings).toEqual([]);
  });

  it("preserves slug/metadata/blocks shape", () => {
    const p = buildArticlePage(baseArticle);
    expect(p.slug).toBe("test");
    expect(p.blocks.length).toBe(1);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
bun test tests/unit/build-page.test.ts
```

Expected : FAIL — `p.warnings` undefined, `--vn-radius:` absent.

- [ ] **Step 3: Mettre à jour `buildArticlePage`**

Remplacer `src/lib/core/build-page.ts` :

```ts
import { ArticleSchema, type Article } from "./schemas/article";
import type { Block } from "./schemas/block";
import { tokensToCSSVariables } from "./harmonize";
import { expandRecipes } from "./expand-recipes";
import { applyPositioning } from "./apply-positioning";
import { validateVariants } from "./validate-variants";

export interface ArticlePageData {
  slug: string;
  metadata: Article["metadata"];
  blocks: Block[];
  cssVariables: string;
  warnings: string[];
}

export function buildArticlePage(spec: unknown): ArticlePageData {
  const article = ArticleSchema.parse(spec);
  const blocks = expandRecipes(article.blocks);
  const resolved = applyPositioning(article.tokens);
  const { warnings } = validateVariants(blocks);
  return {
    slug: article.slug,
    metadata: article.metadata,
    blocks,
    cssVariables: tokensToCSSVariables(resolved),
    warnings,
  };
}
```

- [ ] **Step 4: Mettre à jour les exports publics**

Remplacer `src/lib/index.ts` :

```ts
export { default as BlockRenderer } from "./BlockRenderer.svelte";
export * from "./structural-primitives";
export type {
  Block,
  DevStubBlock,
  StickyBlock,
  ScrollStepsBlock,
  CrossfadeBlock,
  GridBlock,
  SplitBlock,
  SequenceBlock,
  LightboxBlock,
} from "./core/schemas/block";
export type { Article } from "./core/schemas/article";
export type {
  DesignTokens,
  Positioning,
  LayoutRhythm,
  Radius,
  Shadow,
  Border,
  Overlay,
} from "./core/design-tokens";
export * from "./content-primitives";
export * from "./recipes";
export type {
  ScrollyStickyContentBlock,
  ChartLadderBlock,
  GalleryCarouselBlock,
  ScrollyMapBlock,
} from "./core/schemas/recipes";
export type {
  MarkdownBlock,
  ImageBlock,
  VideoBlock,
  DWChartBlock,
  FlourishChartBlock,
  MTMapBlock,
} from "./core/schemas/content";
export { buildArticlePage, type ArticlePageData } from "./core/build-page";
export { expandRecipes } from "./core/expand-recipes";
export { tokensToCSSVariables } from "./core/harmonize";
export { applyPositioning, type ResolvedTokens } from "./core/apply-positioning";
export { validateVariants, type ValidationResult } from "./core/validate-variants";
export {
  STICKY_VARIANTS,
  SPLIT_VARIANTS,
  CROSSFADE_VARIANTS,
  FLOW_VARIANTS,
  FLYTO_VARIANTS,
  CHARTLADDER_VARIANTS,
  GRID_VARIANTS,
  LIGHTBOX_VARIANTS,
  SEQUENCE_VARIANTS,
  EXPLORE_VARIANTS,
  TIER1_RENDER_READY,
  TIER1_DEFAULTS,
  type StickyVariant,
  type SplitVariant,
  type CrossfadeVariant,
  type FlowVariant,
  type FlyToVariant,
  type ChartLadderVariant,
  type GridVariant,
  type LightboxVariant,
  type SequenceVariant,
  type ExploreVariant,
} from "./core/schemas/variants";
```

- [ ] **Step 5: Run all unit tests**

```bash
bun test tests/unit
```

Expected : PASS sur toute la suite (incluant les tests `build-page.test.ts` préexistants).

- [ ] **Step 6: Créer le changeset**

Créer `.changeset/v3-beta-0-foundation.md` :

```md
---
"@rmdms/viznews": major
---

v3.0.0-beta.0 — Foundation

- Bump Zod v3 → v4 (breaking on consumers using zod directly)
- DesignTokens v3: new positioning axis + 5 optional derived tokens
- applyPositioning() cascade: prescriptive mapping positioning → tokens
- validateVariants() build-time warnings for Tier 2+ variants
- tokensToCSSVariables emits --vn-radius/shadow/border/overlay/layout-rhythm-gap
- buildArticlePage returns `warnings: string[]` (additive, non-breaking shape)
- Exports: applyPositioning, validateVariants, all variant enums, Positioning types
```

- [ ] **Step 7: Bump version to beta.0 et commit**

```bash
# Manually set version (changeset publish handles prerelease tag)
bun x changeset pre enter beta
bun x changeset version
```

Expected : `package.json` version devient `3.0.0-beta.0`, `CHANGELOG.md` mis à jour, `.changeset/pre.json` créé.

- [ ] **Step 8: Commit Phase 1**

```bash
git add src/lib/core/build-page.ts src/lib/index.ts tests/unit/build-page.test.ts \
        .changeset/v3-beta-0-foundation.md .changeset/pre.json \
        package.json CHANGELOG.md
git commit -m "$(cat <<'EOF'
feat(core): buildArticlePage wires positioning + variant validation

buildArticlePage now: parses (v4) → expandRecipes → applyPositioning
→ validateVariants → tokensToCSSVariables. Returns warnings field
(additive). Public API exports positioning, variant enums, Tier 1
registry.

Ready for 3.0.0-beta.0 publish.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 9: (User-gated) Publish beta.0 to npm**

> **STOP** — demander confirmation au user avant de publier sur npm (action à blast radius externe).

Quand autorisé :

```bash
bun run build            # svelte-package + vite build
bun x changeset publish  # publie 3.0.0-beta.0 sous tag "beta"
git push origin feat/v3-rebuild --tags
```

Expected : npm tag `beta` pointe vers `3.0.0-beta.0`. Plugin peut `bun install @rmdms/viznews@beta`.

---

## Phase 2 — Variants existants + Flow (publish `3.0.0-beta.1`)

Objectif : ajouter `variant` prop sur 6 structural primitives existants, implémenter CSS variants Tier 1, créer le nouveau primitive `Flow.svelte` avec 7 variants, Playwright contract par variant non-CSS-flip, dev harness `/dev/v3/<primitive>/<variant>`.

### Task 8: Sticky — variant schema + render

**Files:**
- Modify: `src/lib/core/schemas/structural.ts:5-21`
- Modify: `src/lib/core/schemas/block.ts:41-46`
- Modify: `src/lib/structural-primitives/Sticky.svelte`
- Test: `tests/unit/schemas.test.ts` (existant)
- Test: `tests/contracts/sticky-variants.spec.ts`

- [ ] **Step 1: Écrire les tests schema variant**

Ajouter dans `tests/unit/schemas.test.ts` :

```ts
import { StickyBlockSchema } from "../../src/lib/core/schemas/structural";

describe("StickyBlockSchema v3 variant", () => {
  const base = {
    type: "sticky" as const,
    visual: { type: "dev-stub", label: "v" },
    steps: [{ type: "dev-stub", label: "s1" }],
  };

  it("defaults variant to sticky-left", () => {
    const parsed = StickyBlockSchema.parse(base);
    expect(parsed.variant).toBe("sticky-left");
  });

  it("accepts explicit sticky-right", () => {
    const parsed = StickyBlockSchema.parse({ ...base, variant: "sticky-right" });
    expect(parsed.variant).toBe("sticky-right");
  });

  it("accepts sticky-center-overlay (Tier 1)", () => {
    expect(() => StickyBlockSchema.parse({ ...base, variant: "sticky-center-overlay" })).not.toThrow();
  });

  it("accepts sticky-full-with-steps-panel (Tier 2, warning at build)", () => {
    expect(() => StickyBlockSchema.parse({ ...base, variant: "sticky-full-with-steps-panel" })).not.toThrow();
  });

  it("rejects unknown variant", () => {
    expect(() => StickyBlockSchema.parse({ ...base, variant: "diagonal" })).toThrow();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
bun test tests/unit/schemas.test.ts
```

Expected : FAIL (`variant` undefined par défaut).

- [ ] **Step 3: Ajouter variant au schéma Sticky**

Dans `src/lib/core/schemas/structural.ts`, remplacer les lignes 1-21 par :

```ts
import { z } from "zod";
import { BlockSchema } from "./block";
import type { Block } from "./block";
import {
  StickyVariantSchema,
  SplitVariantSchema,
  CrossfadeVariantSchema,
  GridVariantSchema,
  LightboxVariantSchema,
  SequenceVariantSchema,
  type StickyVariant,
  type SplitVariant,
  type CrossfadeVariant,
  type GridVariant,
  type LightboxVariant,
  type SequenceVariant,
} from "./variants";

export const StickyPropsSchema = z.object({
  scrim: z.enum(["default", "none"]).default("default"),
});

type StickyBlockT = {
  type: "sticky";
  variant: StickyVariant;
  visual: Block;
  steps: Block[];
  props?: { scrim?: "default" | "none" };
};

export const StickyBlockSchema: z.ZodType<StickyBlockT> = z.object({
  type: z.literal("sticky"),
  variant: StickyVariantSchema.default("sticky-left"),
  visual: z.lazy(() => BlockSchema),
  steps: z.array(z.lazy(() => BlockSchema)),
  props: StickyPropsSchema.optional(),
}) as z.ZodType<StickyBlockT>;
```

Puis mettre à jour `src/lib/core/schemas/block.ts:41-46` :

```ts
export type StickyBlock = {
  type: "sticky";
  variant: StickyVariant;
  visual: Block;
  steps: Block[];
  props?: { scrim?: "default" | "none" };
};
```

Ajouter l'import en haut du fichier :

```ts
import type { StickyVariant } from "./variants";
```

- [ ] **Step 4: Run tests to verify schema passes**

```bash
bun test tests/unit/schemas.test.ts
```

Expected : PASS.

- [ ] **Step 5: Étendre Sticky.svelte pour supporter variants**

Remplacer `src/lib/structural-primitives/Sticky.svelte` :

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { StickyVariant } from '../core/schemas/variants';
  import { TIER1_RENDER_READY, TIER1_DEFAULTS } from '../core/schemas/variants';

  let {
    variant = 'sticky-left',
    scrim = 'default',
    visual,
    steps
  }: {
    variant?: StickyVariant;
    scrim?: 'default' | 'none';
    visual: Snippet;
    steps: Snippet;
  } = $props();

  const renderReady = $derived(
    (TIER1_RENDER_READY.sticky as readonly string[]).includes(variant)
  );
  const effectiveVariant = $derived(renderReady ? variant : TIER1_DEFAULTS.sticky);

  if (scrim === 'none' && import.meta.env.DEV) {
    console.warn(
      '[viznews/Sticky] scrim="none" disables §11.5 readability-over-sticky contrast protection.'
    );
  }
</script>

<section
  class="vn-sticky vn-sticky--{effectiveVariant}"
  data-testid="sticky-root"
  data-variant={effectiveVariant}
>
  <div class="vn-sticky__visual" data-testid="sticky-visual">
    {@render visual()}
  </div>
  <div
    class="vn-sticky__steps"
    data-testid="sticky-steps"
    class:vn-sticky__steps--scrim={scrim === 'default'}
  >
    {@render steps()}
  </div>
</section>

<style>
  .vn-sticky {
    position: relative;
    display: grid;
    grid-template-columns: 1fr;
  }
  @media (min-width: 768px) {
    .vn-sticky--sticky-left {
      grid-template-columns: 1fr 1fr;
    }
    .vn-sticky--sticky-right {
      grid-template-columns: 1fr 1fr;
    }
    .vn-sticky--sticky-right .vn-sticky__visual {
      order: 2;
    }
    .vn-sticky--sticky-right .vn-sticky__steps {
      order: 1;
    }
    .vn-sticky--sticky-center-overlay {
      grid-template-columns: 1fr;
    }
    .vn-sticky--sticky-center-overlay .vn-sticky__visual {
      grid-area: 1 / 1;
    }
    .vn-sticky--sticky-center-overlay .vn-sticky__steps {
      grid-area: 1 / 1;
      z-index: 2;
      pointer-events: none;
    }
    .vn-sticky--sticky-center-overlay .vn-sticky__steps :global(> *) {
      pointer-events: auto;
    }
  }

  .vn-sticky__visual {
    position: sticky;
    top: 0;
    height: 100vh;
    display: grid;
    place-items: center;
    z-index: 0;
  }

  .vn-sticky__steps {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--vn-layout-rhythm-gap, calc(var(--vn-spacing) * 6));
    padding: 40vh calc(var(--vn-spacing) * 2);
    z-index: 1;
  }

  .vn-sticky__steps--scrim :global(> *) {
    background: color-mix(in srgb, var(--vn-color-bg) 92%, transparent);
    backdrop-filter: blur(4px);
    padding: calc(var(--vn-spacing) * 2);
    border-radius: var(--vn-radius, calc(var(--vn-spacing)));
  }

  @media (max-width: 767px) {
    .vn-sticky {
      display: block;
    }
    .vn-sticky__visual {
      height: 60vh;
      z-index: 2;
    }
    .vn-sticky__steps {
      padding: calc(var(--vn-spacing) * 4) calc(var(--vn-spacing) * 2);
    }
  }
</style>
```

- [ ] **Step 6: Mettre à jour `BlockRenderer.svelte` pour passer variant à Sticky**

Dans `src/lib/BlockRenderer.svelte:36-42`, changer :

```svelte
{:else if block.type === 'sticky'}
  <Sticky variant={block.variant} scrim={block.props?.scrim ?? 'default'}>
    {#snippet visual()}<Self block={block.visual} />{/snippet}
    {#snippet steps()}
      {#each block.steps as step}<Self block={step} />{/each}
    {/snippet}
  </Sticky>
```

- [ ] **Step 7: Créer dev harness routes pour chaque variant Sticky Tier 1**

Créer `src/routes/dev/v3/sticky/[variant]/+page.ts` :

```ts
import type { PageLoad } from "./$types";
import { buildArticlePage } from "$lib/core/build-page";

export const load: PageLoad = ({ params }) => {
  const variant = params.variant;
  const article = {
    slug: `sticky-${variant}`,
    metadata: {
      title: `Sticky / ${variant}`,
      byline: "dev",
      publishedAt: "2026-04-17",
    },
    tokens: {
      locale: "fr-CH",
      palette: {
        scheme: "viridis",
        background: "#ffffff",
        foreground: "#111111",
        muted: "#666666",
        accent: "#156964",
      },
      typography: {
        bodyFontFamily: "Inter, system-ui, sans-serif",
        headingFontFamily: "Inter, system-ui, sans-serif",
        monoFontFamily: "JetBrains Mono, monospace",
        baseSize: 17,
        scale: 1.25,
      },
      spacing: { unit: 8 },
      sourceStyle: { format: "footnote", prefix: "Source : " },
      mode: "light",
      positioning: "balanced",
    },
    blocks: [
      {
        type: "sticky",
        variant,
        visual: {
          type: "dev-stub",
          label: `Visual (${variant})`,
          height: 400,
          color: "#e6f4f1",
        },
        steps: [
          { type: "dev-stub", label: "Step 1 text", height: 200 },
          { type: "dev-stub", label: "Step 2 text", height: 200 },
          { type: "dev-stub", label: "Step 3 text", height: 200 },
        ],
      },
    ],
  };
  return { page: buildArticlePage(article) };
};
```

Créer `src/routes/dev/v3/sticky/[variant]/+page.svelte` :

```svelte
<script lang="ts">
  import BlockRenderer from '$lib/BlockRenderer.svelte';
  let { data } = $props();
</script>

<svelte:head>
  <style>{data.page.cssVariables}</style>
</svelte:head>

<main>
  <header>
    <h1>{data.page.metadata.title}</h1>
    <p><small>dev harness — sticky variant</small></p>
  </header>
  {#each data.page.blocks as block}
    <BlockRenderer {block} />
  {/each}
</main>

<style>
  header { padding: 1rem; max-width: 720px; margin: 0 auto; }
  :global(:root) {
    --vn-color-bg: #fff;
    --vn-color-fg: #111;
    --vn-spacing: 8px;
  }
</style>
```

- [ ] **Step 8: Créer Playwright contract**

Créer `tests/contracts/sticky-variants.spec.ts` :

```ts
import { test, expect } from "@playwright/test";

test.describe("Sticky variants — v3", () => {
  test("sticky-left: visual on left column (desktop)", async ({ page }) => {
    await page.goto("/dev/v3/sticky/sticky-left");
    const root = page.getByTestId("sticky-root");
    await expect(root).toHaveAttribute("data-variant", "sticky-left");
    const visual = page.getByTestId("sticky-visual");
    const box = await visual.boundingBox();
    expect(box!.x).toBeLessThan(100);
  });

  test("sticky-right: visual on right column (desktop)", async ({ page }) => {
    await page.goto("/dev/v3/sticky/sticky-right");
    const visual = page.getByTestId("sticky-visual");
    const box = await visual.boundingBox();
    expect(box!.x).toBeGreaterThan(400);
  });

  test("sticky-center-overlay: steps overlap visual in same grid cell", async ({ page }) => {
    await page.goto("/dev/v3/sticky/sticky-center-overlay");
    const visual = page.getByTestId("sticky-visual");
    const steps = page.getByTestId("sticky-steps");
    const vBox = await visual.boundingBox();
    const sBox = await steps.boundingBox();
    expect(Math.abs(vBox!.x - sBox!.x)).toBeLessThan(50);
  });

  test("Tier 2+ variant falls back to sticky-left (dev-only)", async ({ page }) => {
    await page.goto("/dev/v3/sticky/sticky-full-with-steps-panel");
    const root = page.getByTestId("sticky-root");
    await expect(root).toHaveAttribute("data-variant", "sticky-left");
  });
});
```

- [ ] **Step 9: Run tests**

```bash
bun test tests/unit
bunx playwright test tests/contracts/sticky-variants.spec.ts
```

Expected : toutes vertes.

- [ ] **Step 10: Commit**

```bash
git add src/lib/core/schemas/structural.ts src/lib/core/schemas/block.ts \
        src/lib/structural-primitives/Sticky.svelte src/lib/BlockRenderer.svelte \
        src/routes/dev/v3/sticky \
        tests/unit/schemas.test.ts tests/contracts/sticky-variants.spec.ts
git commit -m "$(cat <<'EOF'
feat(sticky): Tier 1 variants (left/right/center-overlay)

Zod enum + default sticky-left. Tier 2+ (full-with-steps-panel)
accepted by schema, falls back to sticky-left at render with
dev warning (validateVariants). Dev harness route per variant.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Split — variant schema + drag-separator render

**Files:**
- Modify: `src/lib/core/schemas/structural.ts` (SplitBlockSchema)
- Modify: `src/lib/core/schemas/block.ts` (SplitBlock type)
- Modify: `src/lib/structural-primitives/Split.svelte`
- Modify: `src/lib/BlockRenderer.svelte` (pass variant)
- Create: `src/routes/dev/v3/split/[variant]/+page.ts` + `+page.svelte`
- Test: `tests/unit/schemas.test.ts`, `tests/contracts/split-variants.spec.ts`

- [ ] **Step 1: Test schema**

Ajouter dans `tests/unit/schemas.test.ts` :

```ts
import { SplitBlockSchema } from "../../src/lib/core/schemas/structural";

describe("SplitBlockSchema v3 variant", () => {
  const base = {
    type: "split" as const,
    left: { type: "dev-stub", label: "l" },
    right: { type: "dev-stub", label: "r" },
  };

  it("defaults variant to static", () => {
    const p = SplitBlockSchema.parse(base);
    expect(p.variant).toBe("static");
  });

  it("accepts drag-separator", () => {
    expect(() => SplitBlockSchema.parse({ ...base, variant: "drag-separator" })).not.toThrow();
  });

  it("rejects unknown variant", () => {
    expect(() => SplitBlockSchema.parse({ ...base, variant: "side-by-side" })).toThrow();
  });
});
```

- [ ] **Step 2: Run tests to verify FAIL**

```bash
bun test tests/unit/schemas.test.ts
```

Expected : FAIL.

- [ ] **Step 3: Ajouter variant au Split schema**

Remplacer le bloc `SplitBlockSchema` dans `src/lib/core/schemas/structural.ts` :

```ts
type SplitBlockT = {
  type: "split";
  variant: SplitVariant;
  aspectRatio?: string;
  left: Block;
  right: Block;
  legend?: Block;
};

export const SplitBlockSchema: z.ZodType<SplitBlockT> = z.object({
  type: z.literal("split"),
  variant: SplitVariantSchema.default("static"),
  aspectRatio: z
    .string()
    .regex(/^\d+\s*\/\s*\d+$/)
    .optional(),
  left: z.lazy(() => BlockSchema),
  right: z.lazy(() => BlockSchema),
  legend: z.lazy(() => BlockSchema).optional(),
}) as z.ZodType<SplitBlockT>;
```

Mettre à jour `src/lib/core/schemas/block.ts` SplitBlock type :

```ts
export type SplitBlock = {
  type: "split";
  variant: SplitVariant;
  aspectRatio?: string;
  left: Block;
  right: Block;
  legend?: Block;
};
```

Et ajouter `SplitVariant` à l'import en haut.

- [ ] **Step 4: Étendre Split.svelte avec drag-separator**

Remplacer `src/lib/structural-primitives/Split.svelte` :

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { SplitVariant } from '../core/schemas/variants';
  import { TIER1_RENDER_READY, TIER1_DEFAULTS } from '../core/schemas/variants';

  let {
    variant = 'static',
    aspectRatio = '4 / 3',
    left,
    right,
    legend
  }: {
    variant?: SplitVariant;
    aspectRatio?: string;
    left: Snippet;
    right: Snippet;
    legend?: Snippet;
  } = $props();

  const renderReady = $derived(
    (TIER1_RENDER_READY.split as readonly string[]).includes(variant)
  );
  const effectiveVariant = $derived(renderReady ? variant : TIER1_DEFAULTS.split);

  let separator = $state(50); // percent
  let panesEl: HTMLDivElement;
  let dragging = $state(false);

  function onPointerDown(e: PointerEvent) {
    if (effectiveVariant !== 'drag-separator') return;
    dragging = true;
    panesEl.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: PointerEvent) {
    if (!dragging || !panesEl) return;
    const rect = panesEl.getBoundingClientRect();
    const pct = Math.max(10, Math.min(90, ((e.clientX - rect.left) / rect.width) * 100));
    separator = pct;
  }
  function onPointerUp(e: PointerEvent) {
    dragging = false;
    if (panesEl?.hasPointerCapture(e.pointerId)) panesEl.releasePointerCapture(e.pointerId);
  }
</script>

<section class="vn-split vn-split--{effectiveVariant}" data-testid="split-root" data-variant={effectiveVariant}>
  {#if legend}
    <div class="vn-split__legend" data-testid="split-legend">{@render legend()}</div>
  {/if}
  <div
    bind:this={panesEl}
    class="vn-split__panes"
    style:--vn-split-ar={aspectRatio}
    style:--vn-split-sep="{separator}%"
    onpointerdown={onPointerDown}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onpointercancel={onPointerUp}
  >
    <div class="vn-split__side vn-split__side--left" data-testid="split-left">{@render left()}</div>
    <div class="vn-split__side vn-split__side--right" data-testid="split-right">{@render right()}</div>
    {#if effectiveVariant === 'drag-separator'}
      <button
        type="button"
        class="vn-split__handle"
        data-testid="split-handle"
        aria-label="Drag separator"
        aria-valuemin="10"
        aria-valuemax="90"
        aria-valuenow={separator}
      ></button>
    {/if}
  </div>
</section>

<style>
  .vn-split { display: flex; flex-direction: column; gap: calc(var(--vn-spacing) * 2); padding: calc(var(--vn-spacing) * 2); }
  .vn-split__legend { font-size: 0.9em; }

  .vn-split__panes {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: calc(var(--vn-spacing) * 2);
  }

  .vn-split--drag-separator .vn-split__panes {
    display: block;
  }
  .vn-split--drag-separator .vn-split__side {
    position: absolute; top: 0; left: 0;
    aspect-ratio: var(--vn-split-ar);
    width: 100%; height: auto;
    overflow: hidden;
  }
  .vn-split--drag-separator .vn-split__side--left {
    clip-path: inset(0 calc(100% - var(--vn-split-sep)) 0 0);
  }
  .vn-split--drag-separator .vn-split__side--right {
    clip-path: inset(0 0 0 var(--vn-split-sep));
  }
  .vn-split__handle {
    position: absolute;
    top: 0; bottom: 0;
    left: var(--vn-split-sep);
    width: 4px;
    transform: translateX(-50%);
    background: var(--vn-color-accent);
    border: none;
    cursor: ew-resize;
    touch-action: none;
    z-index: 2;
  }

  .vn-split__side { aspect-ratio: var(--vn-split-ar); overflow: hidden; }
  .vn-split__side :global(> *) { height: 100%; width: 100%; }

  @media (max-width: 767px) {
    .vn-split--static .vn-split__panes { grid-template-columns: 1fr; }
  }
</style>
```

- [ ] **Step 5: Update BlockRenderer pour passer variant**

Dans `src/lib/BlockRenderer.svelte:68-81`, remplacer les deux blocs Split par :

```svelte
{:else if block.type === 'split'}
  {#if block.legend}
    {@const legendBlock = block.legend}
    <Split variant={block.variant} aspectRatio={block.aspectRatio ?? '4 / 3'}>
      {#snippet left()}<Self block={block.left} />{/snippet}
      {#snippet right()}<Self block={block.right} />{/snippet}
      {#snippet legend()}<Self block={legendBlock} />{/snippet}
    </Split>
  {:else}
    <Split variant={block.variant} aspectRatio={block.aspectRatio ?? '4 / 3'}>
      {#snippet left()}<Self block={block.left} />{/snippet}
      {#snippet right()}<Self block={block.right} />{/snippet}
    </Split>
  {/if}
```

- [ ] **Step 6: Créer dev harness `/dev/v3/split/[variant]`**

Créer `src/routes/dev/v3/split/[variant]/+page.ts` :

```ts
import type { PageLoad } from "./$types";
import { buildArticlePage } from "$lib/core/build-page";

export const load: PageLoad = ({ params }) => {
  return {
    page: buildArticlePage({
      slug: `split-${params.variant}`,
      metadata: { title: `Split / ${params.variant}`, byline: "dev", publishedAt: "2026-04-17" },
      tokens: {
        locale: "fr-CH",
        palette: { scheme: "viridis", background: "#fff", foreground: "#111", muted: "#666", accent: "#156964" },
        typography: { bodyFontFamily: "Inter", headingFontFamily: "Inter", monoFontFamily: "Mono", baseSize: 17, scale: 1.25 },
        spacing: { unit: 8 },
        sourceStyle: { format: "footnote", prefix: "Source : " },
        mode: "light",
        positioning: "balanced",
      },
      blocks: [
        {
          type: "split",
          variant: params.variant,
          aspectRatio: "16 / 9",
          left: { type: "dev-stub", label: "LEFT / before", color: "#b3e0da" },
          right: { type: "dev-stub", label: "RIGHT / after", color: "#f5d28b" },
        },
      ],
    }),
  };
};
```

Créer `src/routes/dev/v3/split/[variant]/+page.svelte` — même template que Task 8 Step 7.

- [ ] **Step 7: Playwright contract**

Créer `tests/contracts/split-variants.spec.ts` :

```ts
import { test, expect } from "@playwright/test";

test.describe("Split variants — v3", () => {
  test("static: two side-by-side columns (desktop)", async ({ page }) => {
    await page.goto("/dev/v3/split/static");
    const root = page.getByTestId("split-root");
    await expect(root).toHaveAttribute("data-variant", "static");
    await expect(page.getByTestId("split-handle")).toHaveCount(0);
  });

  test("drag-separator: shows draggable handle", async ({ page }) => {
    await page.goto("/dev/v3/split/drag-separator");
    await expect(page.getByTestId("split-handle")).toBeVisible();
  });

  test("drag-separator: handle moves separator on drag", async ({ page }) => {
    await page.goto("/dev/v3/split/drag-separator");
    const handle = page.getByTestId("split-handle");
    const initialBox = await handle.boundingBox();
    await handle.dragTo(page.getByTestId("split-root"), {
      targetPosition: { x: 800, y: 200 },
    });
    const afterBox = await handle.boundingBox();
    expect(Math.abs(afterBox!.x - initialBox!.x)).toBeGreaterThan(50);
  });
});
```

- [ ] **Step 8: Run tests**

```bash
bun test tests/unit
bunx playwright test tests/contracts/split-variants.spec.ts
```

Expected : PASS.

- [ ] **Step 9: Commit**

```bash
git add src/lib/core/schemas/structural.ts src/lib/core/schemas/block.ts \
        src/lib/structural-primitives/Split.svelte src/lib/BlockRenderer.svelte \
        src/routes/dev/v3/split \
        tests/unit/schemas.test.ts tests/contracts/split-variants.spec.ts
git commit -m "$(cat <<'EOF'
feat(split): Tier 1 variants (static, drag-separator)

Zod enum + default static. drag-separator uses clip-path inset +
pointer events for the compare-slider UX. Tier 2 toggle/auto-sweep
schema-accepted, fallback render to static.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: Crossfade + Sequence + Grid + Lightbox — schema variants

**Files:**
- Modify: `src/lib/core/schemas/structural.ts` (4 blocks)
- Modify: `src/lib/core/schemas/block.ts` (4 types)
- Test: `tests/unit/schemas.test.ts`

- [ ] **Step 1: Tests groupés**

Ajouter dans `tests/unit/schemas.test.ts` :

```ts
import {
  CrossfadeBlockSchema,
  GridBlockSchema,
  LightboxBlockSchema,
  SequenceBlockSchema,
} from "../../src/lib/core/schemas/structural";

describe("Crossfade/Grid/Lightbox/Sequence — variant props", () => {
  it("Crossfade default fade, accepts cut", () => {
    const base = { type: "crossfade" as const, activeIndex: 0, frames: [
      { type: "dev-stub", label: "a" }, { type: "dev-stub", label: "b" },
    ]};
    expect(CrossfadeBlockSchema.parse(base).variant).toBe("fade");
    expect(() => CrossfadeBlockSchema.parse({ ...base, variant: "cut" })).not.toThrow();
  });

  it("Grid default uniform, accepts featured", () => {
    const base = { type: "grid" as const, cells: [{ type: "dev-stub", label: "c" }] };
    expect(GridBlockSchema.parse(base).variant).toBe("uniform");
    expect(() => GridBlockSchema.parse({ ...base, variant: "featured" })).not.toThrow();
  });

  it("Lightbox default modal, accepts inline-expand", () => {
    const base = {
      type: "lightbox" as const,
      trigger: { type: "dev-stub", label: "t" },
      content: { type: "dev-stub", label: "c" },
    };
    expect(LightboxBlockSchema.parse(base).variant).toBe("modal");
    expect(() => LightboxBlockSchema.parse({ ...base, variant: "inline-expand" })).not.toThrow();
  });

  it("Sequence default stack", () => {
    const base = { type: "sequence" as const, items: [{ type: "dev-stub", label: "i" }] };
    expect(SequenceBlockSchema.parse(base).variant).toBe("stack");
  });
});
```

- [ ] **Step 2: FAIL**

```bash
bun test tests/unit/schemas.test.ts
```

Expected : FAIL.

- [ ] **Step 3: Mettre à jour les 4 schemas**

Dans `src/lib/core/schemas/structural.ts`, remplacer les blocs Crossfade, Grid, Sequence, Lightbox par :

```ts
type CrossfadeBlockT = {
  type: "crossfade";
  variant: CrossfadeVariant;
  activeIndex: number;
  frames: Block[];
};

export const CrossfadeBlockSchema: z.ZodType<CrossfadeBlockT> = z.object({
  type: z.literal("crossfade"),
  variant: CrossfadeVariantSchema.default("fade"),
  activeIndex: z.number().int().min(0),
  frames: z.array(z.lazy(() => BlockSchema)).min(2),
}) as z.ZodType<CrossfadeBlockT>;

type GridBlockT = {
  type: "grid";
  variant: GridVariant;
  columns?: 2 | 3 | 4;
  aspectRatio?: string;
  cells: Block[];
  legend?: Block;
};

export const GridBlockSchema: z.ZodType<GridBlockT> = z.object({
  type: z.literal("grid"),
  variant: GridVariantSchema.default("uniform"),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
  aspectRatio: z.string().regex(/^\d+\s*\/\s*\d+$/).optional(),
  cells: z.array(z.lazy(() => BlockSchema)).min(1),
  legend: z.lazy(() => BlockSchema).optional(),
}) as z.ZodType<GridBlockT>;

type SequenceBlockT = {
  type: "sequence";
  variant: SequenceVariant;
  items: Block[];
};

export const SequenceBlockSchema: z.ZodType<SequenceBlockT> = z.object({
  type: z.literal("sequence"),
  variant: SequenceVariantSchema.default("stack"),
  items: z.array(z.lazy(() => BlockSchema)).min(1),
}) as z.ZodType<SequenceBlockT>;

type LightboxBlockT = {
  type: "lightbox";
  variant: LightboxVariant;
  trigger: Block;
  content: Block;
};

export const LightboxBlockSchema: z.ZodType<LightboxBlockT> = z.object({
  type: z.literal("lightbox"),
  variant: LightboxVariantSchema.default("modal"),
  trigger: z.lazy(() => BlockSchema),
  content: z.lazy(() => BlockSchema),
}) as z.ZodType<LightboxBlockT>;
```

Et mettre à jour les 4 types dans `src/lib/core/schemas/block.ts` (ajouter `variant: <Name>Variant` sur chaque).

- [ ] **Step 4: Run tests PASS**

```bash
bun test tests/unit/schemas.test.ts
```

Expected : PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/core/schemas/structural.ts src/lib/core/schemas/block.ts tests/unit/schemas.test.ts
git commit -m "$(cat <<'EOF'
feat(schemas): variant prop on Crossfade/Grid/Sequence/Lightbox

Defaults: fade, uniform, stack, modal. Zod enums gate unknowns.
Render logic follows in next commits (fallback to default for
Tier 2+).

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 11: Crossfade, Grid, Lightbox render variants

**Files:**
- Modify: `src/lib/structural-primitives/Crossfade.svelte`
- Modify: `src/lib/structural-primitives/Grid.svelte`
- Modify: `src/lib/structural-primitives/Lightbox.svelte`
- Modify: `src/lib/BlockRenderer.svelte`
- Create: `src/routes/dev/v3/{crossfade,grid,lightbox}/[variant]/+page.{ts,svelte}`
- Test: `tests/contracts/{crossfade,grid,lightbox}-variants.spec.ts`

- [ ] **Step 1: Crossfade.svelte — fade/cut**

Remplacer `src/lib/structural-primitives/Crossfade.svelte` :

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { CrossfadeVariant } from '../core/schemas/variants';
  import { TIER1_RENDER_READY, TIER1_DEFAULTS } from '../core/schemas/variants';

  let {
    variant = 'fade',
    activeIndex = 0,
    children
  }: { variant?: CrossfadeVariant; activeIndex?: number; children: Snippet } = $props();

  const renderReady = $derived(
    (TIER1_RENDER_READY.crossfade as readonly string[]).includes(variant)
  );
  const effectiveVariant = $derived(renderReady ? variant : TIER1_DEFAULTS.crossfade);
</script>

<div
  class="vn-crossfade vn-crossfade--{effectiveVariant}"
  data-testid="crossfade-root"
  data-variant={effectiveVariant}
  data-active-index={activeIndex}
>
  {@render children()}
</div>

<style>
  .vn-crossfade { position: relative; display: grid; }
  .vn-crossfade :global(> [data-testid^="crossfade-frame-"]) {
    grid-area: 1 / 1;
    transition: opacity 400ms ease;
    opacity: 0;
  }
  .vn-crossfade :global(> [data-testid^="crossfade-frame-"][data-active="true"]) {
    opacity: 1;
  }
  .vn-crossfade--cut :global(> [data-testid^="crossfade-frame-"]) {
    transition: none;
  }
</style>
```

- [ ] **Step 2: Grid.svelte — uniform/featured**

Lire d'abord pour connaître le shape actuel :

```bash
cat src/lib/structural-primitives/Grid.svelte
```

Puis ajouter `variant` prop + CSS class. Remplacer intégralement `src/lib/structural-primitives/Grid.svelte` :

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { GridVariant } from '../core/schemas/variants';
  import { TIER1_RENDER_READY, TIER1_DEFAULTS } from '../core/schemas/variants';

  let {
    variant = 'uniform',
    columns = 3,
    aspectRatio = '4 / 3',
    cells,
    legend
  }: {
    variant?: GridVariant;
    columns?: 2 | 3 | 4;
    aspectRatio?: string;
    cells: Snippet;
    legend?: Snippet;
  } = $props();

  const renderReady = $derived(
    (TIER1_RENDER_READY.grid as readonly string[]).includes(variant)
  );
  const effectiveVariant = $derived(renderReady ? variant : TIER1_DEFAULTS.grid);
</script>

<section
  class="vn-grid vn-grid--{effectiveVariant}"
  data-testid="grid-root"
  data-variant={effectiveVariant}
  style:--vn-grid-cols={columns}
  style:--vn-grid-ar={aspectRatio}
>
  {#if legend}
    <div class="vn-grid__legend" data-testid="grid-legend">{@render legend()}</div>
  {/if}
  <div class="vn-grid__cells" data-testid="grid-cells">{@render cells()}</div>
</section>

<style>
  .vn-grid { display: flex; flex-direction: column; gap: calc(var(--vn-spacing) * 2); }
  .vn-grid__legend { font-size: 0.9em; }
  .vn-grid__cells {
    display: grid;
    grid-template-columns: repeat(var(--vn-grid-cols), 1fr);
    gap: calc(var(--vn-spacing) * 2);
  }
  .vn-grid__cells :global(> *) { aspect-ratio: var(--vn-grid-ar); overflow: hidden; }

  /* featured: first cell spans 2×2, rest flow */
  .vn-grid--featured .vn-grid__cells {
    grid-template-columns: repeat(var(--vn-grid-cols), 1fr);
    grid-auto-rows: 1fr;
  }
  .vn-grid--featured .vn-grid__cells :global(> *:first-child) {
    grid-column: span 2;
    grid-row: span 2;
  }
  @media (max-width: 767px) {
    .vn-grid__cells { grid-template-columns: 1fr; }
  }
</style>
```

- [ ] **Step 3: Lightbox.svelte — modal/inline-expand**

Lire d'abord le shape actuel, puis remplacer `src/lib/structural-primitives/Lightbox.svelte` :

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { LightboxVariant } from '../core/schemas/variants';
  import { TIER1_RENDER_READY, TIER1_DEFAULTS } from '../core/schemas/variants';

  let {
    variant = 'modal',
    trigger,
    content
  }: { variant?: LightboxVariant; trigger: Snippet; content: Snippet } = $props();

  const renderReady = $derived(
    (TIER1_RENDER_READY.lightbox as readonly string[]).includes(variant)
  );
  const effectiveVariant = $derived(renderReady ? variant : TIER1_DEFAULTS.lightbox);

  let open = $state(false);
  function toggle() { open = !open; }
</script>

<div class="vn-lightbox vn-lightbox--{effectiveVariant}" data-testid="lightbox-root" data-variant={effectiveVariant}>
  <button type="button" class="vn-lightbox__trigger" data-testid="lightbox-trigger" aria-expanded={open} onclick={toggle}>
    {@render trigger()}
  </button>

  {#if effectiveVariant === 'modal' && open}
    <div
      class="vn-lightbox__modal"
      role="dialog"
      aria-modal="true"
      data-testid="lightbox-modal"
    >
      <button type="button" class="vn-lightbox__close" data-testid="lightbox-close" onclick={toggle} aria-label="Close">×</button>
      <div class="vn-lightbox__content">{@render content()}</div>
    </div>
  {:else if effectiveVariant === 'inline-expand'}
    <div
      class="vn-lightbox__inline"
      data-testid="lightbox-inline"
      aria-hidden={!open}
      data-open={open}
    >
      {@render content()}
    </div>
  {/if}
</div>

<style>
  .vn-lightbox__trigger { all: unset; cursor: pointer; }
  .vn-lightbox__modal {
    position: fixed; inset: 0; background: rgba(0,0,0,0.7);
    display: grid; place-items: center; z-index: 100;
  }
  .vn-lightbox__close {
    position: absolute; top: 1rem; right: 1rem;
    background: transparent; border: none; color: white; font-size: 2rem; cursor: pointer;
  }
  .vn-lightbox__content { max-width: 90vw; max-height: 90vh; overflow: auto; }

  .vn-lightbox__inline {
    max-height: 0; overflow: hidden;
    transition: max-height 300ms ease;
  }
  .vn-lightbox__inline[data-open="true"] { max-height: 80vh; }
</style>
```

- [ ] **Step 4: BlockRenderer — passe variant à Crossfade/Grid/Lightbox/Sequence**

Dans `src/lib/BlockRenderer.svelte`, remplacer les blocs concernés :

```svelte
{:else if block.type === 'crossfade'}
  <Crossfade variant={block.variant} activeIndex={block.activeIndex}>
    {#each block.frames as frame, i}
      <div data-testid="crossfade-frame-{i}" data-active={i === block.activeIndex}>
        <Self block={frame} />
      </div>
    {/each}
  </Crossfade>
{:else if block.type === 'grid'}
  {#if block.legend}
    {@const legendBlock = block.legend}
    <Grid variant={block.variant} columns={block.columns ?? 3} aspectRatio={block.aspectRatio ?? '4 / 3'}>
      {#snippet cells()}
        {#each block.cells as cell}<Self block={cell} />{/each}
      {/snippet}
      {#snippet legend()}<Self block={legendBlock} />{/snippet}
    </Grid>
  {:else}
    <Grid variant={block.variant} columns={block.columns ?? 3} aspectRatio={block.aspectRatio ?? '4 / 3'}>
      {#snippet cells()}
        {#each block.cells as cell}<Self block={cell} />{/each}
      {/snippet}
    </Grid>
  {/if}
{:else if block.type === 'sequence'}
  <Sequence variant={block.variant}>
    {#each block.items as item}<Self block={item} />{/each}
  </Sequence>
{:else if block.type === 'lightbox'}
  <Lightbox variant={block.variant}>
    {#snippet trigger()}<Self block={block.trigger} />{/snippet}
    {#snippet content()}<Self block={block.content} />{/snippet}
  </Lightbox>
```

- [ ] **Step 5: Sequence.svelte — add variant pass-through**

Lire `src/lib/structural-primitives/Sequence.svelte` puis ajouter `variant = 'stack'` prop (pas d'autre logique en Tier 1 — stack = layout flex colonne existant). Ajouter `class="vn-sequence vn-sequence--{effectiveVariant}"` et `data-variant`.

- [ ] **Step 6: Dev harness — 3 primitives × variants**

Créer (pattern identique à Task 8 Step 7) :
- `src/routes/dev/v3/crossfade/[variant]/+page.{ts,svelte}`
- `src/routes/dev/v3/grid/[variant]/+page.{ts,svelte}`
- `src/routes/dev/v3/lightbox/[variant]/+page.{ts,svelte}`

Exemple pour Crossfade (`src/routes/dev/v3/crossfade/[variant]/+page.ts`) :

```ts
import type { PageLoad } from "./$types";
import { buildArticlePage } from "$lib/core/build-page";

export const load: PageLoad = ({ params }) => ({
  page: buildArticlePage({
    slug: `crossfade-${params.variant}`,
    metadata: { title: `Crossfade / ${params.variant}`, byline: "dev", publishedAt: "2026-04-17" },
    tokens: {
      locale: "fr-CH",
      palette: { scheme: "viridis", background: "#fff", foreground: "#111", muted: "#666", accent: "#156964" },
      typography: { bodyFontFamily: "Inter", headingFontFamily: "Inter", monoFontFamily: "Mono", baseSize: 17, scale: 1.25 },
      spacing: { unit: 8 },
      sourceStyle: { format: "footnote", prefix: "Source : " },
      mode: "light",
      positioning: "balanced",
    },
    blocks: [
      {
        type: "crossfade",
        variant: params.variant,
        activeIndex: 0,
        frames: [
          { type: "dev-stub", label: "Frame A", color: "#b3e0da" },
          { type: "dev-stub", label: "Frame B", color: "#f5d28b" },
        ],
      },
    ],
  }),
});
```

- [ ] **Step 7: Playwright contracts pour les 3**

Créer `tests/contracts/crossfade-variants.spec.ts` :

```ts
import { test, expect } from "@playwright/test";

test("crossfade-fade has transition", async ({ page }) => {
  await page.goto("/dev/v3/crossfade/fade");
  const root = page.getByTestId("crossfade-root");
  await expect(root).toHaveAttribute("data-variant", "fade");
  const transition = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="crossfade-frame-0"]') as HTMLElement;
    return getComputedStyle(el).transitionDuration;
  });
  expect(transition).not.toBe("0s");
});

test("crossfade-cut has no transition", async ({ page }) => {
  await page.goto("/dev/v3/crossfade/cut");
  const transition = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="crossfade-frame-0"]') as HTMLElement;
    return getComputedStyle(el).transitionDuration;
  });
  expect(transition).toBe("0s");
});
```

Créer `tests/contracts/grid-variants.spec.ts` (pattern : data-variant checks + first-child span).
Créer `tests/contracts/lightbox-variants.spec.ts` (pattern : click trigger → modal visible / inline expanded).

- [ ] **Step 8: Run tests**

```bash
bun test tests/unit
bunx playwright test tests/contracts/crossfade-variants.spec.ts tests/contracts/grid-variants.spec.ts tests/contracts/lightbox-variants.spec.ts
```

Expected : PASS.

- [ ] **Step 9: Commit**

```bash
git add src/lib/structural-primitives/ src/lib/BlockRenderer.svelte src/routes/dev/v3/ tests/contracts/
git commit -m "$(cat <<'EOF'
feat(variants): Tier 1 CSS variants for Crossfade/Grid/Lightbox/Sequence

- Crossfade: fade (transition 400ms) + cut (transition none)
- Grid: uniform (standard) + featured (first cell spans 2×2)
- Lightbox: modal (fixed overlay) + inline-expand (max-height transition)
- Sequence: stack passthrough (Tier 1 only)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 12: `Flow` — new primitive

**Files:**
- Create: `src/lib/core/schemas/flow.ts` (FlowBlockSchema)
- Modify: `src/lib/core/schemas/block.ts` (add FlowBlock to union)
- Create: `src/lib/structural-primitives/Flow.svelte`
- Modify: `src/lib/structural-primitives/index.ts` (export Flow)
- Modify: `src/lib/BlockRenderer.svelte` (dispatch)
- Test: `tests/unit/flow.test.ts`
- Dev route: `src/routes/dev/v3/flow/[variant]/+page.{ts,svelte}`
- Test: `tests/contracts/flow-variants.spec.ts`

- [ ] **Step 1: Test schema Flow**

Créer `tests/unit/flow.test.ts` :

```ts
import { describe, it, expect } from "bun:test";
import { FlowBlockSchema } from "../../src/lib/core/schemas/flow";

describe("FlowBlockSchema", () => {
  const md = { type: "markdown" as const, html: "<p>txt</p>" };
  const img = { type: "image" as const, src: "https://x.com/a.jpg", alt: "a" };

  it("text-only default accepts only markdown", () => {
    const parsed = FlowBlockSchema.parse({ type: "flow", children: [md] });
    expect(parsed.variant).toBe("text-only");
  });

  it("image-left requires at least one image child", () => {
    expect(() =>
      FlowBlockSchema.parse({ type: "flow", variant: "image-left", children: [md] }),
    ).toThrow(/image/i);
  });

  it("image-left with one image passes", () => {
    expect(() =>
      FlowBlockSchema.parse({ type: "flow", variant: "image-left", children: [md, img] }),
    ).not.toThrow();
  });

  it("rejects unknown variant", () => {
    expect(() =>
      FlowBlockSchema.parse({ type: "flow", variant: "spiral", children: [md] }),
    ).toThrow();
  });
});
```

- [ ] **Step 2: Run test to FAIL**

```bash
bun test tests/unit/flow.test.ts
```

Expected : FAIL (module introuvable).

- [ ] **Step 3: Créer schema**

Créer `src/lib/core/schemas/flow.ts` :

```ts
import { z } from "zod";
import { FlowVariantSchema } from "./variants";
import { MarkdownBlockSchema, ImageBlockSchema } from "./content";
import type { MarkdownBlock, ImageBlock } from "./content";
import type { FlowVariant } from "./variants";

export type FlowBlock = {
  type: "flow";
  variant: FlowVariant;
  children: (MarkdownBlock | ImageBlock)[];
};

export const FlowBlockSchema: z.ZodType<FlowBlock> = z
  .object({
    type: z.literal("flow"),
    variant: FlowVariantSchema.default("text-only"),
    children: z
      .array(z.discriminatedUnion("type", [MarkdownBlockSchema, ImageBlockSchema]))
      .min(1),
  })
  .refine(
    (b) =>
      !b.variant.startsWith("image-") ||
      b.children.some((c) => c.type === "image"),
    { message: "Flow variant image-* requires at least one image child" },
  ) as z.ZodType<FlowBlock>;
```

- [ ] **Step 4: Ajouter FlowBlock à l'union**

Dans `src/lib/core/schemas/block.ts`, ajouter :

```ts
import { FlowBlockSchema, type FlowBlock } from "./flow";
```

Puis ajouter `| FlowBlock` à `export type Block = ...` et `FlowBlockSchema` à `z.union([...])`.

Re-export `FlowBlock` à la fin du fichier.

- [ ] **Step 5: Run tests PASS**

```bash
bun test tests/unit/flow.test.ts
```

Expected : PASS.

- [ ] **Step 6: Créer Flow.svelte**

Créer `src/lib/structural-primitives/Flow.svelte` :

```svelte
<script lang="ts">
  import type { FlowBlock } from '../core/schemas/flow';
  import type { FlowVariant } from '../core/schemas/variants';
  import { TIER1_RENDER_READY, TIER1_DEFAULTS } from '../core/schemas/variants';
  import Markdown from '../content-primitives/Markdown.svelte';
  import Image from '../content-primitives/Image.svelte';

  let {
    variant = 'text-only',
    children: items = []
  }: {
    variant?: FlowVariant;
    children?: FlowBlock['children'];
  } = $props();

  const renderReady = $derived(
    (TIER1_RENDER_READY.flow as readonly string[]).includes(variant)
  );
  const effectiveVariant = $derived(renderReady ? variant : TIER1_DEFAULTS.flow);

  // Pair images with following markdown when variant requires paired layout
  const isPaired = $derived(
    effectiveVariant === 'image-left' ||
    effectiveVariant === 'image-right' ||
    effectiveVariant === 'image-top' ||
    effectiveVariant === 'image-bottom'
  );

  // For `image-background-textoverlay`: pull first image as background, rest as overlay markdown
  const firstImage = $derived(items.find((c) => c.type === 'image'));
  const textChildren = $derived(items.filter((c) => c.type === 'markdown'));
</script>

{#if effectiveVariant === 'image-background-textoverlay' && firstImage}
  <section
    class="vn-flow vn-flow--{effectiveVariant}"
    data-testid="flow-root"
    data-variant={effectiveVariant}
    style:background-image="url({firstImage.src})"
    aria-label={firstImage.alt}
  >
    <div class="vn-flow__overlay">
      {#each textChildren as child}
        <Markdown html={child.html} />
      {/each}
    </div>
  </section>
{:else if effectiveVariant === 'image-fullbleed'}
  <section class="vn-flow vn-flow--{effectiveVariant}" data-testid="flow-root" data-variant={effectiveVariant}>
    {#each items as child}
      {#if child.type === 'image'}
        <Image src={child.src} alt={child.alt} aspectRatio={child.aspectRatio} caption={child.caption} />
      {:else}
        <div class="vn-flow__text"><Markdown html={child.html} /></div>
      {/if}
    {/each}
  </section>
{:else}
  <section class="vn-flow vn-flow--{effectiveVariant}" data-testid="flow-root" data-variant={effectiveVariant}>
    {#each items as child}
      {#if child.type === 'image'}
        <div class="vn-flow__image"><Image src={child.src} alt={child.alt} aspectRatio={child.aspectRatio} caption={child.caption} /></div>
      {:else}
        <div class="vn-flow__text"><Markdown html={child.html} /></div>
      {/if}
    {/each}
  </section>
{/if}

<style>
  .vn-flow {
    display: grid;
    gap: var(--vn-layout-rhythm-gap, calc(var(--vn-spacing) * 4));
    padding: calc(var(--vn-spacing) * 2);
  }
  .vn-flow--text-only { grid-template-columns: 1fr; max-width: 640px; margin: 0 auto; }

  .vn-flow--image-top,
  .vn-flow--image-bottom { grid-template-columns: 1fr; }

  .vn-flow--image-left { grid-template-columns: 1fr 1fr; }
  .vn-flow--image-left .vn-flow__image { grid-column: 1; grid-row: 1; }
  .vn-flow--image-left .vn-flow__text { grid-column: 2; grid-row: 1; }

  .vn-flow--image-right { grid-template-columns: 1fr 1fr; }
  .vn-flow--image-right .vn-flow__text { grid-column: 1; grid-row: 1; }
  .vn-flow--image-right .vn-flow__image { grid-column: 2; grid-row: 1; }

  .vn-flow--image-bottom .vn-flow__text { order: 1; }
  .vn-flow--image-bottom .vn-flow__image { order: 2; }

  .vn-flow--image-fullbleed { padding: 0; }
  .vn-flow--image-fullbleed :global(.vn-image img) { width: 100vw; margin-left: calc(50% - 50vw); }

  .vn-flow--image-background-textoverlay {
    position: relative;
    min-height: 60vh;
    background-size: cover;
    background-position: center;
    display: grid;
    place-items: center;
    padding: 0;
  }
  .vn-flow--image-background-textoverlay::before {
    content: "";
    position: absolute; inset: 0;
    background: var(--vn-overlay, rgba(0,0,0,0.4));
  }
  .vn-flow__overlay {
    position: relative;
    color: white;
    max-width: 600px;
    padding: calc(var(--vn-spacing) * 3);
  }

  @media (max-width: 767px) {
    .vn-flow--image-left,
    .vn-flow--image-right { grid-template-columns: 1fr; }
    .vn-flow--image-left .vn-flow__image,
    .vn-flow--image-left .vn-flow__text,
    .vn-flow--image-right .vn-flow__image,
    .vn-flow--image-right .vn-flow__text {
      grid-column: 1; grid-row: auto;
    }
  }
</style>
```

- [ ] **Step 7: Mettre à jour `src/lib/structural-primitives/index.ts`**

Ajouter l'export Flow :

```ts
export { default as Flow } from "./Flow.svelte";
```

- [ ] **Step 8: Mettre à jour `BlockRenderer.svelte`**

Ajouter l'import et la branch dispatch :

```svelte
import { Sticky, ScrollSteps, Crossfade, Grid, Split, Sequence, Lightbox, Flow } from './structural-primitives';
```

Et la branche (avant le fallback `markdown`) :

```svelte
{:else if block.type === 'flow'}
  <Flow variant={block.variant} children={block.children} />
```

- [ ] **Step 9: Dev harness `/dev/v3/flow/[variant]`**

Créer `src/routes/dev/v3/flow/[variant]/+page.ts` :

```ts
import type { PageLoad } from "./$types";
import { buildArticlePage } from "$lib/core/build-page";

export const load: PageLoad = ({ params }) => {
  const hasImage = params.variant !== "text-only";
  const children: any[] = [
    { type: "markdown", html: "<h2>Titre de section</h2><p>Un paragraphe de texte qui donne du contexte au lecteur.</p>" },
  ];
  if (hasImage) {
    children.push({ type: "image", src: "https://picsum.photos/800/600", alt: "illustration", aspectRatio: "4 / 3" });
  }
  return {
    page: buildArticlePage({
      slug: `flow-${params.variant}`,
      metadata: { title: `Flow / ${params.variant}`, byline: "dev", publishedAt: "2026-04-17" },
      tokens: {
        locale: "fr-CH",
        palette: { scheme: "viridis", background: "#fff", foreground: "#111", muted: "#666", accent: "#156964" },
        typography: { bodyFontFamily: "Inter", headingFontFamily: "Inter", monoFontFamily: "Mono", baseSize: 17, scale: 1.25 },
        spacing: { unit: 8 },
        sourceStyle: { format: "footnote", prefix: "Source : " },
        mode: "light",
        positioning: "balanced",
      },
      blocks: [{ type: "flow", variant: params.variant, children }],
    }),
  };
};
```

Créer `src/routes/dev/v3/flow/[variant]/+page.svelte` (même template que Task 8 Step 7).

- [ ] **Step 10: Playwright contracts Flow**

Créer `tests/contracts/flow-variants.spec.ts` :

```ts
import { test, expect } from "@playwright/test";

const variants = [
  "text-only",
  "image-top",
  "image-left",
  "image-right",
  "image-bottom",
  "image-fullbleed",
  "image-background-textoverlay",
] as const;

for (const v of variants) {
  test(`flow-${v}: renders with correct data-variant`, async ({ page }) => {
    await page.goto(`/dev/v3/flow/${v}`);
    const root = page.getByTestId("flow-root");
    await expect(root).toHaveAttribute("data-variant", v);
  });
}

test("flow-image-left: image before text on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/dev/v3/flow/image-left");
  const imgBox = await page.locator(".vn-flow__image").first().boundingBox();
  const textBox = await page.locator(".vn-flow__text").first().boundingBox();
  expect(imgBox!.x).toBeLessThan(textBox!.x);
});

test("flow-image-right: text before image on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/dev/v3/flow/image-right");
  const imgBox = await page.locator(".vn-flow__image").first().boundingBox();
  const textBox = await page.locator(".vn-flow__text").first().boundingBox();
  expect(textBox!.x).toBeLessThan(imgBox!.x);
});
```

- [ ] **Step 11: Run tests**

```bash
bun test tests/unit
bunx playwright test tests/contracts/flow-variants.spec.ts
```

Expected : PASS.

- [ ] **Step 12: Commit**

```bash
git add src/lib/core/schemas/flow.ts src/lib/core/schemas/block.ts \
        src/lib/structural-primitives/Flow.svelte src/lib/structural-primitives/index.ts \
        src/lib/BlockRenderer.svelte \
        src/routes/dev/v3/flow \
        tests/unit/flow.test.ts tests/contracts/flow-variants.spec.ts
git commit -m "$(cat <<'EOF'
feat(flow): new structural primitive with 7 Tier 1 variants

Flow covers text-only + image+text (top/left/right/bottom/fullbleed/
background-textoverlay). Schema.refine() guards image-* variants
from omitted image child. Mobile forces stack.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 13: Changeset beta.1 + publish

**Files:**
- Create: `.changeset/v3-beta-1-variants.md`

- [ ] **Step 1: Créer le changeset**

Créer `.changeset/v3-beta-1-variants.md` :

```md
---
"@rmdms/viznews": major
---

v3.0.0-beta.1 — Variants + Flow

- Sticky/Split/Crossfade/Grid/Lightbox/Sequence: `variant` prop + Tier 1 CSS variants
- Split: drag-separator with clip-path compare slider
- Flow: new structural primitive (7 variants text-only + image-*)
- BlockRenderer dispatches all new variants
- Dev harness /dev/v3/<primitive>/<variant> covers Tier 1 + fallback targets
- Playwright contracts gate render behavior per variant
```

- [ ] **Step 2: Bump + commit**

```bash
bun x changeset version
bun test tests/unit
bunx playwright test
```

Expected : tous verts. `package.json` → `3.0.0-beta.1`. `CHANGELOG.md` mis à jour.

- [ ] **Step 3: Commit**

```bash
git add .changeset/v3-beta-1-variants.md package.json CHANGELOG.md
git commit -m "$(cat <<'EOF'
chore(release): 3.0.0-beta.1

See CHANGELOG.md.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 4: (User-gated) Publish**

> **STOP** — confirmation user requise.

```bash
bun run build
bun x changeset publish
git push origin feat/v3-rebuild --tags
```

---

## Phase 3 — Explore + Content primitives (publish `3.0.0-beta.2`)

Objectif : nouveau primitive `Explore` + `ExploreLegend`, upgrade `DWChart` / `Image` / `Markdown`, BlockRenderer dispatch.

### Task 14: `Explore` schema

**Files:**
- Create: `src/lib/core/schemas/explore.ts`
- Modify: `src/lib/core/schemas/block.ts` (add to union)
- Test: `tests/unit/explore.test.ts`

- [ ] **Step 1: Tests schema**

Créer `tests/unit/explore.test.ts` :

```ts
import { describe, it, expect } from "bun:test";
import { ExploreBlockSchema } from "../../src/lib/core/schemas/explore";

describe("ExploreBlockSchema", () => {
  const mtContent = {
    type: "mt-map" as const,
    style: { version: 8 },
    bounds: [0, 0, 10, 10] as [number, number, number, number],
    alt: "a map",
  };
  const baseLegend = { position: "top" as const, render: "auto" as const, collapsibleOnMobile: true };

  it("defaults variant to native-interactivity", () => {
    const b = ExploreBlockSchema.parse({ type: "explore", content: mtContent, legend: baseLegend });
    expect(b.variant).toBe("native-interactivity");
  });

  it("defaults legend.position to top, render to auto", () => {
    const b = ExploreBlockSchema.parse({ type: "explore", content: mtContent, legend: {} });
    expect(b.legend.position).toBe("top");
    expect(b.legend.render).toBe("auto");
    expect(b.legend.collapsibleOnMobile).toBe(true);
  });

  it("accepts dw-chart content", () => {
    const dw = { type: "dw-chart" as const, embedUrl: "https://example.com/c", title: "t", alt: "a" };
    expect(() => ExploreBlockSchema.parse({ type: "explore", content: dw, legend: baseLegend })).not.toThrow();
  });

  it("accepts flourish-chart content", () => {
    const fl = { type: "flourish-chart" as const, embedUrl: "https://example.com/f", title: "t", alt: "a" };
    expect(() => ExploreBlockSchema.parse({ type: "explore", content: fl, legend: baseLegend })).not.toThrow();
  });

  it("rejects unknown variant", () => {
    expect(() => ExploreBlockSchema.parse({ type: "explore", variant: "crazy", content: mtContent, legend: baseLegend })).toThrow();
  });

  it("rejects content with unsupported type (e.g. markdown)", () => {
    expect(() => ExploreBlockSchema.parse({ type: "explore", content: { type: "markdown", html: "<p>x</p>" }, legend: baseLegend })).toThrow();
  });
});
```

- [ ] **Step 2: Run tests to FAIL**

```bash
bun test tests/unit/explore.test.ts
```

Expected : FAIL (module introuvable).

- [ ] **Step 3: Créer le schema**

Créer `src/lib/core/schemas/explore.ts` :

```ts
import { z } from "zod";
import {
  DWChartBlockSchema,
  FlourishChartBlockSchema,
  MTMapBlockSchema,
  type DWChartBlock,
  type FlourishChartBlock,
  type MTMapBlock,
} from "./content";
import { ExploreVariantSchema, type ExploreVariant } from "./variants";

const LegendItemSchema = z.object({
  label: z.string(),
  color: z.string().optional(),
  swatch: z.enum(["dot", "square", "line"]).default("square"),
});

export type LegendItem = z.infer<typeof LegendItemSchema>;

const ExploreLegendShapeSchema = z.object({
  position: z.enum(["top", "right", "overlay"]).default("top"),
  items: z.array(LegendItemSchema).optional(),
  render: z.enum(["auto", "lib", "native"]).default("auto"),
  collapsibleOnMobile: z.boolean().default(true),
});

export type ExploreLegendShape = z.infer<typeof ExploreLegendShapeSchema>;

export type ExploreBlock = {
  type: "explore";
  variant: ExploreVariant;
  content: DWChartBlock | FlourishChartBlock | MTMapBlock;
  legend: ExploreLegendShape;
  sourceNote?: string;
};

export const ExploreBlockSchema: z.ZodType<ExploreBlock> = z.object({
  type: z.literal("explore"),
  variant: ExploreVariantSchema.default("native-interactivity"),
  content: z.discriminatedUnion("type", [
    DWChartBlockSchema,
    FlourishChartBlockSchema,
    MTMapBlockSchema,
  ]),
  legend: ExploreLegendShapeSchema,
  sourceNote: z.string().optional(),
}) as z.ZodType<ExploreBlock>;
```

- [ ] **Step 4: Ajouter à l'union Block**

Dans `src/lib/core/schemas/block.ts`, importer + ajouter `ExploreBlock` à `Block` union et `ExploreBlockSchema` à `BlockSchema`.

- [ ] **Step 5: Run tests PASS**

```bash
bun test tests/unit/explore.test.ts
```

Expected : PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/core/schemas/explore.ts src/lib/core/schemas/block.ts tests/unit/explore.test.ts
git commit -m "$(cat <<'EOF'
feat(schemas): ExploreBlock + discriminated content union

Content: dw-chart | flourish-chart | mt-map. Legend: top/right/overlay
position, render auto/lib/native, collapsibleOnMobile default true.
sourceNote optional.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 15: `ExploreLegend.svelte`

**Files:**
- Create: `src/lib/structural-primitives/ExploreLegend.svelte`
- Modify: `src/lib/structural-primitives/index.ts`

- [ ] **Step 1: Créer le component**

Créer `src/lib/structural-primitives/ExploreLegend.svelte` :

```svelte
<script lang="ts">
  import type { LegendItem } from '../core/schemas/explore';

  let {
    items = [],
    position = 'top',
    collapsibleOnMobile = true
  }: {
    items?: LegendItem[];
    position?: 'top' | 'right' | 'overlay';
    collapsibleOnMobile?: boolean;
  } = $props();
</script>

{#if collapsibleOnMobile}
  <details
    class="vn-legend vn-legend--{position} vn-legend--collapsible"
    data-testid="explore-legend"
    data-position={position}
  >
    <summary class="vn-legend__summary">Légende</summary>
    <ul class="vn-legend__items">
      {#each items as item}
        <li class="vn-legend__item" data-testid="legend-item">
          <span class="vn-legend__swatch vn-legend__swatch--{item.swatch ?? 'square'}" style:background={item.color}></span>
          <span class="vn-legend__label">{item.label}</span>
        </li>
      {/each}
    </ul>
  </details>
{:else}
  <div class="vn-legend vn-legend--{position}" data-testid="explore-legend" data-position={position}>
    <ul class="vn-legend__items">
      {#each items as item}
        <li class="vn-legend__item" data-testid="legend-item">
          <span class="vn-legend__swatch vn-legend__swatch--{item.swatch ?? 'square'}" style:background={item.color}></span>
          <span class="vn-legend__label">{item.label}</span>
        </li>
      {/each}
    </ul>
  </div>
{/if}

<style>
  .vn-legend { font-family: var(--vn-font-body); font-size: 0.85em; color: var(--vn-color-fg); }
  .vn-legend__summary { cursor: pointer; font-weight: 500; margin-bottom: calc(var(--vn-spacing)); }
  .vn-legend__items { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: calc(var(--vn-spacing) * 2); }
  .vn-legend__item { display: inline-flex; align-items: center; gap: calc(var(--vn-spacing) * 0.5); }
  .vn-legend__swatch { display: inline-block; width: 12px; height: 12px; background: var(--vn-color-accent); }
  .vn-legend__swatch--dot { border-radius: 50%; }
  .vn-legend__swatch--line { width: 16px; height: 2px; }
  .vn-legend--overlay {
    position: absolute; bottom: 12px; left: 12px;
    background: color-mix(in srgb, var(--vn-color-bg) 85%, transparent);
    backdrop-filter: blur(4px);
    padding: calc(var(--vn-spacing));
    border-radius: var(--vn-radius, 4px);
  }
  @media (min-width: 768px) {
    .vn-legend--collapsible { all: revert; }
    .vn-legend--collapsible > summary { display: none; }
  }
</style>
```

- [ ] **Step 2: Export**

Ajouter dans `src/lib/structural-primitives/index.ts` :

```ts
export { default as ExploreLegend } from "./ExploreLegend.svelte";
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/structural-primitives/ExploreLegend.svelte src/lib/structural-primitives/index.ts
git commit -m "$(cat <<'EOF'
feat(explore-legend): top/right/overlay positioning + collapsible mobile

HTML-pure legend component. top/right = grid position, overlay =
absolute + blur background. Mobile <details> collapsible by
default; desktop always expanded.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 16: `Explore.svelte` + auto-routing

**Files:**
- Create: `src/lib/structural-primitives/Explore.svelte`
- Modify: `src/lib/structural-primitives/index.ts`
- Modify: `src/lib/BlockRenderer.svelte`
- Create: `src/routes/dev/v3/explore/[variant]/+page.{ts,svelte}`
- Test: `tests/contracts/explore.spec.ts`

- [ ] **Step 1: Créer Explore.svelte**

Créer `src/lib/structural-primitives/Explore.svelte` :

```svelte
<script lang="ts">
  import type { ExploreBlock } from '../core/schemas/explore';
  import type { ExploreVariant } from '../core/schemas/variants';
  import { TIER1_RENDER_READY, TIER1_DEFAULTS } from '../core/schemas/variants';
  import DWChart from '../content-primitives/DWChart.svelte';
  import FlourishChart from '../content-primitives/FlourishChart.svelte';
  import MTMap from '../content-primitives/MTMap.svelte';
  import ExploreLegend from './ExploreLegend.svelte';

  let {
    variant = 'native-interactivity',
    content,
    legend,
    sourceNote
  }: {
    variant?: ExploreVariant;
    content: ExploreBlock['content'];
    legend: ExploreBlock['legend'];
    sourceNote?: string;
  } = $props();

  const renderReady = $derived(
    (TIER1_RENDER_READY.explore as readonly string[]).includes(variant)
  );
  const effectiveVariant = $derived(renderReady ? variant : TIER1_DEFAULTS.explore);

  // Legend routing: auto → lib for mt-map (can extract items), native for DW/FL (tools render their own)
  const legendMode = $derived(
    legend.render === 'auto'
      ? content.type === 'mt-map'
        ? 'lib'
        : 'native'
      : legend.render
  );
</script>

<section
  class="vn-explore vn-explore--{effectiveVariant} vn-explore--legend-{legend.position}"
  data-testid="explore-root"
  data-variant={effectiveVariant}
  data-legend-mode={legendMode}
  data-legend-position={legend.position}
>
  {#if legendMode === 'lib' && legend.position === 'top' && legend.items}
    <div class="vn-explore__legend-slot">
      <ExploreLegend items={legend.items} position="top" collapsibleOnMobile={legend.collapsibleOnMobile} />
    </div>
  {/if}

  <div class="vn-explore__content" data-testid="explore-content">
    {#if content.type === 'mt-map'}
      <MTMap
        style={content.style}
        bounds={content.bounds}
        alt={content.alt}
        height={content.height}
        interactive={content.interactive ?? true}
        flyToSteps={content.flyToSteps}
      />
    {:else if content.type === 'dw-chart'}
      <DWChart embedUrl={content.embedUrl} title={content.title} alt={content.alt} height={content.height} />
    {:else if content.type === 'flourish-chart'}
      <FlourishChart embedUrl={content.embedUrl} title={content.title} alt={content.alt} height={content.height} />
    {/if}
  </div>

  {#if legendMode === 'lib' && legend.position !== 'top' && legend.items}
    <div class="vn-explore__legend-slot vn-explore__legend-slot--{legend.position}">
      <ExploreLegend items={legend.items} position={legend.position} collapsibleOnMobile={legend.collapsibleOnMobile} />
    </div>
  {/if}

  {#if sourceNote}
    <footer class="vn-explore__source" data-testid="explore-source">{sourceNote}</footer>
  {/if}
</section>

<style>
  .vn-explore {
    position: relative;
    display: grid;
    gap: calc(var(--vn-spacing) * 2);
    padding: calc(var(--vn-spacing) * 2);
  }
  .vn-explore--legend-top { grid-template-rows: auto 1fr; }
  .vn-explore--legend-right { grid-template-columns: 1fr auto; }
  .vn-explore--legend-right .vn-explore__content { grid-column: 1; }
  .vn-explore--legend-right .vn-explore__legend-slot--right { grid-column: 2; }

  .vn-explore__source { font-size: 0.8em; color: var(--vn-color-muted); margin-top: calc(var(--vn-spacing)); }
</style>
```

- [ ] **Step 2: Export + BlockRenderer dispatch**

Ajouter dans `src/lib/structural-primitives/index.ts` :

```ts
export { default as Explore } from "./Explore.svelte";
```

Dans `src/lib/BlockRenderer.svelte`, importer Explore et ajouter :

```svelte
{:else if block.type === 'explore'}
  <Explore variant={block.variant} content={block.content} legend={block.legend} sourceNote={block.sourceNote} />
```

- [ ] **Step 3: Dev harness**

Créer `src/routes/dev/v3/explore/[variant]/+page.ts` :

```ts
import type { PageLoad } from "./$types";
import { buildArticlePage } from "$lib/core/build-page";

export const load: PageLoad = ({ params }) => ({
  page: buildArticlePage({
    slug: `explore-${params.variant}`,
    metadata: { title: `Explore / ${params.variant}`, byline: "dev", publishedAt: "2026-04-17" },
    tokens: {
      locale: "fr-CH",
      palette: { scheme: "viridis", background: "#fff", foreground: "#111", muted: "#666", accent: "#156964" },
      typography: { bodyFontFamily: "Inter", headingFontFamily: "Inter", monoFontFamily: "Mono", baseSize: 17, scale: 1.25 },
      spacing: { unit: 8 },
      sourceStyle: { format: "footnote", prefix: "Source : " },
      mode: "light",
      positioning: "balanced",
    },
    blocks: [
      {
        type: "explore",
        variant: params.variant,
        content: {
          type: "dw-chart",
          embedUrl: "https://datawrapper.dwcdn.net/Uyxgy/2/",
          title: "Sample chart",
          alt: "sample",
          height: 400,
        },
        legend: { position: "top", render: "native", collapsibleOnMobile: true },
        sourceNote: "Source : Datawrapper demo",
      },
    ],
  }),
});
```

Créer `src/routes/dev/v3/explore/[variant]/+page.svelte` (même pattern).

- [ ] **Step 4: Playwright contract**

Créer `tests/contracts/explore.spec.ts` :

```ts
import { test, expect } from "@playwright/test";

test("explore-native-interactivity renders content", async ({ page }) => {
  await page.goto("/dev/v3/explore/native-interactivity");
  const root = page.getByTestId("explore-root");
  await expect(root).toHaveAttribute("data-variant", "native-interactivity");
  await expect(page.getByTestId("explore-content")).toBeVisible();
});

test("explore Tier 2 variant falls back", async ({ page }) => {
  await page.goto("/dev/v3/explore/controls-panel");
  const root = page.getByTestId("explore-root");
  await expect(root).toHaveAttribute("data-variant", "native-interactivity");
});

test("explore legend routing for dw-chart uses native", async ({ page }) => {
  await page.goto("/dev/v3/explore/native-interactivity");
  const root = page.getByTestId("explore-root");
  await expect(root).toHaveAttribute("data-legend-mode", "native");
});

test("explore renders sourceNote", async ({ page }) => {
  await page.goto("/dev/v3/explore/native-interactivity");
  await expect(page.getByTestId("explore-source")).toContainText("Datawrapper");
});
```

- [ ] **Step 5: Run tests**

```bash
bun test tests/unit
bunx playwright test tests/contracts/explore.spec.ts
```

Expected : PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/structural-primitives/Explore.svelte src/lib/structural-primitives/index.ts \
        src/lib/BlockRenderer.svelte src/routes/dev/v3/explore tests/contracts/explore.spec.ts
git commit -m "$(cat <<'EOF'
feat(explore): new primitive with auto legend routing

Explore wraps DW/FL/MT content, routes legend.render "auto" to
lib for mt-map + native for DW/FL. Tier 1 variant native-
interactivity uses each tool's native controls. Tier 2+ accepted
by schema, falls back to native-interactivity at render.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 17: `DWChart.svelte` — wire build-config

**Files:**
- Modify: `src/lib/content-primitives/DWChart.svelte`
- Test: `tests/contracts/dw-chart.spec.ts` (existant, étendu)

- [ ] **Step 1: Lire le build-config existant**

Vérifier ce que `src/lib/content-primitives/datawrapper/build-config.ts` expose.

```bash
cat src/lib/content-primitives/datawrapper/build-config.ts
```

Prendre note de la shape du config renvoyé.

- [ ] **Step 2: Étendre DWChart pour accepter config optionnel**

Remplacer `src/lib/content-primitives/DWChart.svelte` :

```svelte
<script lang="ts">
  let { embedUrl, title, alt, height = 400 }: {
    embedUrl: string; title: string; alt: string; height?: number;
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
    border-radius: var(--vn-radius, 0);
    box-shadow: var(--vn-shadow, none);
    overflow: hidden;
  }
  .vn-dw-chart iframe { border: none; display: block; }
</style>
```

(Note : la DW iframe doit rester URL-driven comme avant — la config côté build-config.ts reste utilisée par le plugin pour *générer* cette URL. Le component lib reçoit l'URL résolue. Le seul changement visuel est l'adoption des v3 CSS vars `--vn-radius` et `--vn-shadow`.)

- [ ] **Step 3: Run tests**

```bash
bunx playwright test tests/contracts/dw-chart.spec.ts
```

Expected : PASS (aucune régression).

- [ ] **Step 4: Commit**

```bash
git add src/lib/content-primitives/DWChart.svelte
git commit -m "$(cat <<'EOF'
feat(dw-chart): adopt v3 CSS vars (radius, shadow)

DW iframe URL-driven (unchanged). Container picks up
--vn-radius + --vn-shadow from positioning cascade.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 18: `Image.svelte` — picture + srcset

**Files:**
- Modify: `src/lib/core/schemas/content.ts` (ImageBlock: allow `srcset` optional)
- Modify: `src/lib/content-primitives/Image.svelte`
- Test: `tests/contracts/image.spec.ts`

- [ ] **Step 1: Étendre le schema**

Dans `src/lib/core/schemas/content.ts`, remplacer `ImageBlockSchema` :

```ts
export const ImageBlockSchema = z.object({
  type: z.literal("image"),
  src: z.string().url(),
  alt: z.string(),
  srcset: z
    .array(
      z.object({ src: z.string().url(), width: z.number().int().positive() }),
    )
    .optional(),
  sizes: z.string().optional(),
  aspectRatio: z
    .string()
    .regex(/^\d+\s*\/\s*\d+$/)
    .optional(),
  caption: z.string().optional(),
});
```

- [ ] **Step 2: Ajouter le type updated**

```ts
export type ImageBlock = z.infer<typeof ImageBlockSchema>;
```

(déjà fait via `z.infer` — juste s'assurer du re-export).

- [ ] **Step 3: Étendre Image.svelte**

Remplacer `src/lib/content-primitives/Image.svelte` :

```svelte
<script lang="ts">
  let {
    src,
    alt,
    srcset,
    sizes,
    aspectRatio,
    caption
  }: {
    src: string;
    alt: string;
    srcset?: { src: string; width: number }[];
    sizes?: string;
    aspectRatio?: string;
    caption?: string;
  } = $props();

  const srcsetAttr = $derived(
    srcset && srcset.length > 0
      ? srcset.map((s) => `${s.src} ${s.width}w`).join(", ")
      : undefined
  );
</script>

<figure class="vn-image" data-testid="image-root">
  {#if srcsetAttr}
    <picture>
      <img
        {src}
        {alt}
        srcset={srcsetAttr}
        sizes={sizes ?? "100vw"}
        loading="lazy"
        style:aspect-ratio={aspectRatio}
        data-testid="image-img"
      />
    </picture>
  {:else}
    <img
      {src}
      {alt}
      loading="lazy"
      style:aspect-ratio={aspectRatio}
      data-testid="image-img"
    />
  {/if}
  {#if caption}
    <figcaption data-testid="image-caption">{caption}</figcaption>
  {/if}
</figure>

<style>
  .vn-image { margin: 0; border-radius: var(--vn-radius, 0); overflow: hidden; }
  .vn-image img { width: 100%; height: auto; display: block; object-fit: cover; }
  .vn-image figcaption {
    font-family: var(--vn-font-body);
    font-size: 0.85em;
    color: var(--vn-color-muted);
    margin-top: calc(var(--vn-spacing) * 1);
  }
</style>
```

- [ ] **Step 4: Run tests**

```bash
bun test tests/unit
bunx playwright test tests/contracts/image.spec.ts
```

Expected : PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/core/schemas/content.ts src/lib/content-primitives/Image.svelte
git commit -m "$(cat <<'EOF'
feat(image): optional srcset + sizes, responsive <picture>

Schema: ImageBlock adds optional srcset + sizes. Component uses
<picture>+<img srcset=> when provided, falls back to plain <img>.
Adopts --vn-radius.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 19: `Markdown.svelte` — parse + sanitize

**Files:**
- Modify: `package.json` (add `marked`, `dompurify`)
- Modify: `src/lib/core/schemas/content.ts` (MarkdownBlock: allow `md` raw or `html` pre-parsed)
- Modify: `src/lib/content-primitives/Markdown.svelte`
- Test: `tests/contracts/markdown.spec.ts`

- [ ] **Step 1: Installer deps**

```bash
bun add marked isomorphic-dompurify
```

Expected : `package.json` dépendances ajoutées.

- [ ] **Step 2: Étendre le schema**

Dans `src/lib/core/schemas/content.ts`, remplacer `MarkdownBlockSchema` :

```ts
export const MarkdownBlockSchema = z.union([
  z.object({ type: z.literal("markdown"), html: z.string().min(1) }),
  z.object({ type: z.literal("markdown"), md: z.string().min(1) }),
]);
```

Et updater le type inferred :

```ts
export type MarkdownBlock = z.infer<typeof MarkdownBlockSchema>;
```

Tests (ajouter dans `tests/unit/content-schemas.test.ts` ou `schemas.test.ts`) :

```ts
describe("MarkdownBlockSchema v3 — md or html", () => {
  it("accepts html form", () => {
    expect(() => MarkdownBlockSchema.parse({ type: "markdown", html: "<p>x</p>" })).not.toThrow();
  });
  it("accepts md form", () => {
    expect(() => MarkdownBlockSchema.parse({ type: "markdown", md: "# Titre" })).not.toThrow();
  });
  it("rejects neither", () => {
    expect(() => MarkdownBlockSchema.parse({ type: "markdown" })).toThrow();
  });
});
```

- [ ] **Step 3: Run tests to FAIL**

```bash
bun test tests/unit
```

Expected : FAIL sur le test "md form" (le schema actuel n'accepte que `html`).

- [ ] **Step 4: Étendre Markdown.svelte pour parser `md` + sanitize `html`**

Remplacer `src/lib/content-primitives/Markdown.svelte` :

```svelte
<script lang="ts">
  import { marked } from 'marked';
  import DOMPurify from 'isomorphic-dompurify';

  let props: { html?: string; md?: string } = $props();

  const rendered = $derived.by(() => {
    if ('md' in props && props.md) {
      const parsed = marked.parse(props.md, { async: false }) as string;
      return DOMPurify.sanitize(parsed);
    }
    if ('html' in props && props.html) {
      return DOMPurify.sanitize(props.html);
    }
    return '';
  });
</script>

<figure class="vn-markdown" data-testid="markdown-root">
  {@html rendered}
</figure>

<style>
  .vn-markdown {
    margin: 0;
    font-family: var(--vn-font-body);
    color: var(--vn-color-fg);
    line-height: 1.6;
  }
  .vn-markdown :global(h1),
  .vn-markdown :global(h2),
  .vn-markdown :global(h3),
  .vn-markdown :global(h4),
  .vn-markdown :global(h5),
  .vn-markdown :global(h6) {
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

- [ ] **Step 5: Mettre à jour BlockRenderer pour passer md ou html**

Dans `src/lib/BlockRenderer.svelte` remplacer :

```svelte
{:else if block.type === 'markdown'}
  {#if 'md' in block}
    <Markdown md={block.md} />
  {:else}
    <Markdown html={block.html} />
  {/if}
```

- [ ] **Step 6: Run tests**

```bash
bun test tests/unit
bunx playwright test tests/contracts/markdown.spec.ts
```

Expected : PASS.

- [ ] **Step 7: Commit**

```bash
git add package.json bun.lock src/lib/core/schemas/content.ts \
        src/lib/content-primitives/Markdown.svelte src/lib/BlockRenderer.svelte \
        tests/unit/content-schemas.test.ts
git commit -m "$(cat <<'EOF'
feat(markdown): parse md + sanitize via marked + DOMPurify

Schema accepts md (raw) or html (pre-parsed). Runtime parses md
via marked (sync mode), sanitizes both variants via DOMPurify
before {@html}. No raw script/iframe/event-handler injection.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 20: Changeset beta.2 + publish

**Files:**
- Create: `.changeset/v3-beta-2-explore-content.md`

- [ ] **Step 1: Créer changeset**

Créer `.changeset/v3-beta-2-explore-content.md` :

```md
---
"@rmdms/viznews": major
---

v3.0.0-beta.2 — Explore + content primitives

- Explore primitive + ExploreLegend with auto legend routing
  (mt-map → lib, DW/FL → native)
- DWChart adopts --vn-radius + --vn-shadow
- Image: optional srcset + sizes with <picture>
- Markdown: accepts raw md (marked) or html, DOMPurify sanitize
```

- [ ] **Step 2: Bump + tests + commit + publish**

```bash
bun x changeset version
bun test tests/unit
bunx playwright test
```

```bash
git add .changeset/v3-beta-2-explore-content.md package.json CHANGELOG.md
git commit -m "$(cat <<'EOF'
chore(release): 3.0.0-beta.2

See CHANGELOG.md.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 3: (User-gated) Publish**

> **STOP** — confirmation user.

```bash
bun run build
bun x changeset publish
git push origin feat/v3-rebuild --tags
```

---

## Phase 4 — Polish + GA (publish `3.0.0`)

Objectif : alignment ROADMAP ↔ Zod enums, dev harness couvre tout Tier 1, Playwright green, README v3, CHANGELOG final, bump 3.0.0 GA.

### Task 21: ROADMAP alignment check script

**Files:**
- Create: `scripts/check-roadmap-alignment.ts`
- Modify: `package.json` (ajouter script `check:roadmap`)

- [ ] **Step 1: Créer le script**

Créer `scripts/check-roadmap-alignment.ts` :

```ts
#!/usr/bin/env bun
// Compares variant enum const arrays with the ROADMAP.md matrix.
// Exits 1 if drift detected. Intended to run in CI.

import { readFileSync, existsSync } from "fs";
import {
  STICKY_VARIANTS,
  SPLIT_VARIANTS,
  CROSSFADE_VARIANTS,
  FLOW_VARIANTS,
  FLYTO_VARIANTS,
  CHARTLADDER_VARIANTS,
  GRID_VARIANTS,
  LIGHTBOX_VARIANTS,
  SEQUENCE_VARIANTS,
  EXPLORE_VARIANTS,
} from "../src/lib/core/schemas/variants";

const ROADMAP_PATH =
  process.env.VIZNEWS_ROADMAP_PATH ??
  "/Users/rmdms/Sites/Professional/vizualisation-skill-v2/ROADMAP.md";

if (!existsSync(ROADMAP_PATH)) {
  console.warn(`[check-roadmap] ROADMAP not found at ${ROADMAP_PATH} — skipping.`);
  process.exit(0);
}

const roadmap = readFileSync(ROADMAP_PATH, "utf8");

const checks: Record<string, readonly string[]> = {
  sticky: STICKY_VARIANTS,
  split: SPLIT_VARIANTS,
  crossfade: CROSSFADE_VARIANTS,
  flow: FLOW_VARIANTS,
  flyto: FLYTO_VARIANTS,
  "chart-ladder": CHARTLADDER_VARIANTS,
  grid: GRID_VARIANTS,
  lightbox: LIGHTBOX_VARIANTS,
  sequence: SEQUENCE_VARIANTS,
  explore: EXPLORE_VARIANTS,
};

let drift = 0;
for (const [primitive, variants] of Object.entries(checks)) {
  for (const v of variants) {
    if (!roadmap.includes(v)) {
      console.error(`[drift] variant "${v}" (${primitive}) not found in ROADMAP.md`);
      drift++;
    }
  }
}

if (drift > 0) {
  console.error(`[check-roadmap] ${drift} drift(s) detected.`);
  process.exit(1);
}
console.log(`[check-roadmap] ✓ all ${Object.values(checks).flat().length} variants present in ROADMAP.md`);
```

- [ ] **Step 2: Ajouter script**

Dans `package.json`, ajouter dans `"scripts"` :

```json
"check:roadmap": "bun run scripts/check-roadmap-alignment.ts"
```

- [ ] **Step 3: Run**

```bash
bun run check:roadmap
```

Expected : `✓ all 44 variants present in ROADMAP.md`. Si drift, corriger en priorité dans le fichier `variants.ts` (ROADMAP est source-de-vérité).

- [ ] **Step 4: Commit**

```bash
git add scripts/check-roadmap-alignment.ts package.json
git commit -m "$(cat <<'EOF'
chore(scripts): roadmap ↔ Zod enums drift check

Verifies each variant string from variants.ts appears somewhere
in plugin's ROADMAP.md. Run via `bun run check:roadmap`. Drift
= exit 1.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 22: Dev harness audit — every Tier 1 variant has a route

**Files:**
- Inspect: `src/routes/dev/v3/`
- Create: any missing `/dev/v3/<primitive>/[variant]` routes

- [ ] **Step 1: Inventorier ce qui existe déjà**

```bash
ls src/routes/dev/v3/
```

Attendu après Phase 2-3 :
- `sticky/[variant]`, `split/[variant]`, `crossfade/[variant]`, `grid/[variant]`,
- `lightbox/[variant]`, `flow/[variant]`, `explore/[variant]`

Chercher les manquants : `sequence/[variant]`, plus quiconque oublié.

- [ ] **Step 2: Créer les routes manquantes (Sequence minimum)**

Si `src/routes/dev/v3/sequence/[variant]/` n'existe pas, créer `+page.ts` et `+page.svelte` (même pattern que Task 8 Step 7), en utilisant :

```ts
blocks: [
  {
    type: "sequence",
    variant: params.variant,
    items: [
      { type: "dev-stub", label: "Item 1" },
      { type: "dev-stub", label: "Item 2" },
      { type: "dev-stub", label: "Item 3" },
    ],
  },
],
```

- [ ] **Step 3: Créer un index `/dev/v3/` pour naviguer**

Créer `src/routes/dev/v3/+page.svelte` :

```svelte
<script lang="ts">
  const variants = {
    sticky: ["sticky-left", "sticky-right", "sticky-center-overlay", "sticky-full-with-steps-panel"],
    split: ["static", "drag-separator", "toggle", "auto-sweep"],
    crossfade: ["fade", "cut", "wipe", "zoom"],
    flow: ["text-only", "image-top", "image-left", "image-right", "image-bottom", "image-fullbleed", "image-background-textoverlay"],
    grid: ["uniform", "featured", "masonry", "carousel"],
    lightbox: ["modal", "inline-expand", "drawer", "fullscreen-takeover"],
    sequence: ["stack", "carousel", "accordion"],
    explore: ["native-interactivity", "controls-panel", "search-bar", "drill-down-reveals", "sync-multi-viz"],
  };
</script>

<h1>viznews v3 dev harness</h1>
{#each Object.entries(variants) as [primitive, vs]}
  <section>
    <h2>{primitive}</h2>
    <ul>
      {#each vs as v}
        <li><a href="/dev/v3/{primitive}/{v}">{v}</a></li>
      {/each}
    </ul>
  </section>
{/each}
```

- [ ] **Step 4: Run full Playwright**

```bash
bunx playwright test
```

Expected : tous les contracts verts.

- [ ] **Step 5: Commit**

```bash
git add src/routes/dev/v3/
git commit -m "$(cat <<'EOF'
feat(dev-harness): complete Tier 1 variant coverage + index

Dev harness /dev/v3/ lists all primitives × variants with links.
Sequence route added. Coverage: 22 Tier 1 render-ready variants
+ 22 Tier 2+ fallback targets.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 23: README v3 rewrite

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Réécrire README**

Remplacer `README.md` intégralement :

```md
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
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "$(cat <<'EOF'
docs: README v3 with positioning cascade + migration guide

Quick-start, positioning table, variant matrix Tier 1, migration
notes v0.2.0 → v3.0.0, dev commands.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 24: GA release — `3.0.0` tag

**Files:**
- Create: `.changeset/v3-ga.md`
- Modify: `package.json` (version → `3.0.0`)
- Modify: `CHANGELOG.md` (consolidated)

- [ ] **Step 1: Exit changeset pre-mode**

```bash
bun x changeset pre exit
```

Expected : `.changeset/pre.json` deleted.

- [ ] **Step 2: Créer changeset GA**

Créer `.changeset/v3-ga.md` :

```md
---
"@rmdms/viznews": major
---

v3.0.0 GA — Rebuild complet

Consolidation des trois beta :
- beta.0 : Zod v4, DesignTokens v3, positioning cascade, validateVariants.
- beta.1 : variants Tier 1 sur 6 primitives + Flow.
- beta.2 : Explore + ExploreLegend + DWChart/Image/Markdown upgrades.

Dev harness complet. Playwright contract green. README v3. ROADMAP alignment verifié.

Consommateur plugin : `bun add @rmdms/viznews@^3.0.0`.
```

- [ ] **Step 3: Run version**

```bash
bun x changeset version
```

Expected : `package.json` version → `3.0.0`. `CHANGELOG.md` consolide les 4 entrées.

- [ ] **Step 4: Vérifier la suite complète**

```bash
bun test tests/unit
bunx playwright test
bun run check:roadmap
bun run build
```

Expected : tous verts.

- [ ] **Step 5: Commit GA**

```bash
git add .changeset/v3-ga.md package.json CHANGELOG.md
git commit -m "$(cat <<'EOF'
chore(release): 3.0.0 GA

Consolidate beta.0/beta.1/beta.2 into stable 3.0.0.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 6: (User-gated) Tag + publish GA**

> **STOP** — confirmation user pour push + publish + tag.

```bash
bun x changeset publish
git tag v3.0.0
git push origin feat/v3-rebuild --tags
```

Expected : npm `latest` pointe vers `3.0.0`. Tag `v3.0.0` pushed.

- [ ] **Step 7: (User-gated) Merge PR**

Depuis le repo, ouvrir PR `feat/v3-rebuild` → `main` via `gh pr create` (si pas déjà ouverte), puis merger après review.

- [ ] **Step 8: Notifier le plugin repo**

Vérifier que le plugin `vizualisation-skill-v2` peut maintenant :

```bash
cd /Users/rmdms/Sites/Professional/vizualisation-skill-v2
bun install  # resolves @rmdms/viznews@^3.0.0 from npm
```

Expected : install clean. Débloque plugin Tasks 21/22/25 (smoke tests + release tag).

---

## Notes d'exécution

**Commits :** chaque Task doit finir par au moins un commit. Conventional Commits + Co-Authored-By trailer Claude. Jamais `--amend`, jamais `--no-verify`.

**Beta publish :** les étapes `bun x changeset publish` sont **user-gated** — demander confirmation avant chaque appel réseau vers npm (blast radius externe).

**Branch :** tout se passe sur `feat/v3-rebuild`. Ne pas fusionner dans `main` avant Phase 4 + user approval.

**Tests :** `bun test tests/unit` doit rester vert après chaque Task. `bunx playwright test` peut être exécuté sur le subset correspondant par Task pour itération rapide ; full suite requise à Phase 4 Task 24.

**Debugging Zod v4 :** si un test Zod-related casse dans une Task ultérieure, vérifier d'abord `z.record`, `z.nativeEnum`, signatures error. Voir `src/lib/core/schemas/content.ts:55` corrigé à Task 1 comme exemple.

**Fallback render :** chaque component structural a le même pattern — check `TIER1_RENDER_READY`, fallback à `TIER1_DEFAULTS`. Ne pas dupliquer la logique ailleurs.

**Ré-exécutabilité :** chaque Task est autonome. Un subagent peut être dispatché sans lire les Tasks précédentes à condition d'avoir accès au spec + au texte complet de la Task.
