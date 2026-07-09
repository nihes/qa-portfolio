/**
 * WebdriverIO + Appium config — LOCAL run against an Android emulator.
 *
 * This drives mobile Chrome on the emulator (not a native app), so no APK is
 * required — only an Android SDK with at least one AVD ("Android Emulator")
 * booted, plus a local Appium server (started automatically via the
 * `appium` service below).
 *
 * See README.md for full setup instructions. This suite is a
 * knowledge-showcase example and is intentionally NOT wired into CI.
 */
exports.config = {
  runner: 'local',

  // Appium manages the actual device/browser session; wdio only needs the
  // hostname/port of the Appium server, which the `appium` service starts
  // for us on 127.0.0.1:4723.
  hostname: '127.0.0.1',
  port: 4723,
  path: '/',

  specs: ['./test/specs/**/*.js'],
  exclude: [],

  maxInstances: 1,

  capabilities: [
    {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': 'Android Emulator',
      // No 'appium:app' capability — we test the mobile web experience via
      // the on-device Chrome browser rather than a native/hybrid app.
      'appium:browserName': 'Chrome',
      'appium:newCommandTimeout': 240,
    },
  ],

  logLevel: 'info',
  bail: 0,
  baseUrl: 'https://www.saucedemo.com',

  waitforTimeout: 15000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  services: ['appium'],

  framework: 'mocha',
  reporters: ['spec'],

  mochaOpts: {
    ui: 'bdd',
    timeout: 90000,
  },
};
