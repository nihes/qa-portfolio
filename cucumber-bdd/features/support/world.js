const { setWorldConstructor, World } = require('@cucumber/cucumber');

/**
 * Custom Cucumber World shared by every scenario.
 *
 * `this.browser` is set once in the BeforeAll hook (features/support/hooks.js)
 * and shared across the whole run for speed. `this.context` and `this.page`
 * are (re)created fresh in the Before hook for every scenario so that
 * scenarios never leak cookies/local storage/state into one another.
 */
class CustomWorld extends World {
  constructor(options) {
    super(options);
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  /**
   * Converts a human-readable Sauce Demo product name into the slug used in
   * its `data-test` attributes, e.g. "Sauce Labs Backpack" -> "sauce-labs-backpack".
   * @param {string} productName
   * @returns {string}
   */
  toSlug(productName) {
    return productName.trim().toLowerCase().replace(/\s+/g, '-');
  }
}

setWorldConstructor(CustomWorld);

module.exports = { CustomWorld };
