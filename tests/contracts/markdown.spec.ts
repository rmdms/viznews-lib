import { test, expect } from "@playwright/test";

test.describe("Markdown — content rendering", () => {
  test("renders HTML content in DOM", async ({ page }) => {
    await page.goto("/dev/markdown");
    const root = page.getByTestId("markdown-root");
    await expect(root).toBeVisible();
    const html = await root.innerHTML();
    expect(html).toContain("<h2>");
    expect(html).toContain("<strong>");
    expect(html).toContain("<a ");
  });

  test("applies typography tokens", async ({ page }) => {
    await page.goto("/dev/markdown");
    await page.getByTestId("markdown-root").waitFor();
    // The design tokens are injected via a <style> tag in <head>. Check that
    // the style text contains the font declaration rather than resolved computed
    // values (which depend on font loading in headless environments).
    const styleContent = await page.evaluate(() => {
      const styles = Array.from(document.head.querySelectorAll("style"));
      return styles.map((s) => s.textContent ?? "").join("\n");
    });
    expect(styleContent).toContain("Inter");
  });
});
