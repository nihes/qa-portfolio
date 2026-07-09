// ***********************************************
// Custom Cypress commands for the saucedemo.com suite.
// ***********************************************

/**
 * Logs in to saucedemo.com by visiting the login page and submitting
 * the given credentials. Does not assert on the outcome — callers are
 * responsible for asserting success (redirect to /inventory.html) or
 * failure (error banner) depending on the test scenario.
 */
Cypress.Commands.add("login", (username: string, password: string) => {
  cy.visit("/");
  cy.get("#user-name").clear().type(username);
  cy.get("#password").clear().type(password, { log: false });
  cy.get("#login-button").click();
});

// Augment the global Cypress namespace so `cy.login(...)` is typed
// correctly everywhere in the test suite.
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command that logs in via the saucedemo.com login form.
       * @param username saucedemo username, e.g. "standard_user"
       * @param password saucedemo password, e.g. "secret_sauce"
       */
      login(username: string, password: string): Chainable<void>;
    }
  }
}

export {};
