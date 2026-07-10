# Risk-Based Testing

| | |
|---|---|
| **Document** | Risk-Based Testing Register |
| **Scope** | Whole portfolio: catalog/search, cart, checkout, payment, coupons, account/auth, cross-cutting quality attributes |
| **Author** | Ivan Andrijko (QA) |
| **Status** | Living document — revisited each release cycle |
| **Version** | 1.0 |
| **Related** | [`test-strategy.md`](./test-strategy.md), [`requirements-traceability-matrix.md`](./requirements-traceability-matrix.md), [`test-plan-checkout.md`](./test-plan-checkout.md), [`exploratory-charters.md`](./exploratory-charters.md) |

## 1. Why risk-based testing

Test time is always finite; risk it is not. Rather than trying to test
everything equally, this document identifies **what's most likely to break**
and **what it costs if it does**, then uses that to decide where scripted
depth, automation investment, and exploratory attention actually go. A
`High`-priority risk gets a `High`-priority test case, a dedicated
automated spec, and an exploratory charter; a `Low`-priority risk gets a
single scripted check and nothing more — that asymmetry is the point, not
an oversight.

This complements — it doesn't replace — the
[RTM](./requirements-traceability-matrix.md): the RTM tracks *what is
tested*; this register tracks *why it's tested that hard (or not harder)*.

## 2. Method

Each risk is scored on two axes:

- **Likelihood** (`H`/`M`/`L`) — how probable is this failure mode, given
  the feature's complexity, how often it changes, and how many moving parts
  (pricing rules, third-party gateways, multi-store/locale logic, session
  state) are involved?
- **Impact** (`H`/`M`/`L`) — if it happens in production, how bad is it?
  Revenue-affecting and legally-exposing risks are `H` regardless of how
  rare; purely cosmetic issues are rarely above `M`.

**Priority (RPO — Risk Priority Order)** is derived from the Likelihood ×
Impact combination:

| | Impact: L | Impact: M | Impact: H |
|---|---|---|---|
| **Likelihood: H** | P2 | P1 | **P0** |
| **Likelihood: M** | P3 | P2 | P1 |
| **Likelihood: L** | P3 | P3 | P2 |

`P0` = must have deep scripted + automated + exploratory coverage and is a
release blocker if untested. `P3` = light scripted coverage is enough;
exploratory-only is acceptable if resourcing is tight.

## 3. Risk Register

