<script lang="ts">
  import type { Block } from '../core/schemas/block';
  import MTMap from '../content-primitives/MTMap.svelte';
  import BlockRenderer from '../BlockRenderer.svelte';

  let { map, steps }: {
    map: {
      type: "mt-map";
      style: Record<string, unknown>;
      bounds: [number, number, number, number];
      alt: string;
      height?: number;
      interactive?: boolean;
      flyToSteps: Array<{ center: [number, number]; zoom: number; label?: string }>;
    };
    steps: Block[];
  } = $props();

  let mapRef: MTMap | undefined = $state();
  let activeIndex = $state(0);

  function handleIntersection(entries: IntersectionObserverEntry[]) {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const idx = Number(entry.target.getAttribute('data-step-index'));
        if (!Number.isNaN(idx)) activeIndex = idx;
      }
    }
  }

  let stepsEl: HTMLDivElement | undefined = $state();

  $effect(() => {
    if (!stepsEl) return;
    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: '-30% 0px -50% 0px',
      threshold: 0,
    });
    const stepEls = stepsEl.querySelectorAll('[data-step-index]');
    stepEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  });

  $effect(() => {
    mapRef?.flyTo(activeIndex);
  });
</script>

<section class="vn-scrolly-map" data-testid="scrolly-map-root">
  <div class="vn-scrolly-map__visual" data-testid="scrolly-map-visual">
    <MTMap
      bind:this={mapRef}
      style={map.style}
      bounds={map.bounds}
      alt={map.alt}
      height={map.height}
      interactive={map.interactive}
      flyToSteps={map.flyToSteps}
    />
  </div>
  <div class="vn-scrolly-map__steps" data-testid="scrolly-map-steps" bind:this={stepsEl}>
    {#each steps as step, i}
      <div data-step-index={i} data-testid="scrolly-map-step-{i}" class="vn-scrolly-map__step"
        class:vn-scrolly-map__step--active={i === activeIndex}>
        <BlockRenderer block={step} />
      </div>
    {/each}
  </div>
</section>

<style>
  .vn-scrolly-map {
    position: relative;
    display: grid;
    grid-template-columns: 1fr;
  }
  @media (min-width: 768px) {
    .vn-scrolly-map { grid-template-columns: 1fr 1fr; }
  }
  .vn-scrolly-map__visual {
    position: sticky;
    top: 0;
    height: 100vh;
    z-index: 0;
  }
  .vn-scrolly-map__steps {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: calc(var(--vn-spacing) * 6);
    padding: 40vh calc(var(--vn-spacing) * 2);
    z-index: 1;
  }
  .vn-scrolly-map__step {
    background: color-mix(in srgb, var(--vn-color-bg) 92%, transparent);
    backdrop-filter: blur(4px);
    padding: calc(var(--vn-spacing) * 2);
    border-radius: calc(var(--vn-spacing));
  }
  @media (max-width: 767px) {
    .vn-scrolly-map { display: block; }
    .vn-scrolly-map__visual { height: 60vh; z-index: 2; }
    .vn-scrolly-map__steps { padding: calc(var(--vn-spacing) * 4) calc(var(--vn-spacing) * 2); }
  }
</style>
