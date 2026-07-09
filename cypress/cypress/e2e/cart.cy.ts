// Cart scenarios for saucedemo.com: adding items updates the cart
// badge, the cart page lists the right rows, and removing an item
// updates the badge again.

describe("Cart", () => {
  beforeEach(() => {
    cy.login("standard_user", "secret_sauce");
    cy.location("pathname").should("eq", "/inventory.html");
  });

  it("adds two items to the cart and reflects the count in the badge", () => {
    cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    cy.get('[data-test="add-to-cart-sauce-labs-bike-light"]').click();

    cy.get(".shopping_cart_badge").should("have.text", "2");

    cy.get(".shopping_cart_link").click();
    cy.location("pathname").should("eq", "/cart.html");
    cy.get(".cart_item").should("have.length", 2);
  });

  it("removes one item from the cart and updates the badge", () => {
    cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    cy.get('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
    cy.get(".shopping_cart_badge").should("have.text", "2");

    cy.get(".shopping_cart_link").click();
    cy.location("pathname").should("eq", "/cart.html");
    cy.get(".cart_item").should("have.length", 2);

    cy.get('[data-test="remove-sauce-labs-bike-light"]').click();

    cy.get(".cart_item").should("have.length", 1);
    cy.get(".shopping_cart_badge").should("have.text", "1");
  });
});
