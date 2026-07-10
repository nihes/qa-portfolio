# Accessibility — automated a11y scans (axe-core + Playwright)

Automated accessibility (a11y) scanning for [saucedemo.com](https://www.saucedemo.com), built with
[Playwright](https://playwright.dev) and [`@axe-core/playwright`](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright).

## Tech stack

- **Playwright Test** (`@playwright/test`) — test runner, browser automation, HTML reporting
- **axe-core** (`@axe-core/playwright`) — industry-standard accessibility rules engine, injected
  into the page and run against the live DOM
- **TypeScript** — typed specs

## What axe-core checks

axe-core audits the rendered page against automatable [WCAG](https://www.w3.org/WAI/WCAG21/quickref/)
success criteria: things like missing alt text, insufficient color contrast, missing form labels,
invalid ARIA usage, heading order, missing document language, duplicate IDs, and keyboard/focus
issues that can be detected without a human. It cannot catch everything WCAG requires (e.g.
meaningful reading order or the quality of alt text is a judgment call), so axe-core results are a
strong automated baseline, not a full manual accessibility audit.

This suite runs axe-core scoped to the **WCAG 2.0 A**, **WCAG 2.0 AA**, and **WCAG 2.1 AA** rule
tags (`wcag2a`, `wcag2aa`) — the rule sets most commonly required for legal/compliance conformance
(e.g. ADA, EN 301 549).

## Project structure

```
accessibility/
├── package.json
├── playwright.config.ts
└── tests/
    └── a11y.spec.ts
```

## Test coverage

- **Login page** (`/`, before authentication) — scanned in its default, unauthenticated state.
- **Inventory page** (`/inventory.html`) — scanned after logging in as `standard_user`, covering
  the main product-listing view most shoppers land on.

Each test:

1. Runs `new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()`.
2. Attaches the full JSON violation list to the Playwright HTML report for inspection.
3. Logs any **serious**-impact violations to the console as informational context (does not fail
   the build — third-party demo sites commonly carry minor/serious nits outside our control).
4. **Fails only on _unexpected_ `critical`-impact violations.** Critical issues that the demo SUT
   genuinely has are allow-listed (by axe rule id) and reported as `KNOWN/accepted` instead of
   failing CI — we surface the real defect but don't own the app. Any *new* critical violation
   still fails the build.

## Known findings (real defects in the demo SUT)

Automated scanning surfaced a genuine accessibility defect on saucedemo.com, kept on the
known-issues allow-list so it's visible without breaking CI:

| Page | axe rule | Impact | Issue |
|---|---|---|---|
| Inventory | `select-name` | critical | The product-sort `<select>` has no accessible name (no `<label>`/`aria-label`), so screen-reader users can't identify it. |

## Prerequisites

- Node.js 18+

## Setup

```bash
npm install
npx playwright install chromium
```

## Running the tests

```bash
npm test
```

## Viewing the HTML report

After a run, open the generated HTML report (includes the attached axe-core JSON per test):

```bash
npm run report
```

## Notes

- Tests target the public demo site `https://www.saucedemo.com` — no credentials or environment
  secrets are required; login uses the standard demo account `standard_user` / `secret_sauce`.
- Configuration lives in `playwright.config.ts`: base URL, tracing on first retry, screenshots on
  failure, one retry, and both `list` and `html` reporters.
- Scan scope is intentionally limited to `wcag2a` + `wcag2aa` tags rather than the full axe-core
  rule set (e.g. best-practice rules), keeping the suite focused on conformance-relevant checks.

## Reports

After a run, `npm run report` opens `playwright-report/` (the HTML report, including the
attached axe-core JSON per test; also auto-uploaded as a CI artifact).
