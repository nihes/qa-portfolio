# Contributing / Conventions

How this portfolio is organised, how to run any suite in it, and the
conventions new suites or specs should follow. See also
[`architecture.md`](./architecture.md) for the why behind the structure and
[`skills-matrix.md`](./skills-matrix.md) for what each suite demonstrates.

## Prerequisites

| Requirement | Needed for |
|---|---|
| **Node.js 20+** (18+ also works for the individual suites, CI pins 20) | Every suite except `manual-testing/` and `performance/` |
| `npx playwright install [chromium\|webkit]` | `playwright/`, `cucumber-bdd/`, `mobile-web-playwright/` (chromium **and** webkit), `accessibility/`, `visual-regression/` |
| **Google Chrome installed locally** (Selenium Manager auto-downloads a matching `chromedriver`) | `selenium-mocha/` |
| **k6 binary** (`brew install k6` / `choco install k6` / see [k6 install docs](https://k6.io/docs/get-started/installation/)) — not an npm package | `performance/` |
| **Android SDK + emulator (AVD)**, or a **BrowserStack** account (Automate) with `BROWSERSTACK_USERNAME` / `BROWSERSTACK_ACCESS_KEY` exported as env vars | `appium-mobile/` |
| **Docker** (to run `axllent/mailpit`) | The SMTP half of `email-testing/` — the offline HTML-validation half needs nothing |

Nothing here needs an account, license, or paid service — every suite is
built on free/open-source tooling and public demo targets (see
[`architecture.md`](./architecture.md#test-targets)).

## Run any suite — quick reference

Every folder is its own **self-contained npm project** with its own
`package.json` and `README.md`. The pattern is always the same:

```bash
cd <folder>
npm install
npm test
```

Some suites need one extra one-time setup step before `npm test`:

```bash
# API — Newman (Postman collection)
cd api-postman-newman && npm install && npm test

# API — Mocha + axios (dummyjson.com)
cd api-mocha && npm install && npm test

# Playwright (UI)
cd playwright && npm install && npx playwright install chromium && npm test

# Cypress (UI)
cd cypress && npm install && npm test

# Selenium + Mocha (UI) — needs Chrome installed locally
cd selenium-mocha && npm install && npm test

# Cucumber (BDD)
cd cucumber-bdd && npm install && npx playwright install chromium && npm test

# Mobile device emulation (Playwright)
cd mobile-web-playwright && npm install && npx playwright install chromium webkit && npm test

# Accessibility (axe-core)
cd accessibility && npm install && npx playwright install chromium && npm test

# Email — offline HTML validation only (no services needed)
cd email-testing && npm install && npm run test:html
# Full email suite (adds SMTP-integration test, needs Mailpit):
docker run -d -p 1025:1025 -p 8025:8025 axllent/mailpit
cd email-testing && npm test

# Appium (mobile, run-locally / BrowserStack only — not in CI)
cd appium-mobile && npm install
npm run test:local          # Android emulator must already be booted
npm run test:browserstack   # needs BROWSERSTACK_USERNAME / BROWSERSTACK_ACCESS_KEY

# Performance (k6, run-locally only — not in CI)
cd performance && k6 run k6-load-test.js

# Visual regression (Playwright, run-locally only — not in CI)
cd visual-regression && npm install && npx playwright install chromium
npm run update-snapshots    # first run on a new machine/platform regenerates the baseline
npm test
```

`manual-testing/` needs no tooling at all — the artifacts are plain
Markdown; open them directly.

Every Playwright-based suite also has `npm run report` to open the
generated HTML report after a run.

## Coding conventions

- **Page Object Model for UI suites.** `playwright/`, `cypress/`, and
  `selenium-mocha/` each keep one class/module per page under `pages/`
  (`LoginPage`, `InventoryPage`, `CartPage`, `CheckoutPage`, …) that owns
  locators and reusable actions/assertions. Specs read as business-level
  steps, not raw selectors.
- **Web-first / explicit waits — never a fixed sleep.** Playwright and
  Cypress specs rely on built-in auto-waiting/retry-ability
  (`expect(...).toBeVisible()`, Cypress `should`); the Selenium suite uses
  explicit `driver.wait(until....)` waits. No suite uses `sleep()` /
  `cy.wait(<ms>)` to paper over timing. Where a framework's native click/type
  isn't reliable against a React SPA under headless Chrome (see
  `selenium-mocha/README.md`), the fix is a JS-click-with-retry / React-aware
  input helper — not a sleep.
- **Self-contained, public demo targets only.** Every suite points at a
  public demo site or API (saucedemo.com, automationexercise.com,
  dummyjson.com) or a locally-run open-source service (Mailpit). This keeps
  every suite runnable by anyone who clones the repo, with no environment
  provisioning, VPN, or account required.
- **No secrets committed, ever.** There are no real credentials in this
  repo — only throwaway/demo values that are already public (SauceDemo's
  documented demo accounts, a deliberately-fake `testEmail`/`testPassword`
  pair for a negative API test). Anything that *would* be a secret in a real
  project (e.g. BrowserStack credentials) is read from environment variables
  and explicitly documented as "never commit this" in the relevant README.
  `.gitignore` also excludes all suite-local reports, `node_modules/`, and
  lockfiles from being committed noise.
- **One npm project per suite.** Each folder has its own `package.json` and
  its own dependency tree — a suite is never allowed to reach into another
  suite's `node_modules`. This keeps every suite independently runnable and
  independently versioned, and is what lets CI run all twelve automated jobs
  in parallel with no shared install step.
- **Every suite documents itself.** Each folder's `README.md` states what it
  covers, how to run it, and — where relevant — explicitly why it is or
  isn't in CI. New suites should follow the same shape.

## Commit message style

```
Type: concise description
```

Where `Type` is one of `Add` / `Fix` / `Change` / `Remove`, and the
description is a short, imperative summary of *what changed*, e.g.:

```
Add: performance k6 load test with p95/error-rate thresholds
Fix: selenium-mocha React-aware click/type helpers for CI reliability
Change: accessibility allow-list known select-name violation
Remove: stale appium BrowserStack device capability
```

Keep each commit scoped to one suite or concern where practical, so the
history reads as a changelog per folder.

## How CI works

CI is defined in [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)
and runs on every push to `main`/`master`, every pull request, and on manual
`workflow_dispatch`. It is a GitHub Actions workflow with **twelve independent
jobs**, one per runnable automated suite, each scoped to its own folder via
`working-directory` so it installs and runs in isolation:

`api-newman` · `api-mocha` · `api-graphql` · `playwright` · `cypress` ·
`cucumber` · `selenium` · `mobile-web` · `accessibility` · `email` ·
`security` · `test-data`

Each job: checks out the repo, sets up Node 20, runs `npm install`, provisions
browser binaries where needed (`npx playwright install --with-deps ...`, or
`browser-actions/setup-chrome` for the Selenium job), runs `npm test`, and —
for the Playwright-based/report-producing jobs — uploads the HTML report as a
build artifact. The `email` job additionally spins up an `axllent/mailpit`
GitHub Actions **service container** so the SMTP-integration half of that
suite runs for real instead of self-skipping.

`appium-mobile/`, `performance/`, and `visual-regression/` are **intentionally
not wired into CI** — see [`architecture.md`](./architecture.md#ci-pipeline)
for why each one is excluded. If you add a new suite, decide up front whether
it can run unattended on a GitHub-hosted `ubuntu-latest` runner with no
external environment; if yes, add a job for it following the existing
pattern, if no, add a README section explaining why (matching the existing
suites' style) instead of silently leaving it undocumented.
