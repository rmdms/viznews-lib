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
