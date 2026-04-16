import type { Page, Locator } from "@playwright/test";

function relLuminance(r: number, g: number, b: number): number {
  const transform = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * transform(r) + 0.7152 * transform(g) + 0.0722 * transform(b);
}

function contrastRatio(
  a: readonly [number, number, number],
  b: readonly [number, number, number],
): number {
  const la = relLuminance(...a);
  const lb = relLuminance(...b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export async function measureContrast(
  page: Page,
  selector: string,
): Promise<number> {
  const locator: Locator = page.locator(selector).first();
  await locator.waitFor({ state: "visible" });
  const buf = await locator.screenshot();

  const b64 = buf.toString("base64");
  const { fg, bg } = await page.evaluate(async (b64: string) => {
    const img = new Image();
    img.src = "data:image/png;base64," + b64;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const buckets = new Map<
      string,
      { r: number; g: number; b: number; n: number }
    >();
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2];
      const key = `${r >> 4}-${g >> 4}-${b >> 4}`;
      const bucket = buckets.get(key) ?? { r: 0, g: 0, b: 0, n: 0 };
      bucket.r += r;
      bucket.g += g;
      bucket.b += b;
      bucket.n += 1;
      buckets.set(key, bucket);
    }
    const sorted = [...buckets.values()].sort((a, b) => b.n - a.n);
    const [bg, fg] = sorted;
    const avg = (b: { r: number; g: number; b: number; n: number }) =>
      [
        Math.round(b.r / b.n),
        Math.round(b.g / b.n),
        Math.round(b.b / b.n),
      ] as const;
    return { bg: avg(bg), fg: avg(fg) };
  }, b64);
  return contrastRatio(fg, bg);
}
