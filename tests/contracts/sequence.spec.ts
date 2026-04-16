import { test, expect } from "@playwright/test";

test.describe("Sequence — §11.6 Pattern B full-width stacked", () => {
  test("items render full-width at mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/dev/sequence");
    const firstItem = page.getByTestId("sequence-root").locator("> *").first();
    const box = await firstItem.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(375 * 0.8);
  });

  test("items are stacked vertically (flex-direction: column)", async ({
    page,
  }) => {
    await page.goto("/dev/sequence");
    const dir = await page
      .getByTestId("sequence-root")
      .evaluate((el) => getComputedStyle(el).flexDirection);
    expect(dir).toBe("column");
  });
});

test.describe("Sequence — §11.7 source order", () => {
  test("DOM order matches fixture order", async ({ page }) => {
    await page.goto("/dev/sequence");
    const labels = await page
      .getByTestId("sequence-root")
      .locator('[data-testid="dev-stub"]')
      .allTextContents();
    expect(labels.map((l) => l.trim())).toEqual(["item 1", "item 2", "item 3"]);
  });
});
