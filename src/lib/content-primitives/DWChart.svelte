<script lang="ts">
  let { embedUrl, title, alt, height = 400 }: {
    embedUrl: string; title: string; alt: string; height?: number;
  } = $props();

  let iframeHeight = $state(height);

  $effect(() => {
    const handler = (e: MessageEvent) => {
      if (typeof e.data === "object" && e.data?.["datawrapper-height"]) {
        const heights = e.data["datawrapper-height"];
        const firstKey = Object.keys(heights)[0];
        if (firstKey) iframeHeight = heights[firstKey];
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  });
</script>

<figure class="vn-dw-chart" data-testid="dw-chart-root" aria-label={alt}>
  <iframe src={embedUrl} {title} loading="lazy" scrolling="no" frameborder="0"
    style:height="{iframeHeight}px" style:width="100%" data-testid="dw-chart-iframe"></iframe>
</figure>

<style>
  .vn-dw-chart { margin: 0; }
  .vn-dw-chart iframe { border: none; display: block; }
</style>
