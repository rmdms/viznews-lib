<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    activeIndex = 0,
    children
  }: { activeIndex?: number; children: Snippet } = $props();
</script>

<div class="vn-crossfade" data-testid="crossfade-root" data-active-index={activeIndex}>
  {@render children()}
</div>

<style>
  .vn-crossfade {
    position: relative;
    display: grid;
  }
  .vn-crossfade :global(> [data-testid^="crossfade-frame-"]) {
    grid-area: 1 / 1;
    transition: opacity 300ms ease-out;
  }
  .vn-crossfade :global(> [data-testid^="crossfade-frame-"][data-active="false"]) {
    opacity: 0;
    pointer-events: none;
  }
  .vn-crossfade :global(> [data-testid^="crossfade-frame-"][data-active="true"]) {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .vn-crossfade :global(> [data-testid^="crossfade-frame-"]) {
      transition: none;
    }
  }
</style>
