export const prerender = false;

import type { PageLoad } from "./$types";
import { buildArticlePage } from "$lib/core/build-page";

export const load: PageLoad = ({ params }) => ({
  page: buildArticlePage({
    slug: `grid-${params.variant}`,
    metadata: {
      title: `Grid / ${params.variant}`,
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
        type: "grid",
        variant: params.variant,
        columns: 3,
        aspectRatio: "4 / 3",
        cells: [
          { type: "dev-stub", label: "Cell 1", color: "#b3e0da" },
          { type: "dev-stub", label: "Cell 2", color: "#f5d28b" },
          { type: "dev-stub", label: "Cell 3", color: "#d4b3e0" },
          { type: "dev-stub", label: "Cell 4", color: "#b3c8e0" },
          { type: "dev-stub", label: "Cell 5", color: "#e0b3b3" },
          { type: "dev-stub", label: "Cell 6", color: "#c8e0b3" },
        ],
      },
    ],
  }),
});