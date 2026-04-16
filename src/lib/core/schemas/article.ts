import { z } from "zod";
import { DesignTokensSchema } from "./design-tokens";
import { BlockSchema } from "./block";

export const ArticleMetadataSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  byline: z.string(),
  publishedAt: z.string(),
});

export const ArticleSchema = z.object({
  slug: z.string(),
  metadata: ArticleMetadataSchema,
  tokens: DesignTokensSchema,
  blocks: z.array(BlockSchema),
});

export type Article = z.infer<typeof ArticleSchema>;
