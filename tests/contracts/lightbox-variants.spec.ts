import { test, expect } from "@playwright/test";

test("lightbox-modal opens and closes on trigger/close click", async ({
  page,
}) => {
  await page.goto("/dev/v3/lightbox/modal");
  await page.waitForLoadState("networkidle");
  const root = page.getByTestId("lightbox-root");
  await expect(root).toHaveAttribute("data-variant", "modal");

  // modal not visible initially
  await expect(page.getByTestId("lightbox-modal")).not.toBeVisible();

  // open
  await page.getByTestId("lightbox-trigger").click();
  await expect(page.getByTestId("lightbox-modal")).toBeVisible();

  // close
  await page.getByTestId("lightbox-close").click();
  await expect(page.getByTestId("lightbox-modal")).not.toBeVisible();
});

test("lightbox-inline-expand opens on trigger click", async ({ page }) => {
  await page.goto("/dev/v3/lightbox/inline-expand");
  await page.waitForLoadState("networkidle");
  const root = page.getByTestId("lightbox-root");
  await expect(root).toHaveAttribute("data-variant", "inline-expand");

  const inline = page.getByTestId("lightbox-inline");
  await expect(inline).toHaveAttribute("data-open", "false");

  await page.getByTestId("lightbox-trigger").click();
  await expect(inline).toHaveAttribute("data-open", "true");
});
