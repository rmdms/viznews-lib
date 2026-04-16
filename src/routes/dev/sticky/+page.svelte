<script lang="ts">
  import BlockRenderer from '$lib/BlockRenderer.svelte';
  let { data } = $props();
</script>

<h1>{data.page.metadata.title}</h1>
{#each data.page.blocks as block}
  <BlockRenderer {block} />
{/each}
