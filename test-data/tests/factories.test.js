/**
 * Test data factory suite.
 *
 * Validates:
 *  - each factory returns the expected shape and plausible-looking values
 *  - a data-driven scenario generating N customers and asserting the whole
 *    set is well-formed (unique emails, required fields present)
 *  - determinism: seeding the RNG makes two separate generation runs
 *    produce byte-for-byte identical output
 */

'use strict';

const { expect } = require('chai');
const {
  seed,
  makeCustomer,
  makeAddress,
  makeCreditCard,
  makeProduct,
  makeOrder,
} = require('../src/factories');

describe('Test data factories', function () {
  describe('makeCustomer()', function () {
    it('returns a customer with the expected shape', function () {
      const customer = makeCustomer();

      expect(customer).to.have.all.keys('firstName', 'lastName', 'email', 'password', 'phone');
      expect(customer.firstName).to.be.a('string').and.not.be.empty;
      expect(customer.lastName).to.be.a('string').and.not.be.empty;
      expect(customer.email).to.be.a('string').and.include('@');
      expect(customer.password).to.be.a('string').with.length.at.least(8);
      expect(customer.phone).to.be.a('string').and.not.be.empty;
    });

    it('honors overrides without touching the other generated fields', function () {
      const customer = makeCustomer({ email: 'fixed.qa@example.com' });

      expect(customer.email).to.equal('fixed.qa@example.com');
      // Everything else was still generated normally.
      expect(customer.firstName).to.be.a('string').and.not.be.empty;
    });
  });

  describe('makeAddress()', function () {
    it('returns an address with the expected shape', function () {
      const address = makeAddress();

      expect(address).to.have.all.keys('street', 'city', 'postalCode', 'country');
      expect(address.street).to.be.a('string').and.not.be.empty;
      expect(address.city).to.be.a('string').and.not.be.empty;
      expect(address.postalCode).to.be.a('string').and.not.be.empty;
      expect(address.country).to.be.a('string').and.not.be.empty;
    });

    it('honors overrides, e.g. pinning a country for locale-specific tests', function () {
      const address = makeAddress({ country: 'Slovakia', postalCode: '81106' });

      expect(address.country).to.equal('Slovakia');
      expect(address.postalCode).to.equal('81106');
    });
  });

  describe('makeCreditCard()', function () {
    it('returns a card with the expected shape and digit-only number', function () {
      const card = makeCreditCard();

      expect(card).to.have.all.keys('number', 'cvv', 'expiry');
      expect(card.number).to.match(/^\d+$/, 'card number should contain only digits');
      expect(card.number.length).to.be.at.least(12);
      expect(card.cvv).to.match(/^\d{3,4}$/, 'cvv should be 3-4 digits');
      expect(card.expiry).to.match(/^\d{2}\/\d{2}$/, 'expiry should be MM/YY');
    });
  });

  describe('makeProduct()', function () {
    it('returns a product with the expected shape and a positive price', function () {
      const product = makeProduct();

      expect(product).to.have.all.keys('sku', 'name', 'price', 'quantity');
      expect(product.sku).to.be.a('string').and.not.be.empty;
      expect(product.name).to.be.a('string').and.not.be.empty;
      expect(product.price).to.be.a('number').and.be.above(0);
      expect(product.quantity).to.be.a('number').and.be.above(0);
    });
  });

  describe('makeOrder()', function () {
    it('composes a customer, address and items into a coherent order', function () {
      const order = makeOrder();

      expect(order).to.have.all.keys('customer', 'address', 'items', 'total');
      expect(order.customer).to.have.property('email').that.includes('@');
      expect(order.address).to.have.property('postalCode').that.is.a('string');
      expect(order.items).to.be.an('array').with.length.of.at.least(1);
      order.items.forEach((item) => {
        expect(item).to.have.all.keys('sku', 'name', 'price', 'quantity');
      });

      // The total must equal the sum of each line item's price * quantity.
      const expectedTotal = Number(
        order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
      );
      expect(order.total).to.equal(expectedTotal);
    });

    it('reuses a pre-built customer/address when supplied via overrides', function () {
      const customer = makeCustomer({ email: 'order.owner@example.com' });
      const address = makeAddress({ country: 'Czechia' });

      const order = makeOrder({ customer, address });

      expect(order.customer.email).to.equal('order.owner@example.com');
      expect(order.address.country).to.equal('Czechia');
    });
  });

  describe('data-driven: bulk customer generation', function () {
    it('generates N unique, well-formed customers in one batch', function () {
      const COUNT = 25;
      const customers = Array.from({ length: COUNT }, () => makeCustomer());

      // Required fields present on every generated record.
      customers.forEach((customer) => {
        expect(customer).to.have.all.keys('firstName', 'lastName', 'email', 'password', 'phone');
        expect(customer.email).to.include('@');
      });

      // No two generated customers should collide on email - this is the
      // property a data-driven registration test would rely on to safely
      // run each row in the dataset against a shared environment.
      const emails = customers.map((customer) => customer.email);
      const uniqueEmails = new Set(emails);
      expect(uniqueEmails.size).to.equal(COUNT, 'all generated emails should be unique');
    });
  });

  describe('determinism via seed()', function () {
    it('produces identical output across two runs seeded with the same value', function () {
      seed(42);
      const first = makeOrder();

      seed(42);
      const second = makeOrder();

      expect(second).to.deep.equal(first);
    });

    it('produces different output for different seeds', function () {
      seed(1);
      const fromSeedOne = makeCustomer();

      seed(2);
      const fromSeedTwo = makeCustomer();

      expect(fromSeedTwo).to.not.deep.equal(fromSeedOne);
    });
  });
});
