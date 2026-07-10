"use strict";

/**
 * Login flow tests for saucedemo.com — happy path and locked-out user
 * negative case.
 */

const { expect } = require("chai");
const { buildDriver } = require("../helpers/driver");
const LoginPage = require("../pages/LoginPage");
const InventoryPage = require("../pages/InventoryPage");

describe("SauceDemo — Login", function () {
  let driver;
  let loginPage;
  let inventoryPage;

  // A fresh browser per test fully isolates session state (no cookie carryover
  // between the happy-path and locked-out cases).
  beforeEach(async function () {
    driver = await buildDriver();
    loginPage = new LoginPage(driver);
    inventoryPage = new InventoryPage(driver);
    await loginPage.open();
  });

  afterEach(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it("logs in successfully with standard_user and shows the Products page", async function () {
    await loginPage.login("standard_user", "secret_sauce");
    await inventoryPage.waitForLoad();

    const title = await inventoryPage.getTitleText();
    expect(title).to.equal("Products");
  });

  it("shows an error message when logging in with locked_out_user", async function () {
    await loginPage.login("locked_out_user", "secret_sauce");

    const errorText = await loginPage.getErrorText();
    expect(errorText).to.include("Sorry, this user has been locked out.");
  });
});
