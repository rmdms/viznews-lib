<script lang="ts">
  import { marked } from 'marked';
  import DOMPurify from 'isomorphic-dompurify';

  let props: { html?: string; md?: string } = $props();

  const rendered = $derived.by(() => {
    if ('md' in props && props.md) {
      const parsed = marked.parse(props.md, { async: false }) as string;
      return DOMPurify.sanitize(parsed);
    }
    if ('html' in props && props.html) {
      return DOMPurify.sanitize(props.html);
    }
    return '';
  });
</script>

<figure class="vn-markdown" data-testid="markdown-root">
  {@html rendered}
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
