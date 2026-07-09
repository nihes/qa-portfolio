"use strict";

/**
 * Page Object for the saucedemo.com cart page
 * (https://www.saucedemo.com/cart.html).
 */

const { By, until } = require("selenium-webdriver");

class CartPage {
  /**
   * @param {import("selenium-webdriver").WebDriver} driver
   */
  constructor(driver) {
    this.driver = driver;

    this.cartItems = By.css(".cart_item");
    this.itemNames = By.css(".inventory_item_name");
    this.checkoutButton = By.css("[data-test='checkout']");
  }

  /**
   * Waits for the cart page to render its item rows (or confirms the
   * container loaded, tolerating an empty cart).
   */
  async waitForLoad() {
    await this.driver.wait(until.urlContains("/cart.html"), 10000);
  }

  /**
   * Returns the number of line items currently in the cart.
   * @returns {Promise<number>}
   */
  async getItemCount() {
    const items = await this.driver.findElements(this.cartItems);
    return items.length;
  }

  /**
   * Returns the list of product names currently in the cart, in DOM order.
   * @returns {Promise<string[]>}
   */
  async getItemNames() {
    const elements = await this.driver.findElements(this.itemNames);
    const names = [];
    for (const el of elements) {
      names.push(await el.getText());
    }
    return names;
  }

  /**
   * Clicks the "Checkout" button to proceed to step one of checkout.
   */
  async checkout() {
    const btn = await this.driver.wait(
      until.elementLocated(this.checkoutButton),
      10000
    );
    await btn.click();
  }
}

module.exports = CartPage;
