import { z } from "zod";
import { BlockSchema } from "./block";
import type { Block } from "./block";
import { MTMapBlockSchema } from "./content";

// ScrollyStickyContentBlock

type ScrollyStickyContentBlockT = {
  type: "scrolly-sticky-content";
  visual: Block;
  steps: Block[];
  scrim?: "default" | "none";
};

export const ScrollyStickyContentBlockSchema: z.ZodType<ScrollyStickyContentBlockT> =
  z.object({
    type: z.literal("scrolly-sticky-content"),
    visual: z.lazy(() => BlockSchema),
    steps: z.array(z.lazy(() => BlockSchema)).min(1),
    scrim: z.enum(["default", "none"]).optional(),
  }) as z.ZodType<ScrollyStickyContentBlockT>;

export type ScrollyStickyContentBlock = ScrollyStickyContentBlockT;

// ChartLadderBlock

type ChartLadderBlockT = {
  type: "chart-ladder";
  frames: Block[];
  steps: Block[];
};

export const ChartLadderBlockSchema: z.ZodType<ChartLadderBlockT> = z
  .object({
    type: z.literal("chart-ladder"),
    frames: z.array(z.lazy(() => BlockSchema)).min(2),
    steps: z.array(z.lazy(() => BlockSchema)).min(2),
  })
  .refine((d) => d.frames.length === d.steps.length, {
    message: "frames.length must equal steps.length",
  }) as z.ZodType<ChartLadderBlockT>;

export type ChartLadderBlock = ChartLadderBlockT;

// GalleryCarouselBlock

type GalleryCarouselBlockT = {
  type: "gallery-carousel";
  cells: Block[];
  columns?: 2 | 3 | 4;
  aspectRatio?: string;
};

export const GalleryCarouselBlockSchema: z.ZodType<GalleryCarouselBlockT> =
  z.object({
    type: z.literal("gallery-carousel"),
    cells: z.array(z.lazy(() => BlockSchema)).min(1),
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
    aspectRatio: z
      .string()
      .regex(/^\d+\s*\/\s*\d+$/)
      .optional(),
  }) as z.ZodType<GalleryCarouselBlockT>;

export type GalleryCarouselBlock = GalleryCarouselBlockT;

// ScrollyMapBlock

const ScrollyMapMapSchema = MTMapBlockSchema.extend({
  flyToSteps: z
    .array(
      z.object({
        center: z.tuple([z.number(), z.number()]),
        zoom: z.number().min(0).max(22),
        label: z.string().optional(),
      }),
    )
    .min(1),
});

type ScrollyMapBlockT = {
  type: "scrolly-map";
  map: z.infer<typeof ScrollyMapMapSchema>;
  steps: Block[];
};

export const ScrollyMapBlockSchema: z.ZodType<ScrollyMapBlockT> = z
  .object({
    type: z.literal("scrolly-map"),
    map: ScrollyMapMapSchema,
    steps: z.array(z.lazy(() => BlockSchema)).min(1),
  })
  .refine((d) => d.map.flyToSteps.length === d.steps.length, {
    message: "map.flyToSteps.length must equal steps.length",
  }) as z.ZodType<ScrollyMapBlockT>;

export type ScrollyMapBlock = ScrollyMapBlockT;
