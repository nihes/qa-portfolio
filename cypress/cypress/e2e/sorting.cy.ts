// Product sorting coverage on the saucedemo.com inventory page: sorting
// by price (low to high) orders items ascending, and sorting by name
// (Z to A) orders items in reverse alphabetical order.

describe("Sorting", () => {
  beforeEach(() => {
    cy.login("standard_user", "secret_sauce");
    cy.location("pathname").should("eq", "/inventory.html");
  });

  it("sorts by price low to high in ascending order", () => {
    cy.get('[data-test="product-sort-container"]').select("lohi");

    cy.get(".inventory_item_price")
      .then(($prices) => {
        return Cypress._.map($prices, (el) =>
          Number(el.textContent!.replace("$", ""))
        );
      })
      .then((prices) => {
        const sortedAscending = [...prices].sort((a, b) => a - b);
        expect(prices).to.deep.equal(sortedAscending);
      });
  });

  it("sorts by name Z to A in reverse alphabetical order", () => {
    cy.get('[data-test="product-sort-container"]').select("za");

    cy.get(".inventory_item_name")
      .then(($names) => {
        return Cypress._.map($names, (el) => el.textContent!);
      })
      .then((names) => {
        const sortedDescending = [...names].sort((a, b) => b.localeCompare(a));
        expect(names).to.deep.equal(sortedDescending);
      });
  });
});
