import { z } from "zod";

export const DevStubBlockSchema = z.object({
  type: z.literal("dev-stub"),
  label: z.string(),
  height: z.number().optional(),
  color: z.string().optional(),
});

export type DevStubBlock = z.infer<typeof DevStubBlockSchema>;
