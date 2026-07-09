/**
 * WebdriverIO + Appium config — REAL DEVICE run via BrowserStack App Automate /
 * Automate cloud grid. Same spec files as the local emulator config, just
 * pointed at BrowserStack's hub with a real-device capability.
 *
 * Requires two environment variables (never hardcode credentials):
 *   BROWSERSTACK_USERNAME
 *   BROWSERSTACK_ACCESS_KEY
 *
 * Ivan has a BrowserStack account with mobile real-device access — see
 * memory: reference_external_portals_access. Credentials for this demo
 * should be exported in the shell before running, e.g.:
 *   export BROWSERSTACK_USERNAME=your_username
 *   export BROWSERSTACK_ACCESS_KEY=your_access_key
 *   npm run test:browserstack
 */
exports.config = {
  runner: 'local',

  user: process.env.BROWSERSTACK_USERNAME,
  key: process.env.BROWSERSTACK_ACCESS_KEY,

  hostname: 'hub.browserstack.com',

  specs: ['./test/specs/**/*.js'],
  exclude: [],

  maxInstances: 1,

  capabilities: [
    {
      platformName: 'Android',
      browserName: 'Chrome',
      'appium:deviceName': 'Samsung Galaxy S22',
      'appium:platformVersion': '12.0',
      'bstack:options': {
        osVersion: '12.0',
        deviceName: 'Samsung Galaxy S22',
        projectName: 'QA Portfolio - Appium',
        buildName: 'appium-mobile-web',
        sessionName: 'saucedemo mobile web smoke',
        local: false,
        debug: true,
        networkLogs: true,
      },
    },
  ],

  logLevel: 'info',
  bail: 0,
  baseUrl: 'https://www.saucedemo.com',

  waitforTimeout: 15000,
  connectionRetryTimeout: 180000,
  connectionRetryCount: 3,

  // No `services: ['appium']` here — BrowserStack runs its own Appium
  // server in the cloud; wdio just needs to talk to the BrowserStack hub.
  services: [],

  framework: 'mocha',
  reporters: ['spec'],

  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
  },

  onPrepare: function () {
    if (!process.env.BROWSERSTACK_USERNAME || !process.env.BROWSERSTACK_ACCESS_KEY) {
      throw new Error(
        'Missing BROWSERSTACK_USERNAME / BROWSERSTACK_ACCESS_KEY environment variables. ' +
          'See README.md for setup instructions.'
      );
    }
  },
};
