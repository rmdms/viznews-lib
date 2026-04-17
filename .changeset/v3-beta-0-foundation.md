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
