import { z } from "zod";
import { BlockSchema } from "./block";
import type { Block } from "./block";

export const StickyPropsSchema = z.object({
  scrim: z.enum(["default", "none"]).default("default"),
});

type StickyBlockT = {
  type: "sticky";
  visual: Block;
  steps: Block[];
  props?: { scrim?: "default" | "none" };
};

export const StickyBlockSchema: z.ZodType<StickyBlockT> = z.object({
  type: z.literal("sticky"),
  visual: z.lazy(() => BlockSchema),
  steps: z.array(z.lazy(() => BlockSchema)),
  props: StickyPropsSchema.optional(),
}) as z.ZodType<StickyBlockT>;

type ScrollStepsBlockT = { type: "scroll-steps"; steps: Block[] };

export const ScrollStepsBlockSchema: z.ZodType<ScrollStepsBlockT> = z.object({
  type: z.literal("scroll-steps"),
  steps: z.array(z.lazy(() => BlockSchema)),
}) as z.ZodType<ScrollStepsBlockT>;

type CrossfadeBlockT = {
  type: "crossfade";
  activeIndex: number;
  frames: Block[];
};

export const CrossfadeBlockSchema: z.ZodType<CrossfadeBlockT> = z.object({
  type: z.literal("crossfade"),
  activeIndex: z.number().int().min(0),
  frames: z.array(z.lazy(() => BlockSchema)).min(2),
}) as z.ZodType<CrossfadeBlockT>;

type GridBlockT = {
  type: "grid";
  columns?: 2 | 3 | 4;
  aspectRatio?: string;
  cells: Block[];
  legend?: Block;
};

export const GridBlockSchema: z.ZodType<GridBlockT> = z.object({
  type: z.literal("grid"),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
  aspectRatio: z
    .string()
    .regex(/^\d+\s*\/\s*\d+$/)
    .optional(),
  cells: z.array(z.lazy(() => BlockSchema)).min(1),
  legend: z.lazy(() => BlockSchema).optional(),
}) as z.ZodType<GridBlockT>;
