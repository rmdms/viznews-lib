import { buildArticlePage } from "$lib/core/build-page";
import fixture from "$lib/../fixtures/scrolly-map.json";

export const prerender = false;
export const ssr = false;

export function load() {
  return { page: buildArticlePage(fixture) };
}
