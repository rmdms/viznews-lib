import { test, expect } from "@playwright/test";

const variants = [
  "text-only",
  "image-top",
  "image-left",
  "image-right",
  "image-bottom",
  "image-fullbleed",
  "image-background-textoverlay",
] as const;

for (const v of variants) {
  test(`flow-${v}: renders with correct data-variant`, async ({ page }) => {
    await page.goto(`/dev/v3/flow/${v}`);
    const root = page.getByTestId("flow-root");
    await expect(root).toHaveAttribute("data-variant", v);
  });
}

test("flow-image-left: image before text on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/dev/v3/flow/image-left");
  const imgBox = await page.locator(".vn-flow__image").first().boundingBox();
  const textBox = await page.locator(".vn-flow__text").first().boundingBox();
  expect(imgBox!.x).toBeLessThan(textBox!.x);
});

test("flow-image-right: text before image on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/dev/v3/flow/image-right");
  const imgBox = await page.locator(".vn-flow__image").first().boundingBox();
  const textBox = await page.locator(".vn-flow__text").first().boundingBox();
  expect(textBox!.x).toBeLessThan(imgBox!.x);
});
