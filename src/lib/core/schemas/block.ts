import { z } from "zod";
import { DevStubBlockSchema, type DevStubBlock } from "./dev-stub";

export type Block = DevStubBlock; // enriched by primitive tasks

export const BlockSchema: z.ZodType<Block> = z.lazy(() =>
  z.discriminatedUnion("type", [DevStubBlockSchema]),
);
