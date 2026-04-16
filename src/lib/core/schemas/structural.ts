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
