import { test, expect } from "@playwright/test";

/**
 * Authenticated flows.
 *
 * These need a throwaway account on kalenday.com. Credentials come from the
 * environment — never commit them, and never point these at a real customer
 * account:
 *
 *   export KALENDAY_EMAIL="e2e@example.com"
 *   export KALENDAY_PASSWORD="..."
 *
 * Without them the block skips instead of failing, so CI stays green for
 * contributors who cannot log in.
 *
 * TODO: the selectors below are placeholders. Record the real ones with
 *   npx playwright codegen https://kalenday.com/login
 * and replace them before enabling this file. Do not ship guessed selectors:
 * a test that fails for the wrong reason is worse than no test.
 */

const EMAIL = process.env.KALENDAY_EMAIL;
const PASSWORD = process.env.KALENDAY_PASSWORD;

test.describe("sign in", () => {
  test.skip(
    !EMAIL || !PASSWORD,
    "KALENDAY_EMAIL and KALENDAY_PASSWORD are not set",
  );

  test.fixme(true, "Selectors not yet recorded — see the note at the top.");

  test("rejects a wrong password", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel(/email|correo/i).fill(EMAIL!);
    await page.getByLabel(/password|contraseña/i).fill("definitely-not-the-password");
    await page.getByRole("button", { name: /log in|entrar|iniciar/i }).click();

    await expect(page.getByRole("alert")).toBeVisible();
  });

  test("signs in with valid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel(/email|correo/i).fill(EMAIL!);
    await page.getByLabel(/password|contraseña/i).fill(PASSWORD!);
    await page.getByRole("button", { name: /log in|entrar|iniciar/i }).click();

    await expect(page).toHaveURL(/dashboard|inbox|app/);
  });
});
