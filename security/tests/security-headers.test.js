/**
 * security-headers.test.js
 *
 * Lightweight, CI-safe HTTP security-header audit against the DummyJSON demo API.
 *
 * What is HARD-asserted (will fail the build):
 *  - The endpoint is served over HTTPS (transport security is non-negotiable for
 *    any e-commerce API - it is the baseline control everything else builds on).
 *  - The endpoint is reachable and returns HTTP 200.
 *
 * What is INFORMATIONAL ONLY (printed as a PASS/MISSING audit line, never fails
 * the build):
 *  - Presence of common hardening response headers (HSTS, X-Content-Type-Options,
 *    frame-protection / CSP, Referrer-Policy, X-XSS-Protection).
 *
 * Why headers are not hard-asserted here: DummyJSON is a free third-party demo/
 * sandbox API that we do not control and that is not guaranteed to ship a
 * production-grade security header set. Hard-failing CI on a header a public demo
 * API happens to be missing would be noise, not signal. In a real engagement
 * against an app we own, these header checks SHOULD be hard assertions - see the
 * README for how this suite maps to a full OWASP-style audit (ZAP / Burp).
 *
 * Reference: OWASP Secure Headers Project
 * https://owasp.org/www-project-secure-headers/
 */

const { expect } = require('chai');
const axios = require('axios');

const TARGET_URL = 'https://dummyjson.com/test';

// Headers we look for, mapped to a short human-readable description used in the
// audit printout. Header names are matched case-insensitively (axios/Node.js
// already lower-cases response header keys for us).
const HARDENING_HEADERS = [
  {
    name: 'strict-transport-security',
    description: 'HSTS - forces browsers to use HTTPS for future requests',
  },
  {
    name: 'x-content-type-options',
    description: 'Prevents MIME-type sniffing (expected value: nosniff)',
  },
  {
    // Either header mitigates clickjacking; we check for whichever is present.
    name: 'x-frame-options',
    altName: 'content-security-policy',
    description: 'Clickjacking protection (X-Frame-Options or CSP frame-ancestors)',
  },
  {
    name: 'referrer-policy',
    description: 'Controls how much referrer information is leaked cross-origin',
  },
  {
    name: 'x-xss-protection',
    description: 'Legacy browser XSS filter toggle (superseded by CSP, still audited)',
  },
];

describe('Security headers audit - GET /test (DummyJSON)', function () {
  let response;

  before(async function () {
    response = await axios.get(TARGET_URL, {
      // We want to inspect whatever status DummyJSON actually returns, so we
      // don't let axios throw on non-2xx here - the HTTPS/200 checks below are
      // explicit, readable assertions instead.
      validateStatus: () => true,
    });
  });

  it('HARD ASSERT: is served over HTTPS', function () {
    expect(response.request.res.responseUrl || TARGET_URL).to.match(/^https:\/\//);
  });

  it('HARD ASSERT: responds with HTTP 200', function () {
    expect(response.status).to.equal(200);
  });

  it('audits hardening headers (informational - never fails)', function () {
    const headers = response.headers || {};

    console.log('\n  --- Security header audit: https://dummyjson.com/test ---');

    for (const check of HARDENING_HEADERS) {
      const value = headers[check.name] || (check.altName && headers[check.altName]);
      const foundHeaderName = headers[check.name]
        ? check.name
        : check.altName && headers[check.altName]
          ? check.altName
          : check.name;

      if (value) {
        console.log(`  [PASS]    ${foundHeaderName}: ${value}`);
      } else {
        console.log(`  [MISSING] ${check.name}${check.altName ? ` / ${check.altName}` : ''} - ${check.description}`);
      }
    }

    console.log('  --- end audit (informational only, see README) ---\n');

    // Intentionally no assertion here: this test exists to produce a readable
    // report in CI output, not to gate the build on a third-party API's header
    // hygiene. If this suite ever targets an app we own, promote the relevant
    // lines above to `expect(headers[...]).to.exist` / to.equal(...) assertions.
  });
});
