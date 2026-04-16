import type { FlourishIntent } from "./intent-schema";

export type ValidationResult = { ok: boolean; missing: string[] };

export function buildFlourishEmbed(intent: FlourishIntent): string {
  const base = `https://flo.uri.sh/visualisation/${intent.visualisationId}/embed`;
  const params = new URLSearchParams();
  if (intent.autoplay) params.set("auto", "1");
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export function validateFlourishPublishable(
  intent: FlourishIntent,
): ValidationResult {
  const missing: string[] = [];
  if (!intent.visualisationId?.trim()) missing.push("visualisationId");
  if (!intent.title?.trim()) missing.push("title");
  if (!intent.alt?.trim()) missing.push("alt");
  if (!intent.source?.label?.trim()) missing.push("source.label");
  return { ok: missing.length === 0, missing };
}
