# Appium — real-device / emulator mobile (Appium + WebdriverIO)

Mobile smoke test for [saucedemo.com](https://www.saucedemo.com), driven through
**Appium** (via WebdriverIO's `@wdio/cli`) against real/emulated **Android**
devices. Same login → add to cart → cart badge journey covered by the
Playwright/Cypress suites in this portfolio, but exercised on a mobile browser
to demonstrate Appium/WebdriverIO mobile test authoring (device capabilities,
touch-driven element waits, BrowserStack real-device integration).

> **This suite needs a real environment to run — an Android SDK + emulator, or
> a BrowserStack account — and is intentionally excluded from this
> repository's CI pipeline.** Every other suite in this portfolio
> (`playwright/`, `cypress/`, `cucumber-bdd/`, `api-postman-newman/`) runs
> headless in GitHub Actions; `appium-mobile/` is a knowledge-showcase example
> kept out of CI on purpose because a hosted Android emulator/device farm
> isn't available there.

## What's covered

- **`test/specs/mobile-web.e2e.js`** — logs in as `standard_user` on mobile
  Chrome, adds a product to the cart, verifies the cart badge count, then
  removes the item and verifies the badge clears.

## Why "mobile web" and not a native app?

saucedemo.com is a website, not a published app, so there's no APK/IPA to
install. Testing it through the device's Chrome browser (`appium:browserName:
"Chrome"` with no `appium:app` capability) still exercises the full Appium
mobile stack — device/browser session management, mobile viewport rendering,
touch-based taps — which is the same mechanism you'd use to test a hybrid app's
WebView. Swapping in a real APK cap (`appium:app: '/path/to/app.apk'`) is a
one-line change to the capabilities block in either config file.

## Project structure

```
appium-mobile/
  wdio.conf.js                  # local run — Android emulator + local Appium server
  wdio.browserstack.conf.js     # real-device run — BrowserStack Automate
  test/
    specs/
      mobile-web.e2e.js
  package.json
```

## Option A — Run locally against an Android emulator

### Requirements

1. **Android SDK** (via [Android Studio](https://developer.android.com/studio)
   or the standalone `cmdline-tools`).
2. **Java 11+** (required by the Android tooling and Appium's UiAutomator2
   driver).
3. At least one **AVD (Android Virtual Device)** created and bootable, e.g.
   a Pixel 6 running Android 13. Create one via Android Studio's Device
   Manager, or:
   ```bash
   avdmanager create avd -n test-emulator -k "system-images;android-33;google_apis;x86_64"
   ```
4. `ANDROID_HOME` (or `ANDROID_SDK_ROOT`) environment variable pointing at
   your SDK install, with `platform-tools` and `emulator` on your `PATH`.
5. **Chrome** must be present on the emulator image (Google APIs / Play Store
   images include it by default).

### Setup

```bash
cd appium-mobile
npm install
```

### Boot the emulator

```bash
emulator -avd test-emulator
```

Wait until the emulator fully boots to the home screen before starting the
tests — Appium's UiAutomator2 driver needs the device to be responsive.

### Run

```bash
npm run test:local
```

This starts a local Appium server automatically (via the `appium` wdio
service configured in `wdio.conf.js`), connects to the running emulator, and
executes `test/specs/mobile-web.e2e.js` against it.

## Option B — Run on a real device via BrowserStack

Ivan has BrowserStack access with real-device support (see the portfolio's
internal notes) — this path needs no local Android SDK or emulator at all;
BrowserStack provisions and tears down the real device for you.

### Requirements

- A BrowserStack account with **App Automate / Automate** access.
- Your **Username** and **Access Key**, found under
  [BrowserStack → Account Settings](https://www.browserstack.com/accounts/settings).

### Setup

```bash
cd appium-mobile
npm install
```

Export your credentials as environment variables — **never commit them to a
file**:

```bash
# macOS/Linux
export BROWSERSTACK_USERNAME="your_username"
export BROWSERSTACK_ACCESS_KEY="your_access_key"

# Windows PowerShell
$env:BROWSERSTACK_USERNAME = "your_username"
$env:BROWSERSTACK_ACCESS_KEY = "your_access_key"
```

### Run

```bash
npm run test:browserstack
```

This runs the same spec against a **Samsung Galaxy S22 (Android 12)** real
device in BrowserStack's cloud (see `wdio.browserstack.conf.js` — swap the
`appium:deviceName` / `platformVersion` caps for any device in BrowserStack's
device list). Watch the live session and video replay in the
[BrowserStack Automate dashboard](https://automate.browserstack.com/dashboard).

## Notes

- Test credentials: `standard_user` / `secret_sauce` (same demo account used
  across this portfolio's other suites).
- `wdio.conf.js` and `wdio.browserstack.conf.js` share the same `specs` glob
  and `baseUrl` — only the device/session transport differs, which is the
  point of the split: write once, run on any Appium-compatible target.
- This suite is deliberately **not** referenced from
  `.github/workflows/ci.yml` — see the warning at the top of this file.
