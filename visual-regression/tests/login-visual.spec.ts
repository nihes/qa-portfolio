import { test, expect } from '@playwright/test';

/**
 * Visual regression baseline for the saucedemo.com login page.
 *
 * IMPORTANT: Playwright screenshot baselines are OS- and browser-specific.
 * The committed baseline was generated on the maintainer's machine; on a
 * different OS, run `npm run update-snapshots` once to regenerate it. This suite
 * is intentionally NOT part of CI — a Linux runner would diff its own render
 * against the committed baseline and fail for reasons unrelated to the app.
 */
test.describe('Visual regression', () => {
  test('login page matches the visual baseline', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#login-button')).toBeVisible();

    // Compare the full page against the committed baseline image.
    await expect(page).toHaveScreenshot('login-page.png', { fullPage: true });
  });
});
