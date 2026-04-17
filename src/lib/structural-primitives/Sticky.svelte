<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { StickyVariant } from '../core/schemas/variants';
  import { TIER1_RENDER_READY, TIER1_DEFAULTS } from '../core/schemas/variants';

  let {
    variant = 'sticky-left',
    scrim = 'default',
    visual,
    steps
  }: {
    variant?: StickyVariant;
    scrim?: 'default' | 'none';
    visual: Snippet;
    steps: Snippet;
  } = $props();

  const renderReady = $derived(
    (TIER1_RENDER_READY.sticky as readonly string[]).includes(variant)
  );
  const effectiveVariant = $derived(renderReady ? variant : TIER1_DEFAULTS.sticky);

  if (scrim === 'none' && import.meta.env.DEV) {
    console.warn(
      '[viznews/Sticky] scrim="none" disables §11.5 readability-over-sticky contrast protection.'
    );
  }
</script>

<section
  class="vn-sticky vn-sticky--{effectiveVariant}"
  data-testid="sticky-root"
  data-variant={effectiveVariant}
>
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
    .vn-sticky--sticky-left {
      grid-template-columns: 1fr 1fr;
    }
    .vn-sticky--sticky-right {
      grid-template-columns: 1fr 1fr;
    }
    .vn-sticky--sticky-right .vn-sticky__visual {
      order: 2;
    }
    .vn-sticky--sticky-right .vn-sticky__steps {
      order: 1;
    }
    .vn-sticky--sticky-center-overlay {
      grid-template-columns: 1fr;
    }
    .vn-sticky--sticky-center-overlay .vn-sticky__visual {
      grid-area: 1 / 1;
    }
    .vn-sticky--sticky-center-overlay .vn-sticky__steps {
      grid-area: 1 / 1;
      z-index: 2;
      pointer-events: none;
    }
    .vn-sticky--sticky-center-overlay .vn-sticky__steps :global(> *) {
      pointer-events: auto;
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
    gap: var(--vn-layout-rhythm-gap, calc(var(--vn-spacing) * 6));
    padding: 40vh calc(var(--vn-spacing) * 2);
    z-index: 1;
  }

  .vn-sticky__steps--scrim :global(> *) {
    background: color-mix(in srgb, var(--vn-color-bg) 92%, transparent);
    backdrop-filter: blur(4px);
    padding: calc(var(--vn-spacing) * 2);
    border-radius: var(--vn-radius, calc(var(--vn-spacing)));
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
