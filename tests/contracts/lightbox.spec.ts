import { test, expect } from "@playwright/test";

test.describe("Lightbox — §11.4 z-order overlay", () => {
  test("dialog is absent until trigger clicked", async ({ page }) => {
    await page.goto("/dev/lightbox");
    await expect(page.getByTestId("lightbox-dialog")).toHaveCount(0);
  });

  test("dialog renders at top of stacking when open", async ({ page }) => {
    await page.goto("/dev/lightbox");
    await page.getByTestId("lightbox-trigger").click();
    const dialog = page.getByTestId("lightbox-dialog");
    await expect(dialog).toBeVisible();
    const tag = await dialog.evaluate((el) => el.tagName);
    expect(tag).toBe("DIALOG");
  });
});

test.describe("Lightbox — §11.7 focus trap + keyboard", () => {
  test("Escape closes dialog and restores focus to trigger", async ({
    page,
  }) => {
    await page.goto("/dev/lightbox");
    const trigger = page.getByTestId("lightbox-trigger");
    await trigger.click();
    await expect(page.getByTestId("lightbox-dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("lightbox-dialog")).toHaveCount(0);
    const activeTestid = await page.evaluate(() =>
      document.activeElement?.getAttribute("data-testid"),
    );
    expect(activeTestid).toBe("lightbox-trigger");
  });

  test("Close button closes dialog", async ({ page }) => {
    await page.goto("/dev/lightbox");
    await page.getByTestId("lightbox-trigger").click();
    await page.getByTestId("lightbox-close").click();
    await expect(page.getByTestId("lightbox-dialog")).toHaveCount(0);
  });

  test("Tab stays within dialog while open", async ({ page }) => {
    await page.goto("/dev/lightbox");
    await page.getByTestId("lightbox-trigger").click();
    await page.keyboard.press("Tab");
    const activeInsideDialog = await page.evaluate(() => {
      const dlg = document.querySelector('[data-testid="lightbox-dialog"]');
      return dlg?.contains(document.activeElement) ?? false;
    });
    expect(activeInsideDialog).toBe(true);
  });
});
