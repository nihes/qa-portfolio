import { test, expect } from '@playwright/test';

/**
 * Full purchase journey (login -> add item -> cart -> checkout -> finish)
 * exercised under mobile device emulation.
 *
 * The spec itself is engine/device agnostic — it relies only on `baseURL` and
 * data-test selectors, so it runs unchanged against every project defined in
 * playwright.config.ts (iPhone 13 / WebKit and Pixel 5 / Chromium). This proves
 * the storefront's critical path survives a mobile viewport + touch-capable
 * browsing context, not just a full-size desktop one.
 */
test.describe('Mobile checkout journey', () => {
  test('standard_user can complete a purchase end to end on a mobile viewport', async ({ page }) => {
    // --- Login ---
    await page.goto('/');
    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    await expect(page.locator('.title')).toHaveText('Products');

    // --- Add item to cart ---
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

    // --- Go to cart ---
    await page.locator('.shopping_cart_link').click();
    await expect(page).toHaveURL(/cart\.html/);
    await expect(page.locator('.cart_item')).toHaveCount(1);

    // --- Checkout: step one (customer info) ---
    await page.locator('[data-test="checkout"]').click();
    await page.locator('#first-name').fill('Ivan');
    await page.locator('#last-name').fill('Andrijko');
    await page.locator('#postal-code').fill('04001');
    await page.locator('[data-test="continue"]').click();

    // --- Checkout: step two (order review) ---
    await expect(page.locator('.summary_total_label')).toContainText('Total');
    await page.locator('[data-test="finish"]').click();

    // --- Order complete ---
    await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');
  });
});