| Risk ID | Area | Description | Likelihood | Impact | Priority | Mitigation / Test Focus | Related test cases / suites |
|---|---|---|---|---|---|---|---|
| RISK-001 | Payment | Payment failures/declines are mishandled — a raw gateway error leaks to the UI, an order is created despite a declined payment, or the cart/address is lost on retry | M | H | **P1** | Scripted negative payment-decline case; exploratory probing of double-submit and back-navigation after a declined attempt; verify no order record is created on decline | `TC-CHK-009`; Charter 1 in `exploratory-charters.md` |
| RISK-002 | Coupons / discounts | Discount is accepted with a success message but not deducted from the charged total (display-only vs. genuine calculation defect); coupon usage-limit or minimum-spend boundary is miscalculated | H | H | **P0** | Scripted valid/invalid coupon cases plus full totals-arithmetic case; exploratory boundary probing (threshold ±1 cent, stacking, re-apply after cart change); network capture (HAR) to distinguish display bug from real overcharge | `TC-CHK-005`, `TC-CHK-006`, `TC-CHK-007`; Charter 2 in `exploratory-charters.md`; **live defect**: [`BUG-001`](./bug-reports/BUG-001-coupon-not-applied.md) |
| RISK-003 | Cart / session | Cart contents or quantities are lost or reset across a session-state change (login, logout, guest→account merge, long idle, multi-tab) | H | M | **P1** | Scripted persistence cases across navigation/refresh; exploratory session-transition charter with repeated (10+) attempts to catch intermittent/race-condition variants | `TC-CART-005`, `TC-CART-006`; Charter 3 in `exploratory-charters.md`; **live defect**: [`BUG-002`](./bug-reports/BUG-002-cart-quantity-persistence.md) |
| RISK-004 | Catalog / pricing | Stock level or price shown in the cart/PDP goes stale relative to the backend while an item sits in an open cart (price change, item goes out of stock mid-session) | M | H | **P1** | Exploratory probing of price-change-while-in-cart and OOS-while-in-cart scenarios; confirm the user is told *before* the payment step, not at it | Charter 3 in `exploratory-charters.md` (starter questions on stale price / OOS) |
| RISK-005 | Checkout validation | Required-field or format validation is inconsistently enforced across address fields, allowing an order to be placed with invalid/unusable shipping data (e.g. empty or malformed postal code) | M | M | **P2** | Scripted missing-field and invalid-format negative cases per field; confirm the *order itself* is blocked, not just a UI warning shown | `TC-CHK-003`, `TC-CHK-004`; **live defect**: [`BUG-004`](./bug-reports/BUG-004-checkout-accepts-invalid-postal-code.md) |
| RISK-006 | Pricing arithmetic | Rounding or floating-point drift produces an order total that doesn't exactly match subtotal − discount + shipping + tax, especially with 3-decimal or repeating-decimal intermediate values | M | M | **P2** | Scripted boundary case with deliberately awkward unit prices (see `TC-CHK-007`'s 39.99/10%/5.00 example); spot-check totals on any release touching pricing/tax logic | `TC-CHK-007`; **live defect**: [`BUG-003`](./bug-reports/BUG-003-search-zero-results-for-valid-term.md) is a different symptom in the same "output doesn't match input" family — see note below |
| RISK-007 | Search / discovery | Search returns zero or irrelevant results for a term that should plausibly match, silently costing conversions without ever surfacing as a hard error | M | M | **P2** | Scripted relevant-keyword and no-match cases; periodically re-test previously-working search terms as a regression check, since search/indexing defects rarely announce themselves | `TC-SRCH-001`, `TC-SRCH-002`; **live defect**: [`BUG-003`](./bug-reports/BUG-003-search-zero-results-for-valid-term.md) |
| RISK-008 | Account / auth | Session isn't properly invalidated on logout (protected pages remain reachable via back-navigation or direct URL) | L | H | **P2** | Scripted logout-then-access-protected-page case; explicitly test back-navigation after logout, not just a fresh request | `TC-AUTH-007` |
| RISK-009 | Cross-device / responsive | The critical purchase journey breaks or becomes unusable at mobile/tablet viewports or under touch input, even though it works on desktop | M | M | **P2** | Automated mobile emulation of the full checkout journey; manual responsive spot-check of the critical path per release | `mobile-web-playwright/tests/mobile-checkout.spec.ts`, `mobile-web-playwright/tests/responsive.spec.ts`; `test-plan-checkout.md` §2.1 responsive scope |
| RISK-010 | Accessibility / legal exposure | Customer-facing pages carry WCAG-level violations that block real users (screen-reader/keyboard-only) from completing a purchase, with attendant legal/compliance exposure in some markets | L | H | **P2** | Automated axe-core scan of login/inventory pages as a standing gate; triage every violation explicitly (fix, or document as a known third-party issue) rather than suppressing broadly | `accessibility/tests/a11y.spec.ts` |
| RISK-011 | Performance under load | Product-listing/API latency degrades or error rate rises under concurrent load, especially around traffic spikes (sales events) | L | M | **P3** | k6 load test with explicit p95-latency and error-rate thresholds, run ahead of known high-traffic periods | `performance/k6-load-test.js` |
| RISK-012 | API contract drift | A backend change silently alters a response shape/field that a consumer (this test suite, or a real frontend) depends on, breaking integration without any UI symptom until much later | M | M | **P2** | ajv schema/contract tests run on every change as a fast, deterministic gate — independent of any UI | `api-mocha/tests/schema.test.js` |
| RISK-013 | Guest vs. logged-in divergence | A fix or change to one checkout path (guest or logged-in) regresses the other because the two share code but aren't both re-verified | M | M | **P2** | Every checkout regression pass explicitly includes both variants, not just one (see `test-plan-checkout.md` §8) | `TC-CHK-001`, `TC-CHK-008` |
| RISK-014 | Email deliverability & rendering | A transactional order-confirmation email fails to send, or renders with broken markup/links/missing content in real inboxes | L | M | **P3** | Offline structural validation on every change (fast, deterministic); SMTP integration check via Mailpit for the send/receive path; real multi-client rendering (Outlook/Gmail/dark mode) explicitly out of scope for this free/OSS suite — see `email-testing/README.md` | `email-testing/tests/html-validation.test.js`, `email-testing/tests/smtp-mailpit.test.js` |

## 4. How priority drives test depth

| Priority | Scripted manual coverage | Automated coverage expectation | Exploratory coverage | Release-blocking? |
|---|---|---|---|---|
| **P0** | Full happy-path + negative + boundary cases, executed every cycle | Expected; a `Gap` here (see the RTM) is itself treated as a P0 backlog item, not just the underlying feature risk | A dedicated charter, run every cycle | Yes — any open defect blocks release |
| **P1** | Happy-path + key negative cases | Expected on the primary path; edge cases may remain manual-only | Charter run every cycle or on relevant change | Yes for `High`-severity defects |
| **P2** | Happy-path + at least one negative/boundary case | Nice-to-have; manual coverage alone is acceptable | Ad hoc, when time allows or a related bug is fixed | Only for `High`-severity defects |
| **P3** | Light — a single representative case is enough | Automation only if it's cheap to add alongside related P0–P2 work | Rarely dedicated; may piggyback on a broader charter | No, unless severity is unexpectedly high |

In short: **priority is not a suggestion about how many bugs might exist —
it's a decision about how much testing effort is justified**, and it should
visibly track to the RTM's Status column and to which suites actually exist
for a given area (e.g. RISK-002's `P0` rating is exactly why the coupon
`Gap` rows in the RTM are flagged as the highest-value automation backlog
item in the whole portfolio, not a coincidence).

## 5. Revisiting this register

Re-score risks (not just re-list them) at the start of each release cycle,
and whenever:

- A new defect is found that wasn't anticipated by an existing risk row
  (add a new row, or note it under an existing one if it's a variant).
- A risk's Likelihood changes because of an architecture/vendor change
  (e.g. switching payment gateways resets RISK-001's Likelihood — don't
  assume the old score still applies).
- A `Gap` in the RTM for a `P0`/`P1` risk has remained open for more than
  one cycle — that's a signal to escalate, not just re-list it quietly.
