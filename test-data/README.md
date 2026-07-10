# Test Data — synthetic data factories (@faker-js/faker + Mocha)

Data-driven testing suite built on **Mocha + Chai (v4) + @faker-js/faker**.
It demonstrates how a QA suite generates its own realistic, disposable test
data instead of relying on hand-typed fixtures or - worse - real customer
records.

## Why test data management matters

Most flaky or brittle test suites trace back to how their test data is
handled, not to the assertions themselves. This suite exists to show the
opposite pattern:

- **Isolation.** Hard-coded fixtures (`test@test.com`, `SKU-001`, ...) get
  reused across tests and environments until two tests collide on the same
  record - a classic source of "works alone, fails in CI" flakiness. A
  factory called once per test produces a fresh, independent record every
  time, so tests never fight over shared state.
- **Repeatability.** Random data is great for isolation but bad for
  debugging a failure you can't reproduce. The `seed()` helper below gives
  you the best of both: random-looking data that is fully reproducible on
  demand.
- **Edge and boundary coverage.** Every factory accepts an `overrides`
  object, so the same factory that generates "normal" data for a happy-path
  test can be pinned to produce boundary or invalid values for a negative
  test (empty postal code, a card number with letters, a negative price),
  without duplicating the rest of the object by hand.
- **PII-safe synthetic data.** Nothing generated here is a real person,
  address, or card number. Faker output is safe to commit to a repo, print
  in CI logs, paste into a bug report, or run against a staging environment
  - unlike scrubbed exports of real production data, which still carry risk
  even after "anonymization".

## What's in here

`src/factories.js` exports composable factory functions:

| Factory | Produces |
|---|---|
| `makeCustomer(overrides?)` | `firstName`, `lastName`, `email`, `password`, `phone` |
| `makeAddress(overrides?)` | `street`, `city`, `postalCode`, `country` |
| `makeCreditCard(overrides?)` | `number`, `cvv`, `expiry` (sandbox-safe, never a real network) |
| `makeProduct(overrides?)` | `sku`, `name`, `price`, `quantity` |
| `makeOrder(overrides?)` | `customer`, `address`, `items[]`, `total` (composes the factories above) |
| `seed(n)` | seeds the underlying faker RNG for deterministic output |

`tests/factories.test.js` covers:

- **Shape/validity** - every factory returns the right keys and
  plausible-looking values (email contains `@`, price is a positive
  number, card number is digits-only, postal code is present, etc.).
- **Data-driven generation** - a batch of 25 generated customers is
  asserted to have unique emails and all required fields, the same
  pattern you'd use to drive a `for (const row of dataset)` API/UI test.
- **Determinism** - calling `seed(42)` before generating data twice
  produces byte-for-byte identical objects (`deep.equal`), while different
  seeds produce different data.

## Using the factories in your own suite

The factories are plain CommonJS exports with no test-framework
dependency, so they drop straight into any Mocha/Jest/Cypress/Playwright
suite in this portfolio:

```js
const { makeCustomer, makeAddress, makeOrder, seed } = require('../test-data/src/factories');

// Happy path: feed a fresh, unique customer into a registration test.
it('registers a new customer', async function () {
  const customer = makeCustomer();
  const response = await api.post('/customers', customer);
  expect(response.status).to.equal(201);
});

// Edge case: pin just the field under test, let the factory fill the rest.
it('rejects an invalid postal code', async function () {
  const address = makeAddress({ postalCode: '' });
  const response = await api.post('/addresses', address);
  expect(response.status).to.equal(400);
});

// Data-driven: run the same flow across a generated dataset.
const customers = Array.from({ length: 10 }, () => makeCustomer());
customers.forEach((customer) => {
  it(`registers ${customer.email}`, async function () {
    /* ... */
  });
});
```

### The `seed()` determinism trick

Faker's output is random by default - great for isolation, bad if a test
fails and you need to reproduce the *exact* data that triggered it. Call
`seed(n)` right before generating the data you want to pin:

```js
const { seed, makeOrder } = require('../test-data/src/factories');

seed(42);
const order = makeOrder(); // always the same order, every run, on every machine
```

Use a fixed seed in `beforeEach` when a whole suite needs reproducible
fixtures (e.g. visual regression baselines that embed generated text), and
leave it unseeded everywhere else so tests keep getting fresh, isolated
data.

## How this complements the rest of the portfolio

This suite is a **data provider**, not a runner - it has no UI or HTTP
assertions of its own. It's meant to be imported by the other suites in
this portfolio wherever they currently hand-type fixtures, for example:

- `api-mocha/` - feed `makeCustomer()` / `makeOrder()` into the REST CRUD
  and negative-case tests instead of static JSON fixtures.
- `cypress/` / `playwright/` - fill a registration or checkout form with
  `makeCustomer()` + `makeAddress()` + `makeCreditCard()` for true
  data-driven UI runs.
- `cucumber-bdd/` - back a `Given a registered customer` step with
  `makeCustomer()` so every scenario run gets its own account.

## Run

```bash
npm install
npm test
```

Mocha config lives in `.mocharc.json` (`tests/**/*.test.js`, 10s timeout).
