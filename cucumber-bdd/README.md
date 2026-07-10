# qa-portfolio-cucumber

BDD regression suite for [Sauce Demo](https://www.saucedemo.com) using
[`@cucumber/cucumber`](https://github.com/cucumber/cucumber-js) as the
Gherkin/test runner and [Playwright](https://playwright.dev) as the browser
automation driver.

Everything is plain **CommonJS JavaScript** - there is no TypeScript, no
bundler and no build step, so `npm test` works straight out of the box.

## What's covered

- `features/checkout.feature`
  - `@smoke` Successful end-to-end checkout of a single product (add to cart →
    cart page → checkout details → order overview → order confirmation).
  - `@regression` A `Scenario Outline` that adds two different products and
    asserts the shopping cart badge count via an `Examples` table.
  - `@regression` Negative case: checkout is blocked with a validation error
    when the postal code is missing.
- `features/cart.feature`
  - `@smoke` Adding an item increments the cart badge.
  - `@regression` Removing an item decrements the cart badge.
- `features/products.feature`
  - `@regression` A `Scenario Outline` sorting the product list four ways
    (price low→high / high→low, name A→Z / Z→A) and asserting the resulting
    order via an `Examples` data table.

## Selective runs by tag

Scenarios are tagged `@smoke` / `@regression` (plus area tags `@checkout`,
`@cart`, `@products`) so subsets can be run independently:

```bash
npm test              # everything
npm run test:smoke    # only @smoke  (fast confidence check)
npm run test:regression   # only @regression
npx cucumber-js --tags "@products"   # any ad-hoc tag expression
```

## Project layout

```
cucumber-bdd/
├── package.json
├── cucumber.js                       # cucumber-js "default" profile
├── features/
│   ├── checkout.feature
│   ├── cart.feature
│   ├── products.feature              # sorting Scenario Outline
│   ├── support/
│   │   ├── world.js                  # custom World: this.page / this.context
│   │   └── hooks.js                  # Before/After browser + context lifecycle
│   └── step_definitions/
│       ├── checkout.steps.js         # checkout/cart Given/When/Then steps
│       └── products.steps.js         # sorting steps
└── reports/
    └── cucumber-report.html          # generated after `npm test`
```

## Setup

```bash
cd C:/Users/ivana/qa-portfolio/cucumber-bdd
npm install
npx playwright install chromium
```

(`npm run install:browsers` is also wired up as a shortcut for the second
command above.)

## Running the suite

```bash
npm test
```

This runs `cucumber-js` using the `default` profile defined in
`cucumber.js`, which:

- loads every `features/**/*.feature` file,
- loads support code and step definitions from
  `features/support/**/*.js` and `features/step_definitions/**/*.js`,
- prints a live progress bar to the terminal, and
- writes a self-contained HTML report to
  `C:/Users/ivana/qa-portfolio/cucumber-bdd/reports/cucumber-report.html`
  once the run finishes - open that file in any browser to see a
  scenario-by-scenario breakdown with pass/fail status.

## Notes

- Login runs headless Chromium by default (`chromium.launch()` with no
  `headless: false` override). Add `{ headless: false }` in
  `features/support/hooks.js` if you want to watch the browser while
  debugging locally.
- `world.js` exposes a `toSlug(productName)` helper that turns a
  human-readable product name (e.g. `"Sauce Labs Backpack"`) into the
  `data-test` slug Sauce Demo uses on its buttons
  (`add-to-cart-sauce-labs-backpack`, `remove-sauce-labs-backpack`, ...);
  the step definitions use the same conversion so new products can be added
  to `.feature` files without touching any step definition code.
