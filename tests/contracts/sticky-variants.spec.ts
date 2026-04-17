import { test, expect } from "@playwright/test";

test.describe("Sticky variants — v3", () => {
  test("sticky-left: visual on left column (desktop)", async ({ page }) => {
    await page.goto("/dev/v3/sticky/sticky-left");
    const root = page.getByTestId("sticky-root");
    await expect(root).toHaveAttribute("data-variant", "sticky-left");
    const visual = page.getByTestId("sticky-visual");
    const box = await visual.boundingBox();
    expect(box!.x).toBeLessThan(100);
  });

  test("sticky-right: visual on right column (desktop)", async ({
    page,
    viewport,
  }) => {
    test.skip(
      (viewport?.width ?? 0) < 1024,
      "position assertion is desktop-only (>= 1024px)",
    );
    await page.goto("/dev/v3/sticky/sticky-right");
    const visual = page.getByTestId("sticky-visual");
    const box = await visual.boundingBox();
    expect(box!.x).toBeGreaterThan(400);
  });

  test("sticky-center-overlay: steps overlap visual in same grid cell", async ({
    page,
  }) => {
    await page.goto("/dev/v3/sticky/sticky-center-overlay");
    const visual = page.getByTestId("sticky-visual");
    const steps = page.getByTestId("sticky-steps");
    const vBox = await visual.boundingBox();
    const sBox = await steps.boundingBox();
    expect(Math.abs(vBox!.x - sBox!.x)).toBeLessThan(50);
  });

  test("Tier 2+ variant falls back to sticky-left (dev-only)", async ({
    page,
  }) => {
    await page.goto("/dev/v3/sticky/sticky-full-with-steps-panel");
    const root = page.getByTestId("sticky-root");
    await expect(root).toHaveAttribute("data-variant", "sticky-left");
  });
});
