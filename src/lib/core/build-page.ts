import { ArticleSchema, type Article } from "./schemas/article";
import type { Block } from "./schemas/block";
import { tokensToCSSVariables } from "./harmonize";
import { expandRecipes } from "./expand-recipes";

export interface ArticlePageData {
  slug: string;
  metadata: Article["metadata"];
  blocks: Block[];
  cssVariables: string;
}

export function buildArticlePage(spec: unknown): ArticlePageData {
  const article = ArticleSchema.parse(spec);
  const blocks = expandRecipes(article.blocks);
  return {
    slug: article.slug,
    metadata: article.metadata,
    blocks,
    cssVariables: tokensToCSSVariables(article.tokens),
  };
}
