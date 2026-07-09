# qa-portfolio-playwright

End-to-end UI test suite for [saucedemo.com](https://www.saucedemo.com), built with
[Playwright](https://playwright.dev) and TypeScript, following the Page Object Model (POM)
pattern.

## Tech stack

- **Playwright Test** (`@playwright/test`) — test runner, assertions, tracing, HTML reporting
- **TypeScript** — typed page objects and specs
- **Page Object Model** — one class per page (`LoginPage`, `InventoryPage`, `CartPage`,
  `CheckoutPage`) encapsulating locators and reusable actions/assertions

## Project structure

```
playwright/
├── package.json
├── playwright.config.ts
├── pages/
│   ├── LoginPage.ts
│   ├── InventoryPage.ts
│   ├── CartPage.ts
│   └── CheckoutPage.ts
└── tests/
    ├── login.spec.ts
    ├── checkout.spec.ts
    └── sorting.spec.ts
```

## Test coverage

- **login.spec.ts** — successful login as `standard_user`, `locked_out_user` error banner,
  invalid credentials, and empty-field validation.
- **checkout.spec.ts** — full happy-path purchase: login, add two products to the cart,
  verify cart badge/count, fill in checkout details, verify the order overview and total,
  and confirm the "Thank you for your order!" completion screen.
- **sorting.spec.ts** — product list sorting by price (low to high) and by name (Z to A),
  verifying the rendered order matches the expected sort.

## Prerequisites

- Node.js 18+

## Setup

```bash
npm install
npx playwright install chromium
```

## Running the tests

```bash
npm test
```

Run in headed mode (visible browser):

```bash
npm run test:headed
```

## Viewing the HTML report

After a run, open the generated HTML report:

```bash
npm run report
```

## Notes

- Tests target the public demo site `https://www.saucedemo.com` — no credentials or
  environment secrets are required; the demo accounts (`standard_user`,
  `locked_out_user`, `problem_user`, `performance_glitch_user`) all use the password
  `secret_sauce`.
- Configuration lives in `playwright.config.ts`: base URL, tracing on first retry,
  screenshots on failure, one retry, and both `list` and `html` reporters.
