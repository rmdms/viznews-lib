<script lang="ts">
  let { src, alt, aspectRatio, caption }: {
    src: string; alt: string; aspectRatio?: string; caption?: string;
  } = $props();
</script>

<figure class="vn-image" data-testid="image-root">
  <img {src} {alt} loading="lazy" style:aspect-ratio={aspectRatio} data-testid="image-img" />
  {#if caption}
    <figcaption data-testid="image-caption">{caption}</figcaption>
  {/if}
</figure>

<style>
  .vn-image { margin: 0; }
  .vn-image img { width: 100%; height: auto; display: block; object-fit: cover; }
  .vn-image figcaption {
    font-family: var(--vn-font-body);
    font-size: 0.85em;
    color: var(--vn-color-muted);
    margin-top: calc(var(--vn-spacing) * 1);
  }
</style>
