<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children }: { children: Snippet } = $props();
</script>

<section class="vn-sequence" data-testid="sequence-root">
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
