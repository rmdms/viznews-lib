<script lang="ts">
  import type { ExploreBlock } from '../core/schemas/explore';
  import type { ExploreVariant } from '../core/schemas/variants';
  import { TIER1_RENDER_READY, TIER1_DEFAULTS } from '../core/schemas/variants';
  import DWChart from '../content-primitives/DWChart.svelte';
  import FlourishChart from '../content-primitives/FlourishChart.svelte';
  import MTMap from '../content-primitives/MTMap.svelte';
  import ExploreLegend from './ExploreLegend.svelte';

  let {
    variant = 'native-interactivity',
    content,
    legend,
    sourceNote
  }: {
    variant?: ExploreVariant;
    content: ExploreBlock['content'];
    legend: ExploreBlock['legend'];
    sourceNote?: string;
  } = $props();

  const renderReady = $derived(
    (TIER1_RENDER_READY.explore as readonly string[]).includes(variant)
  );
  const effectiveVariant = $derived(renderReady ? variant : TIER1_DEFAULTS.explore);

  const legendMode = $derived(
    legend.render === 'auto'
      ? content.type === 'mt-map'
        ? 'lib'
        : 'native'
      : legend.render
  );
</script>

<section
  class="vn-explore vn-explore--{effectiveVariant} vn-explore--legend-{legend.position}"
  data-testid="explore-root"
  data-variant={effectiveVariant}
  data-legend-mode={legendMode}
  data-legend-position={legend.position}
>
  {#if legendMode === 'lib' && legend.position === 'top' && legend.items}
    <div class="vn-explore__legend-slot">
      <ExploreLegend items={legend.items} position="top" collapsibleOnMobile={legend.collapsibleOnMobile} />
    </div>
  {/if}

  <div class="vn-explore__content" data-testid="explore-content">
    {#if content.type === 'mt-map'}
      <MTMap
        style={content.style}
        bounds={content.bounds}
        alt={content.alt}
        height={content.height}
        interactive={content.interactive ?? true}
        flyToSteps={content.flyToSteps}
      />
    {:else if content.type === 'dw-chart'}
      <DWChart embedUrl={content.embedUrl} title={content.title} alt={content.alt} height={content.height} />
    {:else if content.type === 'flourish-chart'}
      <FlourishChart embedUrl={content.embedUrl} title={content.title} alt={content.alt} height={content.height} />
    {/if}
  </div>

  {#if legendMode === 'lib' && legend.position !== 'top' && legend.items}
    <div class="vn-explore__legend-slot vn-explore__legend-slot--{legend.position}">
      <ExploreLegend items={legend.items} position={legend.position} collapsibleOnMobile={legend.collapsibleOnMobile} />
    </div>
  {/if}

  {#if sourceNote}
    <footer class="vn-explore__source" data-testid="explore-source">{sourceNote}</footer>
  {/if}
</section>

<style>
  .vn-explore {
    position: relative;
    display: grid;
    gap: calc(var(--vn-spacing) * 2);
    padding: calc(var(--vn-spacing) * 2);
  }
  .vn-explore--legend-top { grid-template-rows: auto 1fr; }
  .vn-explore--legend-right { grid-template-columns: 1fr auto; }
  .vn-explore--legend-right .vn-explore__content { grid-column: 1; }
  .vn-explore--legend-right .vn-explore__legend-slot--right { grid-column: 2; }

  .vn-explore__source { font-size: 0.8em; color: var(--vn-color-muted); margin-top: calc(var(--vn-spacing)); }
</style>
