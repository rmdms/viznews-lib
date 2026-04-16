<script lang="ts">
  import * as maptilersdk from '@maptiler/sdk';
  import '@maptiler/sdk/dist/maptiler-sdk.css';

  let { style, bounds, alt, height = 500, interactive = true, flyToSteps }: {
    style: Record<string, unknown>;
    bounds: [number, number, number, number];
    alt: string;
    height?: number;
    interactive?: boolean;
    flyToSteps?: Array<{ center: [number, number]; zoom: number; label?: string }>;
  } = $props();

  let containerEl: HTMLDivElement | undefined = $state();
  let map: maptilersdk.Map | undefined = $state();

  export function flyTo(stepIndex: number) {
    if (!map || !flyToSteps || !flyToSteps[stepIndex]) return;
    const step = flyToSteps[stepIndex];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    map.flyTo({ center: step.center, zoom: step.zoom, duration: reducedMotion ? 0 : 1500 });
  }

  $effect(() => {
    if (!containerEl) return;
    map = new maptilersdk.Map({
      container: containerEl,
      style: style as maptilersdk.StyleSpecification,
      bounds: bounds as maptilersdk.LngLatBoundsLike,
      fitBoundsOptions: { padding: 20 },
      interactive,
      attributionControl: false,
    });
    return () => { map?.remove(); map = undefined; };
  });
</script>

<figure class="vn-mt-map" data-testid="mt-map-root"
  role={interactive ? "application" : "img"} aria-label={alt}>
  <div bind:this={containerEl} class="vn-mt-map-container"
    style:height="{height}px" data-testid="mt-map-container"></div>
</figure>

<style>
  .vn-mt-map { margin: 0; }
  .vn-mt-map-container { width: 100%; }
</style>
