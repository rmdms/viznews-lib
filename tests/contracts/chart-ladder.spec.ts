import { test, expect } from "@playwright/test";

test.describe("chart-ladder recipe", () => {
  test("expands to sticky with crossfade visual", async ({ page }) => {
    await page.goto("/dev/chart-ladder");
    const visual = page.getByTestId("sticky-visual");
    await expect(visual).toBeVisible();
    const crossfadeFrames = visual.locator('[data-testid^="crossfade-frame-"]');
    await expect(crossfadeFrames).toHaveCount(3);
  });

  test("first crossfade frame is active by default", async ({ page }) => {
    await page.goto("/dev/chart-ladder");
    const frame0 = page.getByTestId("crossfade-frame-0");
    await expect(frame0).toHaveAttribute("data-active", "true");
  });

  test("steps match frame count", async ({ page }) => {
    await page.goto("/dev/chart-ladder");
    const steps = page
      .getByTestId("sticky-steps")
      .locator('[data-testid="dev-stub"]');
    await expect(steps).toHaveCount(3);
  });
});
