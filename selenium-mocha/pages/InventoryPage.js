"use strict";

/**
 * Page Object for the saucedemo.com inventory (products) page
 * (https://www.saucedemo.com/inventory.html).
 */

const { By, until } = require("selenium-webdriver");

class InventoryPage {
  /**
   * @param {import("selenium-webdriver").WebDriver} driver
   */
  constructor(driver) {
    this.driver = driver;

    this.pageTitle = By.css(".title");
    this.inventoryItems = By.css(".inventory_item");
    this.itemNames = By.css(".inventory_item_name");
    this.itemPrices = By.css(".inventory_item_price");
    this.sortDropdown = By.css("[data-test='product-sort-container']");
    this.cartBadge = By.css(".shopping_cart_badge");
    this.cartLink = By.css(".shopping_cart_link");
  }

  /**
   * Waits for the inventory list to be present, confirming the page loaded.
   */
  async waitForLoad() {
    await this.driver.wait(until.elementLocated(this.pageTitle), 10000);
    await this.driver.wait(until.elementLocated(this.inventoryItems), 10000);
  }

  /**
   * Returns the "Products" heading text.
   * @returns {Promise<string>}
   */
  async getTitleText() {
    const titleEl = await this.driver.wait(
      until.elementLocated(this.pageTitle),
      10000
    );
    return titleEl.getText();
  }

  /**
   * Adds a product to the cart using its data-test slug,
   * e.g. "sauce-labs-backpack".
   * @param {string} slug
   */
  async addToCartBySlug(slug) {
    const btn = await this.driver.wait(
      until.elementLocated(By.css(`[data-test='add-to-cart-${slug}']`)),
      10000
    );
    // saucedemo's React add/remove buttons don't reliably fire on Selenium's
    // native click in headless Chrome; a JS click dispatches the handler reliably.
    await this.driver.executeScript("arguments[0].click();", btn);
    // Confirm the add registered before returning (button flips to "remove").
    await this.driver.wait(
      until.elementLocated(By.css(`[data-test='remove-${slug}']`)),
      5000
    );
  }

  /**
   * Removes a product from the cart (from the inventory page) using its
   * data-test slug, e.g. "sauce-labs-backpack".
   * @param {string} slug
   */
  async removeFromCartBySlug(slug) {
    const btn = await this.driver.wait(
      until.elementLocated(By.css(`[data-test='remove-${slug}']`)),
      10000
    );
    await this.driver.executeScript("arguments[0].click();", btn);
    // Confirm removal registered (button flips back to "add-to-cart").
    await this.driver.wait(
      until.elementLocated(By.css(`[data-test='add-to-cart-${slug}']`)),
      5000
    );
  }

  /**
   * Selects a sort option from the product sort dropdown.
   * Valid values: "az", "za", "lohi", "hilo".
   * @param {"az"|"za"|"lohi"|"hilo"} value
   */
  async sortBy(value) {
    const dropdownEl = await this.driver.wait(
      until.elementLocated(this.sortDropdown),
      10000
    );
    // Selenium has no built-in <select> helper, so select the option by value directly.
    const optionEl = await dropdownEl.findElement(
      By.css(`option[value='${value}']`)
    );
    await optionEl.click();
  }

  /**
   * Returns the list of visible product names, in DOM order.
   * @returns {Promise<string[]>}
   */
  async getProductNames() {
    const elements = await this.driver.findElements(this.itemNames);
    const names = [];
    for (const el of elements) {
      names.push(await el.getText());
    }
    return names;
  }

  /**
   * Returns the list of visible product prices as numbers (e.g. 29.99),
   * in DOM order.
   * @returns {Promise<number[]>}
   */
  async getProductPrices() {
    const elements = await this.driver.findElements(this.itemPrices);
    const prices = [];
    for (const el of elements) {
      const text = await el.getText();
      prices.push(parseFloat(text.replace("$", "")));
    }
    return prices;
  }

  /**
   * Returns the current shopping cart badge count, or 0 if no badge is shown
   * (empty cart).
   * @returns {Promise<number>}
   */
  async getCartBadgeCount() {
    const badges = await this.driver.findElements(this.cartBadge);
    if (badges.length === 0) {
      return 0;
    }
    const text = await badges[0].getText();
    return parseInt(text, 10);
  }

  /**
   * Clicks the shopping cart icon to navigate to the cart page.
   */
  async goToCart() {
    const cartEl = await this.driver.wait(
      until.elementLocated(this.cartLink),
      10000
    );
    await this.driver.executeScript("arguments[0].click();", cartEl);
    await this.driver.wait(until.urlContains("/cart.html"), 10000);
  }
}

module.exports = InventoryPage;
