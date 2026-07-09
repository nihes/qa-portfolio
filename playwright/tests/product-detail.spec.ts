import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { ProductPage } from '../pages/ProductPage';

/**
 * Product detail page coverage for saucedemo.com: opening a product from the
 * inventory list, verifying its name/price/description, adding it to the
 * cart from the detail page, and returning to the inventory via "Back to products".
 */
test.describe('Product detail', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.expectLoaded();
  });

  test('opening a product shows its name, price and description, and supports add-to-cart', async ({
    page,
  }) => {
    const inventoryPage = new InventoryPage(page);
    const productPage = new ProductPage(page);
    const productName = 'Sauce Labs Backpack';

    // 1. Click the product name on the inventory page to open its detail page
    await productPage.openFromInventoryByName(page, productName);
    await expect(page).toHaveURL(/\/inventory-item\.html\?id=\d+$/);

    // 2. Verify the detail page renders name, price and description
    await productPage.expectName(productName);
    await productPage.expectPriceVisible();
    await productPage.expectDescriptionVisible();

    // 3. Add to cart from the detail page and verify the badge updates
    await productPage.addToCartBySlug('sauce-labs-backpack');
    await inventoryPage.expectCartBadgeCount(1);

    // 4. "Back to products" returns to the inventory page
    await productPage.backToProducts();
    await expect(page).toHaveURL(/\/inventory\.html$/);
    await inventoryPage.expectLoaded();
  });
});
