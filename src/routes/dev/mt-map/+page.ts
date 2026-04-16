import { buildArticlePage } from "$lib/core/build-page";
import fixture from "$lib/../fixtures/mt-map.json";

export const prerender = true;
export const ssr = false;

export function load() {
  return { page: buildArticlePage(fixture) };
}
