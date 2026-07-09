// Negative validation coverage for checkout step one on saucedemo.com:
// submitting the customer information form with a missing first name,
// last name, or postal code each surfaces the matching
// "<Field> is required" error banner and keeps the user on step one.

describe("Checkout step-one validation", () => {
  beforeEach(() => {
    cy.login("standard_user", "secret_sauce");
    cy.location("pathname").should("eq", "/inventory.html");

    cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    cy.get(".shopping_cart_link").click();
    cy.location("pathname").should("eq", "/cart.html");

    cy.get('[data-test="checkout"]').click();
    cy.location("pathname").should("eq", "/checkout-step-one.html");
  });

  it('shows "First Name is required" when the first name is missing', () => {
    cy.get("#last-name").type("Doe");
    cy.get("#postal-code").type("10001");
    cy.get('[data-test="continue"]').click();

    cy.get('[data-test="error"]').should(
      "contain.text",
      "First Name is required"
    );
    cy.location("pathname").should("eq", "/checkout-step-one.html");
  });

  it('shows "Last Name is required" when the last name is missing', () => {
    cy.get("#first-name").type("John");
    cy.get("#postal-code").type("10001");
    cy.get('[data-test="continue"]').click();

    cy.get('[data-test="error"]').should(
      "contain.text",
      "Last Name is required"
    );
    cy.location("pathname").should("eq", "/checkout-step-one.html");
  });

  it('shows "Postal Code is required" when the postal code is missing', () => {
    cy.get("#first-name").type("John");
    cy.get("#last-name").type("Doe");
    cy.get('[data-test="continue"]').click();

    cy.get('[data-test="error"]').should(
      "contain.text",
      "Postal Code is required"
    );
    cy.location("pathname").should("eq", "/checkout-step-one.html");
  });
});
