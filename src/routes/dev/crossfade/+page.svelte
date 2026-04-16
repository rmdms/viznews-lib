<script lang="ts">
  import BlockRenderer from '$lib/BlockRenderer.svelte';
  import type { CrossfadeBlock } from '$lib';
  let { data } = $props();
  let currentIndex = $state(0);

  const block = $derived.by(() => {
    const blk = data.page.blocks[0];
    if (blk.type === 'crossfade') {
      return { ...blk, activeIndex: currentIndex } satisfies CrossfadeBlock;
    }
    return blk;
  });
</script>

<main>
  <header>
    <h1>{data.page.metadata.title}</h1>
    <p><small>dev route — contract §11.2</small></p>
    <button data-testid="crossfade-next" onclick={() => (currentIndex = (currentIndex + 1) % 2)}>
      Toggle frame ({currentIndex})
    </button>
  </header>
  <BlockRenderer {block} />
</main>

<style>
  header {
    padding: 1rem;
    max-width: 720px;
    margin: 0 auto;
  }
  button {
    margin: 1rem 0;
  }
</style>
