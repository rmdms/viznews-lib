<script lang="ts">
  import type { Block } from './core/schemas/block';
  import { Sticky, ScrollSteps, Crossfade, Grid, Split, Sequence } from './structural-primitives';
  import Self from './BlockRenderer.svelte';
  let { block }: { block: Block } = $props();
</script>

{#if block.type === 'dev-stub'}
  <div
    class="vn-dev-stub"
    data-testid="dev-stub"
    style:min-height="{block.height ?? 200}px"
    style:background={block.color ?? 'color-mix(in srgb, var(--vn-color-accent) 8%, transparent)'}
  >
    <span>{block.label}</span>
  </div>
{:else if block.type === 'scroll-steps'}
  <ScrollSteps>
    {#each block.steps as step, i}
      <div data-step-index={i} data-testid="scroll-steps-step-{i}"><Self block={step} /></div>
    {/each}
  </ScrollSteps>
{:else if block.type === 'crossfade'}
  <Crossfade activeIndex={block.activeIndex}>
    {#each block.frames as frame, i}
      <div
        data-testid="crossfade-frame-{i}"
        data-active={i === block.activeIndex}
      >
        <Self block={frame} />
      </div>
    {/each}
  </Crossfade>
{:else if block.type === 'sticky'}
  <Sticky scrim={block.props?.scrim ?? 'default'}>
    {#snippet visual()}<Self block={block.visual} />{/snippet}
    {#snippet steps()}
      {#each block.steps as step}<Self block={step} />{/each}
    {/snippet}
  </Sticky>
{:else if block.type === 'grid'}
  {#if block.legend}
    {@const legendBlock = block.legend}
    <Grid columns={block.columns ?? 3} aspectRatio={block.aspectRatio ?? '4 / 3'}>
      {#snippet cells()}
        {#each block.cells as cell}<Self block={cell} />{/each}
      {/snippet}
      {#snippet legend()}<Self block={legendBlock} />{/snippet}
    </Grid>
  {:else}
    <Grid columns={block.columns ?? 3} aspectRatio={block.aspectRatio ?? '4 / 3'}>
      {#snippet cells()}
        {#each block.cells as cell}<Self block={cell} />{/each}
      {/snippet}
    </Grid>
  {/if}
{:else if block.type === 'sequence'}
  <Sequence>
    {#each block.items as item}<Self block={item} />{/each}
  </Sequence>
{:else if block.type === 'split'}
  {#if block.legend}
    {@const legendBlock = block.legend}
    <Split aspectRatio={block.aspectRatio ?? '4 / 3'}>
      {#snippet left()}<Self block={block.left} />{/snippet}
      {#snippet right()}<Self block={block.right} />{/snippet}
      {#snippet legend()}<Self block={legendBlock} />{/snippet}
    </Split>
  {:else}
    <Split aspectRatio={block.aspectRatio ?? '4 / 3'}>
      {#snippet left()}<Self block={block.left} />{/snippet}
      {#snippet right()}<Self block={block.right} />{/snippet}
    </Split>
  {/if}
{/if}

<style>
  .vn-dev-stub {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: calc(var(--vn-spacing) * 2);
    border: 1px dashed color-mix(in srgb, var(--vn-color-fg) 20%, transparent);
    color: var(--vn-color-fg);
    font-family: var(--vn-font-mono);
    font-size: 14px;
  }
</style>
