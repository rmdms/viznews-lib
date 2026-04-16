import type { EditorialIntent } from "./intent-schema";
import { paletteToColors } from "../../core/palettes";

export type DWPublishableConfig = {
  type: string;
  title: string;
  language: string;
  metadata: {
    describe: {
      intro?: string;
      "source-name": string;
      "source-url"?: string;
      byline?: string;
    };
    visualize: Record<string, unknown>;
    annotate: { notes?: string };
    publish: { "embed-width"?: number };
  };
  data: string;
};

export type ValidationResult = { ok: boolean; missing: string[] };

export function buildPublishableConfig(
  intent: EditorialIntent,
): DWPublishableConfig {
  const visualize: Record<string, unknown> = {
    colors: paletteToColors(intent.palette),
  };
  if (intent.annotations?.length) {
    visualize["text-annotations"] = intent.annotations.map((a) => ({
      x: a.x,
      y: a.y,
      text: a.text,
      align: "tl",
      bold: false,
    }));
  }
  if (intent.yAxisLabel) visualize["y-axis-label"] = intent.yAxisLabel;
  if (intent.xAxisLabel) visualize["x-axis-label"] = intent.xAxisLabel;

  return {
    type: intent.chartType,
    title: intent.title,
    language: intent.locale,
    metadata: {
      describe: {
        intro: intent.subtitle,
        "source-name": intent.source.label,
        "source-url": intent.source.url,
        byline: intent.byline,
      },
      visualize,
      annotate: { notes: intent.notes },
      publish: {},
    },
    data: intent.data.csv,
  };
}

export function validatePublishable(intent: EditorialIntent): ValidationResult {
  const missing: string[] = [];
  if (!intent.title?.trim()) missing.push("title");
  if (!intent.source?.label?.trim()) missing.push("source.label");
  if (!intent.data?.csv?.trim()) missing.push("data.csv");
  if (!intent.altText?.trim()) missing.push("altText");
  if (!intent.locale) missing.push("locale");
  if (!intent.palette) missing.push("palette");
  return { ok: missing.length === 0, missing };
}
