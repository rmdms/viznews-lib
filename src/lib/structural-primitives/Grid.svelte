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
