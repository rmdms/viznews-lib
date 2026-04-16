<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    aspectRatio = '4 / 3',
    left,
    right,
    legend
  }: {
    aspectRatio?: string;
    left: Snippet;
    right: Snippet;
    legend?: Snippet;
  } = $props();
</script>

<section class="vn-split" data-testid="split-root">
  {#if legend}
    <div class="vn-split__legend" data-testid="split-legend">{@render legend()}</div>
  {/if}
  <div class="vn-split__panes" style:--vn-split-ar={aspectRatio}>
    <div class="vn-split__side" data-testid="split-left">{@render left()}</div>
    <div class="vn-split__side" data-testid="split-right">{@render right()}</div>
  </div>
</section>

<style>
  .vn-split { display: flex; flex-direction: column; gap: calc(var(--vn-spacing) * 2); padding: calc(var(--vn-spacing) * 2); }
  .vn-split__legend { font-size: 0.9em; }
  .vn-split__panes { display: grid; grid-template-columns: 1fr 1fr; gap: calc(var(--vn-spacing) * 2); }
  .vn-split__side { aspect-ratio: var(--vn-split-ar); overflow: hidden; }
  .vn-split__side :global(> *) { height: 100%; width: 100%; }
  @media (max-width: 767px) {
    .vn-split__panes { grid-template-columns: 1fr; }
  }
</style>
