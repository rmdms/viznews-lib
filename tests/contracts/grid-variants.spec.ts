import { test, expect } from "@playwright/test";

test("grid-uniform has correct data-variant and cells visible", async ({
  page,
}) => {
  await page.goto("/dev/v3/grid/uniform");
  const root = page.getByTestId("grid-root");
  await expect(root).toHaveAttribute("data-variant", "uniform");
  const cells = page.getByTestId("grid-cells");
  await expect(cells).toBeVisible();
});

test("grid-featured has correct data-variant and first child spans 2 columns", async ({
  page,
}) => {
  await page.goto("/dev/v3/grid/featured");
  const root = page.getByTestId("grid-root");
  await expect(root).toHaveAttribute("data-variant", "featured");
  const gridColumn = await page.evaluate(() => {
    const cells = document.querySelector('[data-testid="grid-cells"]');
    const first = cells?.firstElementChild as HTMLElement | null;
    return first ? getComputedStyle(first).gridColumn : null;
  });
  expect(gridColumn).toMatch(/span 2/);
});
