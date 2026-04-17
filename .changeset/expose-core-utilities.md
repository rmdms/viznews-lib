---
"@rmdms/viznews": minor
---

Expose core utilities from the root entry: `buildArticlePage`, `expandRecipes`, `tokensToCSSVariables`. These were previously only available by deep import, which is blocked by the `exports` map. Consumers can now build a runnable article page without re-implementing recipe expansion or CSS variable synthesis.
