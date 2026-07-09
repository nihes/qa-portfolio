# Test Plan — Checkout Feature Area

| | |
|---|---|
| **Document** | Test Plan |
| **Feature area** | Cart, Checkout, Payment, Orders |
| **Author** | Ivan Andrijko (QA) |
| **Status** | Approved for execution |
| **Version** | 1.0 |
| **Reference SUTs** | [saucedemo.com](https://www.saucedemo.com/), [automationexercise.com](https://automationexercise.com/) |

## 1. Introduction

This test plan covers the end-to-end **checkout journey** of a typical
e-commerce storefront: from an item being added to the cart through to order
confirmation, including cart management, coupon/discount application,
shipping selection, payment processing, and order creation.

The plan is written to be reusable against any storefront that exposes this
journey. Where concrete examples are needed, the public demo stores
**SauceDemo** and **Automation Exercise** are used as stand-ins for a real
production SUT.

### 1.1 Objectives

- Verify that a customer can complete a purchase successfully under normal
  conditions (happy path).
- Verify that the system correctly blocks or handles invalid/incomplete
  input at every step of checkout.
- Verify that pricing, discounts, taxes, shipping, and totals are calculated
  and displayed correctly at every step.
- Verify behaviour differences between guest and authenticated checkout.
- Identify defects that would cause incorrect charges, lost orders, or a
  broken purchase funnel — these have direct revenue impact and are treated
  as highest priority.

## 2. Scope

### 2.1 In scope

- Cart: add/remove/update item, quantity changes, cart badge/count, cart
  persistence across navigation and session.
- Checkout: address entry and validation, shipping method selection, order
  summary/review, order placement, order confirmation page/email.
- Coupons & discounts: applying a valid coupon, rejecting an invalid/expired
  coupon, discount reflected correctly in the running total.
- Payment: successful payment, declined/failed payment handling, on-screen
  error messaging.
- Pricing & totals: subtotal, discount, tax, shipping, and grand total
  arithmetic across all of the above.
- Guest checkout vs. logged-in checkout behavioural differences.
- Cross-browser checks (Chrome, Firefox, Edge — latest stable) for the
  critical path.
- Responsive checks (desktop 1920×1080, tablet 768×1024, mobile 375×812) for
  the critical path.

### 2.2 Out of scope

- Backend/API-level testing, database integrity, or admin/back-office tooling.
- Third-party payment gateway internals (only the storefront-facing behaviour
  and error handling are tested).
- Performance/load testing and security penetration testing (covered by
  separate specialised test plans, if applicable).
- Localization/translation completeness beyond the stores explicitly listed
  in Section 4 (Environments & Test Data).
- Native mobile app checkout (web-responsive only, per Section 2.1).

## 3. Test Approach

A blended approach is used, matched to where each technique adds the most
value:

| Technique | When applied | Purpose |
|---|---|---|
| **Smoke** | Every build/deploy, before deeper testing begins | Confirm the critical path (add to cart → checkout → payment → confirmation) is not broken. |
| **Functional** | Every planned test cycle | Verify each checkout step behaves per the documented/expected behaviour, using the scripted test cases in `test-cases/`. |
| **Negative / boundary** | Every planned test cycle | Verify invalid input, empty states, and edge values (empty cart, invalid coupon, malformed address fields, zero/negative quantity) are handled gracefully. |
| **Regression** | Before each release, and after any bug fix in this area | Re-run the full checkout test case suite to confirm no previously-working behaviour has broken. |
| **Exploratory (session-based)** | Once per release cycle, or when a risk area is identified | Unscripted, charter-driven testing to surface issues the scripted cases don't anticipate (see `exploratory-charters.md`). |
| **Cross-browser** | Critical path only, once per release cycle | Confirm checkout works consistently on Chrome, Firefox, and Edge (latest stable versions). |
| **Responsive** | Critical path only, once per release cycle | Confirm checkout is usable at desktop, tablet, and mobile breakpoints. |

Test cases are prioritised `High` / `Med` / `Low` so that a reduced smoke
pass can be run under time pressure without losing the highest-risk checks.

## 4. Environments & Test Data

### 4.1 Environments

| Environment | Purpose | Notes |
|---|---|---|
| Reference SUT — SauceDemo | Account/auth and basic cart reference examples | Public demo store, no real payment processing. |
| Reference SUT — Automation Exercise | Cart, checkout, coupon, and search/filter/sort reference examples | Public demo store, sandbox/test payment form. |
| Staging (project-specific) | Full-fidelity pre-production testing | Substitute the project's actual staging environment when reusing this plan. |
| Production (smoke only) | Post-deploy smoke verification | Read-only / non-destructive checks only; no test orders placed with real payment instruments. |

### 4.2 Test data

| Data type | Example |
|---|---|
| Standard user | `standard_user` (SauceDemo) / a registered test account (Automation Exercise) |
| Locked-out user | `locked_out_user` (SauceDemo) — used for negative login cases |
| Guest checkout | No account — proceed directly to checkout |
| Valid coupon | A currently active discount code configured in the target store |
| Invalid/expired coupon | `INVALID10`, or a coupon past its expiry date |
| Payment — success | Test card / sandbox payment credentials provided by the store's payment sandbox |
| Payment — decline | A card number reserved by the payment sandbox to simulate a decline |
| Shipping addresses | One valid full address per supported country/store in scope; at least one intentionally incomplete address (missing postal code / required field) for negative testing |

Test data must always be **synthetic** — no real customer PII or live payment
instruments are used in any environment below Production.

## 5. Roles & Responsibilities

| Role | Responsibility |
|---|---|
| QA Engineer | Author and execute test cases, log bugs, report results, maintain this plan |
| Developer | Fix defects, provide clarification on intended behaviour |
| Product Owner | Clarify acceptance criteria, prioritise bug fixes, sign off on release readiness |
| Release Manager | Confirm exit criteria are met before sign-off to production |

## 6. Entry Criteria

- Build is deployed to the target test environment and is reachable.
- Smoke test of the critical checkout path passes.
- Test data (accounts, coupons, payment sandbox credentials) is available
  and confirmed working.
- Relevant test cases in `test-cases/` have been reviewed/updated against
  any functional changes in this cycle.

## 7. Exit Criteria

- 100% of `High` priority test cases executed, with **zero open High/Critical
  severity defects** in the checkout critical path.
- ≥ 95% of `Med`/`Low` priority test cases executed; any failures triaged and
  either fixed or explicitly accepted by the Product Owner.
- All defects found during this cycle are logged (see `bug-reports/`) with
  reproduction steps, severity, and priority.
- No regressions observed versus the previous release's known-good baseline.
- Exploratory session charters for this cycle have been run and their notes
  reviewed (see `exploratory-charters.md`).

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Payment sandbox instability/downtime | Cannot validate payment success/failure paths | Confirm sandbox availability before the cycle starts; have a fallback test window; treat sandbox outages as a blocked (not failed) test |
| Coupon/discount rules change frequently | Test data (valid coupon codes) goes stale between cycles | Re-verify at least one valid and one invalid coupon at the start of each cycle before executing coupon test cases |
| Pricing/tax rules differ per store/locale | A single flat set of expected totals doesn't generalise | Compute expected totals per store/locale as part of test data setup, not assumed globally |
| Cross-browser/device coverage is time-boxed | Lower-traffic browsers/devices get less coverage | Cross-browser/responsive checks are limited to the critical path only (Section 3); full regression stays on the primary browser |
| Guest vs. logged-in logic diverges silently | A fix for one path regresses the other | Every checkout regression pass explicitly includes both guest and logged-in variants, not just one |
| Race between manual and automated coverage | Duplicate or gap coverage | This manual suite intentionally cross-references the automated suite's checkout coverage so both are known and gaps are visible |

## 9. Deliverables

- This test plan (`test-plan-checkout.md`).
- Test case suites: `test-cases/checkout.md`, `test-cases/cart-and-search.md`,
  `test-cases/account-auth.md`.
- Bug reports for any defects found, filed under `bug-reports/`.
- Exploratory testing charters and session notes: `exploratory-charters.md`.
- A test execution summary (pass/fail counts against exit criteria) reported
  to the Release Manager at the end of each cycle.
