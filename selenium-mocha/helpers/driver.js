"use strict";

/**
 * Driver factory for the Selenium test suite.
 *
 * Builds a headless Chrome WebDriver instance. Selenium Manager (bundled with
 * selenium-webdriver v4.6+) automatically resolves and downloads a matching
 * chromedriver binary for whatever Chrome is installed on the machine — no
 * manual driver management or extra dependency (e.g. chromedriver npm package)
 * is required.
 */

const { Builder } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

/**
 * Creates and returns a new headless Chrome WebDriver instance ready to use.
 * Callers are responsible for calling `driver.quit()` once done (typically
 * in a Mocha `after()` hook).
 *
 * @returns {Promise<import("selenium-webdriver").WebDriver>}
 */
async function buildDriver() {
  const options = new chrome.Options();
  options.addArguments(
    "--headless=new",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--window-size=1280,800"
  );

  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  return driver;
}

module.exports = { buildDriver };
