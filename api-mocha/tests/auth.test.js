'use strict';

/**
 * Authentication — JWT login flow on DummyJSON.
 * Covers the happy path (valid login + protected /auth/me with a bearer token)
 * and negative cases (bad password, missing token).
 */

const { expect } = require('chai');
const { client, warmUp } = require('../helpers/client');

const VALID_USER = { username: 'emilys', password: 'emilyspass' };

describe('Authentication', function () {
  before(async function () {
    await warmUp();
  });

  it('logs in with valid credentials and returns an access token', async function () {
    const response = await client.post('/auth/login', VALID_USER);

    expect(response.status).to.equal(200);
    expect(response.data).to.have.property('accessToken').that.is.a('string').and.is.not.empty;
    expect(response.data).to.include({ username: 'emilys' });
  });

  it('returns the current user for a valid bearer token (GET /auth/me)', async function () {
    const login = await client.post('/auth/login', VALID_USER);
    const token = login.data.accessToken;

    const me = await client.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(me.status).to.equal(200);
    expect(me.data).to.include({ username: 'emilys' });
  });

  it('rejects invalid credentials with 400', async function () {
    const response = await client.post('/auth/login', {
      username: 'emilys',
      password: 'definitely-wrong',
    });

    expect(response.status).to.equal(400);
    expect(response.data).to.have.property('message');
  });

  it('does not return the user profile without a token', async function () {
    const response = await client.get('/auth/me');

    // Protected endpoint: anything but a 200 is acceptable here.
    expect(response.status).to.not.equal(200);
  });
});
