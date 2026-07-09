'use strict';

/**
 * sendEmail.js
 * ------------
 * Thin wrapper around nodemailer that renders the order-confirmation HTML
 * template and sends it through a local SMTP endpoint.
 *
 * In this portfolio the SMTP endpoint is Mailpit (https://github.com/axllent/mailpit),
 * a local mail-catcher used for integration testing: it exposes an SMTP server
 * on port 1025 and a REST API + web UI on port 8025, so tests can assert on
 * what was actually sent without touching a real mailbox or a real SMTP provider.
 *
 * Run Mailpit locally with:
 *   docker run -d -p 1025:1025 -p 8025:8025 axllent/mailpit
 */

const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const TEMPLATE_PATH = path.join(__dirname, '..', 'templates', 'order-confirmation.html');

/**
 * Builds a nodemailer transport pointed at the local Mailpit SMTP listener.
 * Mailpit does not require auth and does not use TLS on port 1025, hence
 * `secure: false` and no `auth` block.
 */
function createTransport() {
  return nodemailer.createTransport({
    host: '127.0.0.1',
    port: 1025,
    secure: false,
  });
}

/**
 * Renders the order-confirmation template, replacing the `{{orderNumber}}`
 * placeholder with the real order number.
 *
 * @param {string} orderNumber
 * @returns {string} rendered HTML
 */
function renderOrderConfirmationHtml(orderNumber) {
  const rawHtml = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  return rawHtml.split('{{orderNumber}}').join(orderNumber);
}

/**
 * Sends the order-confirmation email to the given recipient via Mailpit.
 *
 * @param {Object} params
 * @param {string} params.to - recipient email address
 * @param {string} params.orderNumber - human-readable order number, e.g. "100000123"
 * @returns {Promise<import('nodemailer').SentMessageInfo>}
 */
async function sendOrderConfirmation({ to, orderNumber }) {
  if (!to) {
    throw new Error('sendOrderConfirmation: "to" is required');
  }
  if (!orderNumber) {
    throw new Error('sendOrderConfirmation: "orderNumber" is required');
  }

  const transport = createTransport();
  const html = renderOrderConfirmationHtml(orderNumber);

  return transport.sendMail({
    from: 'shop@example.com',
    to,
    subject: `Your order ${orderNumber} is confirmed`,
    html,
  });
}

module.exports = {
  sendOrderConfirmation,
  renderOrderConfirmationHtml,
  TEMPLATE_PATH,
};
