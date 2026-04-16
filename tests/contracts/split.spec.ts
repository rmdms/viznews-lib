import { test, expect } from "@playwright/test";

test.describe("Split — §11.10 aspect-ratio + shared legend", () => {
  test("both sides share the same aspect ratio", async ({ page }) => {
    await page.goto("/dev/split");
    const leftAR = await page
      .getByTestId("split-left")
      .evaluate((el) => getComputedStyle(el).aspectRatio);
    const rightAR = await page
      .getByTestId("split-right")
      .evaluate((el) => getComputedStyle(el).aspectRatio);
    expect(leftAR).toBe(rightAR);
  });

  test("legend appears exactly once", async ({ page }) => {
    await page.goto("/dev/split");
    await expect(page.getByTestId("split-legend")).toHaveCount(1);
  });
});

test.describe("Split — §11.10 mobile reflow", () => {
  test.use({ viewport: { width: 375, height: 667 } });
  test("stacks vertically on mobile", async ({ page }) => {
    await page.goto("/dev/split");
    const cols = await page
      .locator(".vn-split__panes")
      .evaluate((el) => getComputedStyle(el).gridTemplateColumns);
    expect(cols.split(" ").length).toBe(1);
  });
});

test.describe("Split — §11.10 desktop side-by-side", () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test("two columns at desktop", async ({ page }) => {
    await page.goto("/dev/split");
    const cols = await page
      .locator(".vn-split__panes")
      .evaluate((el) => getComputedStyle(el).gridTemplateColumns);
    expect(cols.split(" ").length).toBe(2);
  });
});
