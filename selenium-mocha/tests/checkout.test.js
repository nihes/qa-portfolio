"use strict";

/**
 * End-to-end checkout flow test for saucedemo.com:
 * login -> add two items to cart -> go to cart -> checkout ->
 * fill customer info -> finish -> assert order confirmation.
 */

const { expect } = require("chai");
const { buildDriver } = require("../helpers/driver");
const LoginPage = require("../pages/LoginPage");
const InventoryPage = require("../pages/InventoryPage");
const CartPage = require("../pages/CartPage");
const CheckoutPage = require("../pages/CheckoutPage");

describe("SauceDemo — Checkout flow", function () {
  let driver;
  let loginPage;
  let inventoryPage;
  let cartPage;
  let checkoutPage;

  before(async function () {
    driver = await buildDriver();
    loginPage = new LoginPage(driver);
    inventoryPage = new InventoryPage(driver);
    cartPage = new CartPage(driver);
    checkoutPage = new CheckoutPage(driver);
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it("completes a purchase for two items end to end", async function () {
    // 1. Log in.
    await loginPage.open();
    await loginPage.login("standard_user", "secret_sauce");
    await inventoryPage.waitForLoad();

    // 2. Add two products to the cart and verify the cart badge updates.
    await inventoryPage.addToCartBySlug("sauce-labs-backpack");
    await inventoryPage.addToCartBySlug("sauce-labs-bike-light");

    const badgeCount = await inventoryPage.getCartBadgeCount();
    expect(badgeCount).to.equal(2);

    // 3. Go to the cart and verify both items are present.
    await inventoryPage.goToCart();
    await cartPage.waitForLoad();

    const itemCount = await cartPage.getItemCount();
    expect(itemCount).to.equal(2);

    const itemNames = await cartPage.getItemNames();
    expect(itemNames).to.include.members(["Sauce Labs Backpack", "Sauce Labs Bike Light"]);

    // 4. Proceed to checkout and fill in customer information.
    await cartPage.checkout();
    await checkoutPage.fillCustomerInfo("Ivan", "Andrijko", "83104");

    // 5. Verify the order overview shows a non-empty total, then finish.
    const totalText = await checkoutPage.getSummaryTotalText();
    expect(totalText).to.match(/Total: \$\d+\.\d{2}/);

    await checkoutPage.finish();

    // 6. Assert the order completion screen is shown.
    const completeHeader = await checkoutPage.getCompleteHeaderText();
    expect(completeHeader).to.equal("Thank you for your order!");
  });
});
