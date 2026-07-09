# BUG-002 — Cart item quantity resets after login / session change

| Field | Value |
|---|---|
| **Bug ID** | BUG-002 |
| **Summary** | Item quantities set by a guest user in the cart are reset to 1 (or the cart is emptied entirely) after the user logs in, instead of the cart being merged/preserved with the quantities the user had chosen. |
| **Severity** | Medium — degrades the shopping experience and can cause a customer to unintentionally order the wrong quantity, but does not directly cause an incorrect charge if the customer reviews the cart before paying |
| **Priority** | Medium |
| **Reporter** | Ivan Andrijko (QA) |
| **Date raised** | 2026-07-09 |
| **Status** | Open |

## Environment

| | |
|---|---|
| **Store / SUT** | Automation Exercise demo storefront (`automationexercise.com`) — reference SUT used to illustrate this class of defect; reproduce against the project's actual staging/QA environment for a real ticket |
| **Build / version** | Illustrative — record the actual deployed build/commit hash when filing against a real environment |
| **Browser** | Google Chrome 126.0.6478.x (also reproduced on Microsoft Edge 126) |
| **OS** | Windows 11 |
| **Viewport** | Desktop, 1920×1080 |
| **User state** | Starts as guest (logged out), transitions to logged-in mid-session |

## Preconditions

- User is browsing as a guest (not logged in) at the start of the session.
- User has a registered, valid test account available to log into during the
  session.
- At least two distinct products are available to add to the cart.

## Steps to Reproduce

1. As a guest (logged out), add Product A to the cart with quantity 3.
2. Add Product B to the cart with quantity 2.
3. Open the cart and confirm both items and quantities are correct
   (A × 3, B × 2).
4. Without clearing the cart, click "Login" and authenticate with a valid
   registered test account.
5. After the login completes and the page redirects back to the storefront,
   open the cart again.

## Expected Result

- The cart contents and quantities set while browsing as a guest should
  persist through login — either by carrying the guest cart forward as-is,
  or by merging it with any existing saved cart for that account, with the
  combined/expected quantities clearly reflected (A × 3, B × 2, or the sum if
  a saved cart also had these items).

## Actual Result

- After login, the cart shows Product A and Product B with **quantity reset
  to 1 each** (A × 1, B × 1), discarding the quantities set before login.
- In some repro attempts (approximately 1 in 5), the cart is **emptied
  entirely** after login rather than quantity being reset to 1 — both
  variants were observed and are recorded here as the same underlying
  session-handling defect.

## Frequency

- **Quantity reset to 1**: reproducible in the majority of attempts (approx.
  4 out of 5 login transitions during testing).
- **Cart emptied entirely**: reproducible intermittently (approx. 1 out of 5
  login transitions) — suggests a race condition between guest-cart-to-account
  cart merge logic and the page reload/redirect that follows login, rather
  than a single deterministic cause.

## Evidence

- Screenshot placeholder: `evidence/BUG-002-guest-cart-before-login.png` —
  cart contents and quantities immediately before clicking Login.
- Screenshot placeholder: `evidence/BUG-002-cart-after-login-qty-reset.png` —
  cart contents immediately after login completes, showing quantity reset to 1.
- Screenshot placeholder: `evidence/BUG-002-cart-after-login-emptied.png` —
  cart shown empty after login, captured on one of the intermittent repro
  attempts.
- HAR file placeholder: `evidence/BUG-002-login-network.har` — capture of the
  network requests around the login action and the subsequent cart-fetch
  request, to check whether the server returns the correct merged cart and
  the client fails to render it, or whether the server itself returns the
  wrong (reset/empty) cart state.

## Notes

- The intermittent full-empty variant strongly suggests a **timing/race
  condition** (e.g. the cart-merge request and the redirect-triggered
  cart-refetch request racing each other) rather than a simple logic bug —
  recommend the fix be verified with repeated testing (10+ attempts) rather
  than a single pass, since a fix that only addresses the "reset to 1"
  variant may leave the intermittent empty-cart variant unresolved.
- Recommend checking whether this also affects **logout** (does a logged-in
  cart's quantities survive a logout back to guest browsing?) as a related
  but distinct scenario.
- Related test case: `test-cases/cart-and-search.md` → TC-CART-003 (update
  quantity) and TC-CART-005/TC-CART-006 (cart persistence across navigation
  and refresh) — this bug indicates a gap in that coverage for the specific
  guest→logged-in session transition, which should be added as a new test
  case once the fix is verified.
