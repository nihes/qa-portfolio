# Manual Testing Artifacts

This folder contains manual QA deliverables produced as part of a Senior QA
Engineer portfolio. The goal is to demonstrate structured, professional
manual-testing practice independent of any automation tooling: test
planning, test case design, exploratory testing, and bug reporting.

## System Under Test (SUT)

The artifacts in this folder are written to be **generic and portable across
any e-commerce storefront** (cart, checkout, coupons, shipping, payment,
account management). To keep every example concrete and reproducible, two
public demo storefronts are used as reference SUTs throughout:

- **[SauceDemo](https://www.saucedemo.com/)** — a lightweight demo store used
  as a reference for account/auth flows (standard/locked/problem users) and
  basic cart behaviour.
- **[Automation Exercise](https://automationexercise.com/)** — a fuller demo
  storefront used as a reference for cart, checkout, coupon, and product
  search/filter/sort flows.

Any environment/version fields in the documents below (browser, OS, build)
are illustrative placeholders showing what a real QA report would capture —
substitute your actual test environment when reusing these templates against
a different SUT.

## Contents

| File | Description |
|---|---|
| [`test-plan-checkout.md`](./test-plan-checkout.md) | Full test plan for the checkout feature area: scope, approach, environments, entry/exit criteria, risks. |
| [`test-cases/checkout.md`](./test-cases/checkout.md) | 10 detailed test cases covering the checkout flow (valid checkout, empty cart, address validation, coupons, totals, guest vs. logged-in, payment failure, order confirmation). |
| [`test-cases/cart-and-search.md`](./test-cases/cart-and-search.md) | 9 test cases covering cart operations (add/remove/update qty, persistence, badge count) and product search/filter/sort. |
| [`test-cases/account-auth.md`](./test-cases/account-auth.md) | 8 test cases covering registration, login (valid/invalid/locked), logout, and password reset. |
| [`bug-reports/BUG-001-coupon-not-applied.md`](./bug-reports/BUG-001-coupon-not-applied.md) | Bug report: coupon discount accepted at checkout but not reflected in the order total. |
| [`bug-reports/BUG-002-cart-quantity-persistence.md`](./bug-reports/BUG-002-cart-quantity-persistence.md) | Bug report: cart item quantity resets unexpectedly after login / session change. |
| [`bug-reports/BUG-003-search-zero-results-for-valid-term.md`](./bug-reports/BUG-003-search-zero-results-for-valid-term.md) | Bug report: product search returns zero results for a valid singular keyword while the plural form correctly matches. |
| [`bug-reports/BUG-004-checkout-accepts-invalid-postal-code.md`](./bug-reports/BUG-004-checkout-accepts-invalid-postal-code.md) | Bug report: checkout places an order despite an empty or invalid postal code, unlike every other required address field. |
| [`exploratory-charters.md`](./exploratory-charters.md) | Session-based exploratory testing charters for checkout, coupons/discounts, cart, and multi-currency/store, plus a session notes template. |
| [`test-strategy.md`](./test-strategy.md) | Portfolio-wide test strategy: scope, test levels/types mapped to concrete suites (Playwright, Cypress, Selenium, Cucumber, Postman/Newman, Mocha API, mobile, accessibility, email, k6), environments, entry/exit criteria, defect workflow, CI approach. |
| [`risk-based-testing.md`](./risk-based-testing.md) | Risk register scoring likelihood/impact/priority across payment, coupons, cart/session, pricing, search, auth, accessibility, performance and API-contract risks, and how priority drives test depth. |
| [`requirements-traceability-matrix.md`](./requirements-traceability-matrix.md) | RTM mapping requirements to manual `TC-*` cases and automated suite coverage, with a Covered/Partial/Gap status per row and a coverage summary. |

## How to read the test case tables

Every test case document uses the same column layout:

`ID | Title | Preconditions | Steps | Test Data | Expected Result | Priority | Type`

- **Priority**: `High` / `Med` / `Low` — relative business impact if the case fails.
- **Type**: `Functional` / `Negative` / `Boundary` — the nature of the check.

## Suggested reading order

1. `test-strategy.md` — the portfolio-wide policy: test levels/types, tooling, environments, entry/exit criteria, CI approach.
2. `risk-based-testing.md` — which areas get the deepest testing, and why.
3. `test-plan-checkout.md` — the feature-level plan for checkout, applying that strategy.
4. `test-cases/*.md` — the concrete test cases derived from that plan.
5. `requirements-traceability-matrix.md` — how those test cases (and the automated suites) map back to requirements, and where the coverage gaps are.
6. `bug-reports/*.md` — examples of defects that this kind of testing surfaces.
7. `exploratory-charters.md` — unscripted, risk-based testing that complements the scripted cases above.
