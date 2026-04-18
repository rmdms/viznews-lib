export const prerender = false;

import type { PageLoad } from "./$types";
import { buildArticlePage } from "$lib/core/build-page";

export const load: PageLoad = ({ params }) => ({
  page: buildArticlePage({
    slug: `explore-${params.variant}`,
    metadata: {
      title: `Explore / ${params.variant}`,
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
        type: "explore",
        variant: params.variant,
        content: {
          type: "dw-chart",
          embedUrl: "https://datawrapper.dwcdn.net/Uyxgy/2/",
          title: "Sample chart",
          alt: "sample",
          height: 400,
        },
        legend: {
          position: "top",
          render: "native",
          collapsibleOnMobile: true,
        },
        sourceNote: "Source : Datawrapper demo",
      },
    ],
  }),
});
