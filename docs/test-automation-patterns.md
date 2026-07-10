# Test Automation Patterns & Principles

A practical guide to the automation patterns this portfolio actually uses,
and why — not a generic pattern catalogue. Where a pattern is used, it's
tied to a real file in this repo; where it's *not* used, that's a deliberate
call, and the reasoning is explained rather than left implicit. See also
[`architecture.md`](./architecture.md) (why the repo is structured this way)
and [`skills-matrix.md`](./skills-matrix.md) (what each suite proves).

## 1. Test Pyramid vs Testing Trophy

The classic **Test Pyramid** (Mike Cohn) says: many fast, cheap **unit**
tests at the base, fewer **integration** tests in the middle, a thin cap of
slow, expensive **E2E** tests at the top. The newer **Testing Trophy** (Kent
C. Dodds) adds a **static-analysis** layer underneath unit tests and — more
importantly — argues the *integration* layer, not unit, should be the
biggest one, because integration tests give the best confidence-per-dollar
for most real applications; E2E stays a thin cap either way.

**Where this portfolio actually sits:** every suite here tests a public
third-party demo app (saucedemo.com, automationexercise.com, dummyjson.com)
as a black box — there's no application source to unit-test. So the shapes
don't map 1:1, but the same weighting principle shows up in how effort is
distributed:

- **Static layer** — TypeScript in `playwright/` and `cypress/` catches a
  whole class of mistakes (wrong locator type, wrong argument) before a
  spec even runs, for free.
- **Real unit layer** — [`test-data/tests/factories.test.js`](../test-data/tests/factories.test.js)
  is a genuine unit suite: it tests the pure functions in
  [`test-data/src/factories.js`](../test-data/src/factories.js) in-process,
  with zero network calls, in milliseconds.
