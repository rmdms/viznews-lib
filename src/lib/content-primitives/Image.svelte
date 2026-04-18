<script lang="ts">
  let {
    src,
    alt,
    srcset,
    sizes,
    aspectRatio,
    caption
  }: {
    src: string;
    alt: string;
    srcset?: { src: string; width: number }[];
    sizes?: string;
    aspectRatio?: string;
    caption?: string;
  } = $props();

  const srcsetAttr = $derived(
    srcset && srcset.length > 0
      ? srcset.map((s) => `${s.src} ${s.width}w`).join(", ")
      : undefined
  );
</script>

<figure class="vn-image" data-testid="image-root">
  {#if srcsetAttr}
    <picture>
      <img
        {src}
        {alt}
        srcset={srcsetAttr}
        sizes={sizes ?? "100vw"}
        loading="lazy"
        style:aspect-ratio={aspectRatio}
        data-testid="image-img"
      />
    </picture>
  {:else}
    <img
      {src}
      {alt}
      loading="lazy"
      style:aspect-ratio={aspectRatio}
      data-testid="image-img"
    />
  {/if}
  {#if caption}
    <figcaption data-testid="image-caption">{caption}</figcaption>
  {/if}
</figure>

<style>
  .vn-image { margin: 0; border-radius: var(--vn-radius, 0); overflow: hidden; }
  .vn-image img { width: 100%; height: auto; display: block; object-fit: cover; }
  .vn-image figcaption {
    font-family: var(--vn-font-body);
    font-size: 0.85em;
    color: var(--vn-color-muted);
    margin-top: calc(var(--vn-spacing) * 1);
  }
</style>
