"use strict";

/**
 * Page Object for the saucedemo.com login page (https://www.saucedemo.com/).
 */

const { By, until } = require("selenium-webdriver");

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
    const usernameEl = await this.driver.wait(
      until.elementLocated(this.usernameInput),
      10000
    );
    await usernameEl.clear();
    await usernameEl.sendKeys(username);

    const passwordEl = await this.driver.findElement(this.passwordInput);
    await passwordEl.clear();
    await passwordEl.sendKeys(password);

    const loginBtn = await this.driver.findElement(this.loginButton);
    await loginBtn.click();
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
