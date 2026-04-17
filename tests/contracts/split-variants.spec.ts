import { test, expect } from "@playwright/test";

test.describe("Split variants — v3", () => {
  test("static: two side-by-side columns (desktop)", async ({ page }) => {
    await page.goto("/dev/v3/split/static");
    const root = page.getByTestId("split-root");
    await expect(root).toHaveAttribute("data-variant", "static");
    await expect(page.getByTestId("split-handle")).toHaveCount(0);
  });

  test("drag-separator: shows draggable handle", async ({ page }) => {
    await page.goto("/dev/v3/split/drag-separator");
    await expect(page.getByTestId("split-handle")).toBeVisible();
  });

  test("drag-separator: handle moves separator on drag", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/dev/v3/split/drag-separator");
    await page.waitForLoadState("networkidle");
    const handle = page.getByTestId("split-handle");
    await expect(handle).toBeVisible();
    const initialBox = await handle.boundingBox();
    // Use low-level mouse API to avoid pointer-capture conflicts with dragTo
    await page.mouse.move(
      initialBox!.x + 2,
      initialBox!.y + initialBox!.height / 2,
    );
    await page.mouse.down();
    await page.waitForTimeout(50);
    await page.mouse.move(
      initialBox!.x + 200,
      initialBox!.y + initialBox!.height / 2,
      { steps: 10 },
    );
    await page.waitForTimeout(50);
    await page.mouse.up();
    const afterBox = await handle.boundingBox();
    expect(Math.abs(afterBox!.x - initialBox!.x)).toBeGreaterThan(50);
  });
});
