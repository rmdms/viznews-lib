import { z } from "zod";
import { DevStubBlockSchema, type DevStubBlock } from "./dev-stub";
import type { StickyVariant, SplitVariant } from "./variants";
import {
  StickyBlockSchema,
  ScrollStepsBlockSchema,
  CrossfadeBlockSchema,
  GridBlockSchema,
  SplitBlockSchema,
  SequenceBlockSchema,
  LightboxBlockSchema,
} from "./structural";
import {
  MarkdownBlockSchema,
  ImageBlockSchema,
  VideoBlockSchema,
  DWChartBlockSchema,
  FlourishChartBlockSchema,
  MTMapBlockSchema,
} from "./content";
import type {
  MarkdownBlock,
  ImageBlock,
  VideoBlock,
  DWChartBlock,
  FlourishChartBlock,
  MTMapBlock,
} from "./content";
import {
  ScrollyStickyContentBlockSchema,
  ChartLadderBlockSchema,
  GalleryCarouselBlockSchema,
  ScrollyMapBlockSchema,
} from "./recipes";
import type {
  ScrollyStickyContentBlock,
  ChartLadderBlock,
  GalleryCarouselBlock,
  ScrollyMapBlock,
} from "./recipes";

export type StickyBlock = {
  type: "sticky";
  variant: StickyVariant;
  visual: Block;
  steps: Block[];
  props?: { scrim?: "default" | "none" };
};

export type ScrollStepsBlock = {
  type: "scroll-steps";
  steps: Block[];
};

export type CrossfadeBlock = {
  type: "crossfade";
  activeIndex: number;
  frames: Block[];
};

export type GridBlock = {
  type: "grid";
  columns?: 2 | 3 | 4;
  aspectRatio?: string;
  cells: Block[];
  legend?: Block;
};

export type SplitBlock = {
  type: "split";
  variant: SplitVariant;
  aspectRatio?: string;
  left: Block;
  right: Block;
  legend?: Block;
};

export type SequenceBlock = { type: "sequence"; items: Block[] };

export type LightboxBlock = {
  type: "lightbox";
  trigger: Block;
  content: Block;
};

export type Block =
  | DevStubBlock
  | StickyBlock
  | ScrollStepsBlock
  | CrossfadeBlock
  | GridBlock
  | SplitBlock
  | SequenceBlock
  | LightboxBlock
  | MarkdownBlock
  | ImageBlock
  | VideoBlock
  | DWChartBlock
  | FlourishChartBlock
  | MTMapBlock
  | ScrollyStickyContentBlock
  | ChartLadderBlock
  | GalleryCarouselBlock
  | ScrollyMapBlock;

export const BlockSchema: z.ZodType<Block> = z.lazy(() =>
  z.union([
    DevStubBlockSchema,
    StickyBlockSchema,
    ScrollStepsBlockSchema,
    CrossfadeBlockSchema,
    GridBlockSchema,
    SplitBlockSchema,
    SequenceBlockSchema,
    LightboxBlockSchema,
    MarkdownBlockSchema,
    ImageBlockSchema,
    VideoBlockSchema,
    DWChartBlockSchema,
    FlourishChartBlockSchema,
    MTMapBlockSchema,
    ScrollyStickyContentBlockSchema,
    ChartLadderBlockSchema,
    GalleryCarouselBlockSchema,
    ScrollyMapBlockSchema,
  ]),
);
