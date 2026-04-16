<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    scrim = 'default',
    visual,
    steps
  }: {
    scrim?: 'default' | 'none';
    visual: Snippet;
    steps: Snippet;
  } = $props();

  if (scrim === 'none' && import.meta.env.DEV) {
    console.warn(
      '[viznews/Sticky] scrim="none" disables §11.5 readability-over-sticky contrast protection.'
    );
  }
</script>

<section class="vn-sticky" data-testid="sticky-root">
  <div class="vn-sticky__visual" data-testid="sticky-visual">
    {@render visual()}
  </div>
  <div
    class="vn-sticky__steps"
    data-testid="sticky-steps"
    class:vn-sticky__steps--scrim={scrim === 'default'}
  >
    {@render steps()}
  </div>
</section>

<style>
  .vn-sticky {
    position: relative;
    display: grid;
    grid-template-columns: 1fr;
  }
  @media (min-width: 768px) {
    .vn-sticky {
      grid-template-columns: 1fr 1fr;
    }
  }

  .vn-sticky__visual {
    position: sticky;
    top: 0;
    height: 100vh;
    display: grid;
    place-items: center;
    z-index: 0;
  }

  .vn-sticky__steps {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: calc(var(--vn-spacing) * 6);
    padding: 40vh calc(var(--vn-spacing) * 2);
    z-index: 1;
  }

  .vn-sticky__steps--scrim :global(> *) {
    background: color-mix(in srgb, var(--vn-color-bg) 92%, transparent);
    backdrop-filter: blur(4px);
    padding: calc(var(--vn-spacing) * 2);
    border-radius: calc(var(--vn-spacing));
  }

  @media (max-width: 767px) {
    .vn-sticky {
      display: block;
    }
    .vn-sticky__visual {
      height: 60vh;
      z-index: 2;
    }
    .vn-sticky__steps {
      padding: calc(var(--vn-spacing) * 4) calc(var(--vn-spacing) * 2);
    }
  }
</style>
