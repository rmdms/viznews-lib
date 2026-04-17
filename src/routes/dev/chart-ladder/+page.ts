import { buildArticlePage } from "$lib/core/build-page";
import fixture from "$lib/../fixtures/chart-ladder.json";

export const prerender = true;

export function load() {
  return { page: buildArticlePage(fixture) };
}
