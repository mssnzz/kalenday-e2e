import { test, expect } from "@playwright/test";
import { appReady } from "./helpers";

/**
 * Horizontal overflow is the most common mobile defect and the easiest to
 * miss on a desktop machine: one element wider than the viewport makes the
 * whole page scroll sideways.
 */

const VIEWPORTS = [
  { name: "iPhone SE", width: 375, height: 667 },
  { name: "iPhone 13", width: 390, height: 844 },
  { name: "iPad", width: 768, height: 1024 },
];

for (const viewport of VIEWPORTS) {
  test(`no horizontal overflow at ${viewport.name} (${viewport.width}px)`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/");
    await appReady(page);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );

    // A pixel or two is rounding; anything more is a layout bug.
    expect(overflow).toBeLessThanOrEqual(2);
  });
}

test("the viewport meta tag allows the page to scale", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
    "content",
    /width=device-width/,
  );
});
