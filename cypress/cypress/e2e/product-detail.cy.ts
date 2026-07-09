// Product detail page coverage for saucedemo.com: opening a product from
// the inventory list, verifying its name/price/description, and adding it
// to the cart from the detail page updates the cart badge.

describe("Product detail", () => {
  beforeEach(() => {
    cy.login("standard_user", "secret_sauce");
    cy.location("pathname").should("eq", "/inventory.html");
  });

  it("shows name, price and description, and supports add-to-cart from the detail page", () => {
    cy.get(".inventory_item_name")
      .contains("Sauce Labs Backpack")
      .click();

    cy.location("pathname").should("eq", "/inventory-item.html");

    cy.get(".inventory_details_name").should(
      "have.text",
      "Sauce Labs Backpack"
    );
    cy.get(".inventory_details_price")
      .invoke("text")
      .should("match", /^\$\d+\.\d{2}$/);
    cy.get(".inventory_details_desc")
      .invoke("text")
      .should("have.length.greaterThan", 0);

    cy.get('[data-test="add-to-cart"]').click();
    cy.get(".shopping_cart_badge").should("have.text", "1");

    cy.get('[data-test="back-to-products"]').click();
    cy.location("pathname").should("eq", "/inventory.html");
  });
});
