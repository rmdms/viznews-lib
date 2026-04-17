<script lang="ts">
  import type { FlowBlock } from '../core/schemas/flow';
  import type { FlowVariant } from '../core/schemas/variants';
  import { TIER1_RENDER_READY, TIER1_DEFAULTS } from '../core/schemas/variants';
  import Markdown from '../content-primitives/Markdown.svelte';
  import Image from '../content-primitives/Image.svelte';

  let {
    variant = 'text-only',
    children: items = []
  }: {
    variant?: FlowVariant;
    children?: FlowBlock['children'];
  } = $props();

  const renderReady = $derived(
    (TIER1_RENDER_READY.flow as readonly string[]).includes(variant)
  );
  const effectiveVariant = $derived(renderReady ? variant : TIER1_DEFAULTS.flow);

  const isPaired = $derived(
    effectiveVariant === 'image-left' ||
    effectiveVariant === 'image-right' ||
    effectiveVariant === 'image-top' ||
    effectiveVariant === 'image-bottom'
  );

  const firstImage = $derived(items.find((c) => c.type === 'image'));
  const textChildren = $derived(items.filter((c) => c.type === 'markdown'));
</script>

{#if effectiveVariant === 'image-background-textoverlay' && firstImage}
  <section
    class="vn-flow vn-flow--{effectiveVariant}"
    data-testid="flow-root"
    data-variant={effectiveVariant}
    style:background-image="url({firstImage.src})"
    aria-label={firstImage.alt}
  >
    <div class="vn-flow__overlay">
      {#each textChildren as child}
        <Markdown html={child.html} />
      {/each}
    </div>
  </section>
{:else if effectiveVariant === 'image-fullbleed'}
  <section class="vn-flow vn-flow--{effectiveVariant}" data-testid="flow-root" data-variant={effectiveVariant}>
    {#each items as child}
      {#if child.type === 'image'}
        <Image src={child.src} alt={child.alt} aspectRatio={child.aspectRatio} caption={child.caption} />
      {:else}
        <div class="vn-flow__text"><Markdown html={child.html} /></div>
      {/if}
    {/each}
  </section>
{:else}
  <section class="vn-flow vn-flow--{effectiveVariant}" data-testid="flow-root" data-variant={effectiveVariant}>
    {#each items as child}
      {#if child.type === 'image'}
        <div class="vn-flow__image"><Image src={child.src} alt={child.alt} aspectRatio={child.aspectRatio} caption={child.caption} /></div>
      {:else}
        <div class="vn-flow__text"><Markdown html={child.html} /></div>
      {/if}
    {/each}
  </section>
{/if}

<style>
  .vn-flow {
    display: grid;
    gap: var(--vn-layout-rhythm-gap, calc(var(--vn-spacing) * 4));
    padding: calc(var(--vn-spacing) * 2);
  }
  .vn-flow--text-only { grid-template-columns: 1fr; max-width: 640px; margin: 0 auto; }

  .vn-flow--image-top,
  .vn-flow--image-bottom { grid-template-columns: 1fr; }

  .vn-flow--image-left { grid-template-columns: 1fr 1fr; }
  .vn-flow--image-left .vn-flow__image { grid-column: 1; grid-row: 1; }
  .vn-flow--image-left .vn-flow__text { grid-column: 2; grid-row: 1; }

  .vn-flow--image-right { grid-template-columns: 1fr 1fr; }
  .vn-flow--image-right .vn-flow__text { grid-column: 1; grid-row: 1; }
  .vn-flow--image-right .vn-flow__image { grid-column: 2; grid-row: 1; }

  .vn-flow--image-bottom .vn-flow__text { order: 1; }
  .vn-flow--image-bottom .vn-flow__image { order: 2; }

  .vn-flow--image-fullbleed { padding: 0; }
  .vn-flow--image-fullbleed :global(.vn-image img) { width: 100vw; margin-left: calc(50% - 50vw); }

  .vn-flow--image-background-textoverlay {
    position: relative;
    min-height: 60vh;
    background-size: cover;
    background-position: center;
    display: grid;
    place-items: center;
    padding: 0;
  }
  .vn-flow--image-background-textoverlay::before {
    content: "";
    position: absolute; inset: 0;
    background: var(--vn-overlay, rgba(0,0,0,0.4));
  }
  .vn-flow__overlay {
    position: relative;
    color: white;
    max-width: 600px;
    padding: calc(var(--vn-spacing) * 3);
  }

  @media (max-width: 767px) {
    .vn-flow--image-left,
    .vn-flow--image-right { grid-template-columns: 1fr; }
    .vn-flow--image-left .vn-flow__image,
    .vn-flow--image-left .vn-flow__text,
    .vn-flow--image-right .vn-flow__image,
    .vn-flow--image-right .vn-flow__text {
      grid-column: 1; grid-row: auto;
    }
  }
</style>
