import { test, expect } from "@playwright/test";

test.describe("MTMap — SDK rendering", () => {
  test("map container is mounted", async ({ page }) => {
    await page.goto("/dev/mt-map");
    const container = page.getByTestId("mt-map-container");
    await expect(container).toBeVisible();
    const box = await container.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(400);
  });

  test("figure has aria-label", async ({ page }) => {
    await page.goto("/dev/mt-map");
    const root = page.getByTestId("mt-map-root");
    const label = await root.getAttribute("aria-label");
    expect(label).toBeTruthy();
  });

  test("figure has role=application when interactive", async ({ page }) => {
    await page.goto("/dev/mt-map");
    const root = page.getByTestId("mt-map-root");
    const role = await root.getAttribute("role");
    expect(role).toBe("application");
  });

  test("canvas element appears inside container", async ({ page }) => {
    await page.goto("/dev/mt-map");
    const canvas = page.locator('[data-testid="mt-map-container"] canvas');
    await expect(canvas).toBeAttached({ timeout: 10000 });
  });
});
