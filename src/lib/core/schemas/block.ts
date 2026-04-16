import { z } from "zod";
import { DevStubBlockSchema, type DevStubBlock } from "./dev-stub";
import { StickyBlockSchema } from "./structural";

export type StickyBlock = {
  type: "sticky";
  visual: Block;
  steps: Block[];
  props?: { scrim?: "default" | "none" };
};

export type Block = DevStubBlock | StickyBlock;

export const BlockSchema: z.ZodType<Block> = z.lazy(() =>
  z.discriminatedUnion("type", [DevStubBlockSchema, StickyBlockSchema]),
);
