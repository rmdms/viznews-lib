export const prerender = false;

import type { PageLoad } from "./$types";
import { buildArticlePage } from "$lib/core/build-page";

export const load: PageLoad = ({ params }) => {
  return {
    page: buildArticlePage({
      slug: `split-${params.variant}`,
      metadata: {
        title: `Split / ${params.variant}`,
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
          type: "split",
          variant: params.variant,
          aspectRatio: "16 / 9",
          left: { type: "dev-stub", label: "LEFT / before", color: "#b3e0da" },
          right: { type: "dev-stub", label: "RIGHT / after", color: "#f5d28b" },
        },
      ],
    }),
  };
};