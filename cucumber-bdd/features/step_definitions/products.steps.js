const { When, Then } = require('@cucumber/cucumber');
const assert = require('assert');

/**
 * Steps for the product-sorting feature. The "Given the shopper is logged in"
 * background step is shared from checkout.steps.js (all step-definition files
 * are loaded together by cucumber.js).
 */

When('the shopper sorts products by {string}', async function (sortValue) {
  await this.page.selectOption('[data-test="product-sort-container"]', sortValue);
});

Then('the products should be ordered by {string}', async function (orderType) {
  const ascending = orderType.includes('ascending');

  if (orderType.startsWith('price')) {
    const priceTexts = await this.page.locator('.inventory_item_price').allTextContents();
    const prices = priceTexts.map((t) => parseFloat(t.replace('$', '')));
    const expected = [...prices].sort((a, b) => (ascending ? a - b : b - a));
    assert.deepStrictEqual(prices, expected, `Prices were not ${orderType}: ${prices.join(', ')}`);
  } else {
    const names = await this.page.locator('.inventory_item_name').allTextContents();
    const expected = [...names].sort((a, b) => (ascending ? a.localeCompare(b) : b.localeCompare(a)));
    assert.deepStrictEqual(names, expected, `Names were not ${orderType}: ${names.join(', ')}`);
  }
});
