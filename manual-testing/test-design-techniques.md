# Test Design Techniques (ISTQB) — Applied to E-Commerce

| | |
|---|---|
| **Document** | Reference / Methodology |
| **Feature area** | Cart, Checkout, Coupons, Search, Account/Auth |
| **Author** | Ivan Andrijko (QA) |
| **Status** | Reference |
| **Version** | 1.0 |
| **Reference SUTs** | [saucedemo.com](https://www.saucedemo.com/), [automationexercise.com](https://automationexercise.com/) |

This document explains the black-box test design techniques from the ISTQB
Foundation syllabus and shows, for each one, a **worked example** grounded in
this portfolio's e-commerce domain (cart, checkout, coupons, search,
account/auth). Where a technique produced a real test case already in this
repo, the corresponding `TC-*` ID is cited from:

- [`test-cases/checkout.md`](./test-cases/checkout.md) — `TC-CHK-*`
- [`test-cases/cart-and-search.md`](./test-cases/cart-and-search.md) — `TC-CART-*`, `TC-SRCH-*`
- [`test-cases/account-auth.md`](./test-cases/account-auth.md) — `TC-AUTH-*`

## Why techniques beat ad-hoc testing

Ad-hoc testing ("try a few things that seem reasonable") relies entirely on
the tester's intuition in the moment. It has three structural weaknesses:

1. **Coverage is invisible and unrepeatable.** Two testers — or the same
   tester a week later — will not cover the same ground. There is no
   artifact to prove what *wasn't* tested, which is exactly the question a
   release sign-off needs answered.
2. **It scales linearly with combinations, then stops scaling at all.** A
   checkout form with 4 independently-invalid fields and a payment step with
   3 methods × 4 shipping options × 20 countries has thousands of
   theoretical combinations. Ad-hoc testing samples a handful and calls it
   done; it has no way to reason about *which* handful is worth the time.
3. **It finds the bugs that are easy to imagine, not the bugs that are
   likely to exist.** Boundary and equivalence errors — off-by-one on a
   quantity limit, a discount rule that's `<` instead of `<=` — cluster at
   specific, predictable input values. Ad-hoc testing has no systematic
   reason to visit those exact values.

