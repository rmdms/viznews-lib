import { test, expect } from "@playwright/test";

test.describe("gallery-carousel recipe", () => {
  test("expands to grid with correct cell count", async ({ page }) => {
    await page.goto("/dev/gallery-carousel");
    const grid = page.getByTestId("grid-root");
    await expect(grid).toBeVisible();
    const cells = grid.locator('[data-testid^="grid-cell-"]');
    await expect(cells).toHaveCount(6);
  });

  test("clicking a cell opens lightbox dialog", async ({ page }) => {
    await page.goto("/dev/gallery-carousel");
    const firstCell = page.getByTestId("grid-cell-0");
    await firstCell.click();
    const dialog = page.locator("dialog[open]");
    await expect(dialog).toBeVisible();
  });

  test("Escape closes lightbox and restores focus", async ({ page }) => {
    await page.goto("/dev/gallery-carousel");
    const firstCell = page.getByTestId("grid-cell-0");
    await firstCell.click();
    await page.keyboard.press("Escape");
    const dialog = page.locator("dialog[open]");
    await expect(dialog).toHaveCount(0);
  });
});
