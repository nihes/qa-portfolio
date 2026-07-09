# BUG-001 — Coupon discount accepted but not reflected in order total

| Field | Value |
|---|---|
| **Bug ID** | BUG-001 |
| **Summary** | A valid coupon code is accepted with a "coupon applied" success message, but the discount amount is not deducted from the order grand total at checkout. |
| **Severity** | High — customer-facing pricing defect; overcharges the customer relative to the advertised discount |
| **Priority** | High |
| **Reporter** | Ivan Andrijko (QA) |
| **Date raised** | 2026-07-09 |
| **Status** | Open |

## Environment

| | |
|---|---|
| **Store / SUT** | Automation Exercise demo storefront (`automationexercise.com`) — reference SUT used to illustrate this class of defect; reproduce against the project's actual staging/QA environment for a real ticket |
| **Build / version** | Illustrative — record the actual deployed build/commit hash when filing against a real environment |
| **Browser** | Google Chrome 126.0.6478.x (also reproduced on Firefox 128.0) |
| **OS** | Windows 11 |
| **Viewport** | Desktop, 1920×1080 |
| **User state** | Logged-in test account (also reproduces as guest) |

## Preconditions

- Cart contains at least one item with a known unit price.
- A currently active, valid coupon code exists for the store (e.g. a flat
  10% off code) and has not exceeded its usage limit.
- User has reached the cart or checkout page where the coupon input field is
  available.

## Steps to Reproduce

1. Add one item to the cart (e.g. unit price 25.00, qty 1).
2. Go to Cart / Checkout page.
3. Locate the "Apply Coupon" input field.
4. Enter the valid coupon code and click "Apply".
5. Observe the success message that confirms the coupon was applied.
6. Scroll to the order summary / totals section and compare the **subtotal**
   and **grand total** shown before and after applying the coupon.
7. Proceed to the payment step and check the total charged.

## Expected Result

- After a successful "coupon applied" confirmation, the order summary should
  immediately show a **discount line item** (e.g. "Discount (SAVE10): −2.50")
  and the **grand total should be reduced accordingly** (25.00 → 22.50).
- The reduced total should carry through unchanged to the payment step and
  the final order confirmation.

## Actual Result

- The success message "Coupon applied successfully" is displayed.
- No discount line item appears in the order summary.
- The grand total remains 25.00 both on the cart page and at the payment
  step — identical to the pre-coupon amount.
- The order is placed (and, where a real payment gateway is involved, charged)
  at the full undiscounted price.

## Frequency

- **Always reproducible** (10/10 attempts) with the same valid coupon code
  and a single-item cart.
- Also reproduces with multi-item carts and with both guest and logged-in
  checkout.

## Evidence

- Screenshot placeholder: `evidence/BUG-001-before-coupon.png` — cart total
  before applying the coupon.
- Screenshot placeholder: `evidence/BUG-001-after-coupon-success-msg.png` —
  success message shown with unchanged total visible in the same viewport.
- HAR file placeholder: `evidence/BUG-001-network.har` — capture of the
  "apply coupon" network request/response to confirm whether the backend
  response itself already omits the discount, or whether the discount is
  calculated server-side but not re-rendered client-side.

## Notes

- Worth checking whether this is a **display-only** defect (discount is
  applied server-side and reflected correctly in the final invoice/order
  record, but not re-rendered on the cart/checkout UI) versus a **calculation**
  defect (discount is genuinely dropped and the customer is charged full
  price). The HAR capture above is intended to distinguish these two cases —
  if confirmed as the latter, this should be escalated to Critical severity
  since it results in an incorrect charge.
- Recommend also verifying whether removing and re-applying the coupon, or
  refreshing the page after applying it, changes the outcome (possible
  caching/state issue vs. a pure calculation bug).
- Related test case: `test-cases/checkout.md` → TC-CHK-005 (valid coupon
  applied) and TC-CHK-007 (total calculation across subtotal/discount/shipping/tax).
