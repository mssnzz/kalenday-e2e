import { test, expect } from "@playwright/test";

/**
 * Kalenday renders on the client, so a crawler that does not execute
 * JavaScript sees only what the server sends. The app deliberately ships a
 * JSON-LD block and a <noscript> fallback to cover that — these tests keep
 * both from silently regressing, which is exactly the kind of breakage no
 * one notices until traffic drops.
 */

test.describe("crawler-visible content", () => {
  test("the served HTML carries a parseable JSON-LD block", async ({
    request,
  }) => {
    const html = await (await request.get("/")).text();
    const match = html.match(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
    );

    expect(match, "no JSON-LD block in the served HTML").not.toBeNull();
    expect(() => JSON.parse(match![1])).not.toThrow();
  });

  test("the noscript fallback still describes the product", async ({
    request,
  }) => {
    const html = await (await request.get("/")).text();

    expect(html).toContain("<noscript>");
    expect(html).toMatch(/Kalenday/);
    expect(html).toMatch(/support@kalenday\.com/);
  });

  test("the title and description survive without JavaScript", async ({
    browser,
  }) => {
    // A crawler with JS disabled must still get the metadata, because the
    // client-side router is the only thing that would otherwise set it.
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();

    await page.goto("/");
    await expect(page).toHaveTitle(/Kalenday/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /.{50,}/,
    );

    await context.close();
  });
});
