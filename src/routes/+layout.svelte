<script lang="ts">
  import { setContext } from 'svelte';
  import { defaultTokens } from '$lib/core/design-tokens';
  import { tokensToCSSVariables } from '$lib/core/harmonize';

  let { children } = $props();
  const tokens = defaultTokens();
  setContext('viznews:tokens', tokens);
  const cssVars = tokensToCSSVariables(tokens);
</script>

<svelte:head>
  {@html `<style>:root { ${cssVars} }</style>`}
</svelte:head>

<div class="vn-root">
  {@render children()}
</div>

<style>
  :global(body) {
    margin: 0;
    background: var(--vn-color-bg);
    color: var(--vn-color-fg);
    font-family: var(--vn-font-body);
    font-size: var(--vn-font-size);
  }
  .vn-root {
    min-height: 100vh;
  }
</style>
