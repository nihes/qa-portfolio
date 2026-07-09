'use strict';

/**
 * Products API — read, search, pagination and full CRUD against DummyJSON.
 *
 * Note: DummyJSON SIMULATES writes — POST /products/add, PUT/PATCH /products/:id
 * and DELETE /products/:id return the resulting resource (with a new id, updated
 * fields, or an isDeleted flag) but do not persist it. That is exactly what we
 * assert on: the request/response contract of each operation.
 */

const { expect } = require('chai');
const { client, warmUp } = require('../helpers/client');

describe('Products API', function () {
  before(async function () {
    await warmUp();
  });

  it('lists products with pagination (GET /products?limit=5)', async function () {
    const response = await client.get('/products', { params: { limit: 5, skip: 0 } });

    expect(response.status).to.equal(200);
    expect(response.data).to.have.property('products').that.is.an('array').with.lengthOf(5);
    expect(response.data).to.have.property('total').that.is.a('number').above(0);
    expect(response.data.products[0]).to.include.keys(['id', 'title', 'price']);
  });

  it('searches products (GET /products/search?q=phone)', async function () {
    const response = await client.get('/products/search', { params: { q: 'phone' } });

    expect(response.status).to.equal(200);
    expect(response.data.products).to.be.an('array').that.is.not.empty;
  });

  it('gets a single product by id (GET /products/1)', async function () {
    const response = await client.get('/products/1');

    expect(response.status).to.equal(200);
    expect(response.data).to.include.keys(['id', 'title', 'price', 'category']);
    expect(response.data.id).to.equal(1);
  });

  it('returns 404 for a non-existent product', async function () {
    const response = await client.get('/products/999999');

    expect(response.status).to.equal(404);
  });

  it('adds a product (POST /products/add)', async function () {
    const response = await client.post('/products/add', {
      title: 'QA Portfolio Test Product',
      price: 9.99,
    });

    expect(response.status).to.equal(201);
    expect(response.data).to.have.property('id');
    expect(response.data).to.include({ title: 'QA Portfolio Test Product' });
  });

  it('fully updates a product (PUT /products/1)', async function () {
    const response = await client.put('/products/1', { price: 999.99 });

    expect(response.status).to.equal(200);
    expect(response.data.id).to.equal(1);
    expect(response.data.price).to.equal(999.99);
  });

  it('partially updates a product (PATCH /products/1)', async function () {
    const response = await client.patch('/products/1', { title: 'Patched Title' });

    expect(response.status).to.equal(200);
    expect(response.data.title).to.equal('Patched Title');
  });

  it('deletes a product (DELETE /products/1)', async function () {
    const response = await client.delete('/products/1');

    expect(response.status).to.equal(200);
    expect(response.data).to.have.property('isDeleted', true);
    expect(response.data).to.have.property('deletedOn');
  });
});
