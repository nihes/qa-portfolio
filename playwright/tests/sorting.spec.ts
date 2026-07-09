import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';

/**
 * Product sorting coverage on the inventory page: price low-to-high (lohi)
 * and name Z-to-A (za) sort options.
 */
test.describe('Product sorting', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.expectLoaded();
  });

  test('sorting by "Price (low to high)" orders items ascending by price', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await inventoryPage.sortBy('lohi');

    const prices = await inventoryPage.getPrices();
    const sortedAscending = [...prices].sort((a, b) => a - b);

    expect(prices).toEqual(sortedAscending);
  });

  test('sorting by "Name (Z to A)" orders items in reverse alphabetical order', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await inventoryPage.sortBy('za');

    const names = await inventoryPage.getNames();
    const sortedDescending = [...names].sort((a, b) => b.localeCompare(a));

    expect(names).toEqual(sortedDescending);
  });
});
