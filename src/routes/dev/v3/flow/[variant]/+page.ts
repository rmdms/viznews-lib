export const prerender = false;

import type { PageLoad } from "./$types";
import { buildArticlePage } from "$lib/core/build-page";

export const load: PageLoad = ({ params }) => {
  const hasImage = params.variant !== "text-only";
  const children: any[] = [
    {
      type: "markdown",
      html: "<h2>Titre de section</h2><p>Un paragraphe de texte qui donne du contexte au lecteur.</p>",
    },
  ];
  if (hasImage) {
    children.push({
      type: "image",
      src: "https://picsum.photos/800/600",
      alt: "illustration",
      aspectRatio: "4 / 3",
    });
  }
  return {
    page: buildArticlePage({
      slug: `flow-${params.variant}`,
      metadata: {
        title: `Flow / ${params.variant}`,
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
      blocks: [{ type: "flow", variant: params.variant, children }],
    }),
  };
};