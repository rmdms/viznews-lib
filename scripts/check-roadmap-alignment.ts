#!/usr/bin/env bun
// Compares variant enum const arrays with the ROADMAP.md matrix.
// Exits 1 if drift detected. Intended to run in CI.

import { readFileSync, existsSync } from "fs";
import {
  STICKY_VARIANTS,
  SPLIT_VARIANTS,
  CROSSFADE_VARIANTS,
  FLOW_VARIANTS,
  FLYTO_VARIANTS,
  CHARTLADDER_VARIANTS,
  GRID_VARIANTS,
  LIGHTBOX_VARIANTS,
  SEQUENCE_VARIANTS,
  EXPLORE_VARIANTS,
} from "../src/lib/core/schemas/variants";

const ROADMAP_PATH =
  process.env.VIZNEWS_ROADMAP_PATH ??
  "/Users/rmdms/Sites/Professional/vizualisation-skill-v2/ROADMAP.md";

if (!existsSync(ROADMAP_PATH)) {
  console.warn(
    `[check-roadmap] ROADMAP not found at ${ROADMAP_PATH} — skipping.`,
  );
  process.exit(0);
}

const roadmap = readFileSync(ROADMAP_PATH, "utf8");

const checks: Record<string, readonly string[]> = {
  sticky: STICKY_VARIANTS,
  split: SPLIT_VARIANTS,
  crossfade: CROSSFADE_VARIANTS,
  flow: FLOW_VARIANTS,
  flyto: FLYTO_VARIANTS,
  "chart-ladder": CHARTLADDER_VARIANTS,
  grid: GRID_VARIANTS,
  lightbox: LIGHTBOX_VARIANTS,
  sequence: SEQUENCE_VARIANTS,
  explore: EXPLORE_VARIANTS,
};

let drift = 0;
for (const [primitive, variants] of Object.entries(checks)) {
  for (const v of variants) {
    if (!roadmap.includes(v)) {
      console.error(
        `[drift] variant "${v}" (${primitive}) not found in ROADMAP.md`,
      );
      drift++;
    }
  }
}

if (drift > 0) {
  console.error(`[check-roadmap] ${drift} drift(s) detected.`);
  process.exit(1);
}
console.log(
  `[check-roadmap] ✓ all ${Object.values(checks).flat().length} variants present in ROADMAP.md`,
);
