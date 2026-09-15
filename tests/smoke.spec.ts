import { test, expect } from "@playwright/test";
import { appReady } from "./helpers";

/**
 * Smoke: the checks that decide whether anything else is worth running.
 * Every assertion here targets something the server actually sends or the
 * app actually renders — no guessed copy, no guessed selectors.
 */

test.describe("landing page", () => {
  test("serves the document and the expected title", async ({ page }) => {
    const response = await page.goto("/");

    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle("Kalenday — The AI communication platform");
  });

  test("the React app mounts into #root", async ({ page }) => {
    await page.goto("/");

    // The served HTML ships an empty <div id="root">; if the bundle fails,
    // the element is still there and still empty. Assert on its content.
    await expect(page.locator("#root")).toBeAttached();
    await appReady(page);
  });

  test("renders a level-one heading once hydrated", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  });

  test("declares Spanish as the document language", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("html")).toHaveAttribute("lang", "es");
  });

  test("ships a non-empty meta description", async ({ page }) => {
    await page.goto("/");

    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute("content", /.{50,}/);
  });

  test("the favicon resolves", async ({ request }) => {
    const response = await request.get("/favicon.svg");

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("svg");
  });
});

test.describe("page health", () => {
  test("loads without uncaught console errors", async ({ page }) => {
    const errors: string[] = [];

    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto("/");
    await appReady(page);

    expect(errors, `console errors on load:\n${errors.join("\n")}`).toEqual([]);
  });

  test("every request the page makes succeeds", async ({ page }) => {
    const failed: string[] = [];

    page.on("response", (response) => {
      if (response.status() >= 400) {
        failed.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.goto("/");
    await appReady(page);

    expect(failed, `failed requests:\n${failed.join("\n")}`).toEqual([]);
  });
});
