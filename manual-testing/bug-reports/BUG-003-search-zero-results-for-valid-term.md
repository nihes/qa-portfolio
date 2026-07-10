# BUG-003 — Product search returns zero results for a valid, in-catalog keyword

| Field | Value |
|---|---|
| **Bug ID** | BUG-003 |
| **Summary** | Searching for a keyword that matches an existing, visible product's name returns "No products found" instead of the matching product(s), while a near-identical keyword (differing only in case or a trailing plural "s") correctly returns results. |
| **Severity** | Medium — directly costs conversions for affected search terms (a customer who can't find a product they know exists will assume it's out of stock or leave), but has a workaround (browsing by category still surfaces the product) |
| **Priority** | High |
| **Reporter** | Ivan Andrijko (QA) |
| **Date raised** | 2026-07-10 |
| **Status** | Open |

## Environment

| | |
|---|---|
| **Store / SUT** | Automation Exercise demo storefront (`automationexercise.com`) — reference SUT used to illustrate this class of defect; reproduce against the project's actual staging/QA environment for a real ticket |
| **Build / version** | Illustrative — record the actual deployed build/commit hash when filing against a real environment |
| **Browser** | Google Chrome 126.0.6478.x (also reproduced on Firefox 128.0) |
| **OS** | Windows 11 |
| **Viewport** | Desktop, 1920×1080 |
| **User state** | Logged out (also reproduces logged in) |

## Preconditions

- At least one product exists in the catalog whose product name contains a
  known keyword (e.g. a product literally named "Men Tshirt").
- User is on the storefront home page or search page, with the search box
  visible.

## Steps to Reproduce

1. Enter the exact singular keyword `Tshirt` into the search box and submit.
2. Observe the results page.
3. Clear the search box, enter the plural keyword `Tshirts` instead, and
   submit.
4. Observe the results page.
5. Repeat step 1 with the keyword lower-cased exactly as typed by a real
   user (`tshirt`) versus the same keyword capitalized as it appears in the
   product's own title-cased name (`Tshirt`).

## Expected Result

- Searching `Tshirt` (or any casing/pluralisation variant a reasonable user
  would type) should return every product whose name/description reasonably
  matches the stem of the keyword — i.e. `Tshirt` and `Tshirts` should return
  the *same* result set, and case should not affect matching.
- If a genuinely zero-match term is searched, the "No products found"
  empty-state should appear — but only for terms that truly have no
  reasonable match, not for a term one character away from a term that
  matches successfully.

## Actual Result

- Searching `Tshirt` (singular) returns "No products found", with zero
  results shown.
- Searching `Tshirts` (plural) — the term used by the product's actual
  displayed name/category — returns the expected matching products
  correctly.
- The behaviour is consistent across case variants of whichever form is
  used (i.e. it is genuinely the singular/plural stem that flips the result
  from zero to correct, not a casing issue layered on top).
- No error is shown for the singular search — the UI presents it as a
  normal, successful "zero results" outcome, which masks the fact that this
  is actually a search-relevance defect rather than a genuine no-match case.

## Frequency

- **Always reproducible** (10/10 attempts) for this specific singular/plural
  keyword pair.
- Spot-checked with two additional product names that also have an
  irregular or compound plural form; the same singular-drops-to-zero
  pattern reproduced on one of the two additional terms, suggesting this is
  a pattern affecting a subset of the catalog rather than one isolated
  product.

## Evidence

- Screenshot placeholder: `evidence/BUG-003-search-tshirt-zero-results.png`
  — "No products found" result for the singular term.
- Screenshot placeholder: `evidence/BUG-003-search-tshirts-correct-results.png`
  — correct matching products for the plural term, same session.
- HAR file placeholder: `evidence/BUG-003-search-network.har` — capture of
  both search requests/responses to confirm whether the backend search
  query itself returns zero matches for the singular term (an
  indexing/matching defect) versus the frontend filtering/discarding valid
  results after a correct backend response.

## Notes

- This looks like an **exact-match or overly strict tokenisation** issue in
  the search backend (no stemming/fuzzy matching applied to the query term),
  rather than a rendering bug — the HAR capture above is intended to confirm
  that before it's handed to engineering, since a false "No products found"
  for a strict-but-plausible customer query is a materially different fix
  (search relevance/indexing) than a frontend display bug.
- Worth exploratory follow-up (see `exploratory-charters.md`) on whether
  other common query variations — extra whitespace, minor typos, singular
  vs. plural across the rest of the catalog — show the same drop-to-zero
  pattern, to scope how widespread this is before prioritising a fix.
- Related test cases: `test-cases/cart-and-search.md` → `TC-SRCH-001`
  (relevant keyword returns matching results) and `TC-SRCH-002` (genuine
  no-match term shows the empty state correctly) — this bug is effectively
  a false positive of the `TC-SRCH-002` expected behaviour being triggered
  by what should have been a `TC-SRCH-001` case. Recommend adding a new
  scripted case covering singular/plural and case-variant search terms once
  this is confirmed and fixed, to prevent regression.
