<script lang="ts">
  import BlockRenderer from '$lib/BlockRenderer.svelte';
  let { data } = $props();
</script>

<main>
  <header>
    <h1>{data.page.metadata.title}</h1>
    <p><small>dev route — composition (Sticky × Crossfade visual) + Grid</small></p>
  </header>
  {#each data.page.blocks as block}<BlockRenderer {block} />{/each}
</main>

<style>header { padding: 1rem; max-width: 960px; margin: 0 auto; }</style>
