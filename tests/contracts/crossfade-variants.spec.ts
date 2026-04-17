import { test, expect } from "@playwright/test";

test("crossfade-fade has transition", async ({ page }) => {
  await page.goto("/dev/v3/crossfade/fade");
  const root = page.getByTestId("crossfade-root");
  await expect(root).toHaveAttribute("data-variant", "fade");
  const transition = await page.evaluate(() => {
    const el = document.querySelector(
      '[data-testid="crossfade-frame-0"]',
    ) as HTMLElement;
    return getComputedStyle(el).transitionDuration;
  });
  expect(transition).not.toBe("0s");
});

test("crossfade-cut has no transition", async ({ page }) => {
  await page.goto("/dev/v3/crossfade/cut");
  const transition = await page.evaluate(() => {
    const el = document.querySelector(
      '[data-testid="crossfade-frame-0"]',
    ) as HTMLElement;
    return getComputedStyle(el).transitionDuration;
  });
  expect(transition).toBe("0s");
});
