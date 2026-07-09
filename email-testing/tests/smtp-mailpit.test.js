'use strict';

/**
 * smtp-mailpit.test.js
 * ---------------------
 * INTEGRATION test — sends a real email over SMTP to a local Mailpit
 * instance (https://github.com/axllent/mailpit) and asserts on it via
 * Mailpit's REST API.
 *
 * Mailpit is a self-hosted mail-catcher: it accepts SMTP on 127.0.0.1:1025
 * and exposes a JSON API + web UI on 127.0.0.1:8025. Nothing ever leaves the
 * machine, so this is safe to run against a real transactional-email
 * template without risking a real send.
 *
 * Start it with:
 *   docker run -d -p 1025:1025 -p 8025:8025 axllent/mailpit
 *
 * This suite is intentionally resilient to Mailpit being absent: the
 * before() hook pings the API first and calls `this.skip()` on the whole
 * suite if it's unreachable, so `npm test` never hard-fails in an
 * environment where nobody bothered to start Mailpit (e.g. a plain CI
 * runner that only cares about the offline html-validation suite).
 */

const axios = require('axios');
const { expect } = require('chai');
const { sendOrderConfirmation } = require('../src/sendEmail');

const MAILPIT_API = 'http://127.0.0.1:8025/api/v1';
const PING_TIMEOUT_MS = 1500;

describe('SMTP integration — Mailpit', function () {
  const recipient = 'qa-portfolio-test@example.com';
  const orderNumber = `100${Date.now()}`;

  before(async function () {
    try {
      await axios.get(`${MAILPIT_API}/messages`, { timeout: PING_TIMEOUT_MS });
    } catch (err) {
      // Mailpit isn't running locally — skip the whole suite rather than
      // failing the build. This keeps `npm test` green in environments
      // where the optional local mail-catcher was never started.
      this.skip();
    }

    // Best-effort mailbox cleanup so this run's assertions aren't polluted
    // by messages left over from a previous run. Not all Mailpit versions
    // expose the same delete endpoint, so failures here are non-fatal.
    try {
      await axios.delete(`${MAILPIT_API}/messages`);
    } catch (err) {
      // Ignore — an empty inbox is a nice-to-have, not a precondition.
    }
  });

  it('delivers the order-confirmation email with correct To/Subject and renders the CTA + order number', async function () {
    await sendOrderConfirmation({ to: recipient, orderNumber });

    // Mailpit indexes messages asynchronously right after SMTP accepts them;
    // a short poll avoids a race between "sendMail resolved" and "message
    // is queryable via the API".
    const message = await pollForMessage(recipient, orderNumber);
    expect(message, `expected to find a message to ${recipient} with subject containing ${orderNumber}`).to.not.equal(null);
    expect(message.To[0].Address).to.equal(recipient);
    expect(message.Subject).to.include(orderNumber);

    const { data: fullMessage } = await axios.get(`${MAILPIT_API}/message/${message.ID}`);
    expect(fullMessage.HTML).to.include(orderNumber);
    expect(fullMessage.HTML).to.include('Track your order');
    expect(fullMessage.HTML).to.match(/https:\/\/www\.gymbeam\.com\/customer\/account\/order-tracking\//);
  });
});

/**
 * Polls Mailpit's message list until a message matching the given
 * recipient + order number shows up, or the timeout elapses.
 *
 * @param {string} recipient
 * @param {string} orderNumber
 * @returns {Promise<Object|null>} the matching message summary, or null if not found in time
 */
async function pollForMessage(recipient, orderNumber) {
  const deadline = Date.now() + 10000;

  while (Date.now() < deadline) {
    const { data } = await axios.get(`${MAILPIT_API}/messages`);
    const found = (data.messages || []).find(
      (msg) =>
        msg.To.some((recip) => recip.Address === recipient) &&
        msg.Subject.includes(orderNumber)
    );

    if (found) {
      return found;
    }

    await sleep(300);
  }

  return null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
