# Exploratory Testing Charters — Checkout Domain

Session-based exploratory testing (SBET) charters for the checkout feature
area. Each charter follows the standard form:

> Explore **\<area\>** with **\<resources\>** to discover **\<information\>**

These sessions are intended to complement — not replace — the scripted test
cases in `test-cases/`. They are run once per release cycle, or ad hoc when a
specific risk area is flagged (e.g. after a related bug fix, or before a
high-traffic sales event). Reference SUTs:
[saucedemo.com](https://www.saucedemo.com/),
[automationexercise.com](https://automationexercise.com/).

---

## Charter 1 — Checkout flow

**Explore** the end-to-end checkout flow (cart → address → shipping →
payment → confirmation) **with** interrupted/non-linear navigation (browser
back/forward, refresh mid-step, opening checkout in a second tab, switching
network conditions) **to discover** where the flow breaks, loses state, or
allows an inconsistent order to be placed.

- **Time-box:** 60 minutes
- **Risk focus:** state loss, duplicate order submission, ability to
  bypass a required step by manipulating the URL directly.
- **Starter questions:**
  - What happens if the user hits browser "Back" after payment succeeds but
    before the confirmation page fully loads — can the order be re-submitted?
  - What happens if checkout is opened in two browser tabs simultaneously
    with the same cart/session?
  - Does refreshing mid-checkout ever silently drop entered address or
    payment data without warning the user?

## Charter 2 — Discounts & coupons

**Explore** the coupon/discount application logic **with** multiple coupon
types (percentage, fixed-amount, expired, single-use, stacked/attempted
double application) **to discover** cases where the displayed discount does
not match the amount actually charged, or where invalid coupons are silently
accepted.

- **Time-box:** 45 minutes
- **Risk focus:** discount/total mismatch (see BUG-001), coupon reuse beyond
  its stated usage limit, applying a coupon after changing cart contents.
- **Starter questions:**
  - Does removing an item that made the cart eligible for a coupon (e.g. a
    minimum-spend threshold) correctly remove the coupon and recalculate the
    total, or does the discount "stick" incorrectly?
  - Can the same single-use coupon be applied twice by rapidly double-clicking
    "Apply", or by applying it in two open tabs?
  - What happens when a coupon's minimum order value is met exactly at the
    threshold (boundary), one cent below it, and one cent above it?

## Charter 3 — Cart behaviour

**Explore** cart state management **with** guest browsing, login/logout
transitions, multiple browser tabs, and long idle periods **to discover**
where cart contents, quantities, or pricing become inconsistent or are lost.

- **Time-box:** 45 minutes
- **Risk focus:** cart persistence across session/auth-state changes (see
  BUG-002), stale pricing shown for items whose price changed while sitting
  in the cart, quantity vs. available stock drift.
- **Starter questions:**
  - If an item's price changes on the backend while it sits in an open cart,
    does the cart show the old price, the new price, or something inconsistent
    between the cart page and the checkout review page?
  - If an item goes out of stock while sitting in the cart, is the user told
    before or only at the payment step?
  - Does the cart badge count ever drift out of sync with the actual number
    of line items/quantities shown when the cart is opened?

## Charter 4 — Multi-currency / multi-store

**Explore** store/locale and currency switching **with** an active cart and
an in-progress checkout **to discover** where prices, totals, or applied
discounts fail to convert/recalculate consistently across stores or
currencies.

- **Time-box:** 45 minutes
- **Risk focus:** currency mismatch between cart and checkout totals, coupon
  validity rules that don't translate across stores, shipping cost
  miscalculation after a store switch.
- **Starter questions:**
  - If the store/locale is switched while an item is already in the cart,
    does the price update to the new store's currency/price list, or does a
    stale price/currency combination leak through to checkout?
  - Does a coupon valid in one store incorrectly appear valid (or invalid)
    after switching to a different store/locale mid-session?
  - Are totals on the confirmation page and any confirmation email consistent
    in currency and value with what was shown at the point of payment?

---

## Session Notes Template

Use this template to capture findings during any of the charters above.

```
Charter:            <e.g. Charter 2 — Discounts & coupons>
Tester:             <name>
Date:               <yyyy-mm-dd>
Environment/SUT:    <store, URL, browser, build>
Time-box:           <planned minutes>  |  Actual time spent: <minutes>

Areas covered:
- <bullet list of what was actually explored in this session>

Observations / potential issues found:
1. <short description> — <steps to reproduce, if reproducible>
   Severity guess: <Low/Med/High>   Filed as bug?: <Yes/No — BUG-ID if yes>
2. ...

Questions raised (for follow-up, not necessarily bugs):
- <e.g. "Is X intended behaviour or a gap in the spec?">

Coverage gaps identified for future scripted test cases:
- <e.g. "No existing test case covers coupon + out-of-stock interaction">

Charter outcome:  [ ] Fully covered   [ ] Partially covered — resume later   [ ] Blocked (reason: ______)
```
