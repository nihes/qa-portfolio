# Selenium + Mocha + Chai — saucedemo.com

End-to-end UI test suite built with **Selenium WebDriver v4**, **Mocha** and **Chai**,
driving headless Chrome against the public demo shop
[saucedemo.com](https://www.saucedemo.com/).

This suite intentionally uses **plain CommonJS + raw Selenium WebDriver** (no
test-runner-provided browser automation, unlike the `playwright/` and `cypress/`
suites in this portfolio) to demonstrate comfort with the "classic" WebDriver
API, explicit waits, and building a Page Object Model from scratch on top of it.

## Stack

- [selenium-webdriver](https://www.npmjs.com/package/selenium-webdriver) v4 — W3C WebDriver client, Selenium Manager auto-provisions chromedriver
- [Mocha](https://mochajs.org/) — test runner
- [Chai](https://www.chaijs.com/) v4 (CommonJS `require`, not the ESM-only v5) — assertions
- Headless Chrome (`--headless=new`)

## Project structure

```
selenium-mocha/
├── helpers/
│   └── driver.js          # buildDriver() — headless Chrome WebDriver factory
├── pages/
│   ├── LoginPage.js        # #user-name / #password / #login-button / error banner
│   ├── InventoryPage.js    # product list, add/remove to cart, sort, cart badge
│   ├── CartPage.js         # cart rows, checkout button
│   └── CheckoutPage.js     # steps one & two + order confirmation
├── tests/
│   ├── login.test.js       # valid login + locked_out_user negative case
│   └── checkout.test.js    # full purchase flow: login → cart → checkout → confirmation
├── .mocharc.json
└── package.json
```

## Prerequisites

- Node.js 18+
- **Google Chrome installed locally.** Selenium Manager (bundled with
  `selenium-webdriver` v4.6+) automatically detects the installed Chrome
  version and downloads a matching `chromedriver` binary — no separate
  driver installation or `chromedriver` npm package needed.

## Run

```bash
npm install
npm test              # console reporter
npm run test:report   # also writes an HTML report to mochawesome-report/
```

`npm test` runs `mocha`, which picks up `.mocharc.json` (spec glob
`tests/**/*.test.js`, 60s timeout per test to allow for headless browser
startup and network calls to the live demo site). `npm run test:report`
additionally generates a self-contained **mochawesome** HTML report.

## What's covered

- **Login** (`tests/login.test.js`)
  - `standard_user` / `secret_sauce` logs in successfully and lands on the
    "Products" inventory page.
  - `locked_out_user` is shown the `"Sorry, this user has been locked out."`
    error banner (`[data-test="error"]`).
- **Checkout** (`tests/checkout.test.js`)
  - Login → add two products to the cart by their `data-test` slug
    (`sauce-labs-backpack`, `sauce-labs-bike-light`) → verify the
    `.shopping_cart_badge` count → open the cart and verify both line items
    are present → proceed to checkout → fill in first name / last name /
    postal code → verify the order summary total is rendered → finish → assert
    the `"Thank you for your order!"` confirmation header.

## Design notes

- Every page interaction goes through a **Page Object** (`pages/`) — tests
  read as business-level steps, not raw locators.
- All element access uses **explicit waits**
  (`driver.wait(until.elementLocated(...), timeoutMs)`) rather than fixed
  `sleep()` calls, to keep the suite fast and non-flaky against a live network
  dependency.
- `helpers/driver.js` centralizes headless Chrome options
  (`--headless=new`, `--no-sandbox`, `--disable-dev-shm-usage`,
  `--window-size=1280,800`) so every test file gets an identical, CI-friendly
  browser instance.
- **React-safe interaction helpers** (`helpers/driver.js`): Sauce Demo is a
  React SPA where, under headless Chrome, native WebDriver `click()` can be a
  no-op and `sendKeys()` can drop keystrokes right after a navigation. The suite
  therefore uses `jsClick`/`clickAndWaitForUrl`/`clickAndWaitForElement` (JS
  click + wait-for-outcome with retry) and `typeInto` (sendKeys with a
  React-aware value-setter fallback), keeping the flow deterministic on CI.
- Login specs use a **fresh browser per test** for full session isolation.
