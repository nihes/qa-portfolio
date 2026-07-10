# Portfolio Architecture

## Goal

This repository is a Senior QA Engineer portfolio, not a product codebase. Its
job is to demonstrate — with real, runnable code and documents rather than
claims on a CV — that the author can operate across the **full width** of
modern e-commerce QA: structured manual testing, UI automation in three
different tool ecosystems, BDD, three different styles of API testing (REST
collection-based, REST code-based with contract validation, and GraphQL),
mobile (emulated and real-device), security and test-data disciplines, and
the non-functional disciplines (accessibility, performance, visual
regression, email) that separates the "confirm the happy path with a UI
script" QA from a senior generalist who can pick the right tool and testing
layer for a given risk.

Every suite is scoped small on purpose — a handful of specs each, not a huge
regression bank — because the point is breadth-with-depth-per-tool and
professional structure, not sheer test count.

## Folder layout — one self-contained project per discipline

```
qa-portfolio/
├── README.md                    # top-level overview, skills summary, quick start
├── docs/                        # this folder — architecture, skills matrix,
│                                 # contributing, automation patterns,
│                                 # localization testing, CI/CD
├── .github/workflows/ci.yml     # the 12-job CI pipeline
│
├── manual-testing/              # test strategy, plans, cases, RTM, risk register,
│                                 # exploratory charters, bug reports — no tooling
├── api-postman-newman/          # Postman collection + Newman CLI runner
├── api-mocha/                   # Mocha + Chai + axios + ajv (contract tests)
├── api-graphql/                 # Mocha + Chai + axios against a GraphQL API
│
├── playwright/                  # UI E2E, TypeScript, Page Object Model
├── cypress/                     # UI E2E, TypeScript, custom commands
├── selenium-mocha/              # UI E2E, classic WebDriver v4 + Mocha + Chai
├── cucumber-bdd/                # Gherkin features + Playwright driver
│
├── mobile-web-playwright/       # Playwright device emulation (iPhone 13, Pixel 5)
├── appium-mobile/               # Appium + WebdriverIO, Android emulator/BrowserStack
│
├── email-testing/               # nodemailer + Mailpit (SMTP) + cheerio (offline)
├── accessibility/               # Playwright + @axe-core/playwright
├── performance/                 # k6 load test
├── visual-regression/           # Playwright toHaveScreenshot
├── security/                    # Mocha + Chai + axios — headers + access control
└── test-data/                   # @faker-js/faker data factories
```

Each of the 16 discipline folders is a **fully independent npm project**
(own `package.json`, own `node_modules`, own README) except `manual-testing/`,
which is pure Markdown, and `performance/`, which is a single k6 script with
no npm dependency at all. This mirrors how a real organisation would actually
isolate test suites owned by different tools/teams, and it's what makes every
suite individually cloneable, runnable, and CI-schedulable without dragging
the rest of the repo along.

## Test targets — and why public demo sites

