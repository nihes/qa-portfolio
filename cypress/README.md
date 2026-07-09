# QA Portfolio — Cypress (TypeScript) E2E Suite

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

## Project structure

```
cypress/
  e2e/
    login.cy.ts
    cart.cy.ts
    checkout.cy.ts
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
