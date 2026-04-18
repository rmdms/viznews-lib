export const prerender = false;

import type { PageLoad } from "./$types";
import { buildArticlePage } from "$lib/core/build-page";

export const load: PageLoad = ({ params }) => {
  const variant = params.variant;
  const article = {
    slug: `sequence-${variant}`,
    metadata: {
      title: `Sequence / ${variant}`,
      byline: "dev",
      publishedAt: "2026-04-18",
    },
    tokens: {
      locale: "fr-CH",
      palette: {
        scheme: "viridis",
        background: "#ffffff",
        foreground: "#111111",
        muted: "#666666",
        accent: "#156964",
      },
      typography: {
        bodyFontFamily: "Inter, system-ui, sans-serif",
        headingFontFamily: "Inter, system-ui, sans-serif",
        monoFontFamily: "JetBrains Mono, monospace",
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
        type: "sequence",
        variant,
        items: [
          { type: "dev-stub", label: "Item 1" },
          { type: "dev-stub", label: "Item 2" },
          { type: "dev-stub", label: "Item 3" },
        ],
      },
    ],
  };
  return { page: buildArticlePage(article) };
};
