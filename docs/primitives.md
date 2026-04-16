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

## Contracts not carried by phase 1 primitives

- §11.1 (DW iframe sizing), §11.3 (MT flyTo), §11.9 (ladder axis-lock), §11.11 (hover/touch-parity), §11.12 (hero responsive), §11.14 (MT lifecycle) — phase 2+.
- §11.8 (Gate 4 verification procedure) — migrates to `dataviz-verification-before-completion` skill (workstream 3), not this library.

## Phase 1 acceptance checks

- All seven primitives have at least one contract test that fails when the contract is violated.
- Playwright matrix 375/768/1440 × [no-preference, reduce] green.
- `bun test tests/unit` green (schemas, build-page, tokens).
- `bun run check` = 0 errors.
