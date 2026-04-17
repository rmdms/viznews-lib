import { test, expect } from "@playwright/test";

test.describe("scrolly-map recipe", () => {
  test("map container is mounted", async ({ page }) => {
    await page.goto("/dev/scrolly-map");
    const mapContainer = page.getByTestId("mt-map-container");
    await expect(mapContainer).toBeVisible();
  });

  test("scroll steps are present", async ({ page }) => {
    await page.goto("/dev/scrolly-map");
    const steps = page.getByTestId("scrolly-map-steps");
    await expect(steps).toBeVisible();
    const stepEls = steps.locator('[data-testid^="scrolly-map-step-"]');
    await expect(stepEls).toHaveCount(3);
  });

  test("map has aria-label", async ({ page }) => {
    await page.goto("/dev/scrolly-map");
    const map = page.getByTestId("mt-map-root");
    await expect(map).toHaveAttribute("aria-label", "Map of Geneva region");
  });

  test("visual is sticky-positioned", async ({ page }) => {
    await page.goto("/dev/scrolly-map");
    const visual = page.getByTestId("scrolly-map-visual");
    const position = await visual.evaluate(
      (el) => getComputedStyle(el).position,
    );
    expect(position).toBe("sticky");
  });
});
