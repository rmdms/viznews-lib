import { test, expect } from "@playwright/test";
import { measureContrast } from "../helpers/contrast";

test.describe("Sticky — §11.4 z-order & source-order", () => {
  test("visual DOM index precedes steps DOM index", async ({ page }) => {
    await page.goto("/dev/sticky");
    const visual = page.getByTestId("sticky-visual");
    const steps = page.getByTestId("sticky-steps");
    const visualIdx = await visual.evaluate((el) =>
      Array.from(document.querySelectorAll("*")).indexOf(el as Element),
    );
    const stepsIdx = await steps.evaluate((el) =>
      Array.from(document.querySelectorAll("*")).indexOf(el as Element),
    );
    expect(visualIdx).toBeLessThan(stepsIdx);
  });

  test("focus order: visual then steps", async ({ page }) => {
    await page.goto("/dev/sticky");
    const visualOrderHtml = await page.getByTestId("sticky-visual").innerHTML();
    const stepsOrderHtml = await page.getByTestId("sticky-steps").innerHTML();
    expect(visualOrderHtml.length).toBeGreaterThan(0);
    expect(stepsOrderHtml.length).toBeGreaterThan(0);
    const ariaOwns = await page
      .getByTestId("sticky-root")
      .getAttribute("aria-owns");
    expect(ariaOwns).toBeNull();
  });
});

test.describe("Sticky — §11.5 readability-over-sticky", () => {
  test("step text contrast ≥ 4.5:1 over scrim", async ({ page }) => {
    await page.goto("/dev/sticky");
    await page.evaluate(() => window.scrollTo(0, window.innerHeight));
    const firstStepText = page
      .getByTestId("sticky-steps")
      .locator('[data-testid="dev-stub"]')
      .first();
    await firstStepText.scrollIntoViewIfNeeded();
    const ratio = await measureContrast(
      page,
      '[data-testid="sticky-steps"] [data-testid="dev-stub"]',
    );
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  test('scrim="none" emits dev warning but does not throw', async ({
    page,
  }) => {
    const logs: string[] = [];
    page.on("console", (m) => logs.push(m.text()));
    await page.goto("/dev/sticky");
    expect(logs.filter((l) => l.includes('scrim="none"'))).toHaveLength(0);
  });
});

test.describe("Sticky — §11.6 mobile Pattern A sticky-top stacked", () => {
  test.use({ viewport: { width: 375, height: 667 } });
  test("visual is sticky at top with ~60vh height", async ({ page }) => {
    await page.goto("/dev/sticky");
    const visual = page.getByTestId("sticky-visual");
    const box = await visual.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThan(300);
    expect(box!.height).toBeLessThan(500);
    const position = await visual.evaluate(
      (el) => getComputedStyle(el).position,
    );
    expect(position).toBe("sticky");
  });
});

test.describe("Sticky — §11.7 a11y", () => {
  test("no role/aria surprises on root", async ({ page }) => {
    await page.goto("/dev/sticky");
    const role = await page.getByTestId("sticky-root").getAttribute("role");
    expect(role).toBeNull();
  });
});