| Target | Used by | Why this target |
|---|---|---|
| **[saucedemo.com](https://www.saucedemo.com/)** | `playwright/`, `cypress/`, `selenium-mocha/`, `cucumber-bdd/`, `mobile-web-playwright/`, `accessibility/`, `visual-regression/`, `appium-mobile/` | Purpose-built, stable QA demo app with documented fixed accounts (`standard_user` / `locked_out_user` / `problem_user` / `performance_glitch_user`, password `secret_sauce`) and predictable `data-test` attributes — ideal for UI-layer automation across many tools without fighting selector churn |
| **[automationexercise.com](https://automationexercise.com/)** | `manual-testing/`, `api-postman-newman/` | A fuller e-commerce feature set (registration, cart, coupons, guest checkout, search/filter/sort) for manual test-case design, plus a public REST API with a genuine, testable quirk (HTTP 200 returned even for logical errors — the real result lives in a `responseCode` field in the body) that makes a good API-testing case study |
| **[dummyjson.com](https://dummyjson.com/)** | `api-mocha/`, `performance/`, `security/` | A public JSON API with JWT auth and full CRUD endpoints, well suited to code-based contract testing (ajv/JSON-Schema), to load testing, and to a security-header/access-control audit — it doesn't persist writes, which the suites document and test around explicitly (asserting the request/response *contract*, not stored state) |
| **[countries.trevorblades.com](https://countries.trevorblades.com/)** | `api-graphql/` | A public, schema-stable GraphQL API — good for demonstrating GraphQL-specific concerns (queries with variables, null-vs-error handling, nested queries, schema validation) distinct from REST |
| **Mailpit (local Docker)** | `email-testing/` | A free/OSS SMTP capture server — lets email delivery be tested for real (send → REST-fetch → assert) without touching a live inbox or a paid ESP/SMTP sandbox |

Using public, free, zero-registration targets is a deliberate architectural
choice, not a shortcut:

- **Reproducibility.** Anyone (a recruiter, a hiring manager, another
  engineer) can clone this repo and run every suite with no credentials, no
  VPN, and no environment provisioning.
- **No confidentiality conflicts.** Nothing here touches a real employer's
  codebase, data, or infrastructure — safe to be fully public.
- **Realistic-enough surface.** Both demo sites model genuine e-commerce
  flows (auth, cart, checkout, discounts, search) and genuine API-design
  quirks, so the testing techniques shown transfer directly to a real
  storefront — the manual `test-strategy.md` is explicitly written to be
  "reusable against a real production storefront by substituting the actual
  SUT, environments, and credentials."

## CI pipeline

CI is **GitHub Actions**, defined in
[`.github/workflows/ci.yml`](../.github/workflows/ci.yml), triggered on push
to `main`/`master`, on every pull request, and on manual dispatch. It runs
**twelve independent jobs**, each scoped to one suite's folder:

| Job | Suite | Extra setup |
|---|---|---|
| `api-newman` | `api-postman-newman/` | — |
| `api-mocha` | `api-mocha/` | — |
| `api-graphql` | `api-graphql/` | — |
| `playwright` | `playwright/` | `playwright install --with-deps chromium` |
| `cypress` | `cypress/` | — |
| `cucumber` | `cucumber-bdd/` | `playwright install --with-deps chromium` |
| `selenium` | `selenium-mocha/` | `browser-actions/setup-chrome` |
| `mobile-web` | `mobile-web-playwright/` | `playwright install --with-deps chromium webkit` |
| `accessibility` | `accessibility/` | `playwright install --with-deps chromium` |
| `email` | `email-testing/` | `axllent/mailpit` GitHub Actions **service container** |
| `security` | `security/` | — |
| `test-data` | `test-data/` | — |

Report-producing jobs (`api-newman`, `playwright`, `cucumber`, `mobile-web`,
`accessibility`) upload their HTML/JSON report as a build artifact on every
run, pass or fail.

### The three suites deliberately excluded from CI

| Suite | Why it's run locally instead |
|---|---|
| **`appium-mobile/`** | Needs a real Android SDK + emulator, or a BrowserStack account/credentials — neither is available on a GitHub-hosted `ubuntu-latest` runner without significant extra setup (self-hosted runner, or a paid cloud-device step). Kept as a documented, runnable-on-request example of the Appium/WebdriverIO stack rather than faked or skipped silently. |
| **`performance/`** | k6 is a standalone binary, not an npm package — the rest of this pipeline is Node/npm-based, so adding k6 would mean a different runner setup for one job. Kept out to keep the main pipeline fast and dependency-light; wiring it in later is a one-line `grafana/k6-action` step when a performance gate is actually wanted. |
| **`visual-regression/`** | Screenshot baselines are OS/browser/font-rendering-specific. A baseline generated on the maintainer's machine would spuriously fail on a Linux GitHub runner for reasons that have nothing to do with a real UI regression. The correct real-project fix (generate and commit baselines from inside the CI container, e.g. Playwright's Docker image) is called out in the suite's README as the natural next step; here it's kept local-only so it doesn't destabilise the main pipeline. |

In every case the exclusion is a **documented, deliberate trade-off** — each
excluded suite's README states exactly why it isn't in CI and what running it
locally requires, rather than leaving a silent gap.

## Design principles

- **Reliability / determinism.** No suite relies on fixed sleeps; UI suites
  use web-first assertions or explicit waits, and the Selenium suite goes
  further with React-aware click/type helpers specifically engineered to stay
  deterministic against a React SPA under headless Chrome (see
  `selenium-mocha/README.md`). The email suite treats an unreachable
  dependency (Mailpit) as a self-skip, not a false failure. Non-functional
  suites fail on **explicit thresholds** (axe-core: only new critical
  violations; k6: p95 latency / error-rate / business-error thresholds) so
  pass/fail is a rule, not a judgment call on every run.
- **Readability.** UI suites use the Page Object Model so specs read as
  business-level steps. BDD specs are readable Gherkin with a clean
  step-definition layer. API suites separate shared HTTP-client/helper code
  from the assertions themselves. Every suite's README explains what it
  covers and why, in the same shape, so navigating between tools costs no
  extra ramp-up.
- **Breadth across tools and layers.** The same core e-commerce journeys
  (login, cart, checkout) are deliberately re-implemented across Playwright,
  Cypress, Selenium, and Cucumber — not because the app needs 4x coverage,
  but to prove fluency in each tool's idioms side by side. Layers span manual,
  UI, API (three styles), BDD, mobile (two styles), security, test-data, and
  three non-functional disciplines, mapped explicitly to test levels
  (component/integration/system/E2E) in `manual-testing/test-strategy.md`.
- **AI-assisted authoring.** Automation in this portfolio is built
  pragmatically with AI-assisted tooling — the value being demonstrated is
  the ability to direct that tooling toward reliable, readable, well-scoped
  coverage of real e-commerce journeys across many stacks, and to make and
  document the same engineering trade-off calls (what's in CI, what isn't,
  and why) that a senior QA engineer is expected to own regardless of who
  typed the first draft of a given line.