- **Integration/API layer (the trophy's body)** — `api-mocha/`,
  `api-postman-newman/`, and `api-graphql/` carry real weight: JWT auth,
  pagination, full CRUD, and JSON-Schema **contract** validation via `ajv`
  (`api-mocha/schemas/`) — all without a browser, so they're an order of
  magnitude cheaper than the UI suites per assertion.
- **E2E/UI layer (the cap)** — `playwright/`, `cypress/`, `selenium-mocha/`,
  `cucumber-bdd/`, `mobile-web-playwright/` are deliberately scoped small —
  "a handful of specs each... not a huge regression bank" per
  [`architecture.md`](./architecture.md) — covering the same core journeys
  (login, cart, checkout, sorting) rather than trying to re-verify
  everything the API layer already covers through a browser.

In other words: this portfolio is **Trophy-shaped in spirit** — cheap
layers (unit, API) carry the coverage weight, UI E2E stays thin. The one
portfolio-specific twist is that the *same* thin E2E layer is deliberately
**re-implemented across four tools** (Playwright/Cypress/Selenium/Cucumber)
— not because the SUT needs 4x coverage, but to prove tool fluency, which a
real project would never do.

## 2. Page Object Model (POM) vs Screenplay Pattern

**Page Object Model** — one class per page, owning its locators and the
actions/assertions available on that page, so specs read as business steps
instead of raw selectors. This is what every UI suite here uses:
[`playwright/pages/{LoginPage,InventoryPage,CartPage,CheckoutPage}.ts`](../playwright/pages/),
a `cy.login()` custom command backing the same idea in
[`cypress/cypress/support/commands.ts`](../cypress/cypress/support/commands.ts),
and — the more instructive case — [`selenium-mocha/pages/*.js`](../selenium-mocha/pages/),
where the POM is built **from scratch on raw WebDriver** with no
framework-provided auto-waiting, to demonstrate the pattern isn't tied to
any one tool's conveniences.

**Screenplay Pattern** (from the Serenity/JS lineage) is actor-centric
instead of page-centric: an **Actor** performs composable **Tasks**, made of
**Interactions**, and asks **Questions** to assert state — none of which are
tied to a single page class. It decouples "what the actor wants to do" from
"how it's done at the DOM level" more thoroughly than POM, because a Task
like `CheckOut.withCoupon('SAVE10')` can compose interactions across several
pages without any single class owning all of them.

**Prefer Screenplay over POM when:** a flow has multiple distinct
actors/roles interacting with the same system (e.g. a customer places an
order and an admin approves it), the same business-level task needs to run
from several different entry points and POM classes are starting to
accumulate unrelated helper methods, or assertions need to be reusable
"Questions" independent of any one page.

**Why this repo uses POM, not Screenplay:** every suite here has a single
actor (one shopper) walking a handful of pages. Screenplay's extra
ceremony — Actors, Abilities, Tasks as first-class objects — buys real
value at team/multi-actor scale, but on a scope this small it would be
abstraction with no payoff. POM was chosen deliberately, not by default.

## 3. Waiting Strategies

| Tool | Strategy | Example |
|---|---|---|
| Playwright | **Web-first / auto-waiting** — assertions poll and retry against the live DOM | `expect(page.locator(...)).toBeVisible()` |
| Cypress | **Command retry-ability** — `cy.get`/`should` re-query and re-assert until timeout | no `cy.wait(<ms>)` anywhere in `cypress/cypress/e2e/*.cy.ts` |
| Selenium (classic WebDriver) | **Explicit waits** — no built-in auto-wait, so every access is wrapped | `driver.wait(until.elementLocated(locator), timeoutMs)` in `selenium-mocha/pages/*.js` |

**Why fixed sleeps are banned:** a `sleep(5000)` is either too short (the
suite stays flaky under real-world latency) or too long (the suite wastes
that time on every single run, whether or not it was needed) — and either
way it hides a real timing dependency behind a guess instead of waiting for
an observable signal. [`docs/CONTRIBUTING.md`](./CONTRIBUTING.md) states
this as a hard rule: "No suite uses `sleep()` / `cy.wait(<ms>)` to paper
over timing."

**Concrete case: saucedemo's React SPA needed more than "just wait longer."**
Under headless Chrome, [`selenium-mocha/helpers/driver.js`](../selenium-mocha/helpers/driver.js)
documents two real quirks that no amount of waiting alone fixes:

1. Right after a navigation, React's event handlers can attach a beat
   *after* the element is already in the DOM — so WebDriver's *native*
   `click()` can land on an element with no handler wired up yet, and
   silently does nothing.
2. `sendKeys()` can drop keystrokes into a React-controlled input right
   after a navigation, for the same reason.

The fix is **retry-until-observed-outcome**, not a longer sleep:

- `jsClick(driver, el)` — scrolls the element into view and dispatches a
  JS-level `.click()`, which reliably reaches React's handler.
- `typeInto(driver, locator, text)` — tries native `sendKeys()` first,
  verifies the field actually holds the expected value, and falls back to
  a React-aware value setter (using the prototype's `value` property
  descriptor plus dispatched `input`/`change` events, so React's
  `onChange` actually fires) if native typing didn't stick.
- `clickAndWaitForUrl(...)` / `clickAndWaitForElement(...)` — click, then
  wait for a real signal (a URL fragment, or a confirming element) with a
  bounded number of retries, rather than trusting a single click blindly.

This is the general principle behind "no fixed sleeps": **wait for, and
verify, a real outcome — and retry the action itself if the outcome didn't
happen** — never wait a guessed amount of time and hope.

## 4. Flake Control

- **Retries.** [`playwright/playwright.config.ts`](../playwright/playwright.config.ts)
  sets `retries: 1` plus `forbidOnly: !!process.env.CI` — a genuine
  environmental flake gets one automatic re-run, while a `.only` test
  someone forgot to remove fails the CI job outright instead of silently
  running a subset.
- **Isolation / fresh state.** Playwright's `fullyParallel: true` gives
  every test its own isolated browser context by default; on the classic
  WebDriver side, `selenium-mocha`'s login spec explicitly builds a **fresh
  browser per test** for full session isolation (`selenium-mocha/README.md`).
- **Deterministic data.** [`test-data/src/factories.js`](../test-data/src/factories.js)'s
  `makeCustomer` / `makeAddress` / `makeCreditCard` / `makeProduct` /
  `makeOrder` are pure, overridable factories — every call produces a fresh
  record so tests never collide on a shared fixture like `test@test.com`,
  and `seed(n)` pins the underlying faker RNG so a failing run's exact data
  can be reproduced byte-for-byte on demand (see
  [`test-data/README.md`](../test-data/README.md#the-seed-determinism-trick)).
- **Stable selectors.** Every UI suite locates elements via saucedemo's
  `data-test` attributes (`[data-test="error"]`, the
  `add-to-cart-<product-slug>` pattern that `cucumber-bdd`'s `toSlug()`
  helper reproduces in `features/support/world.js`) instead of CSS classes
  or visible text, which change with styling and copy edits respectively.
- **Network / cold-start handling.** `api-mocha/helpers/client.js` exposes
  a `warmUp()` that pings `/test` before any assertion runs, so a
  cold-start delay doesn't get misattributed to the first real test;
  `email-testing` calls `this.skip()` on its SMTP-integration test when
  Mailpit isn't reachable, turning an unavailable dependency into an
  explicit skip instead of a false failure; and the top comment in
  [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) documents that
  every job depends on a *live* third-party demo service, so "an occasional
  red run can be an upstream availability blip rather than a real
  regression" — a named, understood risk instead of a mystery flake.

## 5. Parallelization & Isolation

- **CI level.** `.github/workflows/ci.yml` runs the automated suites as
  **independent GitHub Actions jobs**, each scoped to its own folder via
  `working-directory` (`api-newman`, `api-mocha`, `playwright`, `cypress`,
  `cucumber`, `selenium`, `mobile-web`, `accessibility`, `email`, plus
  `security`, `test-data`, `api-graphql`). The pipeline's wall-clock is
  roughly the slowest single job, not the sum of all of them, and a failure
  in one suite never blocks another suite's report from being produced.
- **Dependency level.** "One npm project per suite" (`docs/CONTRIBUTING.md`)
  — every folder has its own `package.json`/`node_modules`, so suites can
  never leak broken state into each other through a shared install.
- **In-suite level.** `playwright.config.ts`'s `fullyParallel: true` runs
  specs across multiple workers, each with its own isolated browser
  context; `cucumber-bdd/features/support/hooks.js` opens a fresh
  page/context per scenario via `Before`/`After` hooks rather than reusing
  one browser tab across an entire feature file.

## 6. Reporting

| Suite(s) | Reporter | Output |
|---|---|---|
| `playwright/`, `mobile-web-playwright/`, `accessibility/`, `visual-regression/` | Playwright HTML reporter (`list` + `html`, `open: 'never'`) | `playwright-report/`, uploaded as a CI artifact on every run |
| `selenium-mocha/`, `api-mocha/` | mochawesome (`npm run test:report`) | `mochawesome-report/` |
| `cucumber-bdd/` | Cucumber's own HTML formatter | `reports/cucumber-report.html`, uploaded as a CI artifact |
| `api-postman-newman/` | `newman-reporter-htmlextra` | `newman/report.html`, uploaded as a CI artifact |

The common thread: every report-producing CI job uploads its artifact with
`if: always()`, so a **failing** run still leaves a debuggable
trace/screenshot/report behind — not just a red X with no evidence.

## 7. Anti-patterns to avoid

- **Fixed sleeps** (`sleep(5000)`, `cy.wait(5000)`) to paper over timing —
  either flaky or slow, never both fixed. Wait for, and verify, a real
  outcome instead (see §3).
- **Shared, hand-typed fixtures** (`test@test.com`, `SKU-001`) reused across
  tests/environments until two runs collide on the same record — use a
  factory that produces a fresh record per call instead (§4).
- **Selectors coupled to styling or copy** (CSS classes, visible text)
  instead of a stable test hook like `data-test` — the DOM changes for
  reasons that have nothing to do with the behaviour under test.
- **Trusting transport status alone** when the real result lives in the
  body — `automationexercise.com`'s API returns HTTP 200 even for logical
  errors; asserting only on the HTTP status would let real failures pass
  silently (see `api-postman-newman/README.md`).
- **God-object page classes** that mix locators, business assertions, and
  unrelated pages' concerns — a sign POM has outgrown its scope and either
  needs splitting or, at real scale, a Screenplay-style Task layer (§2).
- **One shared browser/session reused across unrelated tests** — hides
  state leakage between tests instead of surfacing it; prefer per-test
  isolation (§5) even when it costs a little setup time.
- **Silently skipping or catching-and-swallowing a flaky test** instead of
  fixing the root cause or making the skip an explicit, documented decision
  (compare `email-testing`'s deliberate `this.skip()` vs a swallowed
  exception).
- **Committing environment-specific artifacts as if they were portable** —
  e.g. a screenshot baseline generated on one OS/browser build, wired into
  a CI runner with different font rendering (exactly why `visual-regression/`
  is deliberately kept out of this repo's CI — see `architecture.md`).
