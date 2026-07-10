# Mobile Web — device emulation (Playwright)

Playwright E2E tests for [saucedemo.com](https://www.saucedemo.com), run through
Playwright's built-in **device emulation** — mobile viewport size, mobile user-agent
string and touch-input support — rather than a full-size desktop browser.

This is the same public demo shop used by [`../playwright`](../playwright/), but the
point here isn't the shop, it's the **execution context**: proving the critical
purchase journey still works when the browser presents itself as a phone.

## What this demonstrates

- Configuring Playwright **projects** per device profile (`iPhone 13` on WebKit,
  `Pixel 5` on Chromium) using `playwright.config.ts` `devices[...]` presets.
- Writing specs that are **device/engine-agnostic** — the same test file runs against
  both projects unchanged.
- Asserting on **observable mobile characteristics** (small viewport, touch support)
  using standard web APIs instead of engine-specific internals like Chromium's
  `isMobile` CDP flag, which isn't consistently available across engines (e.g. WebKit).

## What this is *not*

This suite emulates mobile characteristics inside a desktop-hosted browser engine —
it changes viewport size, user-agent, and touch flags, but the JavaScript engine,
rendering engine quirks, OS-level gestures, and real network/hardware conditions of
an actual phone are not present. It's fast and great for catching layout/flow
regressions early, but it is **not** a substitute for testing on real devices.

Real-device coverage (actual iOS/Android hardware or cloud device farms) is covered
separately in [`../appium-mobile`](../appium-mobile/).

## Run

```bash
npm install
npx playwright install chromium webkit
npm test
```

View the HTML report after a run:

```bash
npm run report
```

## Structure

```
mobile-web-playwright/
├── playwright.config.ts   # iPhone 13 (WebKit) + Pixel 5 (Chromium) projects
├── tests/
│   ├── mobile-checkout.spec.ts   # full login -> cart -> checkout -> finish flow
│   └── responsive.spec.ts        # viewport + touch-capability sanity checks
└── package.json
```

## Reports

After a run, `npm run report` opens `playwright-report/` (the HTML report; also
auto-uploaded as a CI artifact).
