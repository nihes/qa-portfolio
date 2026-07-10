/**
 * access-control.test.js
 *
 * Demonstrates authentication / access-control testing against the DummyJSON
 * demo API - a small, real-world slice of OWASP A01:2021 (Broken Access Control)
 * and A07:2021 (Identification and Authentication Failures).
 *
 * Flow:
 *  1. GET /auth/me with NO Authorization header must NOT return 200 - the
 *     endpoint is expected to be protected and reject unauthenticated access.
 *  2. POST /auth/login with valid demo credentials to obtain a bearer token.
 *  3. GET /auth/me WITH the bearer token must return 200 - proving the same
 *     protected resource is reachable once properly authenticated.
 *
 * This is the classic "negative then positive" access-control test pattern:
 * proving a resource is *closed* by default, then proving it *opens* correctly
 * for a legitimate, authenticated caller. Testing only the positive path would
 * miss the far more common real-world bug: an endpoint that "forgets" to check
 * auth at all.
 */

const { expect } = require('chai');
const axios = require('axios');

const BASE_URL = 'https://dummyjson.com';

// Public demo credentials documented by DummyJSON for exactly this purpose:
// https://dummyjson.com/docs/auth
const DEMO_USERNAME = 'emilys';
const DEMO_PASSWORD = 'emilyspass';

describe('Access control audit - /auth/me (DummyJSON)', function () {
  it('HARD ASSERT: GET /auth/me without a token is NOT authorized (status !== 200)', async function () {
    const response = await axios.get(`${BASE_URL}/auth/me`, {
      // No Authorization header sent at all - simulates an anonymous caller.
      validateStatus: () => true,
    });

    expect(response.status).to.not.equal(200);
  });

  it('HARD ASSERT: valid credentials log in and receive a bearer token', async function () {
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: DEMO_USERNAME,
      password: DEMO_PASSWORD,
    });

    expect(loginResponse.status).to.equal(200);
    expect(loginResponse.data).to.have.property('accessToken').that.is.a('string').and.is.not.empty;
  });

  it('HARD ASSERT: GET /auth/me WITH a valid bearer token is authorized (status === 200)', async function () {
    // Re-authenticate here rather than reusing state from the previous `it`
    // block: each test should be able to run/fail independently and stay
    // readable in isolation (avoids brittle cross-test shared state).
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: DEMO_USERNAME,
      password: DEMO_PASSWORD,
    });
    const token = loginResponse.data.accessToken;

    const meResponse = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(meResponse.status).to.equal(200);
    expect(meResponse.data).to.have.property('username', DEMO_USERNAME);
  });
});
