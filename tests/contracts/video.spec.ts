import { test, expect } from "@playwright/test";

test.describe("Video — content rendering", () => {
  test("video has controls attribute", async ({ page }) => {
    await page.goto("/dev/video");
    const video = page.getByTestId("video-player");
    await expect(video).toBeAttached();
    const controls = await video.getAttribute("controls");
    expect(controls).not.toBeNull();
  });

  test("video has aria-label", async ({ page }) => {
    await page.goto("/dev/video");
    const video = page.getByTestId("video-player");
    const label = await video.getAttribute("aria-label");
    expect(label).toBeTruthy();
  });

  test("figcaption is rendered", async ({ page }) => {
    await page.goto("/dev/video");
    const caption = page.getByTestId("video-caption");
    await expect(caption).toBeVisible();
  });

  test("reduced-motion pauses autoplay", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/dev/video");
    const paused = await page
      .getByTestId("video-player")
      .evaluate((el: HTMLVideoElement) => el.paused);
    expect(paused).toBe(true);
    await ctx.close();
  });
});
