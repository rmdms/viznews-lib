<script lang="ts">
  import type { LegendItem } from '../core/schemas/explore';

  let {
    items = [],
    position = 'top',
    collapsibleOnMobile = true
  }: {
    items?: LegendItem[];
    position?: 'top' | 'right' | 'overlay';
    collapsibleOnMobile?: boolean;
  } = $props();
</script>

{#if collapsibleOnMobile}
  <details
    class="vn-legend vn-legend--{position} vn-legend--collapsible"
    data-testid="explore-legend"
    data-position={position}
  >
    <summary class="vn-legend__summary">Légende</summary>
    <ul class="vn-legend__items">
      {#each items as item}
        <li class="vn-legend__item" data-testid="legend-item">
          <span class="vn-legend__swatch vn-legend__swatch--{item.swatch ?? 'square'}" style:background={item.color}></span>
          <span class="vn-legend__label">{item.label}</span>
        </li>
      {/each}
    </ul>
  </details>
{:else}
  <div class="vn-legend vn-legend--{position}" data-testid="explore-legend" data-position={position}>
    <ul class="vn-legend__items">
      {#each items as item}
        <li class="vn-legend__item" data-testid="legend-item">
          <span class="vn-legend__swatch vn-legend__swatch--{item.swatch ?? 'square'}" style:background={item.color}></span>
          <span class="vn-legend__label">{item.label}</span>
        </li>
      {/each}
    </ul>
  </div>
{/if}

<style>
  .vn-legend { font-family: var(--vn-font-body); font-size: 0.85em; color: var(--vn-color-fg); }
  .vn-legend__summary { cursor: pointer; font-weight: 500; margin-bottom: calc(var(--vn-spacing)); }
  .vn-legend__items { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: calc(var(--vn-spacing) * 2); }
  .vn-legend__item { display: inline-flex; align-items: center; gap: calc(var(--vn-spacing) * 0.5); }
  .vn-legend__swatch { display: inline-block; width: 12px; height: 12px; background: var(--vn-color-accent); }
  .vn-legend__swatch--dot { border-radius: 50%; }
  .vn-legend__swatch--line { width: 16px; height: 2px; }
  .vn-legend--overlay {
    position: absolute; bottom: 12px; left: 12px;
    background: color-mix(in srgb, var(--vn-color-bg) 85%, transparent);
    backdrop-filter: blur(4px);
    padding: calc(var(--vn-spacing));
    border-radius: var(--vn-radius, 4px);
  }
  @media (min-width: 768px) {
    .vn-legend--collapsible { all: revert; }
    .vn-legend--collapsible > summary { display: none; }
  }
</style>
