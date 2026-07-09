import { test, expect } from '@playwright/test';

/**
 * Sanity checks that the active Playwright project is actually behaving like a
 * mobile device, independent of which browser engine is driving it.
 *
 * Deliberately engine-agnostic: it does NOT read `page.context()`'s internal
 * `isMobile` flag or any Chromium-only CDP API, because that flag is a
 * Chromium/CDP concept and is not consistently exposed across engines
 * (e.g. WebKit projects). Instead it asserts on two device-agnostic, observable
 * signals that any real mobile browser also exhibits:
 *   1. A small viewport width (mobile phones, not tablets/desktops).
 *   2. Touch input support, detected via the standard web APIs
 *      `navigator.maxTouchPoints` and the `ontouchstart` window property.
 */
test.describe('Mobile emulation sanity checks', () => {
  test('viewport width is mobile-sized', async ({ page }) => {
    await page.goto('/');

    const viewportSize = page.viewportSize();
    expect(viewportSize).not.toBeNull();
    expect(viewportSize!.width).toBeLessThanOrEqual(500);
  });

  test('touch input is available', async ({ page }) => {
    await page.goto('/');

    const hasTouchSupport = await page.evaluate(() => {
      return navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
    });

    expect(hasTouchSupport).toBe(true);
  });
});
