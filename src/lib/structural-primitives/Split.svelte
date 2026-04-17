<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { SplitVariant } from '../core/schemas/variants';
  import { TIER1_RENDER_READY, TIER1_DEFAULTS } from '../core/schemas/variants';

  let {
    variant = 'static',
    aspectRatio = '4 / 3',
    left,
    right,
    legend
  }: {
    variant?: SplitVariant;
    aspectRatio?: string;
    left: Snippet;
    right: Snippet;
    legend?: Snippet;
  } = $props();

  const renderReady = $derived(
    (TIER1_RENDER_READY.split as readonly string[]).includes(variant)
  );
  const effectiveVariant = $derived(renderReady ? variant : TIER1_DEFAULTS.split);

  let separator = $state(50); // percent
  let panesEl: HTMLDivElement;

  function onPointerDown(e: PointerEvent) {
    if (effectiveVariant !== 'drag-separator') return;
    e.preventDefault();
    const onMove = (ev: PointerEvent) => {
      if (!panesEl) return;
      const rect = panesEl.getBoundingClientRect();
      const pct = Math.max(10, Math.min(90, ((ev.clientX - rect.left) / rect.width) * 100));
      separator = pct;
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }
</script>

<section class="vn-split vn-split--{effectiveVariant}" data-testid="split-root" data-variant={effectiveVariant}>
  {#if legend}
    <div class="vn-split__legend" data-testid="split-legend">{@render legend()}</div>
  {/if}
  <div
    bind:this={panesEl}
    class="vn-split__panes"
    style:--vn-split-ar={aspectRatio}
    style:--vn-split-sep="{separator}%"
  >
    <div class="vn-split__side vn-split__side--left" data-testid="split-left">{@render left()}</div>
    <div class="vn-split__side vn-split__side--right" data-testid="split-right">{@render right()}</div>
    {#if effectiveVariant === 'drag-separator'}
      <button
        type="button"
        class="vn-split__handle"
        data-testid="split-handle"
        aria-label="Drag separator"
        aria-valuemin="10"
        aria-valuemax="90"
        aria-valuenow={separator}
        onpointerdown={onPointerDown}
      ></button>
    {/if}
  </div>
</section>

<style>
  .vn-split { display: flex; flex-direction: column; gap: calc(var(--vn-spacing) * 2); padding: calc(var(--vn-spacing) * 2); }
  .vn-split__legend { font-size: 0.9em; }

  .vn-split__panes {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: calc(var(--vn-spacing) * 2);
  }

  .vn-split--drag-separator .vn-split__panes {
    display: block;
  }
  .vn-split--drag-separator .vn-split__side {
    position: absolute; top: 0; left: 0;
    aspect-ratio: var(--vn-split-ar);
    width: 100%; height: auto;
    overflow: hidden;
  }
  .vn-split--drag-separator .vn-split__side--left {
    clip-path: inset(0 calc(100% - var(--vn-split-sep)) 0 0);
  }
  .vn-split--drag-separator .vn-split__side--right {
    clip-path: inset(0 0 0 var(--vn-split-sep));
  }
  .vn-split__handle {
    position: absolute;
    top: 0; bottom: 0;
    left: var(--vn-split-sep);
    width: 4px;
    transform: translateX(-50%);
    background: var(--vn-color-accent);
    border: none;
    cursor: ew-resize;
    touch-action: none;
    z-index: 2;
  }

  .vn-split__side { aspect-ratio: var(--vn-split-ar); overflow: hidden; }
  .vn-split__side :global(> *) { height: 100%; width: 100%; }

  @media (max-width: 767px) {
    .vn-split--static .vn-split__panes { grid-template-columns: 1fr; }
  }
</style>
