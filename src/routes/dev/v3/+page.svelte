<script lang="ts">
  const variants = {
    sticky: ["sticky-left", "sticky-right", "sticky-center-overlay", "sticky-full-with-steps-panel"],
    split: ["static", "drag-separator", "toggle", "auto-sweep"],
    crossfade: ["fade", "cut", "wipe", "zoom"],
    flow: ["text-only", "image-top", "image-left", "image-right", "image-bottom", "image-fullbleed", "image-background-textoverlay"],
    grid: ["uniform", "featured", "masonry", "carousel"],
    lightbox: ["modal", "inline-expand", "drawer", "fullscreen-takeover"],
    sequence: ["stack", "carousel", "accordion"],
    explore: ["native-interactivity", "controls-panel", "search-bar", "drill-down-reveals", "sync-multi-viz"],
  };
</script>

<h1>viznews v3 dev harness</h1>
{#each Object.entries(variants) as [primitive, vs]}
  <section>
    <h2>{primitive}</h2>
    <ul>
      {#each vs as v}
        <li><a href="/dev/v3/{primitive}/{v}">{v}</a></li>
      {/each}
    </ul>
  </section>
{/each}
