<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    columns = 3,
    aspectRatio = '4 / 3',
    cells,
    legend
  }: {
    columns?: 2 | 3 | 4;
    aspectRatio?: string;
    cells: Snippet;
    legend?: Snippet;
  } = $props();
</script>

<section class="vn-grid" data-testid="grid-root" data-columns={columns}>
  {#if legend}
    <div class="vn-grid__legend" data-testid="grid-legend">
      {@render legend()}
    </div>
  {/if}
  <div class="vn-grid__cells" style:--vn-grid-cols={columns} style:--vn-grid-ar={aspectRatio}>
    {@render cells()}
  </div>
</section>

<style>
  .vn-grid {
    display: flex;
    flex-direction: column;
    gap: calc(var(--vn-spacing) * 2);
    padding: calc(var(--vn-spacing) * 2);
  }
  .vn-grid__legend {
    font-size: 0.9em;
  }
  .vn-grid__cells {
    display: grid;
    grid-template-columns: repeat(var(--vn-grid-cols), 1fr);
    gap: calc(var(--vn-spacing) * 2);
  }
  .vn-grid__cells :global(> *) {
    aspect-ratio: var(--vn-grid-ar);
  }
  @media (max-width: 767px) {
    .vn-grid__cells {
      grid-template-columns: 1fr;
    }
  }
</style>
