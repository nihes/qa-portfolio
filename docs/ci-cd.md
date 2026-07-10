# CI/CD & Quality Gates

How this portfolio is continuously verified, and the QA thinking behind it.

## Shift-left in practice

"Shift-left" means moving quality checks as early and as often as possible
instead of testing only at the end. In this repo that shows up as:

- **Every push and pull request runs the full automated suite** (see
  [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)) — feedback in
  ~1–2 minutes, not after a manual QA cycle.
- **Fast, layered checks**: cheap API/unit-style checks run alongside slower
  browser E2E, so most regressions surface quickly.
- **Deterministic, self-contained tests** against public demo targets — no
  shared staging to break, no secrets required.

## The pipeline (GitHub Actions)

Triggered on `push` to `main`/`master`, on `pull_request`, and manually via
`workflow_dispatch`. Each job is an independent, self-contained npm project run
on `ubuntu-latest` with Node 20.

| Job | Layer / type | Target |
|---|---|---|
| API — Newman (Postman) | API, collection-based | automationexercise.com |
| API — Mocha + axios | API, code-based + JSON-schema contract | dummyjson.com |
| API — GraphQL | API, GraphQL | countries.trevorblades.com |
| UI — Playwright | E2E (POM) | saucedemo.com |
| UI — Cypress | E2E (custom commands) | saucedemo.com |
| UI — Selenium + Mocha | E2E (classic WebDriver) | saucedemo.com |
| BDD — Cucumber | E2E, behaviour-driven | saucedemo.com |
| Mobile — Playwright emulation | Mobile device emulation | saucedemo.com |
| Accessibility — axe-core | Non-functional, a11y | saucedemo.com |
| Email — SMTP (Mailpit) + HTML | Email delivery + template validation | Mailpit service |
| Security — headers + access control | Non-functional, security | dummyjson.com |
| Test data — faker factories | Supporting / data | (offline) |

Browser jobs install only the browser they need (`npx playwright install
chromium` / `chromium webkit`); the Email job spins up a Mailpit **service
container** so SMTP + the capture API are available inside the job.

## Quality gates

- **A red job fails the run** — a merge signal, not just information.
- **Artifacts on failure**: Playwright/Cucumber HTML reports and the Newman
  report are uploaded as build artifacts (`if: always()`) for post-mortem.
- **`forbidOnly` in CI**: a stray `test.only` fails the Playwright job, so a
  narrowed local run can't accidentally reduce coverage on `main`.
- **Status badge** in the root README reflects `main` health at a glance.

## Deliberately run **locally**, not in CI

Three suites are excluded from CI on purpose (documented in each README):

| Suite | Why not in CI |
|---|---|
| `appium-mobile/` | Needs a real Android emulator / device farm (or BrowserStack creds). |
| `performance/` (k6) | k6 is a standalone binary, not npm; belongs on a dedicated perf runner. |
| `visual-regression/` | Screenshot baselines are OS/browser-specific; a committed baseline would fail on a different-OS runner. |

Each is wired to run with one command and could be added to CI with a matching
runner/action when a project genuinely needs that gate — the point is to keep
the default pipeline fast and free of false failures.

## A note on live-demo dependencies

Jobs hit public demo services, so an occasional red run can be an upstream
availability blip rather than a real regression. Mitigations already in place:
web-first/explicit waits, retries, cold-start warm-up (api-mocha), and
tolerant assertions where a third-party can't be controlled (e.g. the security
header audit is informational; the a11y suite allow-lists a known SUT defect).
In a product codebase the same suites would point at owned environments.

## Extending it

- Add a suite → add a job block (copy an existing one, set `working-directory`).
- Add a scheduled run → add a `schedule:` trigger (nightly smoke).
- Gate merges → make the workflow a required status check on the branch.
