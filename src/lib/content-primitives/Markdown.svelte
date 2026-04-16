<script lang="ts">
  let { html }: { html: string } = $props();
</script>

<figure class="vn-markdown" data-testid="markdown-root">
  {@html html}
</figure>

<style>
  .vn-markdown {
    margin: 0;
    font-family: var(--vn-font-body);
    color: var(--vn-color-fg);
    line-height: 1.6;
  }
  .vn-markdown :global(h1),
  .vn-markdown :global(h2),
  .vn-markdown :global(h3),
  .vn-markdown :global(h4),
  .vn-markdown :global(h5),
  .vn-markdown :global(h6) {
    font-family: var(--vn-font-heading);
    margin-top: calc(var(--vn-spacing) * 3);
    margin-bottom: calc(var(--vn-spacing) * 1);
  }
  .vn-markdown :global(p) {
    margin-top: 0;
    margin-bottom: calc(var(--vn-spacing) * 2);
  }
  .vn-markdown :global(a) {
    color: var(--vn-color-accent);
  }
</style>
