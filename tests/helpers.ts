import { expect, type Page } from "@playwright/test";

/**
 * Wait until the app has actually rendered.
 *
 * `#root` is not empty once the bundle runs: the app injects a <script> as
 * its first child before React mounts, so "the first child of #root exists"
 * is true even when nothing has rendered, and "the first child is visible"
 * is permanently false because a script never is. Skip scripts and wait for
 * the first real element instead.
 */
export async function appReady(page: Page) {
  await expect(page.locator("#root > *:not(script)").first()).toBeVisible();
}
