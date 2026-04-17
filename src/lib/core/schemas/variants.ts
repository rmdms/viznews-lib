import { z } from "zod";

export const STICKY_VARIANTS = [
  "sticky-left",
  "sticky-right",
  "sticky-center-overlay",
  "sticky-full-with-steps-panel",
] as const;

export const SPLIT_VARIANTS = [
  "static",
  "drag-separator",
  "toggle",
  "auto-sweep",
] as const;

export const CROSSFADE_VARIANTS = ["fade", "cut", "wipe", "zoom"] as const;

export const FLOW_VARIANTS = [
  "text-only",
  "image-top",
  "image-left",
  "image-right",
  "image-bottom",
  "image-fullbleed",
  "image-background-textoverlay",
] as const;

export const FLYTO_VARIANTS = [
  "camera-scripted",
  "reveal-layers",
  "trail",
  "markers-pop-in",
] as const;

export const CHARTLADDER_VARIANTS = [
  "cross-dissolve",
  "annotation-accumulative",
  "camera-zoom",
  "data-filter-step",
] as const;

export const GRID_VARIANTS = [
  "uniform",
  "featured",
  "masonry",
  "carousel",
] as const;

export const LIGHTBOX_VARIANTS = [
  "modal",
  "inline-expand",
  "drawer",
  "fullscreen-takeover",
] as const;

export const SEQUENCE_VARIANTS = ["stack", "carousel", "accordion"] as const;

export const EXPLORE_VARIANTS = [
  "native-interactivity",
  "controls-panel",
  "search-bar",
  "drill-down-reveals",
  "sync-multi-viz",
] as const;

export const StickyVariantSchema = z.enum(STICKY_VARIANTS);
export const SplitVariantSchema = z.enum(SPLIT_VARIANTS);
export const CrossfadeVariantSchema = z.enum(CROSSFADE_VARIANTS);
export const FlowVariantSchema = z.enum(FLOW_VARIANTS);
export const FlyToVariantSchema = z.enum(FLYTO_VARIANTS);
export const ChartLadderVariantSchema = z.enum(CHARTLADDER_VARIANTS);
export const GridVariantSchema = z.enum(GRID_VARIANTS);
export const LightboxVariantSchema = z.enum(LIGHTBOX_VARIANTS);
export const SequenceVariantSchema = z.enum(SEQUENCE_VARIANTS);
export const ExploreVariantSchema = z.enum(EXPLORE_VARIANTS);

export type StickyVariant = z.infer<typeof StickyVariantSchema>;
export type SplitVariant = z.infer<typeof SplitVariantSchema>;
export type CrossfadeVariant = z.infer<typeof CrossfadeVariantSchema>;
export type FlowVariant = z.infer<typeof FlowVariantSchema>;
export type FlyToVariant = z.infer<typeof FlyToVariantSchema>;
export type ChartLadderVariant = z.infer<typeof ChartLadderVariantSchema>;
export type GridVariant = z.infer<typeof GridVariantSchema>;
export type LightboxVariant = z.infer<typeof LightboxVariantSchema>;
export type SequenceVariant = z.infer<typeof SequenceVariantSchema>;
export type ExploreVariant = z.infer<typeof ExploreVariantSchema>;

// Tier 1 render-ready (spec §5.1 + §5.2 + §5.3)
export const TIER1_RENDER_READY = {
  sticky: [
    "sticky-left",
    "sticky-right",
    "sticky-center-overlay",
  ] as StickyVariant[],
  split: ["static", "drag-separator"] as SplitVariant[],
  crossfade: ["fade", "cut"] as CrossfadeVariant[],
  flow: [
    "text-only",
    "image-top",
    "image-left",
    "image-right",
    "image-bottom",
    "image-fullbleed",
    "image-background-textoverlay",
  ] as FlowVariant[],
  grid: ["uniform", "featured"] as GridVariant[],
  lightbox: ["modal", "inline-expand"] as LightboxVariant[],
  sequence: ["stack"] as SequenceVariant[],
  explore: ["native-interactivity"] as ExploreVariant[],
} as const;

// Tier 1 defaults per primitive — fallback target when variant is Tier 2+
export const TIER1_DEFAULTS = {
  sticky: "sticky-left" as StickyVariant,
  split: "static" as SplitVariant,
  crossfade: "fade" as CrossfadeVariant,
  flow: "text-only" as FlowVariant,
  grid: "uniform" as GridVariant,
  lightbox: "modal" as LightboxVariant,
  sequence: "stack" as SequenceVariant,
  explore: "native-interactivity" as ExploreVariant,
} as const;
