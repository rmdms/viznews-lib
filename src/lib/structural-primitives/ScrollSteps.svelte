<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onMount } from 'svelte';

  let {
    onStepChange = undefined,
    children
  }: {
    onStepChange?: (index: number) => void;
    children: Snippet;
  } = $props();

  let activeIndex = $state(0);
  let rootEl: HTMLElement | undefined = $state();
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;

  const DEBOUNCE_MS = 50;
  const THRESHOLDS = [0, 0.25, 0.5, 0.75, 1];

  function emitDebounced(index: number) {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      activeIndex = index;
      onStepChange?.(index);
    }, DEBOUNCE_MS);
  }

  onMount(() => {
    if (!rootEl) return;
    const steps = Array.from(rootEl.querySelectorAll<HTMLElement>('[data-step-index]'));
    if (steps.length === 0) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      activeIndex = steps.length - 1;
      onStepChange?.(steps.length - 1);
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length === 0) return;
        const el = visible[0].target as HTMLElement;
        const idx = Number(el.dataset.stepIndex);
        if (!Number.isNaN(idx)) emitDebounced(idx);
      },
      {
        threshold: THRESHOLDS,
        rootMargin: '-30% 0px -40% 0px'
      }
    );
    steps.forEach(s => observer.observe(s));
    return () => {
      observer.disconnect();
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  });
</script>

<section
  class="vn-scroll-steps"
  data-testid="scroll-steps-root"
  data-active-index={activeIndex}
  bind:this={rootEl}
>
  {@render children()}
</section>

<style>
  .vn-scroll-steps {
    display: flex;
    flex-direction: column;
    gap: calc(var(--vn-spacing) * 6);
    padding: calc(var(--vn-spacing) * 4) calc(var(--vn-spacing) * 2);
  }
</style>
