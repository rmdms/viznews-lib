<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onMount } from 'svelte';

  let { trigger, content }: { trigger: Snippet; content: Snippet } = $props();

  let open = $state(false);
  let mounted = $state(false);
  let triggerEl: HTMLElement | undefined = $state();
  let dialogEl: HTMLDialogElement | undefined = $state();

  onMount(() => {
    mounted = true;
  });

  $effect(() => {
    if (open && dialogEl && !dialogEl.open) {
      dialogEl.showModal();
    }
  });

  function show() {
    open = true;
  }

  function close() {
    // Close the native dialog first to release modal focus trap,
    // then focus the trigger, then remove from DOM.
    if (dialogEl?.open) {
      dialogEl.close();
    }
    triggerEl?.focus();
    open = false;
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === 'Tab' && dialogEl) {
      const focusable = Array.from(
        dialogEl.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter(el => !el.hasAttribute('disabled'));
      if (focusable.length === 0) { e.preventDefault(); return; }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
  }
</script>

<button
  type="button"
  class="vn-lightbox__trigger"
  data-testid="lightbox-trigger"
  data-mounted={mounted}
  bind:this={triggerEl}
  onclick={show}
>
  {@render trigger()}
</button>

{#if open}
  <dialog
    class="vn-lightbox__dialog"
    data-testid="lightbox-dialog"
    bind:this={dialogEl}
    onkeydown={onKeydown}
    onclose={() => { open = false; }}
  >
    <button
      type="button"
      class="vn-lightbox__close"
      data-testid="lightbox-close"
      aria-label="Close"
      autofocus
      onclick={close}
    >×</button>
    <div data-testid="lightbox-content">{@render content()}</div>
  </dialog>
{/if}

<style>
  .vn-lightbox__trigger {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: inherit;
    font: inherit;
  }
  .vn-lightbox__dialog {
    max-width: min(90vw, 1200px);
    max-height: 90vh;
    border: none;
    border-radius: calc(var(--vn-spacing));
    padding: calc(var(--vn-spacing) * 3);
    background: var(--vn-color-bg);
    color: var(--vn-color-fg);
  }
  .vn-lightbox__dialog::backdrop {
    background: rgba(0, 0, 0, 0.6);
  }
  .vn-lightbox__close {
    position: absolute;
    top: calc(var(--vn-spacing));
    right: calc(var(--vn-spacing));
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--vn-color-fg);
  }
</style>
