import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

/**
 * Negative validation coverage for checkout step one ("/checkout-step-one.html"):
 * submitting the customer information form with a missing first name, last name,
 * or postal code each surfaces the matching "<Field> is required" error banner.
 */
test.describe('Checkout step-one validation', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.expectLoaded();

    await inventoryPage.addToCartBySlug('sauce-labs-backpack');
    await inventoryPage.openCart();
    await expect(page).toHaveURL(/\/cart\.html$/);
    await cartPage.checkout();
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
  });

  test('missing first name shows "First Name is required"', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    await checkoutPage.fillCustomerInformation('', 'Doe', '10001');
    await checkoutPage.continueToOverview();

    await expect(page.locator('[data-test="error"]')).toBeVisible();
    await expect(page.locator('[data-test="error"]')).toContainText('First Name is required');
    // Still on step one — the form did not submit successfully
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
  });

  test('missing last name shows "Last Name is required"', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    await checkoutPage.fillCustomerInformation('John', '', '10001');
    await checkoutPage.continueToOverview();

    await expect(page.locator('[data-test="error"]')).toBeVisible();
    await expect(page.locator('[data-test="error"]')).toContainText('Last Name is required');
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
  });

  test('missing postal code shows "Postal Code is required"', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    await checkoutPage.fillCustomerInformation('John', 'Doe', '');
    await checkoutPage.continueToOverview();

    await expect(page.locator('[data-test="error"]')).toBeVisible();
    await expect(page.locator('[data-test="error"]')).toContainText('Postal Code is required');
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
  });
});
