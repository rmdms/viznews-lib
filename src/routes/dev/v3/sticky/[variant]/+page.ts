export const prerender = false;

import type { PageLoad } from "./$types";
import { buildArticlePage } from "$lib/core/build-page";

export const load: PageLoad = ({ params }) => {
  const variant = params.variant;
  const article = {
    slug: `sticky-${variant}`,
    metadata: {
      title: `Sticky / ${variant}`,
      byline: "dev",
      publishedAt: "2026-04-17",
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
        type: "sticky",
        variant,
        visual: {
          type: "dev-stub",
          label: `Visual (${variant})`,
          height: 400,
          color: "#e6f4f1",
        },
        steps: [
          { type: "dev-stub", label: "Step 1 text", height: 200 },
          { type: "dev-stub", label: "Step 2 text", height: 200 },
          { type: "dev-stub", label: "Step 3 text", height: 200 },
        ],
      },
    ],
  };
  return { page: buildArticlePage(article) };
};