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
        `[viznews] variant "${b.variant}" on ${b.type} is Tier 2+ — not yet render-ready in v3.0.0. fallback to Tier 1 default.`,
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
  if (any.children) for (const s of any.children as Block[]) walk(s, warnings);
}

export function validateVariants(blocks: Block[]): ValidationResult {
  const warnings: string[] = [];
  for (const b of blocks) walk(b, warnings);
  return { warnings };
}
