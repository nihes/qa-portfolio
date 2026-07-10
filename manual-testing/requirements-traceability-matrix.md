# Requirements Traceability Matrix (RTM)

| | |
|---|---|
| **Document** | Requirements Traceability Matrix |
| **Feature areas** | Catalog/Search, Cart, Checkout, Payment, Coupons/Discounts, Account/Auth |
| **Author** | Ivan Andrijko (QA) |
| **Status** | Living document — updated each release cycle |
| **Version** | 1.0 |
| **Reference SUTs** | [saucedemo.com](https://www.saucedemo.com/), [automationexercise.com](https://automationexercise.com/), [dummyjson.com](https://dummyjson.com) |

## What this is and why it exists

A Requirements Traceability Matrix maps every testable requirement to the
test artifact(s) that verify it — manual test cases and/or automated
specs — and records a coverage **Status**. It answers three questions a
release sign-off needs answered quickly:

1. **Is this requirement tested at all?** (traceability — no requirement
   silently falls through the cracks between manual and automated suites)
2. **By what, exactly?** (a specific `TC-*` ID and/or a specific spec file —
   not "yes, somewhere")
3. **Where are the real gaps?** (a `Gap` row is a concrete, actionable backlog
   item, not a vague sense that "we should probably test that")

This RTM deliberately spans **both** the manual test-case suites in this
folder (`test-cases/checkout.md`, `test-cases/cart-and-search.md`,
`test-cases/account-auth.md`) **and** the automated suites elsewhere in the
portfolio (`playwright/`, `cypress/`, `selenium-mocha/`, `cucumber-bdd/`,
`api-postman-newman/`, `api-mocha/`, `mobile-web-playwright/`,
`accessibility/`, `email-testing/`, `performance/`). Automated and manual
coverage are tracked side by side on purpose — a requirement can be
`Covered` by automation alone, by manual testing alone, by both, or by
neither (`Gap`), and this matrix is where that becomes visible instead of
living in two people's heads.

> **Note on SUTs**: the automated suites in this portfolio primarily target
> **saucedemo.com** (`playwright/`, `cypress/`, `selenium-mocha/`,
> `cucumber-bdd/`, `mobile-web-playwright/`, `accessibility/`) or
> **dummyjson.com** (`api-mocha/`, `performance/`), while the manual test
> cases are written against the fuller **automationexercise.com** feature
> set (coupons, product search, guest checkout) per
> `test-plan-checkout.md` §4.1. Several `Gap` rows below exist precisely
> because saucedemo has no equivalent feature (e.g. no coupons, no product
> search) for the automated suites to exercise — this is a genuine
> tooling/SUT-parity gap, not an oversight, and is called out per row.

## Coverage summary

| Status | Count | % of rows |
|---|---|---|
| ✅ Covered | 9 | 36% |
| 🟡 Partial | 7 | 28% |
| 🔴 Gap | 9 | 36% |
| **Total requirements tracked** | **25** | 100% |

Read as: roughly two-thirds of tracked requirements have *some* automated
signal; a third rely on manual testing alone (mostly coupons, guest
checkout, cart-quantity edge cases, and account registration/logout — see
the `Gap` rows below, most of which trace to a real SUT-parity limitation
rather than a skipped test).

## Catalog & Search

| Req ID | Requirement | Manual TC(s) | Automated Coverage | Status |
|---|---|---|---|---|
| REQ-010 | Product search returns results relevant to the search keyword | [`TC-SRCH-001`](./test-cases/cart-and-search.md) | `api-postman-newman/collections/automationexercise-api.postman_collection.json` — "Search Product" request asserts `responseCode` 200 and a non-empty `products` array (API-level only; no UI-level search exists on saucedemo to automate) | 🟡 Partial |
| REQ-011 | Searching a non-matching keyword shows a graceful empty-state, not an error | [`TC-SRCH-002`](./test-cases/cart-and-search.md) | — (no automated suite exercises the no-results UI state) | 🔴 Gap |
| REQ-012 | Product listing can be sorted by price and the resulting order is correct | [`TC-SRCH-003`](./test-cases/cart-and-search.md) | `playwright/tests/sorting.spec.ts`, `cypress/cypress/e2e/sorting.cy.ts` — both verify price low→high and name Z→A ordering | ✅ Covered |

## Cart

| Req ID | Requirement | Manual TC(s) | Automated Coverage | Status |
|---|---|---|---|---|
| REQ-020 | Adding an item to the cart increments the cart badge/count | [`TC-CART-001`](./test-cases/cart-and-search.md) | `playwright/tests/cart.spec.ts`, `cypress/cypress/e2e/cart.cy.ts`, `cucumber-bdd/features/cart.feature`, `mobile-web-playwright/tests/mobile-checkout.spec.ts` (as part of the full flow) | ✅ Covered |
| REQ-021 | Removing an item from the cart updates badge/count and total | [`TC-CART-002`](./test-cases/cart-and-search.md) | `playwright/tests/cart.spec.ts`, `cypress/cypress/e2e/cart.cy.ts`, `cucumber-bdd/features/cart.feature` | ✅ Covered |
| REQ-022 | Updating item quantity in the cart recalculates line and cart totals | [`TC-CART-003`](./test-cases/cart-and-search.md) | — (saucedemo's cart has no quantity-edit control, only remove; automationexercise supports it but is not yet automated) | 🔴 Gap |
| REQ-023 | Quantity cannot be driven to zero/negative via direct input (boundary) | [`TC-CART-004`](./test-cases/cart-and-search.md) | — | 🔴 Gap |
| REQ-024 | Cart contents persist across in-session page navigation | [`TC-CART-005`](./test-cases/cart-and-search.md) | — (no automated spec re-navigates and re-asserts cart state) | 🔴 Gap |
| REQ-025 | Cart contents persist across a browser refresh | [`TC-CART-006`](./test-cases/cart-and-search.md) | — | 🔴 Gap |

## Checkout & Payment

| Req ID | Requirement | Manual TC(s) | Automated Coverage | Status |
|---|---|---|---|---|
| REQ-030 | A user with a valid cart can complete checkout successfully (happy path) | [`TC-CHK-001`](./test-cases/checkout.md) | `playwright/tests/checkout.spec.ts`, `cypress/cypress/e2e/checkout.cy.ts`, `selenium-mocha/tests/checkout.test.js`, `cucumber-bdd/features/checkout.feature`, `mobile-web-playwright/tests/mobile-checkout.spec.ts` — the single most redundantly-automated requirement in the portfolio, by design (it's the critical revenue path) | ✅ Covered |
| REQ-031 | Checkout is blocked / redirected when the cart is empty | [`TC-CHK-002`](./test-cases/checkout.md) | — | 🔴 Gap |
| REQ-032 | Checkout blocks progression when a required address field is missing | [`TC-CHK-003`](./test-cases/checkout.md) | `playwright/tests/checkout-validation.spec.ts`, `cypress/cypress/e2e/checkout-validation.cy.ts` — missing first name / last name / postal code each assert the matching "&lt;Field&gt; is required" banner | ✅ Covered |
| REQ-033 | Checkout rejects an invalid field *format* (e.g. non-numeric ZIP), not just an empty field | [`TC-CHK-004`](./test-cases/checkout.md) | `checkout-validation` specs above cover *missing* fields only, not malformed *format* — format validation is not exercised by automation | 🟡 Partial |
| REQ-040 | A valid coupon code is applied and the discount is reflected in the order total | [`TC-CHK-005`](./test-cases/checkout.md) | — (saucedemo has no coupon feature to automate against; see [`BUG-001`](./bug-reports/BUG-001-coupon-not-applied.md) for a live defect in this exact area found via manual testing) | 🔴 Gap |
| REQ-041 | An invalid or expired coupon code is rejected with a clear error and no discount applied | [`TC-CHK-006`](./test-cases/checkout.md) | — | 🔴 Gap |
| REQ-042 | Order total arithmetic (subtotal, discount, shipping, tax → grand total) is correct with no rounding/floating-point drift | [`TC-CHK-007`](./test-cases/checkout.md) | `playwright/tests/checkout.spec.ts` / `cypress/cypress/e2e/checkout.cy.ts` assert the order-summary total on the happy path (no discount applied in that scenario) | 🟡 Partial |
| REQ-043 | Guest users can complete checkout without being forced to register | [`TC-CHK-008`](./test-cases/checkout.md) | — (saucedemo requires login for every flow; automationexercise supports true guest checkout but this isn't automated yet) | 🔴 Gap |
| REQ-044 | A declined/failed payment shows a clear on-screen error, creates no order, and preserves cart/address so the user can retry | [`TC-CHK-009`](./test-cases/checkout.md) | — (no payment sandbox is wired into any automated suite in this portfolio) | 🔴 Gap |
| REQ-045 | The order confirmation page/screen accurately reflects the placed order (items, qty, total) | [`TC-CHK-010`](./test-cases/checkout.md) | `playwright/tests/checkout.spec.ts`, `cypress/cypress/e2e/checkout.cy.ts` assert the "Thank you for your order!" completion screen and total — full line-item/qty accuracy on the confirmation screen is not separately re-verified | 🟡 Partial |
| REQ-046 | A transactional order-confirmation email is sent with correct, well-formed content | *(not in current manual suite — candidate for a new TC)* | `email-testing/tests/html-validation.test.js` (offline structural checks on `templates/order-confirmation.html`), `email-testing/tests/smtp-mailpit.test.js` (send → fetch via Mailpit → assert recipient/subject/body) | 🟡 Partial |

## Coupons & Discounts

| Req ID | Requirement | Manual TC(s) | Automated Coverage | Status |
|---|---|---|---|---|
| REQ-050 | Coupon/discount logic is explored beyond the scripted happy/negative cases (stacking, threshold boundaries, cart-content changes after apply) | Charter 2 in [`exploratory-charters.md`](./exploratory-charters.md) | — | 🔴 Gap |

*(REQ-040/041/042 above are the scripted coupon requirements; REQ-050 tracks
the exploratory/risk-based layer on top of them — see
[`risk-based-testing.md`](./risk-based-testing.md) RISK-002.)*

## Account & Auth

| Req ID | Requirement | Manual TC(s) | Automated Coverage | Status |
|---|---|---|---|---|
| REQ-060 | A new user can register with valid, unique data | [`TC-AUTH-001`](./test-cases/account-auth.md) | — (saucedemo has fixed demo accounts only, no registration flow to automate) | 🔴 Gap |
| REQ-061 | Registration is rejected for an already-registered email, with no duplicate account created | [`TC-AUTH-002`](./test-cases/account-auth.md) | — | 🔴 Gap |
| REQ-062 | Login succeeds with valid credentials and establishes a session | [`TC-AUTH-003`](./test-cases/account-auth.md) | `playwright/tests/login.spec.ts`, `cypress/cypress/e2e/login.cy.ts`, `selenium-mocha/tests/login.test.js`, `cucumber-bdd` step defs (login precedes every scenario), `api-mocha/tests/auth.test.js` (equivalent pattern at the API layer against dummyjson `POST /auth/login`) | ✅ Covered |
| REQ-063 | Login is rejected with a generic error when the password is incorrect | [`TC-AUTH-004`](./test-cases/account-auth.md) | `playwright/tests/login.spec.ts`, `cypress/cypress/e2e/login.cy.ts` — invalid-credentials case | ✅ Covered |
| REQ-064 | Login is rejected for a locked-out account with an explanatory message | [`TC-AUTH-005`](./test-cases/account-auth.md) | `playwright/tests/login.spec.ts`, `cypress/cypress/e2e/login.cy.ts`, `selenium-mocha/tests/login.test.js` — all three assert the `locked_out_user` error banner | ✅ Covered |
| REQ-065 | Login is rejected for a non-existent username without revealing account existence | [`TC-AUTH-006`](./test-cases/account-auth.md) | Overlaps the same "invalid credentials" assertion used for REQ-063 in `login.spec.ts` / `login.cy.ts` — not separately parametrised for a *non-existent* vs. *wrong-password* username | 🟡 Partial |
| REQ-066 | Logout invalidates the session and blocks access to protected pages | [`TC-AUTH-007`](./test-cases/account-auth.md) | — (no automated spec logs out and re-attempts protected-page access) | 🔴 Gap |
| REQ-067 | Requesting a password reset for a valid email triggers a reset email without confirming/denying account existence | [`TC-AUTH-008`](./test-cases/account-auth.md) | `email-testing/tests/smtp-mailpit.test.js` demonstrates the SMTP-capture pattern this would need, but no password-reset-specific template/flow is wired up yet | 🟡 Partial |

## Cross-cutting quality attributes

These have no 1:1 manual `TC-*` in the current suite (candidates for future
test cases) but are tracked here because they're exercised by dedicated
automated suites and belong in a complete picture of coverage.

| Req ID | Requirement | Manual TC(s) | Automated Coverage | Status |
|---|---|---|---|---|
| REQ-070 | Critical pages (login, inventory) have no critical WCAG 2.0/2.1 A/AA accessibility violations | — | `accessibility/tests/a11y.spec.ts` (axe-core scan; known third-party issue `select-name` on the sort control is explicitly triaged, not silently ignored) | 🟡 Partial |
| REQ-071 | The critical purchase journey works under mobile viewport/touch emulation | — | `mobile-web-playwright/tests/mobile-checkout.spec.ts`, `mobile-web-playwright/tests/responsive.spec.ts` | 🟡 Partial |
| REQ-080 | API responses conform to their documented contract/schema | — | `api-mocha/tests/schema.test.js` (ajv validation against `schemas/login.schema.json`, `schemas/product.schema.json`) | ✅ Covered |
| REQ-081 | Product listing API stays within latency and error-rate thresholds under load | — | `performance/k6-load-test.js` (p95 < 800ms, error rate < 1%, custom `business_errors` metric) | ✅ Covered |

## Maintaining this matrix

- Add a row **before** or **alongside** writing a new manual test case or
  automated spec — not after the fact — so `Gap` rows always reflect current
  reality rather than stale intent.
- When a `Gap` is closed by a new automated spec, update the row's
  **Automated Coverage** and **Status** columns in the same change that adds
  the spec; do not let this file drift from `playwright/`, `cypress/`, etc.
- A `Partial` row should say *why* it's partial in the Automated Coverage
  cell (missing edge case, different SUT, API-only vs. UI-level, etc.) — a
  bare "Partial" with no explanation is not useful to whoever reads this next.
