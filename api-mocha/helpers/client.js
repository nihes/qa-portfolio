'use strict';

/**
 * Shared HTTP client + warm-up helper for the DummyJSON API.
 *
 * DummyJSON (https://dummyjson.com) is a stable, key-free public REST API used
 * here to exercise real API-testing technique: authentication (JWT), pagination,
 * search, and full CRUD. Writes are SIMULATED server-side (add/update/delete
 * return the resulting resource but do not persist), which makes the responses
 * deterministic and ideal for contract-style assertions in CI.
 */

const axios = require('axios');

const BASE_URL = 'https://dummyjson.com';

// A single shared axios instance for all tests.
// - validateStatus always returns true so axios never throws on 4xx/5xx;
//   tests assert on `response.status` themselves instead of catching errors.
// - a generous timeout tolerates the occasional slow response.
const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  validateStatus: () => true,
});

/**
 * Pings the API until it responds, so a transient blip doesn't fail the first
 * real assertion. Called once in a global before() hook.
 *
 * @param {number} maxAttempts - how many pings to try before giving up.
 * @param {number} delayMs - pause between attempts.
 * @returns {Promise<void>} resolves once /test answers with a non-5xx status.
 * @throws {Error} if the API never becomes reachable within maxAttempts.
 */
async function warmUp(maxAttempts = 5, delayMs = 3000) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await client.get('/test');
      if (response.status && response.status < 500) {
        return;
      }
      lastError = new Error(`/test responded with status ${response.status}`);
    } catch (err) {
      lastError = err;
    }

    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw new Error(
    `dummyjson did not become reachable after ${maxAttempts} attempts: ${lastError && lastError.message}`
  );
}

module.exports = { client, warmUp, BASE_URL };
