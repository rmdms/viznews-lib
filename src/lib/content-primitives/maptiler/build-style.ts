import type { SpatialIntent } from "./intent-schema";
import { paletteToColors } from "../../core/palettes";

export type MTStyle = {
  version: 8;
  metadata?: {
    title?: string;
    subtitle?: string;
    source?: string;
    byline?: string;
    altText?: string;
    locale?: string;
  };
  bounds?: [number, number, number, number];
  sources: Record<string, unknown>;
  layers: Array<Record<string, unknown>>;
};
export type ValidationResult = { ok: boolean; missing: string[] };

function buildChoroplethLayer(
  intent: SpatialIntent,
): Array<Record<string, unknown>> {
  const colors = paletteToColors(intent.palette);
  const stepsExpr: unknown[] = ["step", ["get", "value"]];
  colors.forEach((c, i) => {
    if (i === 0) stepsExpr.push(c);
    else stepsExpr.push(i / colors.length, c);
  });
  return [
    {
      id: "choropleth-fill",
      type: "fill",
      source: "data",
      paint: {
        "fill-color": stepsExpr,
        "fill-opacity": 0.85,
        "fill-outline-color": "#ffffff",
      },
    },
  ];
}

function buildSymbolLayer(
  intent: SpatialIntent,
): Array<Record<string, unknown>> {
  const colors = paletteToColors(intent.palette);
  return [
    {
      id: "symbol-circle",
      type: "circle",
      source: "data",
      paint: {
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["get", "value"],
          0,
          2,
          100,
          30,
        ],
        "circle-color": colors[0] ?? "#1f77b4",
        "circle-opacity": 0.7,
        "circle-stroke-width": 1,
        "circle-stroke-color": "#ffffff",
      },
    },
  ];
}

function buildHeatmapLayer(
  intent: SpatialIntent,
): Array<Record<string, unknown>> {
  const colors = paletteToColors(intent.palette);
  return [
    {
      id: "heatmap",
      type: "heatmap",
      source: "data",
      paint: {
        "heatmap-weight": ["coalesce", ["get", "value"], 1],
        "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 9, 3],
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0,
          "rgba(0,0,0,0)",
          0.2,
          colors[0] ?? "#440154",
          0.4,
          colors[1] ?? "#3b528b",
          0.6,
          colors[2] ?? "#21918c",
          0.8,
          colors[3] ?? "#5ec962",
          1,
          colors[4] ?? "#fde725",
        ],
      },
    },
  ];
}

function buildDotLayer(intent: SpatialIntent): Array<Record<string, unknown>> {
  const colors = paletteToColors(intent.palette);
  return [
    {
      id: "dot",
      type: "circle",
      source: "data",
      paint: {
        "circle-radius": 3,
        "circle-color": colors[0] ?? "#1f77b4",
        "circle-opacity": 0.6,
      },
    },
  ];
}

export function buildPublishableStyle(intent: SpatialIntent): MTStyle {
  const sources: Record<string, unknown> = {};
  if ("geojsonUrl" in intent.data)
    sources.data = { type: "geojson", data: intent.data.geojsonUrl };
  else sources.data = { type: "geojson", data: intent.data.csvUrl };
  let layers: Array<Record<string, unknown>>;
  switch (intent.mapType) {
    case "choropleth":
      layers = buildChoroplethLayer(intent);
      break;
    case "proportional-symbol":
      layers = buildSymbolLayer(intent);
      break;
    case "heatmap":
      layers = buildHeatmapLayer(intent);
      break;
    case "dot":
      layers = buildDotLayer(intent);
      break;
    case "flow":
    case "interactive":
      layers = [{ id: "placeholder", type: "fill", source: "data" }];
      break;
  }
  return {
    version: 8,
    metadata: {
      title: intent.title,
      subtitle: intent.subtitle,
      source: intent.source.label,
      byline: intent.byline,
      altText: intent.altText,
      locale: intent.locale,
    },
    bounds: [
      intent.bounds.west,
      intent.bounds.south,
      intent.bounds.east,
      intent.bounds.north,
    ],
    sources,
    layers,
  };
}

export function validateSpatialPublishable(
  intent: SpatialIntent,
): ValidationResult {
  const missing: string[] = [];
  if (!intent.title?.trim()) missing.push("title");
  if (!intent.source?.label?.trim()) missing.push("source.label");
  if (!intent.altText?.trim()) missing.push("altText");
  if (!intent.locale) missing.push("locale");
  if (!intent.legend?.title?.trim()) missing.push("legend.title");
  if (!intent.bounds) missing.push("bounds");
  return { ok: missing.length === 0, missing };
}
