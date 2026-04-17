import { test, expect } from "@playwright/test";

test.describe("scrolly-sticky-content recipe", () => {
  test("expands to sticky — visual and steps present", async ({ page }) => {
    await page.goto("/dev/scrolly-sticky-content");
    const visual = page.getByTestId("sticky-visual");
    const steps = page.getByTestId("sticky-steps");
    await expect(visual).toBeVisible();
    await expect(steps).toBeVisible();
  });

  test("visual is sticky-positioned", async ({ page }) => {
    await page.goto("/dev/scrolly-sticky-content");
    const visual = page.getByTestId("sticky-visual");
    const position = await visual.evaluate(
      (el) => getComputedStyle(el).position,
    );
    expect(position).toBe("sticky");
  });

  test("steps contain expected number of children", async ({ page }) => {
    await page.goto("/dev/scrolly-sticky-content");
    const stepsChildren = page
      .getByTestId("sticky-steps")
      .locator('[data-testid="dev-stub"]');
    await expect(stepsChildren).toHaveCount(4);
  });
});
