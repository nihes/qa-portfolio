// Login scenarios for saucedemo.com: valid credentials, a locked-out
// account, and invalid credentials.

describe("Login", () => {
  it("logs in with valid standard_user credentials and reaches the inventory page", () => {
    cy.login("standard_user", "secret_sauce");

    cy.location("pathname").should("eq", "/inventory.html");
    cy.get(".title").should("have.text", "Products");
  });

  it("shows an error banner for locked_out_user", () => {
    cy.login("locked_out_user", "secret_sauce");

    cy.location("pathname").should("eq", "/");
    cy.get('[data-test="error"]').should(
      "contain.text",
      "Sorry, this user has been locked out."
    );
  });

  it("shows an error banner for invalid credentials", () => {
    cy.login("invalid_user", "wrong_password");

    cy.location("pathname").should("eq", "/");
    cy.get('[data-test="error"]').should(
      "contain.text",
      "Username and password do not match any user in this service"
    );
  });
});
