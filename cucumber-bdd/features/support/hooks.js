const { BeforeAll, Before, After, AfterAll, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('playwright');

// Sauce Demo can be a little slow on first paint (fonts/assets); give every
// step up to 60s instead of Cucumber's 5s default before it's marked as failed.
setDefaultTimeout(60 * 1000);

/** @type {import('playwright').Browser} */
let browser;

// One browser process for the whole test run - launching Chromium per
// scenario would be needlessly slow.
BeforeAll(async function () {
  browser = await chromium.launch();
});

// A brand new isolated context + tab per scenario so cookies, local storage
// and the Sauce Demo cart never bleed between scenarios.
Before(async function () {
  this.browser = browser;
  this.context = await browser.newContext();
  this.page = await this.context.newPage();
});

After(async function () {
  if (this.context) {
    await this.context.close();
  }
});

AfterAll(async function () {
  if (browser) {
    await browser.close();
  }
});
