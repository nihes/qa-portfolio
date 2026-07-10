# Cypress — E2E UI automation (TypeScript, custom commands)

End-to-end tests for [saucedemo.com](https://www.saucedemo.com), written in
Cypress with TypeScript. Part of a Senior QA Engineer portfolio demonstrating
idiomatic Cypress test design (custom commands, `should` assertions, no
fixed-time waits).

## What's covered

- **`cypress/e2e/login.cy.ts`** — valid login, `locked_out_user`, and invalid
  credentials.
- **`cypress/e2e/cart.cy.ts`** — adding items updates the cart badge and cart
  page, removing an item updates the badge again.
- **`cypress/e2e/checkout.cy.ts`** — full happy-path purchase flow from login
  through order confirmation.
- **`cypress/e2e/sorting.cy.ts`** — sorting by price (low to high) orders items
  ascending, and sorting by name (Z to A) orders items in reverse alphabetical
  order.
- **`cypress/e2e/checkout-validation.cy.ts`** — negative checkout step-one
  coverage: missing first name, last name, or postal code each surfaces the
  matching "<Field> is required" error banner and keeps the user on step one.
- **`cypress/e2e/product-detail.cy.ts`** — opening a product from the
  inventory list, verifying name/price/description on the detail page, and
  adding to cart from the detail page updates the cart badge.

## Project structure

```
cypress/
  e2e/
    login.cy.ts
    cart.cy.ts
    checkout.cy.ts
    sorting.cy.ts
    checkout-validation.cy.ts
    product-detail.cy.ts
  support/
    e2e.ts          # loads custom commands before every spec
    commands.ts      # cy.login(username, password) custom command
cypress.config.ts
package.json
tsconfig.json
```

## Requirements

- Node.js 18+ (any version compatible with Cypress 13.x)

## Setup

```bash
npm install
```

## Running the tests

Headless run (CI-style, used by `npm test`):

```bash
npm test
```

Interactive runner (Cypress GUI, useful while developing tests):

```bash
npm run open
```

## Notes

- Base URL is configured in `cypress.config.ts` as
  `https://www.saucedemo.com` — specs use relative paths (e.g. `cy.visit("/")`).
- Test users: `standard_user`, `locked_out_user`, `problem_user`,
  `performance_glitch_user`. Password for all: `secret_sauce`.
- No `cy.wait(<ms>)` calls are used — every wait is an implicit retry via
  Cypress's built-in assertion/query retrying (`should`, `cy.get`, etc.).
