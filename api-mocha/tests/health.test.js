'use strict';

/**
 * Health check — confirms the DummyJSON API is reachable before any other
 * suite runs. Simplest possible smoke test: if /test is down, everything
 * downstream is expected to fail too.
 */

const { expect } = require('chai');
const { client, warmUp } = require('../helpers/client');

describe('Health check — GET /test', function () {
  before(async function () {
    await warmUp();
  });

  it('returns 200 and status "ok" when the service is up', async function () {
    const response = await client.get('/test');

    expect(response.status).to.equal(200);
    expect(response.data).to.have.property('status', 'ok');
  });
});
