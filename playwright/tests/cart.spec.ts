import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';

/**
 * Cart scenarios for saucedemo.com: adding two items updates the cart badge
 * and the cart page's row count, and removing one item from the cart page
 * updates both the row count and the badge again.
 */
test.describe('Cart', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.expectLoaded();
  });

  test('adding two items updates the badge and the cart page row count', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    // 1. Add two products from the inventory page
    await inventoryPage.addToCartBySlug('sauce-labs-backpack');
    await inventoryPage.addToCartBySlug('sauce-labs-bike-light');
    await inventoryPage.expectCartBadgeCount(2);

    // 2. Open the cart and verify two rows are listed
    await inventoryPage.openCart();
    await expect(page).toHaveURL(/\/cart\.html$/);
    await cartPage.expectItemCount(2);
  });

  test('removing one item from the cart page updates the row count and badge', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    // 1. Add two products, then navigate to the cart page
    await inventoryPage.addToCartBySlug('sauce-labs-backpack');
    await inventoryPage.addToCartBySlug('sauce-labs-bike-light');
    await inventoryPage.expectCartBadgeCount(2);

    await inventoryPage.openCart();
    await expect(page).toHaveURL(/\/cart\.html$/);
    await cartPage.expectItemCount(2);

    // 2. Remove one item directly from the cart page (same remove-<slug> selector as inventory)
    await page.locator('[data-test="remove-sauce-labs-bike-light"]').click();

    // 3. Assert the row is gone and the badge reflects the remaining item
    await cartPage.expectItemCount(1);
    await inventoryPage.expectCartBadgeCount(1);
  });
});
