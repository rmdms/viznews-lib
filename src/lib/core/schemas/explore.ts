import { z } from "zod";
import {
  DWChartBlockSchema,
  FlourishChartBlockSchema,
  MTMapBlockSchema,
  type DWChartBlock,
  type FlourishChartBlock,
  type MTMapBlock,
} from "./content";
import { ExploreVariantSchema, type ExploreVariant } from "./variants";

const LegendItemSchema = z.object({
  label: z.string(),
  color: z.string().optional(),
  swatch: z.enum(["dot", "square", "line"]).default("square"),
});

export type LegendItem = z.infer<typeof LegendItemSchema>;

const ExploreLegendShapeSchema = z.object({
  position: z.enum(["top", "right", "overlay"]).default("top"),
  items: z.array(LegendItemSchema).optional(),
  render: z.enum(["auto", "lib", "native"]).default("auto"),
  collapsibleOnMobile: z.boolean().default(true),
});

export type ExploreLegendShape = z.infer<typeof ExploreLegendShapeSchema>;

export type ExploreBlock = {
  type: "explore";
  variant: ExploreVariant;
  content: DWChartBlock | FlourishChartBlock | MTMapBlock;
  legend: ExploreLegendShape;
  sourceNote?: string;
};

export const ExploreBlockSchema: z.ZodType<ExploreBlock> = z.object({
  type: z.literal("explore"),
  variant: ExploreVariantSchema.default("native-interactivity"),
  content: z.discriminatedUnion("type", [
    DWChartBlockSchema,
    FlourishChartBlockSchema,
    MTMapBlockSchema,
  ]),
  legend: ExploreLegendShapeSchema,
  sourceNote: z.string().optional(),
}) as z.ZodType<ExploreBlock>;
