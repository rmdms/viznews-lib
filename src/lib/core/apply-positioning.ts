import type {
  DesignTokens,
  Positioning,
  LayoutRhythm,
  Radius,
  Shadow,
  Border,
  Overlay,
} from "./design-tokens";

export type ResolvedTokens = DesignTokens & {
  layoutRhythm: LayoutRhythm;
  radius: Radius;
  shadow: Shadow;
  border: Border;
  overlay: Overlay;
};

type Preset = {
  layoutRhythm: LayoutRhythm;
  radius: Radius;
  shadow: Shadow;
  border: Border;
};

const POSITIONING_PRESETS: Record<Positioning, Preset> = {
  "editorial-tight": {
    layoutRhythm: "tight",
    radius: "sharp",
    shadow: "subtle",
    border: "hairline",
  },
  balanced: {
    layoutRhythm: "balanced",
    radius: "soft",
    shadow: "subtle",
    border: "none",
  },
  "airy-contemplative": {
    layoutRhythm: "airy",
    radius: "rounded",
    shadow: "dramatic",
    border: "none",
  },
  "dashboard-dense": {
    layoutRhythm: "dense",
    radius: "sharp",
    shadow: "none",
    border: "hairline",
  },
};

export function applyPositioning(tokens: DesignTokens): ResolvedTokens {
  const preset = POSITIONING_PRESETS[tokens.positioning];
  return {
    ...tokens,
    layoutRhythm: tokens.layoutRhythm ?? preset.layoutRhythm,
    radius: tokens.radius ?? preset.radius,
    shadow: tokens.shadow ?? preset.shadow,
    border: tokens.border ?? preset.border,
    overlay: tokens.overlay ?? "none",
  };
}
