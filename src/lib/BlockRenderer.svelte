<script lang="ts">
  import type { Block } from './core/schemas/block';
  import { Sticky, ScrollSteps, Crossfade, Grid, Split, Sequence, Lightbox } from './structural-primitives';
  import { Markdown, Image, Video, DWChart, FlourishChart, MTMap } from './content-primitives';
  import { ScrollyMap } from './recipes';
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
  <Crossfade variant={block.variant} activeIndex={block.activeIndex}>
    {#each block.frames as frame, i}
      <div data-testid="crossfade-frame-{i}" data-active={i === block.activeIndex}>
        <Self block={frame} />
      </div>
    {/each}
  </Crossfade>
{:else if block.type === 'sticky'}
  <Sticky variant={block.variant} scrim={block.props?.scrim ?? 'default'}>
    {#snippet visual()}<Self block={block.visual} />{/snippet}
    {#snippet steps()}
      {#each block.steps as step}<Self block={step} />{/each}
    {/snippet}
  </Sticky>
{:else if block.type === 'grid'}
  {#if block.legend}
    {@const legendBlock = block.legend}
    <Grid variant={block.variant} columns={block.columns ?? 3} aspectRatio={block.aspectRatio ?? '4 / 3'}>
      {#snippet cells()}
        {#each block.cells as cell}<Self block={cell} />{/each}
      {/snippet}
      {#snippet legend()}<Self block={legendBlock} />{/snippet}
    </Grid>
  {:else}
    <Grid variant={block.variant} columns={block.columns ?? 3} aspectRatio={block.aspectRatio ?? '4 / 3'}>
      {#snippet cells()}
        {#each block.cells as cell}<Self block={cell} />{/each}
      {/snippet}
    </Grid>
  {/if}
{:else if block.type === 'sequence'}
  <Sequence variant={block.variant}>
    {#each block.items as item}<Self block={item} />{/each}
  </Sequence>
{:else if block.type === 'lightbox'}
  <Lightbox variant={block.variant}>
    {#snippet trigger()}<Self block={block.trigger} />{/snippet}
    {#snippet content()}<Self block={block.content} />{/snippet}
  </Lightbox>
{:else if block.type === 'split'}
  {#if block.legend}
    {@const legendBlock = block.legend}
    <Split variant={block.variant} aspectRatio={block.aspectRatio ?? '4 / 3'}>
      {#snippet left()}<Self block={block.left} />{/snippet}
      {#snippet right()}<Self block={block.right} />{/snippet}
      {#snippet legend()}<Self block={legendBlock} />{/snippet}
    </Split>
  {:else}
    <Split variant={block.variant} aspectRatio={block.aspectRatio ?? '4 / 3'}>
      {#snippet left()}<Self block={block.left} />{/snippet}
      {#snippet right()}<Self block={block.right} />{/snippet}
    </Split>
  {/if}
{:else if block.type === 'markdown'}
  <Markdown html={block.html} />
{:else if block.type === 'image'}
  <Image src={block.src} alt={block.alt} aspectRatio={block.aspectRatio} caption={block.caption} />
{:else if block.type === 'video'}
  <Video src={block.src} alt={block.alt} poster={block.poster} aspectRatio={block.aspectRatio} caption={block.caption} />
{:else if block.type === 'dw-chart'}
  <DWChart embedUrl={block.embedUrl} title={block.title} alt={block.alt} height={block.height} />
{:else if block.type === 'flourish-chart'}
  <FlourishChart embedUrl={block.embedUrl} title={block.title} alt={block.alt} height={block.height} />
{:else if block.type === 'mt-map'}
  <MTMap style={block.style} bounds={block.bounds} alt={block.alt} height={block.height} interactive={block.interactive} flyToSteps={block.flyToSteps} />
{:else if block.type === 'scrolly-map'}
  <ScrollyMap map={block.map} steps={block.steps} />
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
