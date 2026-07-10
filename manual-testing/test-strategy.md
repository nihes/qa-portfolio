# Test Strategy — E-commerce QA Portfolio

| | |
|---|---|
| **Document** | Test Strategy |
| **Scope** | Whole portfolio: manual testing + all automated suites |
| **Author** | Ivan Andrijko (QA) |
| **Status** | Approved |
| **Version** | 1.0 |
| **Related** | [`test-plan-checkout.md`](./test-plan-checkout.md) (feature-level plan for the checkout area), [`requirements-traceability-matrix.md`](./requirements-traceability-matrix.md), [`risk-based-testing.md`](./risk-based-testing.md) |

## 1. Purpose

A **test plan** (e.g. `test-plan-checkout.md`) answers "how do we test *this
feature*, in *this* cycle?". This **test strategy** sits one level above
that: it answers "how does testing work across this whole project, as a
standing policy, independent of any one feature or release?" — test levels,
test types, tooling choices, environments, entry/exit criteria, and defect
handling that every feature-level plan is expected to follow.

## 2. Scope & Objectives

### 2.1 Scope

This strategy covers manual and automated testing of a typical e-commerce
storefront's core journeys — catalog/search, cart, checkout, payment,
coupons/discounts, and account/auth — as demonstrated against the public
reference SUTs used throughout this portfolio: **SauceDemo**,
**Automation Exercise**, and **DummyJSON** (API-only). It is written to be
reusable against a real production storefront by substituting the actual
SUT, environments, and credentials.

### 2.2 Objectives

- Catch regressions and defects **before** they reach production, weighted
  by business impact (a broken checkout matters more than a cosmetic sort
  glitch — see [`risk-based-testing.md`](./risk-based-testing.md)).
- Maintain **fast, deterministic feedback** for the parts of the system that
  can be verified without a full browser or live service (unit-adjacent API
  contract tests, offline email-template checks).
- Maintain **realistic, user-facing confidence** for the parts of the system
  that can only be verified end-to-end (full checkout journeys, cross-device
  behaviour).
- Keep manual and automated coverage **visibly reconciled** via the
  [RTM](./requirements-traceability-matrix.md) rather than letting the two
  drift apart silently.
- Treat non-functional attributes (accessibility, performance, email
  deliverability/rendering) as first-class test types with owned suites, not
  afterthoughts.

## 3. Test Levels

