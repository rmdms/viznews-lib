import { buildArticlePage } from "$lib/core/build-page";
import fixture from "$lib/../fixtures/lightbox.json";
export const ssr = false;
export function load() {
  return { page: buildArticlePage(fixture) };
}
