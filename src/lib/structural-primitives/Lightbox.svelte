<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { LightboxVariant } from '../core/schemas/variants';
  import { TIER1_RENDER_READY, TIER1_DEFAULTS } from '../core/schemas/variants';

  let {
    variant = 'modal',
    trigger,
    content
  }: { variant?: LightboxVariant; trigger: Snippet; content: Snippet } = $props();

  const renderReady = $derived(
    (TIER1_RENDER_READY.lightbox as readonly string[]).includes(variant)
  );
  const effectiveVariant = $derived(renderReady ? variant : TIER1_DEFAULTS.lightbox);

  let open = $state(false);
  function toggle() { open = !open; }
</script>

<div class="vn-lightbox vn-lightbox--{effectiveVariant}" data-testid="lightbox-root" data-variant={effectiveVariant}>
  <button type="button" class="vn-lightbox__trigger" data-testid="lightbox-trigger" aria-expanded={open} onclick={toggle}>
    {@render trigger()}
  </button>

  {#if effectiveVariant === 'modal' && open}
    <div
      class="vn-lightbox__modal"
      role="dialog"
      aria-modal="true"
      data-testid="lightbox-modal"
    >
      <button type="button" class="vn-lightbox__close" data-testid="lightbox-close" onclick={toggle} aria-label="Close">×</button>
      <div class="vn-lightbox__content">{@render content()}</div>
    </div>
  {:else if effectiveVariant === 'inline-expand'}
    <div
      class="vn-lightbox__inline"
      data-testid="lightbox-inline"
      aria-hidden={!open}
      data-open={open}
    >
      {@render content()}
    </div>
  {/if}
</div>

<style>
  .vn-lightbox__trigger { all: unset; cursor: pointer; }
  .vn-lightbox__modal {
    position: fixed; inset: 0; background: rgba(0,0,0,0.7);
    display: grid; place-items: center; z-index: 100;
  }
  .vn-lightbox__close {
    position: absolute; top: 1rem; right: 1rem;
    background: transparent; border: none; color: white; font-size: 2rem; cursor: pointer;
  }
  .vn-lightbox__content { max-width: 90vw; max-height: 90vh; overflow: auto; }

  .vn-lightbox__inline {
    max-height: 0; overflow: hidden;
    transition: max-height 300ms ease;
  }
  .vn-lightbox__inline[data-open="true"] { max-height: 80vh; }
</style>
