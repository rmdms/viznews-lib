import { test, expect } from "@playwright/test";

test("explore-native-interactivity renders content", async ({ page }) => {
  await page.goto("/dev/v3/explore/native-interactivity");
  const root = page.getByTestId("explore-root");
  await expect(root).toHaveAttribute("data-variant", "native-interactivity");
  await expect(page.getByTestId("explore-content")).toBeVisible();
});

test("explore Tier 2 variant falls back", async ({ page }) => {
  await page.goto("/dev/v3/explore/controls-panel");
  const root = page.getByTestId("explore-root");
  await expect(root).toHaveAttribute("data-variant", "native-interactivity");
});

test("explore legend routing for dw-chart uses native", async ({ page }) => {
  await page.goto("/dev/v3/explore/native-interactivity");
  const root = page.getByTestId("explore-root");
  await expect(root).toHaveAttribute("data-legend-mode", "native");
});

test("explore renders sourceNote", async ({ page }) => {
  await page.goto("/dev/v3/explore/native-interactivity");
  await expect(page.getByTestId("explore-source")).toContainText("Datawrapper");
});
