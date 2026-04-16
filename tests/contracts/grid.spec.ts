import { test, expect } from "@playwright/test";

test.describe("Grid — §11.10 shared legend + aspect-ratio locked", () => {
  test("legend rendered exactly once outside the cell grid", async ({
    page,
  }) => {
    await page.goto("/dev/grid");
    const legends = page.getByTestId("grid-legend");
    await expect(legends).toHaveCount(1);
    const legendIsInsideCells = await legends.evaluate((el) =>
      el.parentElement?.classList.contains("vn-grid__cells"),
    );
    expect(legendIsInsideCells).toBe(false);
  });

  test("cells have aspect-ratio locked per grid config", async ({ page }) => {
    await page.goto("/dev/grid");
    const firstCell = page.locator(".vn-grid__cells > *").first();
    const ar = await firstCell.evaluate(
      (el) => getComputedStyle(el).aspectRatio,
    );
    expect(ar.replace(/\s/g, "")).toMatch(/^4\/3$|^1\.3/);
  });
});

test.describe("Grid — §11.10 mobile reflow", () => {
  test.use({ viewport: { width: 375, height: 667 } });
  test("single column on mobile", async ({ page }) => {
    await page.goto("/dev/grid");
    const gridCols = await page
      .locator(".vn-grid__cells")
      .evaluate((el) => getComputedStyle(el).gridTemplateColumns);
    const trackCount = gridCols.split(" ").length;
    expect(trackCount).toBe(1);
  });
});

test.describe("Grid — §11.10 desktop 3-column", () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test("3 columns at desktop", async ({ page }) => {
    await page.goto("/dev/grid");
    const gridCols = await page
      .locator(".vn-grid__cells")
      .evaluate((el) => getComputedStyle(el).gridTemplateColumns);
    const trackCount = gridCols.split(" ").length;
    expect(trackCount).toBe(3);
  });
});
