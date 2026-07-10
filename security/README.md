# Security — headers audit + access-control checks (Mocha + Chai + axios)

A small, **CI-safe**, automatable slice of security testing built with **Mocha + Chai + Axios**
against the public [DummyJSON](https://dummyjson.com) demo API. It exists to show what a QA
engineer can realistically own in an automated regression suite - not to replace a real
penetration test or a dedicated security tool.

## What this suite checks

### 1. `tests/security-headers.test.js` - HTTP security header audit
- **Hard assertions (fail the build):**
  - The target endpoint (`GET https://dummyjson.com/test`) is served over **HTTPS**.
  - The endpoint is reachable and returns **HTTP 200**.
- **Informational audit (printed to console, never fails the build):**
  - Checks for common hardening response headers and logs a `[PASS]` / `[MISSING]`
    line for each one:
    - `Strict-Transport-Security` (HSTS)
    - `X-Content-Type-Options`
    - `X-Frame-Options` / `Content-Security-Policy` (clickjacking protection)
    - `Referrer-Policy`
    - `X-XSS-Protection`
  - These are informational because DummyJSON is a third-party demo API we don't own or
    control - hard-failing CI on a public sandbox's header hygiene would be noise, not signal.
    Against an application we own, promote these checks to real assertions.
  - See the [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/) for
    the full reference list and recommended values.

### 2. `tests/access-control.test.js` - authentication / access-control check
- `GET /auth/me` **without** a token must **not** return `200` (endpoint is protected).
- `POST /auth/login` with valid demo credentials (`emilys` / `emilyspass`, documented at
  https://dummyjson.com/docs/auth) returns a bearer token.
- `GET /auth/me` **with** the bearer token returns `200` (legitimate access works).
- This is the "negative-then-positive" pattern: prove the resource is closed by default,
  then prove it opens correctly for an authenticated caller. Testing only the happy path
  would miss the far more common real bug - an endpoint that never checks auth at all.

## OWASP Top 10 (2021) - what a QA can realistically test on an e-commerce app

| # | Category | What QA can test without specialist tooling |
|---|---|---|
| A01 | Broken Access Control | Negative auth tests (protected endpoints reject anonymous/foreign-user tokens), IDOR checks (can user A fetch/edit user B's order/cart/address by changing an ID?), role-based UI/API gating (customer vs. admin endpoints) |
| A02 | Cryptographic Failures | Confirm HTTPS-only (no plain HTTP fallback), no secrets/PII in URLs or client-side logs, cookies flagged `Secure`/`HttpOnly`/`SameSite` |
| A03 | Injection | Boundary/fuzz input on search, filters, login, and free-text fields (SQL/NoSQL/HTML meta-characters); verify inputs are rejected or safely encoded, not executed/reflected |
| A04 | Insecure Design | Business-logic abuse cases: apply a coupon twice, negative quantities, race a "limited stock" checkout, skip a checkout step by calling a later API directly |
| A05 | Security Misconfiguration | Response header audit (this suite), verbose error/stack-trace leakage, default admin creds, exposed `/debug` or `/.env`-style paths, CORS wildcard checks |
| A06 | Vulnerable and Outdated Components | `npm audit` / dependency scanning in CI; flag EOL libraries surfaced in `package-lock.json` |
| A07 | Identification and Authentication Failures | Login lockout/rate-limit behavior, session/token expiry, password-reset token reuse, "remember me" token lifetime, MFA bypass attempts (this suite's login+`/auth/me` flow) |
| A08 | Software and Data Integrity Failures | Verify checkout/payment webhooks validate signatures; CI pipeline doesn't pull unpinned/untrusted packages |
| A09 | Security Logging and Monitoring Failures | Confirm failed logins, blocked orders, and payment errors actually appear in logs/alerts (spot-check, not a QA-owned control end-to-end) |
| A10 | Server-Side Request Forgery (SSRF) | Test any feature accepting a user-supplied URL (webhooks, "import from URL", avatar-by-URL) against internal/loopback addresses |

This suite automates a thin, safe slice of **A01, A02 (partially), A05**, and **A07** above.
The rest either need a security specialist, a dedicated scanner, or write access to an
environment we're allowed to attack - none of which belong in a lightweight CI job hitting a
public demo API.

## Deeper scanning (out of scope for this suite)

This suite is deliberately narrow and safe to run in CI on every commit. For real coverage of
an owned application, pair it with:

- **[OWASP ZAP](https://www.zaproxy.org/)** - run a **baseline scan**
  (`zap-baseline.py -t https://your-app -r zap-report.html`) in a CI pipeline against a
  staging environment for a broad, automated pass over headers, cookies, and common
  vulnerability classes.
- **[Burp Suite](https://portswigger.net/burp)** - manual/semi-automated exploratory testing
  (proxying real checkout/login traffic, repeater/intruder-driven fuzzing, business-logic
  abuse cases) that automated suites like this one cannot express.
- **`npm audit` / Dependabot / Snyk** - dependency vulnerability scanning, complementary to
  the header/access-control checks here.

## Running the suite

```bash
cd security
npm install
npm test
```

Mocha config lives in `.mocharc.json` (spec glob `tests/**/*.test.js`, 30s timeout to tolerate
a slow third-party demo API). No environment variables or secrets are required - all
credentials used are the public demo credentials documented by DummyJSON.
