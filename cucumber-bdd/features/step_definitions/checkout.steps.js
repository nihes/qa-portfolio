const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');

const BASE_URL = 'https://www.saucedemo.com';
const PASSWORD = 'secret_sauce';

/**
 * Converts a human-readable Sauce Demo product name into the slug used in
 * its `data-test` attributes, e.g. "Sauce Labs Backpack" -> "sauce-labs-backpack".
 * @param {string} productName
 * @returns {string}
 */
function toSlug(productName) {
  return productName.trim().toLowerCase().replace(/\s+/g, '-');
}

Given('the shopper is logged in as {string}', async function (username) {
  await this.page.goto(`${BASE_URL}/`);
  await this.page.fill('#user-name', username);
  await this.page.fill('#password', PASSWORD);
  await this.page.click('#login-button');

  // Locked-out accounts never leave the login page - surface that instead of
  // blowing up later on a missing .title selector.
  const errorBanner = this.page.locator('[data-test="error"]');
  if (await errorBanner.isVisible().catch(() => false)) {
    const message = await errorBanner.textContent();
    throw new Error(`Login failed for user "${username}": ${message.trim()}`);
  }

  await this.page.waitForSelector('.title');
  const title = (await this.page.textContent('.title')).trim();
  assert.strictEqual(title, 'Products', `Expected to land on the Products page after login, got "${title}"`);
});

When('the shopper adds {string} to the cart', async function (productName) {
  const slug = toSlug(productName);
  await this.page.click(`[data-test="add-to-cart-${slug}"]`);
});

When('the shopper removes {string} from the cart', async function (productName) {
  const slug = toSlug(productName);
  await this.page.click(`[data-test="remove-${slug}"]`);
});

When('the shopper goes to the cart', async function () {
  await this.page.click('.shopping_cart_link');
  await this.page.waitForURL('**/cart.html');
});

When('the shopper proceeds to checkout', async function () {
  await this.page.click('[data-test="checkout"]');
  await this.page.waitForURL('**/checkout-step-one.html');
});

When(
  'the shopper fills in checkout information with first name {string}, last name {string} and postal code {string}',
  async function (firstName, lastName, postalCode) {
    await this.page.fill('#first-name', firstName);
    await this.page.fill('#last-name', lastName);
    await this.page.fill('#postal-code', postalCode);
  }
);

When('the shopper continues to the overview', async function () {
  await this.page.click('[data-test="continue"]');
  await this.page.waitForURL('**/checkout-step-two.html');
});

When('the shopper finishes the checkout', async function () {
  await this.page.click('[data-test="finish"]');
  await this.page.waitForURL('**/checkout-complete.html');
});

Then('the shopper should see the message {string}', async function (expectedMessage) {
  await this.page.waitForSelector('.complete-header');
  const header = (await this.page.textContent('.complete-header')).trim();
  assert.strictEqual(header, expectedMessage);
});

Then('the cart badge should show {string}', async function (expectedCount) {
  const badge = (await this.page.textContent('.shopping_cart_badge')).trim();
  assert.strictEqual(badge, expectedCount);
});

// --- Negative checkout-validation steps ---

When(
  'the shopper fills in first name {string} and last name {string} without a postal code',
  async function (firstName, lastName) {
    await this.page.fill('#first-name', firstName);
    await this.page.fill('#last-name', lastName);
    // postal code intentionally left blank
  }
);

When('the shopper tries to continue to the overview', async function () {
  // Click continue but do NOT wait for a navigation — a validation error should
  // keep the shopper on step one.
  await this.page.click('[data-test="continue"]');
});

Then('the shopper should see the checkout error {string}', async function (expectedError) {
  await this.page.waitForSelector('[data-test="error"]');
  const error = (await this.page.textContent('[data-test="error"]')).trim();
  assert.ok(
    error.includes(expectedError),
    `Expected checkout error to include "${expectedError}", got "${error}"`
  );
});
