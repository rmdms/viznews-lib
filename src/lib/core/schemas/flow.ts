import { z } from "zod";
import { FlowVariantSchema } from "./variants";
import { MarkdownBlockSchema, ImageBlockSchema } from "./content";
import type { MarkdownBlock, ImageBlock } from "./content";
import type { FlowVariant } from "./variants";

export type FlowBlock = {
  type: "flow";
  variant: FlowVariant;
  children: (MarkdownBlock | ImageBlock)[];
};

export const FlowBlockSchema: z.ZodType<FlowBlock> = z
  .object({
    type: z.literal("flow"),
    variant: FlowVariantSchema.default("text-only"),
    children: z.array(z.union([MarkdownBlockSchema, ImageBlockSchema])).min(1),
  })
  .refine(
    (b) =>
      !b.variant.startsWith("image-") ||
      b.children.some((c) => c.type === "image"),
    { message: "Flow variant image-* requires at least one image child" },
  ) as z.ZodType<FlowBlock>;
