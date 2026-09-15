import { test, expect } from "@playwright/test";
import { appReady } from "./helpers";

/**
 * A single-page app served through a catch-all returns the same document for
 * every path, so a URL that does not exist answers 200 instead of 404.
 *
 * That is a real defect, not a quirk: search engines index the dead URL, and
 * monitoring that watches for 404s never fires. The test below documents the
 * behaviour rather than asserting it is correct — see the annotation.
 */

const NONSENSE_PATH = "/this-page-does-not-exist-e2e-check";

test.describe("unknown routes", () => {
  test("a nonexistent path answers 200 instead of 404", async ({ request }) => {
    test.info().annotations.push({
      type: "known issue",
      description:
        "SPA catch-all: the server returns index.html for every path. " +
        "Expected: 404 for unknown routes, or a 200 that renders a not-found " +
        "view with a noindex tag. Asserting current behaviour so a fix breaks " +
        "this test loudly.",
    });

    const response = await request.get(NONSENSE_PATH);

    expect(response.status()).toBe(200);
  });

  test("a nonexistent path renders something, not a blank page", async ({
    page,
  }) => {
    // Whatever the router decides to do — redirect home or show a not-found
    // view — it must not leave the user staring at an empty #root.
    await page.goto(NONSENSE_PATH);

    await appReady(page);
  });
});