| Level | Definition here | Where it applies in this portfolio |
|---|---|---|
| **Component** | Verifying a single unit of behaviour in isolation (a schema, a template, a single endpoint contract) | `api-mocha/tests/schema.test.js` (ajv contract validation), `email-testing/tests/html-validation.test.js` (offline, no network — structural checks on one template) |
| **Integration** | Verifying two or more real components talking to each other (a real HTTP call to a real service, SMTP delivery to a real inbox) | `api-mocha/tests/auth.test.js`, `tests/products-crud.test.js` (live calls to the DummyJSON API), `email-testing/tests/smtp-mailpit.test.js` (send → Mailpit → fetch), `api-postman-newman` (live calls to automationexercise's API) |
| **System** | Verifying a full user-facing flow within one application/UI, including all its internal integrations | `playwright/`, `cypress/`, `selenium-mocha/`, `cucumber-bdd/` — each drives the real storefront UI through login → cart → checkout |
| **End-to-end (E2E)** | System-level testing plus the surrounding context that a real user experiences: real device/viewport characteristics, accessibility tooling, cross-browser | `mobile-web-playwright/` (device emulation), `accessibility/` (axe-core scans layered on the same UI), manual cross-browser/responsive checks per `test-plan-checkout.md` §2.1 |

The manual test cases in `test-cases/*.md` sit primarily at **System/E2E**
level — they exercise the storefront the way a real customer would, which is
also where the highest-value, hardest-to-automate-cheaply defects tend to
live (BUG-001, BUG-002, and the two new reports below were all found at this
level).

## 4. Test Types → Concrete Suite Mapping

| Test type | Purpose | Concrete suite(s) in this repo |
|---|---|---|
| **Functional** | Confirm each feature behaves per its documented/expected behaviour | `test-cases/*.md` (manual); `playwright/tests/*.spec.ts`; `cypress/cypress/e2e/*.cy.ts`; `selenium-mocha/tests/*.test.js` |
| **Regression** | Re-verify previously-working behaviour after a change | Full re-run of `test-cases/*.md` before release (manual); the entire automated suite set run in CI on every push (see §7) |
| **Smoke** | Fast confirmation the critical path isn't broken before deeper testing starts | A reduced `High`-priority subset of `test-cases/checkout.md` (manual); `playwright/tests/checkout.spec.ts` alone as a CI smoke gate |
| **Exploratory** | Unscripted, charter-driven testing to surface what scripted cases don't anticipate | [`exploratory-charters.md`](./exploratory-charters.md) — 4 charters (checkout flow, coupons, cart behaviour, multi-currency) |
| **API** | Verify backend contracts and behaviour independent of any UI | `api-postman-newman/` (Postman/Newman against automationexercise.com's API — including its `responseCode`-in-body quirk); `api-mocha/` (Mocha+Chai+axios+ajv against DummyJSON — auth, CRUD, pagination, schema contracts) |
| **BDD** | Express acceptance criteria as living, stakeholder-readable Gherkin | `cucumber-bdd/features/checkout.feature`, `cucumber-bdd/features/cart.feature` (Cucumber.js + Playwright driver) |
| **Accessibility** | Catch WCAG-level violations on customer-facing pages | `accessibility/tests/a11y.spec.ts` (axe-core via `@axe-core/playwright`, scoped to WCAG 2.0/2.1 A+AA, fails on unexpected `critical` violations only) |
| **Performance / Load** | Confirm latency and error-rate stay within threshold under concurrent load | `performance/k6-load-test.js` (k6; ramping VUs, p95 latency + error-rate thresholds) |
| **Mobile / responsive** | Confirm the critical journey survives a touch/mobile viewport context | `mobile-web-playwright/tests/mobile-checkout.spec.ts`, `mobile-web-playwright/tests/responsive.spec.ts` (Playwright device emulation — iPhone 13/WebKit, Pixel 5/Chromium) |
| **Email** | Confirm transactional email is well-formed and actually delivered | `email-testing/tests/html-validation.test.js` (offline structural/a11y checks on the HTML template), `email-testing/tests/smtp-mailpit.test.js` (real SMTP send + Mailpit REST assertions) |

Manual testing is the connective tissue across all of the above: it's where
the actual end-user journeys, negative/boundary cases, and cross-cutting
"does this *feel* right" judgement calls live, and it's the layer that most
readily absorbs new risk areas (see `risk-based-testing.md`) before they're
worth the investment of an automated spec.

## 5. Environments & Test Data

### 5.1 Environments

| Environment | Purpose | Notes |
|---|---|---|
| SauceDemo (public demo) | Reference SUT for account/auth, cart, checkout, sorting — used by `playwright/`, `cypress/`, `selenium-mocha/`, `cucumber-bdd/`, `mobile-web-playwright/`, `accessibility/` | Fixed demo accounts only (`standard_user`, `locked_out_user`, `problem_user`, `performance_glitch_user` / `secret_sauce`); no registration, coupons, or product search — see the resulting `Gap` rows in the RTM |
| Automation Exercise (public demo) | Reference SUT for the fuller feature set the manual suite documents — cart, checkout, coupons, guest checkout, search/filter/sort | Used by manual `test-cases/*.md` and `api-postman-newman/`; sandbox/test payment form only |
| DummyJSON (public demo API) | Reference API for code-based API testing and load testing | Used by `api-mocha/` and `performance/`; does not persist mutations (see `api-mocha/README.md`) — tests assert on request/response *contract*, not on storage state |
| Mailpit (local, Docker) | SMTP capture for email integration testing | `email-testing/tests/smtp-mailpit.test.js`; self-skips if Mailpit isn't running rather than failing the build |
| Project's real staging/QA | Full-fidelity pre-production testing when this strategy is reused against an actual production storefront | Substitute for the public demo SUTs above; carries the multistore/scope caveats a real platform would have |
| Project's real production | Post-deploy smoke verification only | Read-only checks; no test orders with real payment instruments |

### 5.2 Test data principles

- Test data is always **synthetic** below production — no real customer PII,
  no real payment instruments.
- Public demo accounts/credentials documented above are used as-is; a real
  project substitutes its own test-account matrix (see the project's own
  test-data reference where applicable).
- API suites (`api-mocha/`, `api-postman-newman/`) intentionally test against
  *contract*, not persisted state, when the underlying demo API doesn't
  persist writes — this is called out explicitly rather than silently
  assumed.

## 6. Entry & Exit Criteria

### 6.1 Entry criteria (per test cycle)

- Target build/environment is deployed and reachable.
- A smoke pass of the critical path (login → cart → checkout →
  confirmation) is green.
- Test data/credentials for the cycle are confirmed valid (accounts,
  coupons, payment sandbox where applicable).
- Any automated suite affected by the cycle's changes has been run at least
  once locally or in CI with no unexplained failures.

### 6.2 Exit criteria (per release)

- 100% of `High`-priority manual test cases executed; **zero open
  High/Critical severity defects** on the critical path.
- ≥ 95% of `Med`/`Low` manual test cases executed; failures triaged and
  either fixed or explicitly accepted.
- All automated suites green in CI on the release candidate commit (or
  failures explicitly triaged as known/flaky with a linked follow-up).
- All defects found are logged per §8 below.
- The [RTM](./requirements-traceability-matrix.md) reflects the coverage
  actually run this cycle — not a stale prior snapshot.
- Relevant exploratory charters for the cycle have been run (see
  `exploratory-charters.md`).

## 7. CI / Automation Approach

- Each automated suite is an independently runnable npm project (own
  `package.json`), so it can be triggered standalone or wired into a shared
  pipeline.
- **GitHub Actions** is the assumed CI runner for the Node/npm-based suites
  (`playwright/`, `cypress/`, `selenium-mocha/`, `cucumber-bdd/`,
  `api-postman-newman/`, `api-mocha/`, `mobile-web-playwright/`,
  `accessibility/`, `email-testing/`'s offline half): install deps, restore
  browser binary cache where relevant (`npx playwright install`), run
  `npm test`, publish the HTML/JSON report as a build artifact.
- **`performance/` (k6)** is intentionally **excluded** from the main
  pipeline — it needs its own binary/runner rather than npm, so it's kept as
  a run-on-demand artifact to keep the main CI fast and dependency-light
  (see `performance/README.md`). Wiring it in is a one-line
  `grafana/k6-action` step when a performance gate is wanted.
- **`email-testing/`'s SMTP half** self-skips (`this.skip()`) rather than
  failing the build when Mailpit isn't reachable, so CI doesn't need a
  standing Mailpit service just to stay green — but a CI variant that spins
  up the `axllent/mailpit` Docker image as a service container gets full
  integration coverage for free.
- Suggested pipeline shape: run the fast, deterministic suites (API,
  schema/contract, offline email validation) on every push; run the fuller
  browser suites (Playwright/Cypress/Selenium/Cucumber/mobile/accessibility)
  on every push to a shared branch and before merge to `main`; treat manual
  regression + exploratory charters as the release-gate layer that CI cannot
  replace.
- The [RTM](./requirements-traceability-matrix.md) is the reconciliation
  point between "CI is green" and "the requirement is actually verified" —
  a green pipeline does not by itself mean a `Gap` row is closed.

## 8. Defect Management Workflow

1. **Discovery** — via scripted manual test case, exploratory charter, or an
   automated suite failure.
2. **Triage** — is it reproducible? Is it a real defect vs. a known
   third-party/demo-SUT quirk (e.g. `accessibility/tests/a11y.spec.ts`'s
   documented `select-name` triage on saucedemo)? Assign Severity
   (technical impact) and Priority (business urgency) — they can differ.
3. **Log** — file under `bug-reports/BUG-NNN-<slug>.md` following the fixed
   structure (Summary, Severity, Priority, Environment, Preconditions,
   Steps to Reproduce, Expected/Actual Result, Frequency, Evidence, Notes),
   cross-referencing the `TC-*` ID(s) that surfaced or cover it.
4. **Fix & verify** — developer fixes; QA re-executes the originating
   `TC-*`/spec plus a short regression sweep of adjacent cases (e.g. a
   coupon fix re-runs all of `TC-CHK-005`–`TC-CHK-007`, not just the one
   that failed).
5. **Close the loop in the RTM** — if the defect revealed a coverage gap
   (as BUG-002's Notes section explicitly flags for the guest→logged-in cart
   transition), add the missing `TC-*`/spec and update
   `requirements-traceability-matrix.md` in the same change.

Severity/Priority scale used throughout: `High` / `Med`(ium) / `Low`,
consistent with the `Priority` column already used in `test-cases/*.md`.

## 9. Roles

| Role | Responsibility |
|---|---|
| QA Engineer | Own this strategy and the RTM; author/execute manual test cases and exploratory charters; author/maintain automated suites; triage and log defects |
| Developer | Fix defects; review/pair on automated suite additions that touch app code; provide clarification on intended behaviour |
| Product Owner | Clarify acceptance criteria; prioritise fixes; accept known gaps/residual risk explicitly (never implicitly) |
| Release Manager | Confirm exit criteria (§6.2) are met before production sign-off |

## 10. Tooling Summary

| Concern | Tool(s) |
|---|---|
| UI E2E (TypeScript, POM) | Playwright (`playwright/`), Cypress (`cypress/`) |
| UI E2E (classic WebDriver) | Selenium WebDriver v4 + Mocha + Chai (`selenium-mocha/`) |
| BDD / Gherkin | Cucumber.js + Playwright driver (`cucumber-bdd/`) |
| Mobile/responsive emulation | Playwright device emulation (`mobile-web-playwright/`) |
| Accessibility | axe-core via `@axe-core/playwright` (`accessibility/`) |
| API (collection-based) | Postman + Newman + newman-reporter-htmlextra (`api-postman-newman/`) |
| API (code-based, contract) | Mocha + Chai + axios + ajv (`api-mocha/`) |
| Email | nodemailer + Mailpit + cheerio (`email-testing/`) |
| Performance/load | k6 (`performance/`) |
| Manual test management | Markdown test cases + RTM in this folder (no paid test-case-management SaaS — see the portfolio's free/OSS-only tooling stance) |
| CI | GitHub Actions (Node/npm suites); k6 run on demand outside the main pipeline |

## 11. Relationship to Other Documents in This Folder

- **`test-plan-checkout.md`** is the feature-level plan this strategy sits
  above — it inherits this document's test levels/types/criteria and adds
  checkout-specific scope, schedule, and risk detail.
- **`requirements-traceability-matrix.md`** operationalises §4 above into a
  row-by-row Requirement → Test mapping.
- **`risk-based-testing.md`** operationalises §2.2's "weighted by business
  impact" objective into a scored risk register that determines how deep
  testing goes per area.
- **`exploratory-charters.md`** is the concrete implementation of the
  Exploratory row in §4.
