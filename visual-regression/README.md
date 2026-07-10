# Visual Regression — screenshot diffing (Playwright)

A small **visual regression** example using Playwright's built-in
[`toHaveScreenshot`](https://playwright.dev/docs/test-snapshots) assertion
against the saucedemo.com login page. It captures a reference screenshot
(baseline) and fails a future run if the rendered page drifts beyond a small
pixel-diff tolerance — catching unintended UI/CSS changes that functional tests
miss.

## How it works

- `tests/login-visual.spec.ts` navigates to the login page and calls
  `expect(page).toHaveScreenshot('login-page.png')`.
- The **baseline** image lives next to the spec in
  `tests/login-visual.spec.ts-snapshots/`.
- `playwright.config.ts` sets a `maxDiffPixelRatio` tolerance (2%) and disables
  animations so anti-aliasing / sub-pixel noise doesn't cause false failures.

## Baselines are platform-specific ⚠️

Screenshot baselines depend on the OS, browser build and font rendering. The
committed baseline was generated on the maintainer's machine, so on a different
platform you must regenerate it once:

```bash
npm install
npx playwright install chromium
npm run update-snapshots   # regenerate the baseline for THIS platform
npm test                   # compare against it
```

## Why it's not in CI

Because baselines are platform-specific, committing a Windows/Mac baseline would
make a Linux CI runner fail on an unrelated rendering difference. In a real
project you'd solve this by generating baselines inside the CI container (or via
Playwright's Docker image) and committing those. Here it's kept as a documented,
run-locally example to demonstrate the technique without destabilising the main
CI pipeline.

## Run

```bash
npm install
npx playwright install chromium
npm test          # or: npm run update-snapshots on first run / new platform
npm run report    # open the HTML report (includes visual diffs on failure)
```

## Reports

After a run, `npm run report` opens `playwright-report/` (the HTML report, including
visual diffs on failure). Not uploaded as a CI artifact — this suite runs locally only.
