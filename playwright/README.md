# Playwright — E2E UI automation (TypeScript, Page Object Model)

End-to-end UI test suite for [saucedemo.com](https://www.saucedemo.com), built with
[Playwright](https://playwright.dev) and TypeScript, following the Page Object Model (POM)
pattern.

## Tech stack

- **Playwright Test** (`@playwright/test`) — test runner, assertions, tracing, HTML reporting
- **TypeScript** — typed page objects and specs
- **Page Object Model** — one class per page (`LoginPage`, `InventoryPage`, `CartPage`,
  `CheckoutPage`, `ProductPage`) encapsulating locators and reusable actions/assertions

## Project structure

```
playwright/
├── package.json
├── playwright.config.ts
├── pages/
│   ├── LoginPage.ts
│   ├── InventoryPage.ts
│   ├── CartPage.ts
│   ├── CheckoutPage.ts
│   └── ProductPage.ts
└── tests/
    ├── login.spec.ts
    ├── checkout.spec.ts
    ├── checkout-validation.spec.ts
    ├── sorting.spec.ts
    ├── cart.spec.ts
    └── product-detail.spec.ts
```

## Test coverage

- **login.spec.ts** — successful login as `standard_user`, `locked_out_user` error banner,
  invalid credentials, and empty-field validation.
- **checkout.spec.ts** — full happy-path purchase: login, add two products to the cart,
  verify cart badge/count, fill in checkout details, verify the order overview and total,
  and confirm the "Thank you for your order!" completion screen.
- **checkout-validation.spec.ts** — negative checkout step-one coverage: submitting the
  customer information form with a missing first name, last name, or postal code each
  surfaces the matching "<Field> is required" error banner and keeps the user on step one.
- **sorting.spec.ts** — product list sorting by price (low to high) and by name (Z to A),
  verifying the rendered order matches the expected sort.
- **cart.spec.ts** — adding two items updates the cart badge and the cart page's row
  count; removing one item from the cart page updates both the row count and the badge.
- **product-detail.spec.ts** — opening a product from the inventory list shows its name,
  price and description on the detail page, adding to cart from the detail page updates
  the badge, and "Back to products" returns to the inventory page.

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

## Cross-browser (opt-in)

CI runs **chromium** only to stay fast. Firefox and WebKit projects are included
(commented) in `playwright.config.ts` — uncomment them, install the engines, and
run all three, or target one:

```bash
npx playwright install firefox webkit
npm test                        # all enabled projects
npx playwright test --project=firefox
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

## Reports

After a run, `npm run report` opens `playwright-report/` (the HTML report; also
auto-uploaded as a CI artifact).
