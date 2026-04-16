<script lang="ts">
  const routes = [
    { path: '/dev/sticky', name: 'Sticky', note: 'Pinned visual + scrollable steps (§11.4, §11.5, §11.6, §11.7)' },
    { path: '/dev/scroll-steps', name: 'ScrollSteps', note: 'IntersectionObserver step tracker (§11.13, §11.7)' },
    { path: '/dev/crossfade', name: 'Crossfade', note: 'Frame-to-frame fade (§11.2)' },
    { path: '/dev/grid', name: 'Grid', note: 'Small-multiples grid (§11.10)' },
    { path: '/dev/split', name: 'Split', note: 'Two-pane comparison (§11.10)' },
    { path: '/dev/sequence', name: 'Sequence', note: 'Vertical flow (§11.6 Pattern B)' },
    { path: '/dev/lightbox', name: 'Lightbox', note: 'Modal overlay (§11.4, §11.7 focus trap)' },
    { path: '/dev/composition', name: 'Composition', note: 'Sticky × ScrollSteps × Crossfade integration' }
  ];
</script>

<main>
  <h1>viznews-lib — dev harness</h1>
  <p>Phase 1 — 7 structural primitives.</p>
  <ul>
    {#each routes as r}
      <li><a href={r.path}>{r.name}</a> — <small>{r.note}</small></li>
    {/each}
  </ul>
</main>

<style>
  main { max-width: 720px; margin: 2rem auto; padding: 1rem; }
  li { margin: 0.5rem 0; }
  small { color: var(--vn-color-muted); }
</style>
