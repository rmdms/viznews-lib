import { z } from "zod";
import { DevStubBlockSchema, type DevStubBlock } from "./dev-stub";
import {
  StickyBlockSchema,
  ScrollStepsBlockSchema,
  CrossfadeBlockSchema,
  GridBlockSchema,
  SplitBlockSchema,
} from "./structural";

export type StickyBlock = {
  type: "sticky";
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
  aspectRatio?: string;
  left: Block;
  right: Block;
  legend?: Block;
};

export type Block =
  | DevStubBlock
  | StickyBlock
  | ScrollStepsBlock
  | CrossfadeBlock
  | GridBlock
  | SplitBlock;

export const BlockSchema: z.ZodType<Block> = z.lazy(() =>
  z.discriminatedUnion("type", [
    DevStubBlockSchema,
    StickyBlockSchema,
    ScrollStepsBlockSchema,
    CrossfadeBlockSchema,
    GridBlockSchema,
    SplitBlockSchema,
  ]),
);
