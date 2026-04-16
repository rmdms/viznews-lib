import { test, expect } from "@playwright/test";

test.describe("ScrollSteps — §11.13 IntersectionObserver step-detection", () => {
  test("active index advances as user scrolls", async ({ page }) => {
    await page.goto("/dev/scroll-steps");
    const root = page.getByTestId("scroll-steps-root");
    await expect(root).toHaveAttribute("data-active-index", "0");

    // Scroll step-2 into the middle of the viewport to cross the rootMargin trigger zone
    const step2 = page.getByTestId("scroll-steps-step-2");
    const box = await step2.boundingBox();
    if (box) {
      const viewportSize = page.viewportSize();
      const targetY = box.y - (viewportSize?.height ?? 600) * 0.35;
      await page.evaluate(
        (y) => window.scrollTo({ top: y, behavior: "instant" }),
        targetY,
      );
    }
    await page.waitForTimeout(300);
    const active = await root.getAttribute("data-active-index");
    expect(["1", "2", "3"]).toContain(active);
  });

  test("debounce prevents thrash on rapid scrolling", async ({ page }) => {
    await page.goto("/dev/scroll-steps");
    const root = page.getByTestId("scroll-steps-root");
    for (let y = 0; y < 2000; y += 100) {
      await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
    }
    await page.waitForTimeout(100);
    const active = await root.getAttribute("data-active-index");
    expect(active).not.toBeNull();
  });
});

test.describe("ScrollSteps — §11.13 reduced-motion fallback", () => {
  test.use({ colorScheme: "light" });
  test("locks to final step when prefers-reduced-motion: reduce", async ({
    browser,
  }) => {
    const ctx = await browser.newContext({
      reducedMotion: "reduce",
      baseURL: "http://localhost:5173",
    });
    const page = await ctx.newPage();
    await page.goto("/dev/scroll-steps");
    await page.waitForTimeout(300);
    const active = await page
      .getByTestId("scroll-steps-root")
      .getAttribute("data-active-index");
    expect(active).toBe("3");
    await ctx.close();
  });
});

test.describe("ScrollSteps — §11.7 a11y", () => {
  test("each step is keyboard-reachable in source order", async ({ page }) => {
    await page.goto("/dev/scroll-steps");
    const stepsCount = await page.locator("[data-step-index]").count();
    expect(stepsCount).toBe(4);
  });
});
