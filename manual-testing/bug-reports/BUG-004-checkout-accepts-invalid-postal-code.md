# BUG-004 — Checkout accepts and places an order with an empty/invalid postal code

| Field | Value |
|---|---|
| **Bug ID** | BUG-004 |
| **Summary** | The checkout address form allows the "Postal/Zip Code" field to be left empty (or filled with an obviously invalid value) and still proceeds through payment to a placed, confirmed order — client-side validation does not block the field the way it blocks other required address fields. |
| **Severity** | High — an unusable/undeliverable address reaches fulfillment as a "successful" order, which surfaces downstream as a failed shipment, support ticket, or manual warehouse intervention rather than being caught at the point of entry |
| **Priority** | High |
| **Reporter** | Ivan Andrijko (QA) |
| **Date raised** | 2026-07-10 |
| **Status** | Open |

## Environment

| | |
|---|---|
| **Store / SUT** | Automation Exercise demo storefront (`automationexercise.com`) — reference SUT used to illustrate this class of defect; reproduce against the project's actual staging/QA environment for a real ticket |
| **Build / version** | Illustrative — record the actual deployed build/commit hash when filing against a real environment |
| **Browser** | Google Chrome 126.0.6478.x (also reproduced on Microsoft Edge 126) |
| **OS** | Windows 11 |
| **Viewport** | Desktop, 1920×1080; also reproduced at mobile viewport 375×812 |
| **User state** | Logged-in test account (also reproduces as guest) |

## Preconditions

- Cart contains at least one in-stock item.
- User has reached the address-entry step of checkout.

## Steps to Reproduce

1. Add an item to the cart and proceed to checkout.
2. Fill in every address field **except** "Postal Code" / "Zip Code",
   leaving it completely empty.
3. Fill all other required fields (name, address line, city, state/region,
   country, phone) with valid data.
4. Click "Continue" / proceed to the next checkout step.
5. Separately, repeat steps 1–4 but instead of leaving the field empty,
   enter an obviously invalid value (`00000`, or letters like `ABCDE` in a
   numeric-postal-code country) into the Postal Code field.
6. In both variants, continue through shipping method selection and payment
   with valid data, and place the order.

## Expected Result

- Leaving the required Postal Code field empty should produce the same
  inline "This field is required" validation error already shown for other
  required address fields, and should block progression to the next
  checkout step — consistent with `TC-CHK-003`'s documented expected
  behaviour for any missing required field.
- Entering a value that is not a plausible postal code for the selected
  country should be rejected with a format-validation error, consistent
  with `TC-CHK-004`'s documented expected behaviour.
- In neither case should an order be placeable with a missing or invalid
  postal code.

## Actual Result

- With the Postal Code field left **empty**: no validation error is shown
  for that field; checkout proceeds to shipping, then payment, and the
  order is placed successfully with a confirmed order number. The order
  confirmation and (where inspectable) the resulting order record show the
  postal code field as blank.
- With the Postal Code field filled with an **invalid** value (`00000` or
  `ABCDE`): the same result — no format validation is triggered, and the
  order is placed successfully with the invalid value stored as-is.
- Other required fields on the same form (first name, last name, address
  line, city) correctly show a "required" validation error and correctly
  block progression when left empty — the defect is isolated to the postal
  code field specifically, not the form's validation logic in general.

## Frequency

- **Always reproducible** (10/10 attempts) for both the empty-field and
  invalid-value variants.
- Reproduces identically for guest and logged-in checkout, and at both
  desktop and mobile viewports.

## Evidence

- Screenshot placeholder: `evidence/BUG-004-empty-postal-code-no-error.png`
  — checkout form showing the empty Postal Code field with no validation
  error, alongside the other filled fields.
- Screenshot placeholder: `evidence/BUG-004-order-confirmed-blank-postal.png`
  — order confirmation page for the order placed with a blank postal code.
- Screenshot placeholder: `evidence/BUG-004-invalid-postal-code-accepted.png`
  — checkout form showing `ABCDE` accepted in the Postal Code field with no
  error, immediately before proceeding.
- HAR file placeholder: `evidence/BUG-004-checkout-submit.har` — capture of
  the checkout-step submission request to confirm whether the empty/invalid
  value is sent to and accepted by the backend as-is (server-side validation
  gap) versus stripped/defaulted silently before submission.

## Notes

- Recommend checking whether server-side validation exists independently of
  the client-side form — if the backend also accepts a blank/invalid postal
  code, this is a two-layer gap (both client and server), which is a more
  serious finding than a client-only oversight and should be called out
  explicitly when this is escalated to engineering.
- Worth confirming whether this is specific to the Postal Code field's
  validation rule being misconfigured (e.g. marked optional when it should
  be required, or missing its format regex) rather than a systemic issue,
  since every other field on the same form validates correctly.
- Related test cases: `test-cases/checkout.md` → `TC-CHK-003` (required
  field validation) and `TC-CHK-004` (invalid field format validation) —
  both list Postal Code explicitly as example test data, so this bug is a
  direct failure of the behaviour those two cases were written to verify.
  Once fixed, re-run both cases specifically against the Postal Code field
  (not just the fields used in their original example test data) to confirm
  the fix, and consider splitting out a dedicated `TC-CHK-0XX` per required
  field so a future regression in one field doesn't hide behind a case
  written against a different field.
