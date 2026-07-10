'use strict';

/**
 * Contract / JSON-schema validation.
 *
 * Beyond asserting individual fields, these tests validate whole API responses
 * against a committed JSON Schema (draft-07) using ajv. Schema checks catch
 * contract drift — a renamed field, a type change, a dropped property — that
 * targeted field assertions can miss, and double as living API documentation.
 */

const { expect } = require('chai');
const Ajv = require('ajv');
const { client, warmUp } = require('../helpers/client');
const productSchema = require('../schemas/product.schema.json');
const loginSchema = require('../schemas/login.schema.json');

const ajv = new Ajv({ allErrors: true });

describe('Contract / JSON-schema validation', function () {
  before(async function () {
    await warmUp();
  });

  it('GET /products/1 conforms to the product schema', async function () {
    const response = await client.get('/products/1');
    expect(response.status).to.equal(200);

    const validate = ajv.compile(productSchema);
    const valid = validate(response.data);
    expect(valid, JSON.stringify(validate.errors, null, 2)).to.equal(true);
  });

  it('POST /auth/login response conforms to the login schema', async function () {
    const response = await client.post('/auth/login', {
      username: 'emilys',
      password: 'emilyspass',
    });
    expect(response.status).to.equal(200);

    const validate = ajv.compile(loginSchema);
    const valid = validate(response.data);
    expect(valid, JSON.stringify(validate.errors, null, 2)).to.equal(true);
  });
});
