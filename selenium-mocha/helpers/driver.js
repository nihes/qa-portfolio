"use strict";

/**
 * Driver factory + robust interaction helpers for the Selenium test suite.
 *
 * Builds a headless Chrome WebDriver instance. Selenium Manager (bundled with
 * selenium-webdriver v4.6+) automatically resolves and downloads a matching
 * chromedriver binary for whatever Chrome is installed on the machine — no
 * manual driver management or extra dependency (e.g. chromedriver npm package)
 * is required.
 *
 * saucedemo.com is a React SPA. Two quirks are handled here:
 *  1. Its buttons don't reliably fire on Selenium's *native* click in headless
 *     Chrome — a JavaScript click (element.click()) dispatches the handler.
 *  2. Right after a navigation the React handlers can attach a beat later than
 *     the element appears in the DOM, so a single click can be a no-op. The
 *     click helpers below therefore click, wait for the expected outcome, and
 *     retry a few times — making the flow deterministic on slow/fast CI alike.
 */

const { Builder, until } = require("selenium-webdriver");
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

/**
 * Scrolls an element into view and clicks it via JavaScript (reliable on
 * saucedemo's React buttons under headless Chrome).
 * @param {import("selenium-webdriver").WebDriver} driver
 * @param {import("selenium-webdriver").WebElement} el
 */
async function jsClick(driver, el) {
  await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", el);
  await driver.executeScript("arguments[0].click();", el);
}

/**
 * Types text into an input reliably: locate, clear, sendKeys, then verify the
 * value actually stuck (React inputs under headless Chrome occasionally drop
 * keystrokes right after a navigation) — retrying if it didn't.
 * @param {import("selenium-webdriver").WebDriver} driver
 * @param {import("selenium-webdriver").By} locator
 * @param {string} text
 */
async function typeInto(driver, locator, text, attempts = 3) {
  // React setter used by the JS fallback so the framework registers the change
  // (setting .value directly wouldn't fire React's onChange).
  const reactSetValue =
    "var el=arguments[0], val=arguments[1];" +
    "var proto=Object.getPrototypeOf(el);" +
    "var desc=Object.getOwnPropertyDescriptor(proto,'value');" +
    "if(desc&&desc.set){desc.set.call(el,val);}else{el.value=val;}" +
    "el.dispatchEvent(new Event('input',{bubbles:true}));" +
    "el.dispatchEvent(new Event('change',{bubbles:true}));";

  let lastValue;
  for (let i = 0; i < attempts; i += 1) {
    const el = await driver.wait(until.elementLocated(locator), 10000);

    // 1) Native keystrokes (works on most pages).
    await el.clear();
    await el.sendKeys(text);
    lastValue = await el.getAttribute("value");
    if (lastValue === text) return;

    // 2) Fallback: some saucedemo inputs drop keystrokes in headless Chrome
    //    right after a navigation — set the value via the React-aware setter.
    await driver.executeScript(reactSetValue, el, text);
    lastValue = await el.getAttribute("value");
    if (lastValue === text) return;
  }
  throw new Error(
    `typeInto failed: field value "${lastValue}" did not match expected "${text}" after ${attempts} attempts`
  );
}

/**
 * Clicks a locator and waits until the URL contains `urlFragment`, retrying the
 * click if the navigation didn't take (handles React-hydration timing races).
 * @param {import("selenium-webdriver").WebDriver} driver
 * @param {import("selenium-webdriver").By} locator
 * @param {string} urlFragment
 * @param {number} attempts
 */
async function clickAndWaitForUrl(driver, locator, urlFragment, attempts = 3) {
  let lastError;
  for (let i = 0; i < attempts; i += 1) {
    const el = await driver.wait(until.elementLocated(locator), 10000);
    await jsClick(driver, el);
    try {
      await driver.wait(until.urlContains(urlFragment), 5000);
      return;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

/**
 * Clicks a locator and waits until `confirmLocator` is present, retrying the
 * click if nothing happened (e.g. add-to-cart flipping to a remove button).
 * @param {import("selenium-webdriver").WebDriver} driver
 * @param {import("selenium-webdriver").By} locator
 * @param {import("selenium-webdriver").By} confirmLocator
 * @param {number} attempts
 */
async function clickAndWaitForElement(driver, locator, confirmLocator, attempts = 3) {
  let lastError;
  for (let i = 0; i < attempts; i += 1) {
    const el = await driver.wait(until.elementLocated(locator), 10000);
    await jsClick(driver, el);
    try {
      await driver.wait(until.elementLocated(confirmLocator), 5000);
      return;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

module.exports = {
  buildDriver,
  jsClick,
  typeInto,
  clickAndWaitForUrl,
  clickAndWaitForElement,
};
