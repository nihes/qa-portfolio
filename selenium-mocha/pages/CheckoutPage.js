"use strict";

/**
 * Page Object covering all three saucedemo.com checkout steps:
 *  - step one: customer information (/checkout-step-one.html)
 *  - step two: order overview (/checkout-step-two.html)
 *  - complete: order confirmation (/checkout-complete.html)
 */

const { By, until } = require("selenium-webdriver");

class CheckoutPage {
  /**
   * @param {import("selenium-webdriver").WebDriver} driver
   */
  constructor(driver) {
    this.driver = driver;

    // Step one — customer information.
    this.firstNameInput = By.css("#first-name");
    this.lastNameInput = By.css("#last-name");
    this.postalCodeInput = By.css("#postal-code");
    this.continueButton = By.css("[data-test='continue']");

    // Step two — order overview.
    this.summaryTotalLabel = By.css(".summary_total_label");
    this.finishButton = By.css("[data-test='finish']");

    // Complete — confirmation.
    this.completeHeader = By.css(".complete-header");
  }

  /**
   * Fills in the customer information form (checkout step one) and
   * continues to step two.
   * @param {string} firstName
   * @param {string} lastName
   * @param {string} postalCode
   */
  async fillCustomerInfo(firstName, lastName, postalCode) {
    const firstNameEl = await this.driver.wait(
      until.elementLocated(this.firstNameInput),
      10000
    );
    await firstNameEl.sendKeys(firstName);

    const lastNameEl = await this.driver.findElement(this.lastNameInput);
    await lastNameEl.sendKeys(lastName);

    const postalCodeEl = await this.driver.findElement(this.postalCodeInput);
    await postalCodeEl.sendKeys(postalCode);

    const continueBtn = await this.driver.findElement(this.continueButton);
    await continueBtn.click();
  }

  /**
   * Returns the "Total: $x.xx" label text from checkout step two.
   * @returns {Promise<string>}
   */
  async getSummaryTotalText() {
    const totalEl = await this.driver.wait(
      until.elementLocated(this.summaryTotalLabel),
      10000
    );
    return totalEl.getText();
  }

  /**
   * Clicks "Finish" on checkout step two to complete the order.
   */
  async finish() {
    const finishBtn = await this.driver.wait(
      until.elementLocated(this.finishButton),
      10000
    );
    await finishBtn.click();
  }

  /**
   * Returns the confirmation header text on the order complete page,
   * e.g. "Thank you for your order!".
   * @returns {Promise<string>}
   */
  async getCompleteHeaderText() {
    const headerEl = await this.driver.wait(
      until.elementLocated(this.completeHeader),
      10000
    );
    return headerEl.getText();
  }
}

module.exports = CheckoutPage;
