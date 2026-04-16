<script lang="ts">
  let { src, alt, poster, aspectRatio, caption }: {
    src: string; alt: string; poster?: string; aspectRatio?: string; caption?: string;
  } = $props();

  let videoEl: HTMLVideoElement | undefined = $state();

  $effect(() => {
    if (!videoEl) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handle = () => {
      if (mq.matches && videoEl && !videoEl.paused) videoEl.pause();
    };
    handle();
    mq.addEventListener("change", handle);
    return () => mq.removeEventListener("change", handle);
  });
</script>

<figure class="vn-video" data-testid="video-root">
  <video bind:this={videoEl} {src} {poster} controls preload="metadata"
    aria-label={alt} style:aspect-ratio={aspectRatio} data-testid="video-player"></video>
  {#if caption}
    <figcaption data-testid="video-caption">{caption}</figcaption>
  {/if}
</figure>

<style>
  .vn-video { margin: 0; }
  .vn-video video { width: 100%; display: block; }
  .vn-video figcaption {
    font-family: var(--vn-font-body);
    font-size: 0.85em;
    color: var(--vn-color-muted);
    margin-top: calc(var(--vn-spacing) * 1);
  }
</style>
