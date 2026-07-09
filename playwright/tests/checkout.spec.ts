import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

/**
 * End-to-end happy path: log in, add two named products to the cart,
 * complete the checkout form, verify the order overview, and confirm the order.
 */
test.describe('Checkout', () => {
  test('standard_user can complete a full purchase for two products', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    // 1. Log in
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.expectLoaded();

    // 2. Add two named products to the cart
    await inventoryPage.addToCartBySlug('sauce-labs-backpack');
    await inventoryPage.addToCartBySlug('sauce-labs-bike-light');
    await inventoryPage.expectCartBadgeCount(2);

    // 3. Open the cart and proceed to checkout
    await inventoryPage.openCart();
    await expect(page).toHaveURL(/\/cart\.html$/);
    await cartPage.expectItemCount(2);
    await cartPage.checkout();

    // 4. Fill in customer information (checkout step one)
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
    await checkoutPage.fillCustomerInformation('John', 'Doe', '10001');
    await checkoutPage.continueToOverview();

    // 5. Verify the order overview (checkout step two)
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
    await checkoutPage.expectOverviewItemCount(2);
    await checkoutPage.expectTotalDisplayed();

    // 6. Finish the order and verify the confirmation
    await checkoutPage.finish();
    await expect(page).toHaveURL(/\/checkout-complete\.html$/);
    await checkoutPage.expectOrderComplete();
  });
});
