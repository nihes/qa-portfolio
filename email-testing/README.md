# Email Testing — SMTP capture (Mailpit) + HTML-email validation

QA suite for transactional HTML email, split into two independent parts:

1. **Offline HTML-email validation** (`tests/html-validation.test.js`) — static
   checks against `templates/order-confirmation.html` using
   [cheerio](https://github.com/cheeriojs/cheerio). No network, no services,
   nothing to start — this is the part that should always run in CI.
2. **SMTP integration testing** (`tests/smtp-mailpit.test.js`) — sends a real
   email over SMTP to a local [Mailpit](https://github.com/axllent/mailpit)
   instance and asserts on it through Mailpit's REST API. This part is
   self-skipping: if Mailpit isn't running, the suite calls `this.skip()`
   instead of failing the build.

## Why these two parts

Real HTML-email QA has two very different failure modes:

- **"Is the markup itself sound?"** — doctype, charset, alt text, working
  links, a preheader, table-based layout for client compatibility. This is
  cheap, deterministic, and fully offline — perfect for a fast pre-commit /
  CI gate.
- **"Does the email actually get sent and rendered with the right content?"**
  — this requires an SMTP transport and something to catch what was sent.
  Mailpit fills that role locally without touching a real inbox or a real
  ESP/SMTP provider.

**What this suite intentionally does *not* try to do:** verify pixel-perfect
rendering across real mail clients (Outlook/Gmail/Apple Mail/dark mode,
image-blocking behavior, clipping, etc.). That class of testing is normally
done with a dedicated service such as [Litmus](https://www.litmus.com/) or
[Email on Acid](https://www.emailonacid.com/) that renders the email in
dozens of real client/OS combinations and provides visual diffs — it's out of
scope for a local, free/OSS-only test suite, but is the natural next step in
a real pipeline.

## Running Mailpit locally

```bash
docker run -d -p 1025:1025 -p 8025:8025 axllent/mailpit
```

- SMTP listener: `127.0.0.1:1025` (no auth, no TLS — matches
  `src/sendEmail.js`)
- REST API + web UI: `http://127.0.0.1:8025`

Mailpit is free and open source, so it's used here instead of any paid
SMTP-sandbox SaaS product.

## Setup

```bash
npm install
```

## Running the tests

```bash
# Offline HTML validation only — no external services needed
npm run test:html

# Full suite (offline validation + Mailpit integration).
# If Mailpit isn't running, the SMTP suite self-skips instead of failing.
npm test
```

## Files

| File | Purpose |
|---|---|
| `templates/order-confirmation.html` | Realistic transactional order-confirmation email template (table-based layout, inline styles, preheader, CTA). |
| `src/sendEmail.js` | Renders the template and sends it via nodemailer to Mailpit's SMTP listener. |
| `tests/html-validation.test.js` | Offline cheerio-based structural/accessibility checks on the template. |
| `tests/smtp-mailpit.test.js` | Integration test: send → fetch via Mailpit API → assert on recipient, subject, and rendered HTML body. Self-skips if Mailpit is unreachable. |