Formal techniques replace intuition with a **derivation rule**: given the
specification, the technique tells you which inputs/states/combinations to
pick and why. That makes coverage explainable ("we tested every partition
and every boundary"), reviewable by a second person before execution, and
reusable as regression suites and automation scripts age with the product.
None of this replaces exploratory testing or domain intuition — it gives
them a floor to stand on, and exploratory testing is exactly where you
spend the time these techniques *saved* you.

---

## 1. Equivalence Partitioning (EP)

**Idea:** Divide the input domain into partitions where the system is
expected to behave the same way for every value in the partition. Test one
representative value per partition instead of every possible value —
because if the specification treats the whole partition identically, one
value that passes is (by definition of the partition) evidence for all of
them, and testing a second value from the same partition buys nothing.

Partitions come in two flavors: **valid** (the system should accept/process
the input normally) and **invalid** (the system should reject it or handle
it as an error).

### Worked example — coupon code field at checkout

Specification: a coupon code is alphanumeric, 4–12 characters, matched
case-insensitively against currently active, non-expired codes.

| Partition | Description | Representative value | Expected behaviour |
|---|---|---|---|
| Valid — active code | Code exists, `is_active`, within `from_date`/`to_date` | `SAVE10` | Discount applied |
| Valid — active code, mixed case | Same code, different casing | `save10` | Discount applied (case-insensitive match) |
| Invalid — non-existent code | Well-formed but not in the coupon table | `NOTREAL1` | "Invalid coupon" error, no discount |
| Invalid — expired code | Exists but `expiration_date` has passed | `XMAS2024` | "Coupon has expired" error, no discount |
| Invalid — too short | < 4 characters | `AB` | Field-level validation error, request not even sent |
| Invalid — too long | > 12 characters | `THISCODEISWAYTOOLONG` | Field-level validation error or server-side rejection |
| Invalid — non-alphanumeric | Contains symbols/spaces | `SAVE 10%` | Validation error, no discount |
| Invalid — already used (single-use, per-customer limit reached) | Exists, active, but this customer already redeemed it | `WELCOME1` (reused) | "Coupon already used" error, no discount |

This directly informed `TC-CHK-005` (valid code partition) and `TC-CHK-006`
(invalid/expired partition) in `checkout.md`. Note EP alone would stop at
one valid + one invalid case; the extra rows above (case-insensitivity,
length, charset, reuse limit) are *also* EP but partitioning the input on a
different axis (format vs. business-rule validity) — a reminder that EP is
only as good as how many ways you slice the domain.

### Worked example — cart quantity input

| Partition | Representative value | Expected behaviour |
|---|---|---|
| Valid — normal quantity | `3` | Line total recalculates correctly (`TC-CART-003`) |
| Invalid — zero or negative | `0`, `-1` | Rejected/clamped, never persisted as a line item (`TC-CART-004`) |
| Invalid — non-numeric | `abc` | Input rejected, previous valid value retained |
| Invalid — exceeds available stock | qty greater than warehouse stock | "Only N left in stock" message, quantity capped at N |

---

## 2. Boundary Value Analysis (BVA)

**Idea:** Defects cluster at the *edges* of partitions, not in the middle,
because off-by-one errors (`<` vs `<=`, `>` vs `>=`) are the most common way
a correct-looking condition is subtly wrong. For every boundary, test the
value **on** the boundary, and the values **just below** and **just above**
it (min−1, min, min+1, max−1, max, max+1).

### Worked example — coupon minimum-spend threshold

Specification: coupon `SAVE10` requires a cart subtotal **≥ €40.00** to
apply.

| Test value | Boundary position | Expected result |
|---|---|---|
| €39.99 | min − 0.01 | Coupon rejected: "Minimum spend of €40.00 required" |
| €40.00 | min (boundary) | Coupon applied — this is the case most likely to be wrong if the code uses `>` instead of `>=` |
| €40.01 | min + 0.01 | Coupon applied |

This extends `TC-CHK-005`/`TC-CHK-007` — those cases assume the coupon
already qualifies; a dedicated BVA case at exactly €40.00 (and €39.99) is
what actually exercises the comparison operator in the discount-eligibility
code and should be added alongside them as `TC-CHK-005a`/`005b` if a minimum
spend rule exists on the coupon under test.

### Worked example — cart quantity upper limit

Specification: maximum quantity per line item is **10** (stock notwithstanding).

| Test value | Boundary position | Expected result |
|---|---|---|
| 9 | max − 1 | Accepted |
| 10 | max (boundary) | Accepted |
| 11 | max + 1 | Rejected — "Maximum quantity per order is 10" or silently clamped to 10 (verify which per spec) |

### Worked example — postal code length (checkout address)

Specification (illustrative, e.g. a 5-digit ZIP format): exactly **5**
digits required.

| Test value | Boundary position | Expected result |
|---|---|---|
| `1234` (4 digits) | length − 1 | Validation error |
| `12345` (5 digits) | length (boundary, valid) | Accepted |
| `123456` (6 digits) | length + 1 | Validation error |
| empty string | below min (degenerate) | Required-field validation error (overlaps `TC-CHK-003`) |

BVA on the postal code is what `TC-CHK-004` gestures at with `ABC$$`
(a charset violation) and `123` (a length violation) — but note `123` there
is 3 digits, not adjacent to the real boundary of 5. A rigorous BVA pass
would replace/add `1234` and `123456` specifically to pressure-test the
length check rather than just the format check.

---

## 3. Decision Table Testing

**Idea:** Used when the expected result depends on a **combination of
independent conditions** ("and/or" logic) rather than a single input. List
every condition as a row, every combination as a column, and derive the
expected action for each column. This both designs the tests *and* doubles
as a specification review tool — writing the table often surfaces rules the
requirements never stated explicitly (see the "?" cases below).

### Worked example — discount eligibility from coupon × membership × cart total

Conditions:
- **C1**: Valid, active coupon applied? (Y/N)
- **C2**: Customer is a paid loyalty member? (Y/N)
- **C3**: Cart subtotal ≥ €40 minimum spend? (Y/N)

Business rules (illustrative): a coupon only applies above the minimum
spend; loyalty members get free shipping regardless of coupon status;
coupon discount and loyalty member discount are **not** stackable — if both
would apply, the coupon takes precedence (larger of the two, per marketing
rules).

| | R1 | R2 | R3 | R4 | R5 | R6 | R7 | R8 |
|---|---|---|---|---|---|---|---|---|
| C1: Valid coupon | Y | Y | Y | Y | N | N | N | N |
| C2: Loyalty member | Y | Y | N | N | Y | Y | N | N |
| C3: Subtotal ≥ €40 | Y | N | Y | N | Y | N | Y | N |
| **Action: Apply coupon discount** | Y | N | Y | N | N | N | N | N |
| **Action: Apply free shipping (loyalty)** | Y | Y | N | N | Y | Y | N | N |
| **Action: Reject coupon, show min-spend msg** | N | Y | N | Y | N/A | N/A | N/A | N/A |

Reading the table as test cases:

- **R1** (`TC-DT-01`): coupon + loyalty + over threshold → coupon discount
  applied, free shipping also applied (both benefits, no conflict since
  free shipping isn't a "discount" in the stacking rule).
- **R2** (`TC-DT-02`): coupon + loyalty + **under** threshold → coupon is
  rejected with the min-spend message; loyalty free shipping still applies
  independently. This column is the one most likely to be missed by ad-hoc
  testing — it's the case where two "yes" conditions and one "no" condition
  don't average out to "mostly works," they produce a specific partial
  state.
- **R4**: no coupon, no loyalty, under threshold → plain checkout, standard
  shipping cost, no discount. This is the baseline/control case.
- **R5–R8**: no valid coupon submitted — C1=N makes C3 irrelevant to the
  coupon action (marked N/A), but C3 still matters if the store has an
  unrelated "free shipping over €40" promo not modeled here — a real table
  would need a fourth condition for that, which is exactly the kind of gap
  this exercise is designed to surface *before* writing code.

This table should be handed to the developer/BA during spec review — if
rows R2 or R5 produce disagreement about what "should" happen, that's a
requirements gap, not a testing gap, and it's far cheaper to resolve at this
stage than after `TC-CHK-005`/`TC-CHK-007` fail in execution.

---

## 4. State Transition Testing

**Idea:** Used when the system's behaviour depends on its **current state**
and a **history of prior events**, not just the current input. Model the
system as states + transitions (events that move it from one state to
another) and design tests for: every valid transition, invalid transitions
(events that should be rejected in a given state), and state re-entry
guards (e.g. can't pay twice).

### Worked example — cart → checkout → order state lifecycle

States: `Cart` → `AddressEntered` → `ShippingSelected` → `PaymentPending` →
`Paid` → `Confirmed` (terminal), with an `Abandoned`/`Empty` state reachable
from `Cart`, and a `PaymentFailed` state that loops back.

**State transition table:**

| Current state | Event | Next state | Notes |
|---|---|---|---|
| `Cart` (has items) | Click "Proceed to Checkout" | `AddressEntered` (pending) | Blocked → stays `Cart` if empty (`TC-CHK-002`) |
| `AddressEntered` (pending) | Submit valid address | `AddressEntered` | Confirmed sub-state |
| `AddressEntered` (pending) | Submit invalid/incomplete address | `AddressEntered` (pending) | No transition — error shown, stays put (`TC-CHK-003`, `TC-CHK-004`) |
| `AddressEntered` | Select shipping method | `ShippingSelected` | |
| `ShippingSelected` | Submit valid payment | `Paid` | Happy path (`TC-CHK-001`) |
| `ShippingSelected` | Submit payment that gets declined | `PaymentFailed` | Cart/address state preserved (`TC-CHK-009`) |
| `PaymentFailed` | Retry with valid payment | `Paid` | Must be reachable without re-entering address |
| `PaymentFailed` | Abandon (close tab / navigate away) | `Abandoned` | Cart contents should persist per session rules (`TC-CART-005`/`006`) |
| `Paid` | System confirms order creation | `Confirmed` | `TC-CHK-010` |
| `Confirmed` | Refresh confirmation page | `Confirmed` | Must **not** re-trigger order creation (guards against duplicate orders) |
| `Cart` (empty) | Navigate directly to checkout URL | *(no transition)* | Invalid transition — must be rejected, not silently accepted (`TC-CHK-002`) |
| `Confirmed` | Click browser Back, then resubmit payment form | *(no transition)* | Invalid transition — must not create a second order (classic double-submit bug) |

The two "invalid transition" rows at the bottom are the highest-value tests
this technique produces: they are not on the happy path and would never
appear in a straight-line functional walkthrough, but they map directly to
two of the most common real-world e-commerce bugs (checkout re-entry with
an empty cart, and double-order-on-refresh/back-button). A state diagram
makes both impossible to forget because every state needs an answer for
"what happens if the user does something *other* than the expected next
step here."

### Worked example — authenticated session state (login/logout)

States: `LoggedOut` → `LoggedIn` → `LoggedOut`, with a `Locked` state.

| Current state | Event | Next state | Related test |
|---|---|---|---|
| `LoggedOut` | Valid credentials | `LoggedIn` | `TC-AUTH-003` |
| `LoggedOut` | Invalid password | `LoggedOut` (no transition) | `TC-AUTH-004` |
| `LoggedOut` | Credentials for locked account | `LoggedOut` (no transition, specific message) | `TC-AUTH-005` |
| `LoggedIn` | Click logout | `LoggedOut` | `TC-AUTH-007` |
| `LoggedOut` (post-logout) | Browser Back to a protected page | *(must not transition to `LoggedIn`)* | Second half of `TC-AUTH-007` — the invalid transition that's easy to skip |

---

## 5. Pairwise / Combinatorial Testing

**Idea:** When a feature has several independent parameters, testing every
combination (a full Cartesian product) is usually infeasible, but most
real-world defects are triggered by the **interaction of at most two
parameters** at once, not three or more simultaneously. Pairwise testing
generates a minimal set of test cases such that every possible *pair* of
parameter values appears together in at least one test case — giving strong
defect-detection power at a fraction of the cost of exhaustive testing.

### Worked example — payment method × shipping method × country at checkout

Parameters and values (illustrative for a multi-country storefront):

- **Payment method**: Card, PayPal, Cash-on-delivery (3 values)
- **Shipping method**: Standard, Express, Pickup-point (3 values)
- **Country**: DE, FR, PL, RO (4 values)

Full combinatorial coverage: 3 × 3 × 4 = **36** test cases.

A pairwise-covering array reduces this to as few as **12 test cases**
(exact count depends on the tool/algorithm — e.g. PICT) while still
covering every (payment, shipping), (payment, country), and (shipping,
country) pair at least once. Example of a subset of such an array:

| # | Payment | Shipping | Country |
|---|---|---|---|
| 1 | Card | Standard | DE |
| 2 | Card | Express | FR |
| 3 | Card | Pickup-point | PL |
| 4 | PayPal | Standard | FR |
| 5 | PayPal | Express | PL |
| 6 | PayPal | Pickup-point | RO |
| 7 | Cash-on-delivery | Standard | PL |
| 8 | Cash-on-delivery | Express | RO |
| 9 | Cash-on-delivery | Pickup-point | DE |
| 10 | Card | Standard | RO |
| 11 | PayPal | Express | DE |
| 12 | Cash-on-delivery | Pickup-point | FR |

**Why this cuts combinations without gutting coverage:** the theory behind
pairwise testing is that the overwhelming majority of real defects in
systems like this are caused by one parameter's logic interacting badly
with one other parameter — e.g. "Cash-on-delivery is wrongly still offered
for Pickup-point in Romania" is a (payment × shipping × country) triple, but
it will almost always *also* manifest as a (payment × shipping) pair-level
bug ("COD shouldn't be offered for Pickup-point at all") or a (shipping ×
country) pair-level bug ("Pickup-point isn't available in RO"), either of
which a pairwise set will catch. True three-way-only interaction bugs exist
but are rare enough that spending 36 test cases to guarantee catching them
is rarely worth the execution cost — 12 cases catch the large majority of
interaction defects at a third of the cost.

This is the technique to reach for whenever a matrix like *"payment ×
shipping × country"* or *"browser × OS × viewport"* threatens to blow up a
regression suite — cross-reference the multi-country payment/shipping
combinations noted for this shop against the full pairwise array before
committing to which subset actually gets automated.

### Worked example — search/filter/sort combinations

Parameters: **Category filter** (4 categories), **Price range filter** (3
bands), **Sort order** (4 options: relevance, price asc, price desc,
newest). Full combinations = 48; pairwise reduces this to roughly 12–16
cases while still covering every (category, sort) and (price band, sort)
pair — directly extending the single-parameter `TC-SRCH-003` (sort only) to
the realistic case where a shopper has *also* filtered by category and
price before sorting.

---

## 6. Error Guessing & Exploratory Testing

**Idea:** These are **experience-based** techniques, not derivation rules —
they intentionally sit outside the systematic techniques above. Error
guessing uses the tester's knowledge of common defect types and the
system's history (past bugs, risky code paths, framework quirks) to
anticipate where a bug is likely, then designs a targeted test for it.
Exploratory testing goes further: simultaneous learning, test design, and
test execution, guided by a **charter** (a scoped mission) rather than a
predefined script, so the tester can follow up on anything suspicious in
real time.

They matter precisely *because* they catch what the systematic techniques
above structurally cannot: EP/BVA/decision tables/state models/pairwise all
assume the specification is complete and correct. Error guessing and
exploratory testing are what catch the *unspecified* behaviour, the
integration surprise, and the "nobody thought to write this down" bug.

### Worked example — error guessing at checkout

Drawing on common e-commerce failure patterns:

- **Double-submit**: rapid double-click on "Place Order" — does it create
  two orders or one? (Directly informed by the `Confirmed` re-entry row in
  the state model above.)
- **Currency/rounding**: a coupon discount computed on a subtotal with 3+
  decimal-precision line items (e.g. `€13.333 × 3`) — does the displayed
  total match the charged total to the cent? This is exactly the kind of
  arithmetic drift `TC-CHK-007` guards against, but error guessing pushes
  further into deliberately awkward number combinations (thirds, primes)
  that a spec-derived test wouldn't naturally choose.
- **Back-button after payment decline**: after `TC-CHK-009`'s decline flow,
  does hitting Back and re-submitting the *same* form resubmit stale
  payment tokens?
- **Concurrent coupon edit**: apply a coupon, then have it expire (or hit
  its usage limit) server-side *while the user is still on the review
  page* before they click "Place Order" — is the discount re-validated at
  submit time or trusted from the earlier "Apply" response?
- **Unicode/emoji in free-text fields**: shipping address line 2 with
  emoji or right-to-left script — does it break the label/receipt PDF
  rendering?

### Worked example — exploratory charter for search

> **Charter:** Explore the product search box's handling of edge-case input
> for 30 minutes, focused on whether malformed/adversarial queries degrade
> gracefully. Note any crashes, unstyled error states, or results that look
> subtly wrong (not just "no results").

Session notes would typically probe: SQL/NoSQL-injection-shaped strings
(without assuming a vulnerability, just checking the UI doesn't choke),
extremely long strings, only-whitespace queries, queries that are a single
character, emoji-only queries, and rapid repeated submissions — building on
the baseline coverage from `TC-SRCH-001`/`TC-SRCH-002` but without a
predetermined expected result, since the point is to notice whatever
actually happens. See `exploratory-charters.md` in this same folder for the
full charter template and session-notes format used across this portfolio.

---

## Summary — technique selection guide

| Technique | When to use | This portfolio's example |
|---|---|---|
| **Equivalence Partitioning** | A single input has distinct classes of values the system should treat identically; you need a *minimum* sane set of inputs before doing anything more expensive | Coupon code field, cart quantity field |
| **Boundary Value Analysis** | Any input has a numeric/length threshold (min, max, exact length); always pair with EP — BVA tests the edges of the partitions EP identified | Coupon min-spend (€40), quantity max (10), postal code length (5) |
| **Decision Table** | The expected result depends on the **combination** of 2+ independent business conditions (and/or logic), especially where rules interact non-obviously | Discount eligibility: coupon × loyalty membership × cart total |
| **State Transition** | The system's response depends on **history/current state**, not just the current input — anything with a lifecycle, wizard, or "can't do X after Y" rule | Cart→checkout→order lifecycle; login/logout session state |
| **Pairwise / Combinatorial** | 3+ independent parameters where full combinatorial testing is too expensive but multi-parameter interaction bugs are a real risk | Payment method × shipping method × country |
| **Error Guessing** | You (or the team) have prior-bug knowledge or domain experience about where this *kind* of system tends to break; fast, cheap, targeted | Double-submit, rounding drift, back-button resubmission |
| **Exploratory Testing** | Early in a feature's life, after scripted coverage exists but before sign-off, or whenever "something feels off" — unscripted, charter-driven, learn-as-you-go | Search box adversarial-input charter |

**Practical workflow used in this portfolio:** start with EP to establish
the minimum valid/invalid input set, layer BVA on top of any numeric or
length-based partition boundary, reach for a decision table the moment two
or more conditions start interacting in the requirements, model anything
with a lifecycle as a state machine before writing steps, use pairwise
testing to cap the cost of any 3+-parameter matrix (payment/shipping/
country being the recurring one here), and close every feature with a
time-boxed error-guessing pass and an exploratory charter to catch what the
spec never mentioned.
