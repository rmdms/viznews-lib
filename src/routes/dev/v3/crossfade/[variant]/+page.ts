import type { PageLoad } from "./$types";
import { buildArticlePage } from "$lib/core/build-page";

export const load: PageLoad = ({ params }) => ({
  page: buildArticlePage({
    slug: `crossfade-${params.variant}`,
    metadata: {
      title: `Crossfade / ${params.variant}`,
      byline: "dev",
      publishedAt: "2026-04-17",
    },
    tokens: {
      locale: "fr-CH",
      palette: {
        scheme: "viridis",
        background: "#fff",
        foreground: "#111",
        muted: "#666",
        accent: "#156964",
      },
      typography: {
        bodyFontFamily: "Inter",
        headingFontFamily: "Inter",
        monoFontFamily: "Mono",
        baseSize: 17,
        scale: 1.25,
      },
      spacing: { unit: 8 },
      sourceStyle: { format: "footnote", prefix: "Source : " },
      mode: "light",
      positioning: "balanced",
    },
    blocks: [
      {
        type: "crossfade",
        variant: params.variant,
        activeIndex: 0,
        frames: [
          { type: "dev-stub", label: "Frame A", color: "#b3e0da" },
          { type: "dev-stub", label: "Frame B", color: "#f5d28b" },
        ],
      },
    ],
  }),
});
