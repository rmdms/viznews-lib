<script lang="ts">
  import type { Block } from './core/schemas/block';
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
