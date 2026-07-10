"use strict";

/**
 * Page Object for the saucedemo.com login page (https://www.saucedemo.com/).
 */

const { By, until } = require("selenium-webdriver");
const { jsClick, typeInto } = require("../helpers/driver");

const BASE_URL = "https://www.saucedemo.com";

class LoginPage {
  /**
   * @param {import("selenium-webdriver").WebDriver} driver
   */
  constructor(driver) {
    this.driver = driver;

    this.usernameInput = By.css("#user-name");
    this.passwordInput = By.css("#password");
    this.loginButton = By.css("#login-button");
    this.errorMessage = By.css("[data-test='error']");
  }

  /**
   * Navigates to the saucedemo login page and waits for the form to render.
   */
  async open() {
    await this.driver.get(BASE_URL);
    await this.driver.wait(until.elementLocated(this.loginButton), 10000);
  }

  /**
   * Fills in credentials and submits the login form.
   * @param {string} username
   * @param {string} password
   */
  async login(username, password) {
    await typeInto(this.driver, this.usernameInput, username);
    await typeInto(this.driver, this.passwordInput, password);

    // Submit, then wait for a definite outcome (inventory page OR the error
    // banner), retrying the click if React hadn't wired the submit handler yet
    // (a hydration timing race that shows up on slower CI runners).
    let lastError;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const loginBtn = await this.driver.findElement(this.loginButton);
      await jsClick(this.driver, loginBtn);
      try {
        await this.driver.wait(async () => {
          const url = await this.driver.getCurrentUrl();
          if (url.includes("/inventory.html")) return true;
          const errors = await this.driver.findElements(this.errorMessage);
          return errors.length > 0;
        }, 5000);
        return;
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError;
  }

  /**
   * Waits for and returns the text of the login error banner.
   * @returns {Promise<string>}
   */
  async getErrorText() {
    const errorEl = await this.driver.wait(
      until.elementLocated(this.errorMessage),
      10000
    );
    return errorEl.getText();
  }
}

module.exports = LoginPage;
