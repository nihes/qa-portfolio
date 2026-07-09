// Full happy-path checkout flow on saucedemo.com: login, add an item,
// go through the two-step checkout form, and land on the order
// confirmation screen.

describe("Checkout", () => {
  it("completes a purchase end to end", () => {
    cy.login("standard_user", "secret_sauce");
    cy.location("pathname").should("eq", "/inventory.html");

    cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    cy.get(".shopping_cart_badge").should("have.text", "1");

    cy.get(".shopping_cart_link").click();
    cy.location("pathname").should("eq", "/cart.html");
    cy.get(".cart_item").should("have.length", 1);

    cy.get('[data-test="checkout"]').click();
    cy.location("pathname").should("eq", "/checkout-step-one.html");

    cy.get("#first-name").type("Ivan");
    cy.get("#last-name").type("Andrijko");
    cy.get("#postal-code").type("04001");
    cy.get('[data-test="continue"]').click();

    cy.location("pathname").should("eq", "/checkout-step-two.html");
    cy.get(".summary_total_label").should("contain.text", "Total:");

    cy.get('[data-test="finish"]').click();

    cy.location("pathname").should("eq", "/checkout-complete.html");
    cy.get(".complete-header").should(
      "contain.text",
      "Thank you for your order!"
    );
  });
});
