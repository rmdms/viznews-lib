<script lang="ts">
  import BlockRenderer from '$lib/BlockRenderer.svelte';
  let { data } = $props();
</script>

<svelte:head>
  <style>{data.page.cssVariables}</style>
</svelte:head>

<main>
  <header>
    <h1>{data.page.metadata.title}</h1>
    <p><small>dev harness — sticky variant</small></p>
  </header>
  {#each data.page.blocks as block}
    <BlockRenderer {block} />
  {/each}
</main>

<style>
  header { padding: 1rem; max-width: 720px; margin: 0 auto; }
  :global(:root) {
    --vn-color-bg: #fff;
    --vn-color-fg: #111;
    --vn-spacing: 8px;
  }
</style>
