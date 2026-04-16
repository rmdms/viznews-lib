import { test, expect } from "@playwright/test";

test.describe("Crossfade — §11.2 fade timing & both-nodes-present", () => {
  test("both frames remain in DOM during transition (no display:none swap)", async ({
    page,
  }) => {
    await page.goto("/dev/crossfade");
    await expect(page.getByTestId("crossfade-frame-0")).toBeAttached();
    await expect(page.getByTestId("crossfade-frame-1")).toBeAttached();
    await page.getByTestId("crossfade-next").click();
    await expect(page.getByTestId("crossfade-frame-0")).toBeAttached();
    await expect(page.getByTestId("crossfade-frame-1")).toBeAttached();
  });

  test("transition duration between 250 and 350 ms", async ({ page }) => {
    await page.goto("/dev/crossfade");
    const frame0 = page.getByTestId("crossfade-frame-0");
    const duration = await frame0.evaluate((el) => {
      const cs = getComputedStyle(el);
      return parseFloat(cs.transitionDuration) * 1000;
    });
    expect(duration).toBeGreaterThanOrEqual(250);
    expect(duration).toBeLessThanOrEqual(350);
  });

  test("active frame has opacity 1, inactive 0", async ({ page }) => {
    await page.goto("/dev/crossfade");
    const op0 = await page
      .getByTestId("crossfade-frame-0")
      .evaluate((el) => getComputedStyle(el).opacity);
    const op1 = await page
      .getByTestId("crossfade-frame-1")
      .evaluate((el) => getComputedStyle(el).opacity);
    expect(op0).toBe("1");
    expect(op1).toBe("0");
  });
});

test.describe("Crossfade — §11.2 reduced-motion", () => {
  test("transition removed when prefers-reduced-motion: reduce", async ({
    browser,
  }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/dev/crossfade");
    const duration = await page
      .getByTestId("crossfade-frame-0")
      .evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(duration).toBe("0s");
    await ctx.close();
  });
});
