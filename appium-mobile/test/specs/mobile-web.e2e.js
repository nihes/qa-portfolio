/**
 * Mobile-web smoke test — saucedemo.com driven through Appium/WebdriverIO on
 * an Android device's Chrome browser (emulator locally, real device on
 * BrowserStack). Same login → add to cart → cart badge flow used by the
 * Playwright/Cypress suites elsewhere in this portfolio, ported to a mobile
 * form factor to demonstrate Appium page interaction (taps, mobile
 * viewport-aware selectors) rather than desktop clicks.
 *
 * Run locally:        npm run test:local        (needs Android emulator)
 * Run on BrowserStack: npm run test:browserstack (needs BS creds, see README)
 */
describe('saucedemo.com — mobile web', () => {
  const USERNAME = 'standard_user';
  const PASSWORD = 'secret_sauce';
  const PRODUCT_SLUG = 'sauce-labs-backpack';

  it('logs in and adds a product to the cart', async () => {
    await browser.url('/');

    // --- Login page ---
    const usernameInput = await $('#user-name');
    const passwordInput = await $('#password');
    const loginButton = await $('#login-button');

    await usernameInput.waitForDisplayed({ timeout: 15000 });
    await usernameInput.setValue(USERNAME);
    await passwordInput.setValue(PASSWORD);
    await loginButton.click();

    // --- Inventory page ---
    const pageTitle = await $('.title');
    await pageTitle.waitForDisplayed({ timeout: 15000 });
    await expect(pageTitle).toHaveText('Products');

    const addToCartButton = await $(`[data-test="add-to-cart-${PRODUCT_SLUG}"]`);
    await addToCartButton.waitForDisplayed();
    await addToCartButton.click();

    // --- Cart badge reflects the addition ---
    const cartBadge = await $('.shopping_cart_badge');
    await cartBadge.waitForDisplayed({ timeout: 10000 });
    await expect(cartBadge).toHaveText('1');

    // The "Remove" button now replaces "Add to cart" for that product,
    // confirming the item state flipped as expected.
    const removeButton = await $(`[data-test="remove-${PRODUCT_SLUG}"]`);
    await expect(removeButton).toBeDisplayed();
  });

  it('removing the item clears the cart badge', async () => {
    await browser.url('/inventory.html');

    const removeButton = await $(`[data-test="remove-${PRODUCT_SLUG}"]`);
    await removeButton.waitForDisplayed({ timeout: 15000 });
    await removeButton.click();

    // No items left — the badge element itself disappears from the DOM.
    const cartBadges = await $$('.shopping_cart_badge');
    await expect(cartBadges).toBeElementsArrayOfSize(0);
  });
});
