import { test, expect } from "@playwright/test";

test.describe("DWChart — iframe embed", () => {
  test("iframe has correct src", async ({ page }) => {
    await page.goto("/dev/dw-chart");
    const iframe = page.getByTestId("dw-chart-iframe");
    await expect(iframe).toBeAttached();
    const src = await iframe.getAttribute("src");
    expect(src).toContain("datawrapper.dwcdn.net");
  });

  test("iframe has title attribute", async ({ page }) => {
    await page.goto("/dev/dw-chart");
    const iframe = page.getByTestId("dw-chart-iframe");
    const title = await iframe.getAttribute("title");
    expect(title).toBeTruthy();
  });

  test("wrapper has aria-label", async ({ page }) => {
    await page.goto("/dev/dw-chart");
    const root = page.getByTestId("dw-chart-root");
    const label = await root.getAttribute("aria-label");
    expect(label).toBeTruthy();
  });

  test("iframe has non-zero height", async ({ page }) => {
    await page.goto("/dev/dw-chart");
    const iframe = page.getByTestId("dw-chart-iframe");
    const box = await iframe.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThan(100);
  });
});
