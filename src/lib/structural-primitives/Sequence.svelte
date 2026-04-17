<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { SequenceVariant } from '../core/schemas/variants';
  import { TIER1_RENDER_READY, TIER1_DEFAULTS } from '../core/schemas/variants';

  let {
    variant = 'stack',
    children
  }: { variant?: SequenceVariant; children: Snippet } = $props();

  const renderReady = $derived(
    (TIER1_RENDER_READY.sequence as readonly string[]).includes(variant)
  );
  const effectiveVariant = $derived(renderReady ? variant : TIER1_DEFAULTS.sequence);
</script>

<section
  class="vn-sequence vn-sequence--{effectiveVariant}"
  data-testid="sequence-root"
  data-variant={effectiveVariant}
>
  {@render children()}
</section>

<style>
  .vn-sequence {
    display: flex;
    flex-direction: column;
    gap: calc(var(--vn-spacing) * 4);
    padding:
      env(safe-area-inset-top, 0)
      calc(var(--vn-spacing) * 2)
      env(safe-area-inset-bottom, 0)
      calc(var(--vn-spacing) * 2);
  }
  .vn-sequence :global(> *) {
    width: 100%;
    max-width: 100%;
  }
</style>
