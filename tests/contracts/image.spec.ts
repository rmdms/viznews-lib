import { test, expect } from "@playwright/test";

test.describe("Image — content rendering", () => {
  test("img has loading=lazy", async ({ page }) => {
    await page.goto("/dev/image");
    const img = page.getByTestId("image-img");
    await expect(img).toBeVisible();
    const loading = await img.getAttribute("loading");
    expect(loading).toBe("lazy");
  });

  test("img has alt attribute", async ({ page }) => {
    await page.goto("/dev/image");
    const img = page.getByTestId("image-img");
    const alt = await img.getAttribute("alt");
    expect(alt).toBeTruthy();
    expect(alt!.length).toBeGreaterThan(0);
  });

  test("figcaption is rendered", async ({ page }) => {
    await page.goto("/dev/image");
    const caption = page.getByTestId("image-caption");
    await expect(caption).toBeVisible();
    const text = await caption.textContent();
    expect(text).toContain("Lorem Picsum");
  });

  test("aspect-ratio is applied", async ({ page }) => {
    await page.goto("/dev/image");
    const img = page.getByTestId("image-img");
    const ar = await img.evaluate((el) => getComputedStyle(el).aspectRatio);
    expect(ar).toContain("16");
  });
});
