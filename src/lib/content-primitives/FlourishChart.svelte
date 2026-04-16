<script lang="ts">
  let { embedUrl, title, alt, height = 400 }: {
    embedUrl: string; title: string; alt: string; height?: number;
  } = $props();

  let iframeHeight = $state(height);

  $effect(() => {
    const handler = (e: MessageEvent) => {
      if (typeof e.data === "object" && e.data?.sender === "Flourish" &&
          e.data?.method === "resize" && typeof e.data?.height === "number") {
        iframeHeight = e.data.height;
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  });
</script>

<figure class="vn-flourish-chart" data-testid="flourish-chart-root" aria-label={alt}>
  <iframe src={embedUrl} {title} loading="lazy" scrolling="no" frameborder="0"
    sandbox="allow-same-origin allow-forms allow-scripts allow-downloads allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
    style:height="{iframeHeight}px" style:width="100%" data-testid="flourish-chart-iframe"></iframe>
</figure>

<style>
  .vn-flourish-chart { margin: 0; }
  .vn-flourish-chart iframe { border: none; display: block; }
</style>
