// src/lib/core/palettes.ts
export type PaletteConfig = {
  scheme: "viridis" | "okabe-ito" | "tol-bright" | "category10" | "custom";
  customColors?: string[];
  reverse?: boolean;
  steps?: number;
};

export const PALETTE_PRESETS: Record<string, string[]> = {
  viridis: ["#440154", "#3b528b", "#21918c", "#5ec962", "#fde725"],
  "okabe-ito": [
    "#000000",
    "#E69F00",
    "#56B4E9",
    "#009E73",
    "#F0E442",
    "#0072B2",
    "#D55E00",
    "#CC79A7",
  ],
  "tol-bright": [
    "#4477AA",
    "#EE6677",
    "#228833",
    "#CCBB44",
    "#66CCEE",
    "#AA3377",
    "#BBBBBB",
  ],
  category10: [
    "#1f77b4",
    "#ff7f0e",
    "#2ca02c",
    "#d62728",
    "#9467bd",
    "#8c564b",
    "#e377c2",
    "#7f7f7f",
    "#bcbd22",
    "#17becf",
  ],
};

export function paletteToColors(palette: PaletteConfig): string[] {
  if (palette.scheme === "custom") {
    if (!palette.customColors?.length) {
      throw new Error("custom palette requires customColors[]");
    }
    return palette.customColors;
  }
  const preset = PALETTE_PRESETS[palette.scheme];
  if (!preset) {
    throw new Error(`unknown palette scheme: ${palette.scheme}`);
  }
  let colors = [...preset];
  if (palette.steps && palette.steps < colors.length) {
    colors = colors.slice(0, palette.steps);
  }
  if (palette.reverse) {
    colors.reverse();
  }
  return colors;
}
