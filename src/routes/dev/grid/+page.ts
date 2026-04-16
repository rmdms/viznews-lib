import { buildArticlePage } from "$lib/core/build-page";
import fixture from "$lib/../fixtures/grid.json";
export const prerender = true;
export function load() {
  return { page: buildArticlePage(fixture) };
}
