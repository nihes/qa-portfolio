/**
 * Test data factories for e-commerce QA suites.
 *
 * Why factories instead of hard-coded fixtures?
 *  - Isolation: every call produces a fresh, independent record, so tests
 *    don't collide on shared state (e.g. two parallel tests both trying to
 *    register "test@test.com").
 *  - Realism without PII: @faker-js/faker generates data that *looks* real
 *    (names, addresses, card numbers) but is entirely synthetic, so it is
 *    safe to commit, log, and share, and never touches real customer data.
 *  - Overridable: every factory accepts a partial `overrides` object so a
 *    test can pin exactly the field(s) it cares about (e.g. an invalid
 *    email for a negative test) while everything else stays randomized.
 *  - Determinism on demand: call seed(n) before generating data to make a
 *    "random" run fully reproducible - useful for debugging a failure or
 *    snapshotting expected output.
 *
 * All factories are plain functions returning plain objects - no classes,
 * no hidden state - so they compose trivially (e.g. makeOrder() builds on
 * top of makeCustomer(), makeAddress() and makeProduct()).
 */

'use strict';

const { faker } = require('@faker-js/faker');

/**
 * Seed the underlying faker RNG so subsequent factory calls are
 * deterministic. Call this at the top of a test (or in a beforeEach) when
 * you need repeatable data instead of a fresh random value every run.
 *
 * @param {number} n - seed value; the same n always produces the same
 *   sequence of generated values.
 */
function seed(n) {
  faker.seed(n);
}

/**
 * Build a synthetic customer record.
 *
 * @param {object} [overrides] - fields to force instead of generating them.
 * @returns {{firstName: string, lastName: string, email: string, password: string, phone: string}}
 */
function makeCustomer(overrides = {}) {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  const customer = {
    firstName,
    lastName,
    // Base the email on the generated names so it reads as a real account,
    // and lower-case it since most e-commerce backends normalize on save.
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    password: faker.internet.password({ length: 12 }),
    phone: faker.phone.number(),
  };

  return { ...customer, ...overrides };
}

/**
 * Build a synthetic shipping/billing address.
 *
 * @param {object} [overrides] - fields to force instead of generating them.
 * @returns {{street: string, city: string, postalCode: string, country: string}}
 */
function makeAddress(overrides = {}) {
  const address = {
    street: faker.location.streetAddress(),
    city: faker.location.city(),
    postalCode: faker.location.zipCode(),
    country: faker.location.country(),
  };

  return { ...address, ...overrides };
}

/**
 * Build a synthetic (Luhn-valid-looking, but never a real network's) test
 * credit card. Faker's finance module is explicitly designed to produce
 * numbers that are safe to use in test/staging payment sandboxes.
 *
 * @param {object} [overrides] - fields to force instead of generating them.
 * @returns {{number: string, cvv: string, expiry: string}}
 */
function makeCreditCard(overrides = {}) {
  const card = {
    // Strip separators so callers get a plain digit string, matching what
    // most payment form fields expect.
    number: faker.finance.creditCardNumber().replace(/\D/g, ''),
    cvv: faker.finance.creditCardCVV(),
    expiry: `${String(faker.number.int({ min: 1, max: 12 })).padStart(2, '0')}/${faker.number.int({ min: 26, max: 32 })}`,
  };

  return { ...card, ...overrides };
}

/**
 * Build a synthetic catalog product line.
 *
 * @param {object} [overrides] - fields to force instead of generating them.
 * @returns {{sku: string, name: string, price: number, quantity: number}}
 */
function makeProduct(overrides = {}) {
  const product = {
    sku: faker.string.alphanumeric({ length: 8, casing: 'upper' }),
    name: faker.commerce.productName(),
    // faker.commerce.price returns a string; cast to a number since callers
    // will typically do arithmetic with it (totals, discounts, tax).
    price: Number(faker.commerce.price({ min: 1, max: 500, dec: 2 })),
    quantity: faker.number.int({ min: 1, max: 20 }),
  };

  return { ...product, ...overrides };
}

/**
 * Build a full synthetic order composed of a customer, address, one or
 * more line items, and a computed grand total.
 *
 * Nested pieces can be supplied via overrides (e.g. pass a specific
 * `customer` so the order belongs to an already-created test account), and
 * a caller can also pin the final `total` directly for edge-case tests.
 *
 * @param {object} [overrides]
 * @param {object} [overrides.customer] - reuse an existing makeCustomer() result.
 * @param {object} [overrides.address] - reuse an existing makeAddress() result.
 * @param {Array<object>} [overrides.items] - reuse existing makeProduct() results.
 * @param {number} [overrides.total] - force the total instead of computing it.
 * @returns {{customer: object, address: object, items: Array<object>, total: number}}
 */
function makeOrder(overrides = {}) {
  const customer = overrides.customer || makeCustomer();
  const address = overrides.address || makeAddress();
  const items =
    overrides.items ||
    Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, () => makeProduct());

  const computedTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = {
    customer,
    address,
    items,
    total: Number(computedTotal.toFixed(2)),
  };

  return { ...order, ...overrides };
}

module.exports = {
  seed,
  makeCustomer,
  makeAddress,
  makeCreditCard,
  makeProduct,
  makeOrder,
};
